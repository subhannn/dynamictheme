<?php namespace Kincir\Dynamictheme\Classes;

use Cms;
use File;
use Lang;
use Cache;
use Route;
use Config;
use Validator;
use ApplicationException;
use Cms\Classes\CmsCompoundObject;
use Kincir\Dynamictheme\Classes\ParserTheme;


/**
 * Represents a static page.
 *
 * @package Kincir\StaticPage
 * @author Alexey Bobkov, Samuel Georges
 */
class ContainerPage extends CmsCompoundObject
{
    /**
     * @var string The container name associated with the model, eg: pages.
     */
    protected $dirName = 'base';

    protected $helper;

    protected $controller;

    /**
     * @var array The attributes that are mass assignable.
     */
    protected $fillable = [
        'url',
        'layout',
        'title',
        'description',
        'is_hidden',
        'meta_title',
        'meta_description',
        'markup',
        'settings',
        'code'
    ];

    /**
     * Creates an instance of the object and associates it with a CMS theme.
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->helper = ParserTheme::instance();
    }

    public function setController($controller){
        $this->controller = $controller;
    }

    public function getCodeClassParent(){
        return '\Kincir\Dynamictheme\Classes\ThemeCode';
    }

    public function initCmsComponents($cmsController){
        $this->controller = $cmsController;
        $this->initConfig();

        $this->helper->initComponent();
        $this->helper->makeAttachExternalAssets();
        if(!$this->helper->isEditingMode()){
            $this->helper->makeInlineStyle();
        }
    }

    public function getTwigContent(){
        $this->initConfig();

        return $this->helper->render();
    }

    protected function initConfig(){
        $config = input('config');
        $helper = $this->helper->setController($this->controller);
        
        if(isset($this->controller->getPage()->settings['config']) && !$config){
            $config = $this->controller->getPage()->settings['config'];
            $config = json_decode($config)?$config:'';
            $helper->loadConfig($config);
        }
    }

    public function getType(){
        return 'dynamictheme';
    }
}
