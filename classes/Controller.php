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
    public function initCmsPage($url, $preview_editing_theme=false)
    {
        if(!$preview_editing_theme)
            return null;

        // CmsCompoundObject::clearCache($this->theme);
        $router = new Router($this->theme);
        $page = $router->findByUrl($url);
        // echo '<pre>';
        // print_r($page);
        // exit();
        if (!$page) {
            return null;
        }

        return $page;

        // $viewBag = $page->viewBag;

        // $cmsPage = CmsPage::inTheme($this->theme);
        // $cmsPage->url = $url;
        // $cmsPage->apiBag['staticPage'] = $page;

        
        //  * Transfer specific values from the content view bag to the page settings object.
         
        // $viewBagToSettings = ['title', 'layout', 'meta_title', 'meta_description', 'is_hidden'];

        // foreach ($viewBagToSettings as $property) {
        //     $cmsPage->settings[$property] = array_get($viewBag, $property);
        // }

        // return $cmsPage;
    }

    public function injectPageTwig($controller, $page, $loader, $twig)
    {
        if(!$page instanceof ContainerPage)
            return;
        
        $page->setController($controller);
    }

    public function getPageContents($page)
    {
        if (!isset($page->apiBag['staticPage'])) {
            return;
        }

        return $page->apiBag['staticPage']->getProcessedMarkup();
    }

    public function getPlaceholderContents($page, $placeholderName, $placeholderContents)
    {
        if (!isset($page->apiBag['staticPage'])) {
            return;
        }

        return $page->apiBag['staticPage']->getProcessedPlaceholderMarkup($placeholderName, $placeholderContents);
    }

    public function initPageComponents($cmsController, $page)
    {
        if ( !$page instanceof ContainerPage) {
            return;
        }

        $page->initCmsComponents($cmsController);
    }

    public function parseSyntaxFields($content)
    {
        try {
            return SyntaxParser::parse($content, [
                'varPrefix' => 'extraData.',
                'tagPrefix' => 'page:'
            ])->toTwig();
        }
        catch (Exception $ex) {
            return $content;
        }
    }
}
