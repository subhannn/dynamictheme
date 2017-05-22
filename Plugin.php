<?php namespace Kincir\Dynamictheme;

use System\Classes\PluginBase;
use Backend;
use Event;
use Config;
use Kincir\Dynamictheme\Classes\Controller;
use Cms\Classes\Controller as CmsController;
use Kincir\Dynamictheme\Classes\ContainerPage;
use Kincir\Dynamictheme\Twig\Extension;

class Plugin extends PluginBase
{
    public function registerThemeComponents()
    {
        return [
            'Kincir\Dynamictheme\Components\Article' => 'DynamicThemeArticle',
            'Kincir\Dynamictheme\Components\KincirFans' => 'KincirFans',
        ];
    }

    public function registerSettings()
    {
    }
    
    public function registerFormWidgets() {
        return [
            'Kincir\Dynamictheme\FormWidgets\CssInput' => [
                'label' => 'Css Input',
                'code' => 'cssinput'
            ],
            'Kincir\Dynamictheme\FormWidgets\FontInput' => [
                'label' => 'Font Input',
                'code' => 'fontinput'
            ],
            'Kincir\Dynamictheme\FormWidgets\TokenInput' => [
                'label' => 'Token Input',
                'code' => 'tokeninput'
            ],
        ];
    }

    public function registerNavigation() {
        return [
            'theme' => [
                'label' => 'kincir.dynamictheme::lang.menu.main_menu',
                'url' => Backend::url('kincir/dynamictheme/index'),
                'icon' => 'icon-paint-brush'
            ]
        ];
    }

    public function register(){

        Config::set('cms.twigNoCache', true);
        /**
        * Register twig
        */
        Event::listen('cms.page.beforeDisplay', function($controller, $url, $page){
            $twig = $controller->getTwig();
            $loader = $controller->getLoader();
            $twig->addExtension(new Extension($controller));
            
            if($page instanceof ContainerPage || get_class($page) == 'Kincir\Dynamictheme\Plugin'){
                // init list component
                if(!isset($controller->configuration)){
                    $controller->{'configuration'} = [];
                    $controller->configuration['customStyle'] = [];
                    $controller->configuration['configData'] = [];
                    $controller->configuration['components'] = [];
                }
                
                Controller::instance()->injectPageTwig($controller, $page, $loader, $twig);
            }
        });

        Event::listen('cms.router.beforeRoute', function($url) {
            return Controller::instance()->initCmsPage($url, true);
        });

        Event::listen('cms.page.initComponents', function($controller, $page) {
            Controller::instance()->initPageComponents($controller, $page);
        });
    }
}
