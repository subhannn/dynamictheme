<?php namespace Kincir\Dynamictheme\Classes;


use Cms\Classes\ComponentManager;
use Cms\Classes\CmsException;
use System\Classes\PluginManager;
use Kincir\Dynamictheme\Classes\Section;
use Cms\Classes\Theme;
use Kincir\Dynamictheme\Classes\ThemeModule;
use Cms\Classes\MediaViewHelper;
use Kincir\Dynamictheme\Classes\BaseModelForm;
use Cms\Classes\ComponentHelpers;

/**
 * The System Twig extension class implements common Twig functions and filters.
 *
 * @package october\system
 * @author Alexey Bobkov, Samuel Georges
 */
class ParserTheme
{
    use \October\Rain\Support\Traits\Singleton;
    use \System\Traits\ConfigMaker;

    protected $controller;

    protected $config = false;

    protected $configdata = [
        'rows'  => [],
        'sections'=> []
    ];

    /**
     * Creates the extension instance.
     */
    public function init()
    {
        $this->loadThemeComponent();
        $this->loadConfig();
    }

    public function loadConfig($config=''){
        if(!$config){
            $config = get('config');
            if(!$config) $config = post('config');
        }

        if($config){
            $config = @json_decode($config);

            if($config){
                $this->config = $config;

                $this->buildConfigData();

                return $config;
            }
        }

        return false;
    }

    public function setDataSection($id, $data=[]){
        $modules = [];
        foreach ($data as $key => $value) {
            $modules[$key] = [
                'config'    => isset($value['config'])?$value['config']:[],
                'style'     => isset($value['style'])?$value['style']:[],
            ];
        }

        $this->configdata['sections'][$id] = [
            'config'    => [],
            'style'     => [],
            'internal'  => [],
            'components'=> $modules
        ];
    }

    public function isEditingMode(){
        $isEdit = get('preview_editing_theme');
        if(input('preview') == '1'){
            $isEdit = '0';
        }

        if($isEdit == '1'){
            return true;
        }else{
            return false;
        }
    }

    public function setController($controller){
        $this->controller = $controller;

        return $this;
    }

    public function render(){
        $html = '';
        if(isset($this->config->rows)){
            $html = '';
            $contentRow = '';
            foreach ($this->config->rows as $row) {
                $contentSec = '';
                foreach ($row->sections as $section) {
                    $sectionObj = $this->getSection($section);
                    $contentSec .= $this->renderPartial($sectionObj, $section);
                }
                $contentRow .= $this->renderRow($contentSec, $row);
            }
            $html = $contentRow;
        }

        if($this->isEditingMode()){
            $html = view('kincir.dynamictheme::template.container_row', [
                'content'   => $html
            ])->render();
        }

        return $html;
    }

    public function initComponent(){
        $html = '';
        if(isset($this->config->rows)){
            $html = '';
            $contentRow = '';
            foreach ($this->config->rows as $row) {
                $contentSec = '';
                foreach ($row->sections as $section) {
                    $sectionObj = $this->getSection($section);
                    $this->renderPartial($sectionObj, $section, true);
                }
            }
        }
    }

    public function renderPartial($objPartial, $configRaw=[], $initComponent=false){
        $configRaw = (array) $configRaw;

        $this->controller->configuration['configData'] = $this->configdata;
        $config = isset($configRaw['config'])?(array) $configRaw['config']:[];
        $style = isset($configRaw['style'])?(array) $configRaw['style']:[];
        $allPartialConfigData = array_merge($config, $style);

        $formHelper = FormHelper::instance()->setPartialObj($objPartial);
        $partialConfig = isset($objPartial->attr)?$objPartial->attr:[];
        $manager = ComponentManager::instance();
        $objComponent = [];
        foreach ($objPartial->settings['components'] as $component => $properties) {
            // Do not inject the viewBag component to the environment.
            // Not sure if they're needed there by the requirements,
            // but there were problems with array-typed properties used by Static Pages 
            // snippets and setComponentPropertiesFromParams(). --ab
            if ($component == 'viewBag') {
                continue;
            }

            list($name, $alias) = strpos($component, ' ')
                ? explode(' ', $component)
                : [$component, $component];

            $properties = array_merge($properties, $formHelper->splitComponentAttr($allPartialConfigData, $alias));
            
            if (!$componentObj = $manager->makeComponent($name, $this->controller->getPageObject(), $properties)) {
                throw new CmsException(Lang::get('cms::lang.component.not_found', ['name'=>$name]));
            }

            $componentObj->alias = $alias;
            $componentObj->className = $name;
            $objComponent[$alias] = $this->controller->getPage()->components[$alias] = $componentObj;

            $cmpConfig = method_exists($componentObj, 'getConfigProperties')?$componentObj->getConfigProperties():[];
            $partialConfig = array_merge($partialConfig, $cmpConfig);

            $this->setComponentPropertiesFromParams($componentObj);
            $componentObj->init();
            $componentObj->onRun();
        }

        if($initComponent)
            return;

        // echo $objPartial->getTwigContent();
        // exit();
        if(!$partialConfig){
            $conf = $this->getDefaultAttribute();
            $partialConfig = isset($conf->attr)?$conf->attr:[];
        }

        $customStyle = $formHelper->parseStyleToArray($partialConfig, $style);
        $styleStr = '';
        // print_r($customStyle);
        // exit();
        if($this->isEditingMode()){
            $styleStr = $formHelper->covertStyle($customStyle);
        }

        $this->controller->configuration['customStyle'] = array_merge($this->controller->configuration['customStyle'], $customStyle);
        
        CmsException::mask($objPartial, 400);
        $this->controller->getLoader()->setObject($objPartial);
        $template = $this->controller->getTwig()->loadTemplate($objPartial->getFilePath());
        $result = $template->render(array_merge($this->controller->vars, $this->overrideValue($objPartial, $config), $objComponent));
        CmsException::unmask();

        $partialType = $objPartial->getParentType();
        $html = view('kincir.dynamictheme::template.'.$partialType, [
            'content'   => $result.$styleStr,
            'id'        => $objPartial->viewId,
            'isEditingMode'=> $this->isEditingMode(),
            'wrap'      => input('nonwrap')
        ])->render();

        return MediaViewHelper::instance()->processHtml($html);
    }

    protected function setComponentPropertiesFromParams($component, $parameters = [])
    {
        $properties = $component->getProperties();
        $routerParameters = $this->controller->getRouter()->getParameters();

        foreach ($properties as $propertyName => $propertyValue) {
            if (is_array($propertyValue)) {
                continue;
            }

            $matches = [];
            if (preg_match('/^\{\{([^\}]+)\}\}$/', $propertyValue, $matches)) {
                $paramName = trim($matches[1]);

                if (substr($paramName, 0, 1) == ':') {
                    $routeParamName = substr($paramName, 1);
                    $newPropertyValue = array_key_exists($routeParamName, $routerParameters)
                        ? $routerParameters[$routeParamName]
                        : null;

                }
                else {
                    $newPropertyValue = array_key_exists($paramName, $parameters)
                        ? $parameters[$paramName]
                        : null;
                }

                $component->setProperty($propertyName, $newPropertyValue);
                $component->setExternalPropertyName($propertyName, $paramName);
            }
        }
    }

    private function overrideValue($obj, $config){
        $configs = [];
        foreach ($config as $key => $value) {
            $configs[$key] = $value;
            if(strpos($key, '-') === false){
                $fnc = 'get'.studly_case($key).'Value';
                if(method_exists($obj, $fnc)){
                    $configs[$key] = $obj->$fnc($value);
                }
            }
        }

        return $configs;
    }

    public function getDefaultAttribute(){
        $conf = $this->guessConfigPath().'/default_property.yaml';
        $config = $this->makeConfig($conf);
        return $config;
    }

    public function renderCustomStyle(){
        $this->defaultAssetsOnEditing();
        $formHelper = FormHelper::instance();
        if(!$this->isEditingMode()){
            $customStyle = $this->controller->configuration['customStyle'];
            return $formHelper->covertStyle($customStyle);
        }else{
            return;
        }
    }

    public function defaultAssetsOnEditing(){
        if($this->isEditingMode()){
            $this->controller->addCss('/plugins/kincir/dynamictheme/assets/css/custom.css');
            $this->controller->addCss('/plugins/kincir/dynamictheme/assets/css/font-awesome.css');
            $this->controller->addJs('/plugins/kincir/dynamictheme/assets/js/javascript/custom.js');
        }
    }

    protected function renderRow($content, $row){
        $html = view('kincir.dynamictheme::template.row', [
            'content'   => $content,
            'isEditingMode' => $this->isEditingMode(),
            'row'   => $row
        ]);

        return $html;
    }

    protected function getSection($section){
        $singleSection = Section::loadCached(Theme::getActiveTheme(), $section->code);
        $singleSection->{'viewId'} = $section->id;
        $singleSection->syncOriginal();

        return $singleSection;
    }

    public function loadThemeComponent(){
        ComponentManager::instance()->registerComponents(function($manager){
            $pluginManager = PluginManager::instance();
            $plugins = $pluginManager->getPlugins();

            foreach ($plugins as $plugin) {
                if(!method_exists($plugin, 'registerThemeComponents'))
                    continue;

                $components = $plugin->registerThemeComponents();
                if(!is_array($components) || count($components) == 0)
                    continue;

                foreach ($components as $className => $code) {
                    $manager->registerComponent($className, $code, $plugin);
                }
            }
        });
    }

    protected function buildComponentProperties($properties=[]){
        $str = '';
        foreach ($properties as $key => $value) {
            $str .= " ".$key."='".$value."' ";
        }

        return $str;
    }

    public function makeComponent($name, $parameters=[]){
        $manager = ComponentManager::instance();

        $partials = ThemeModule::find($name);

        $partials->{'viewId'} = $partials->code;

        $sectionId = isset($parameters['sectionId'])?$parameters['sectionId']:'';
        $configData = $this->controller->configuration['configData'];

        $attr = [];
        if(isset($configData['sections'][$sectionId])){
            if(isset($configData['sections'][$sectionId]['components'][$partials->code])){
                $attr = (object) $configData['sections'][$sectionId]['components'][$partials->code];
            }
        }

        $this->controller->configuration['components'][$partials->code] = $partials;

        return $this->renderPartial($partials, $attr);
    }
    
    public function makeFormConfig($objPartial, $titleForm = 'Modules Edit'){
        $manager = ComponentManager::instance();
        $componentConfig = isset($objPartial->attr)?$objPartial->attr:[];
        foreach ($objPartial->settings['components'] as $component => $properties) {
            // Do not inject the viewBag component to the environment.
            // Not sure if they're needed there by the requirements,
            // but there were problems with array-typed properties used by Static Pages 
            // snippets and setComponentPropertiesFromParams(). --ab
            if ($component == 'viewBag') {
                continue;
            }

            list($name, $alias) = strpos($component, ' ')
                ? explode(' ', $component)
                : [$component, $component];

            if (!$componentObj = $manager->makeComponent($name)) {
                throw new CmsException(Lang::get('cms::lang.component.not_found', ['name'=>$name]));
            }

            $componentObj->alias = $alias;
            $componentObj->className = $name;

            $compProps = ComponentHelpers::getComponentsPropertyConfig($componentObj, false, true);
            $compProps = FormHelper::instance()->componentPropertiesToFormProperties($compProps, $componentObj->alias);

            $cmpConfig = method_exists($componentObj, 'getConfigProperties')?$componentObj->getConfigProperties():[];
            $componentConfig = array_merge($componentConfig, $cmpConfig, $compProps);
            
            $objPartial->components[$alias] = $componentObj;

            $componentObj->init();
        }
        if(!$componentConfig){
            $conf = $this->getDefaultAttribute();
            $componentConfig = isset($conf->attr)?$conf->attr:[];
        }

        $formHelper = FormHelper::instance()->setPartialObj($objPartial);
        $config = $formHelper->parse($componentConfig);
        // print_r($config);
        // exit();

        if(input('config') || input('style')){
            $attr = $formHelper->parsePost(post());
            $model = new BaseModelForm($objPartial, $config, $attr);
        }else{
            $model = new BaseModelForm($objPartial, $config);
        }
        $config->{'model'} = $model;
        $config->{'context'} = 'create';

        $form = $this->controller->makeWidget('Kincir\Dynamictheme\Widgets\DynamicFormSettings', $config);
        $form->bindToController();

        $html = view('kincir.dynamictheme::container_form', [
            'title' => $titleForm,
            'content'  => $form->render()
        ])->render();

        return $html;
    }

    protected function buildConfigData(){
        if(!isset($this->config->rows))
            return;

        foreach ($this->config->rows as $key => $row) {
            $this->configdata['rows'][$row->id] = $this->getConfigAndStyle($row);
            foreach ($row->sections as $section) {
                $this->configdata['sections'][$section->id] = $this->getConfigAndStyle($section);
                foreach ($section->components as $key3 => $component) {
                    $this->configdata['sections'][$section->id]['components'][$component->code] = $this->getConfigAndStyle($component);
                }
            }
        }
    }

    protected function getConfigAndStyle($data){
        $config = [
            'config'=> [],
            'style' => [],
            'internal'=> []
        ];
        if(isset($data->config))
            $config['config'] = (array) $data->config;

        if(isset($data->style))
            $config['style'] = (array) $data->style;

        $internalKey = ['code', 'component', 'partial'];
        foreach ($internalKey as $key) {

            if(isset($data->$key)){
                $config['internal'][$key] = $data->$key;
            }
        }

        return $config;
    }
}
