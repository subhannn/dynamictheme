<?php namespace Kincir\Dynamictheme\Classes;

use Lang;
use Cms\Classes\Page as CmsPage;
use Cms\Classes\Theme;
use Cms\Classes\Layout;
use Cms\Classes\CmsException;
use October\Rain\Parse\Syntax\Parser as SyntaxParser;
use Exception;
use Cms\Classes\CmsCompoundObject;
use Kincir\Dynamictheme\Classes\ContainerPage;
use Kincir\Dynamictheme\Classes\ParserTheme;

/**
 * Represents a static page controller.
 *
 * @package rainlab\pages
 * @author Alexey Bobkov, Samuel Georges
 */
class Controller
{
    use \October\Rain\Support\Traits\Singleton;

    protected $theme;

    /**
     * Initialize this singleton.
     */
    protected function init()
    {
        $this->theme = Theme::getActiveTheme();
        if (!$this->theme) {
            throw new CmsException(Lang::get('cms::lang.theme.active.not_found'));
        }
    }

    /**
     * Creates a CMS page from a static page and configures it.
     * @param string $url Specifies the static page URL.
     * @return \Cms\Classes\Page Returns the CMS page object or NULL of the requested page was not found.
     */
    public function initCmsPage($url, $route)
    {
        $router = new Router($this->theme);
        $page = $router->findByUrl($url);
        
        $parameters = $router->getParameters();
        if(is_array($parameters) && $parameters)
            $route->setParameters($parameters);
        // print_r($router->getParameters());
        // exit();
        if (!$page) {
            return null;
        }

        return $page;
    }

    public function injectPageTwig($controller, $page, $loader, $twig)
    {
        if(!$page instanceof ContainerPage)
            return;
        
        $page->setController($controller);
    }

    public function initPageComponents($cmsController, $page)
    {
        if ( !$page instanceof ContainerPage) {
            return;
        }

        $page->initCmsComponents($cmsController);
    }
}
