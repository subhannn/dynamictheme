<?php namespace Kincir\Dynamictheme;

use System\Classes\PluginBase;
use Backend;
use Event;
use Config;
use Kincir\Dynamictheme\Classes\Controller;
use Cms\Classes\Controller as CmsController;
use Backend\Classes\Controller as BackendController;
use Kincir\Dynamictheme\Classes\ContainerPage;
use Kincir\Dynamictheme\Twig\Extension;
use Request;
use Block;

class Plugin extends PluginBase
{
    public function registerThemeComponents()
    {
        return [
            'Kincir\Dynamictheme\Components\Article' => 'DynamicThemeArticle',
            'Kincir\Dynamictheme\Components\KincirFans' => 'KincirFans',
        ];
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
            'Kincir\Dynamictheme\FormWidgets\CustomColor' => [
                'label' => 'Custom Color',
                'code' => 'customcolor'
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

        Event::listen('cms.router.beforeRoute', function($url, $route) {
            return Controller::instance()->initCmsPage($url, $route);
        });

        Event::listen('cms.page.initComponents', function($controller, $page) {
            Controller::instance()->initPageComponents($controller, $page);
        });

        BackendController::extend(function($controller){
            $controller->addJs('/plugins/kincir/dynamictheme/assets/js/jquery-ui.js');
        });
    }

    public function registerSettings(){
        return [
            'settings' => [
                'label'       => 'Dynamictheme Settings',
                'description' => 'Configure dynamictheme settings.',
                'icon'        => 'icon-paint-brush',
                'class'       => 'Kincir\Dynamictheme\Models\Settings',
                'order'       => 100,
                'permissions' => ['backend.access_dashboard'],
            ]
        ];
    }
}
