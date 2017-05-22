<?php namespace Kincir\Dynamictheme\Classes;

use Cache;
use Config;
use Cms\Classes\Theme;
// use Kincir\StaticPage\Classes\Page;
use October\Rain\Support\Str;
use October\Rain\Router\Helper as RouterHelper;
use Kincir\Dynamictheme\Models\Page as PageModel;
use Kincir\Dynamictheme\Classes\ContainerPage;
use Request;
use Kincir\Dynamictheme\Classes\ParserTheme;
use October\Rain\Router\Router as RainRouter;

/**
 * A router for static pages.
 *
 * @package Kincir\StaticPage
 * @author Alexey Bobkov, Samuel Georges
 */
class Router
{
    /**
     * @var \Cms\Classes\Theme A reference to the CMS theme containing the object.
     */
    protected $theme;

    /**
     * @var array Contains the URL map - the list of page file names and corresponding URL patterns.
     */
    private static $urlMap = [];

    /**
     * @var array Request-level cache
     */
    private static $cache = [];

    protected $page;

    protected $routerObj = null;

    protected $parameters;

    /**
     * Creates the router instance.
     * @param \Cms\Classes\Theme $theme Specifies the theme being processed.
     */
    public function __construct(Theme $theme)
    {
        $this->theme = $theme;
    }

    /**
     * Finds a static page by its URL.
     * @param string $url The requested URL string.
     * @return \Kincir\StaticPage\Classes\Page Returns \Kincir\StaticPage\Classes\Page object or null if the page cannot be found.
     */
    public function findByUrl($url)
    {
        $url = Str::lower(RouterHelper::normalizeUrl($url));
        $urlMap = $this->getUrlMap();
        $router = $this->getRouterObject();

        if (!$router->match($url)) {
            return null;
        }

        $pageId = $router->matchedRoute();
        $this->parameters = $router->getParameters();

        $currentPage = $urlMap[$pageId]['info'];
        $this->page = $currentPage;

        /**
         * Check limited by subdomain
         * @var [type]
         */
        if(ParserTheme::instance()->isEditingMode() == false){
            if($this->isLimitBySubDomain())
                return null;
        }

        $page = ContainerPage::find('base');
        if(!$page){
            $page = ContainerPage::create([
                'fileName'  => 'base'
            ]);
        }

        $page->fill([
            'settings'  => [
                'title' => $currentPage->title,
                'description' => (isset($currentPage->data['meta_description'])?$currentPage->data['meta_description']:''),
                'viewBag'   => [
                    'title' => $currentPage->title,
                    'url'   => $currentPage->url,
                    'layout'=> ((isset($currentPage->data['layout']) && !empty($currentPage->data['layout']))?$currentPage->data['layout']:'default'),
                    'meta_title'=> (isset($currentPage->data['meta_title'])?$currentPage->data['meta_title']:''),
                    'meta_description'=> (isset($currentPage->data['meta_description'])?$currentPage->data['meta_description']:''),
                    'is_hidden'=> (isset($currentPage->data['is_hidden'])?$currentPage->data['is_hidden']:0)
                ]
            ]
        ]);

        foreach ($currentPage->data as $key => $value) {
            $page->settings[$key] = $value;
        }

        // echo '<pre>';
        // print_r($page);
        // exit();
        return $page;
    }

    /**
     * Sets the current routing parameters.
     * @param  array $parameters
     * @return array
     */
    public function setParameters(array $parameters)
    {
        $this->parameters = $parameters;
    }

    /**
     * Returns the current routing parameters.
     * @return array
     */
    public function getParameters()
    {
        return $this->parameters;
    }

    protected function getRouterObject()
    {
        if ($this->routerObj !== null) {
            return $this->routerObj;
        }

        /*
         * Load up each route rule
         */
        $router = new RainRouter();
        foreach ($this->getUrlMap() as $id => $pageInfo) {
            $router->route($id, $pageInfo['url']);
        }

        /*
         * Sort all the rules
         */
        $router->sortRules();

        return $this->routerObj = $router;
    }

    /**
     * Autoloads the URL map only allowing a single execution.
     * @return array Returns the URL map.
     */
    protected function getUrlMap()
    {
        if (!count(self::$urlMap)) {
            $this->loadUrlMap();
        }

        return self::$urlMap;
    }

    /**
     * Loads the URL map - a list of page file names and corresponding URL patterns.
     * The URL map can is cached. The clearUrlMap() method resets the cache. By default
     * the map is updated every time when a page is saved in the back-end, or 
     * when the interval defined with the cms.urlCacheTtl expires.
     * @return boolean Returns true if the URL map was loaded from the cache. Otherwise returns false.
     */
    protected function loadUrlMap()
    {
        $key = $this->getCacheKey('dynamictheme-page-url-map');

        $cacheable = Config::get('cms.enableRoutesCache');
        $cached = $cacheable ? Cache::get($key, false) : false;

        if (!$cached || ($unserialized = @unserialize($cached)) === false) {
            /*
             * The item doesn't exist in the cache, create the map
             */
            $pages = $this->getListUrlByModel();

            $map = [];
            foreach ($pages as $url => $row) {
                if (!$url) {
                    continue;
                }

                $url = Str::lower(RouterHelper::normalizeUrl($url));
                $file = 'default';

                $map[$row->id]['url'] = $url;
                $map[$row->id]['filename'] = $file;
                $map[$row->id]['title'] = $row->title;
                $map[$row->id]['info'] = $row;
            }

            self::$urlMap = $map;

            return false;
        }

        self::$urlMap = $unserialized;

        return true;
    }

    protected function getListUrlByModel(){
        $pages = PageModel::UrlLists();
        
        return $pages;
    }

    /**
     * Returns the caching URL key depending on the theme.
     * @param string $keyName Specifies the base key name.
     * @return string Returns the theme-specific key name.
     */
    protected function getCacheKey($keyName)
    {
        return crc32($this->theme->getPath()).$keyName;
    }

    /**
     * Clears the router cache.
     */
    public function clearCache()
    {
        Cache::forget($this->getCacheKey('static-page-url-map'));
    }

    protected function isLimitBySubDomain(){
        $subdomainLimited = (isset($this->page->data['sub_domain']) && !empty($this->page->data['sub_domain']))?$this->page->data['sub_domain']:null;

        if($subdomainLimited){
            $subdomainLimited = explode(',', $subdomainLimited);
            if(in_array(getCurrentSubDomain(), $subdomainLimited)){
                return false;
            }else{
                return true;
            }
        }

        return false;
    }
}
