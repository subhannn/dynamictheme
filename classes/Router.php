<?php namespace Kincir\Dynamictheme\Classes;

use Cache;
use Config;
use Cms\Classes\Theme;
// use Kincir\StaticPage\Classes\Page;
use October\Rain\Support\Str;
use October\Rain\Router\Helper as RouterHelper;
use Kincir\Dynamictheme\Models\Page as PageModel;
use Kincir\Dynamictheme\Classes\ContainerPage;

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
        $urlMap = array_key_exists('info', $urlMap) ? $urlMap['info'] : [];

        if (!array_key_exists($url, $urlMap)) {
            return null;
        }
        
        $currentPage = $urlMap[$url];
        // echo '<pre>';
        // print_r($currentPage);
        // exit();

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

            $map = [
                'urls'   => [],
                'files'  => [],
                'titles' => []
            ];
            foreach ($pages as $url => $row) {
                if (!$url) {
                    continue;
                }

                $url = Str::lower(RouterHelper::normalizeUrl($url));
                $file = 'default';

                $map['urls'][$url] = $file;
                $map['files'][$file] = $url;
                $map['titles'][$file] = $row->title;
                $map['info'][$url] = $row;
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
}
