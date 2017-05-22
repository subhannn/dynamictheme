<?php namespace Kincir\DynamicTheme\Behaviors;

use Str;
use Lang;
use Event;
use Flash;
use ApplicationException;
use Yaml;
use File;
use Url;
use Config;
use App;
use anlutro\cURL\cURL;

use Cms\Classes\Theme;
use Backend\Classes\ControllerBehavior;
use Kincir\DynamicTheme\Classes\SectionModelParser;
use Kincir\DynamicTheme\Classes\Section;
use Cms\Classes\CmsException;
use October\Rain\Halcyon\Model;
use October\Rain\Filesystem\Filesystem;
use October\Rain\Halcyon\Datasource\FileDatasource;
use October\Rain\Halcyon\Datasource\Resolver;
use Cms\Classes\ComponentManager;
use Kincir\Dynamictheme\Classes\Controller;
use Cms\Classes\Controller as CmsController;
use Kincir\Dynamictheme\Classes\ThemeModule;
use Kincir\Dynamictheme\Classes\ParserTheme;
use Kincir\Dynamictheme\Classes\FormHelper;

use Kincir\Dynamictheme\Models\Page;

class EditingThemeController extends ControllerBehavior
{
    public $vars = [];

    protected $themeConfig;

    protected $theme;

    protected $errors = [];

    protected $themeSections;

    protected $cmsLoader;

    protected $page;

    /**
     * Behavior constructor
     * @param \Backend\Classes\Controller $controller
     */
    public function __construct($controller)
    {
        parent::__construct($controller);

        $this->init();

        $this->controller->pageTitle = 'Editing Dynamictheme';
    }

    public function init(){
        ParserTheme::instance()->loadThemeComponent();

        $this->activeTheme();
    }

    public function loadAssets(){
        $this->controller->addCss('/plugins/kincir/dynamictheme/assets/css/form.css');
        $this->controller->addJs('/plugins/kincir/dynamictheme/assets/js/jquery-ui.js');
        $this->controller->addJs('/plugins/kincir/dynamictheme/assets/build/bower_components/underscore/underscore-min.js');
        $this->controller->addJs('/plugins/kincir/dynamictheme/assets/build/bower_components/backbone/backbone-min.js');
        $this->controller->addJs('/plugins/kincir/dynamictheme/assets/js/build.js');
    }

    public function editing($id){
        $page = Page::find($id);

        if(!$page)
            return;

        $this->page = $page;

        $this->loadAssets();
        $this->controller->bodyClass = 'compact-container';

        $config = isset($page->data['config'])?$page->data['config']:'';
        $this->vars['config'] = json_decode($config)?$config:'';
        $this->vars['themeOptions'] = json_encode($this->buildThemeOptions());
    }

    public function onSave($id){
        $config = post('editing_data');
        $page = Page::find($id);

        if(!$page)
            return;

        $page->data = array_merge($page->data, ['config'=>$config]);
        $page->save();

        Flash::success('Save Success');

        return;
    }

    public function renderEditingTheme(){
        if($this->errors){
            return $this->makePartial('errors', $this->errors);
        }else{
            return $this->makePartial('container', $this->vars);
        }
    }

    public function buildThemeOptions(){
        $this->loadThemeSections();

        $data = [];
        $data['sections'] = $this->themeSections;
        $data['path'] = $this->page->url;
        $data['base_url'] = url();
        $data['page_url'] = url($this->page->url);
        $data['page_url_preview'] = $this->page->getPageUrl();

        return $data;
    }

    public function onLoadComponent(){
        $code = post('code');
        $module = ThemeModule::find($code);

        return ParserTheme::instance()->setController($this->controller)->makeFormConfig($module);
    }

    public function onLoadSectionSettings(){
        $code = post('code');
        $section = Section::find($code);
        $section->viewId = post('id');

        return ParserTheme::instance()->setController($this->controller)->makeFormConfig($section);
    }

    public function onLoadSectionsList(){
        $this->loadThemeSections();

        $this->vars['list_section'] = $this->themeSections?$this->themeSections:[];

        return [
            'result'    => $this->makePartial('list_sections', $this->vars),
            'sections'  => $this->themeSections
        ];
    }

    public function onSearchKincirPage(){
        $search = post('s');
        if($search){
            $res = $this->_call('api/idol/library?s='.$search, 'get');
            $data = [];
            foreach ($res as $row) {
                $data[$row['id']] = $row['name'];
            }

            return [
                'result'    => $data
            ];
        }

        return [];
    }

    /** PROTEDTED FUNCTION **/
    protected function getOptionsValueComponent($name, $handlerName){
        if($componentObj = $this->findComponentByName($name)){
            if ($componentObj && $componentObj->methodExists($handlerName)) {
                $result = $componentObj->runAjaxHandler($handlerName);
                return ($result) ?: [];
            }
        }

        return [];
    }

    protected function findComponentByName($name){
        $manager = ComponentManager::instance();

        $listComponent = $manager->listComponents();
        if(isset($listComponent[$name])){
            if($componentObj = $manager->makeComponent($listComponent[$name])){
                return $componentObj;
            }
        }

        return false;
    }

    /**
     * Load available section on active theme
     * 
     * @return void
     */
    protected function loadThemeSections(){
        $listSection = Section::lists('fileName');

        foreach ($listSection as $sec) {
            $section = Section::find($sec);

            if(!$section)
                continue;

            $this->themeSections[$section->code] = (object) [
                'name'  => $section->title,
                'picture' => Url::to('themes/'.$this->theme->getDirName().$section->preview),
                'code' => $section->code,
                'configForm' => isset($section->attr)?true:false
            ];
        }
    }

    protected function setErrors($message, $parameter=[]){
        $this->errors = [
            'message'   => $message,
            'param'     => $parameter
        ];
    }

    protected function activeTheme(){
        $this->theme = Theme::getActiveTheme();

        $datasource = new FileDatasource($this->theme->getPath(), new Filesystem);
        $resolver = new Resolver([$this->theme->getDirName() => $datasource]);
        $resolver->setDefaultDatasource($this->theme->getDirName());
        Model::setDatasourceResolver($resolver);
    }

    protected function _call($url, $method='post', $data=[]){
        $curl = new cURL();
        $method = strtolower($method?$method:'post');

        $req = $curl->newRequest($method, url($url), $data)
            ->setHeader('Referer', url())
            ->setOption(CURLOPT_SSL_VERIFYHOST, 0)
            ->setOption(CURLOPT_SSL_VERIFYPEER, 0)
            ->setHeader('Host', $_SERVER['HTTP_HOST']);
        $res = $req->send();

        if(isset($res->statusCode) && $res->statusCode == '200'){
            $json = json_decode($res->body, true);
            $json = isset($json['result'])?$json['result']['data']:[];

            return $json;
        }

        return [];
    }
}
