<?php namespace Kincir\Dynamictheme\Components;

use Kincir\Dynamictheme\Classes\ThemeComponentBase;
use anlutro\cURL\cURL;
use Cache;

class Article extends ThemeComponentBase
{

    public $propertieConfig = 'properties.yaml';

    public $posts = null;

    protected $attrData = [];
    
    public function componentDetails()
    {
        return [
            'name'        => 'Article',
            'description' => 'aarticle.'
        ];
    }

    public function getFilterOptions(){
        return [
            'all'           => 'All Post',
            'video-type'    => 'Post Video',
            'quiz'          => 'Post Quiz',
            'post'          => 'Post (only article post)',
            'trending'      => 'Trending Post',
            'hits'          => 'Post Hits By Number',
            'popular'       => 'Popular Post'
        ];
    }

    public function init(){
        $this->attrData = Cache::remember('cache-attr-viral', (24*60), function(){
            $curl = new cURL();
            $json = $curl->get(kincir_config('viral_host').'/info/attributes?type=categories,tags,sorting');

            if($json->statusCode == 200 && !empty($json->body)){
                return json_decode($json->body, true);
            }

            return [];
        });

        if(!$this->attrData)
            Cache::forget('cache-attr-viral');

    }

    public function getGroupOptions(){
        return [
            ''          => '--Choose Group--',
            'category'  => 'By Category',
            'tag'       => 'By Tagging'
        ];
    }

    public function getCategoryOptions(){
        if(isset($this->attrData['categories']) && count($this->attrData['categories']) > 0){
            $json = $this->attrData['categories'];
            
            if(!isset($json[0])){
                $json[''] = '--Choose Category--';
            }

            return $json;
        }

        return [];
    }

    public function getSortingOptions(){
        if(isset($this->attrData['sorting']) && count($this->attrData['sorting']) > 0){
            $json = $this->attrData['sorting'];

            if(!isset($json[0])){
                $json[''] = '--Choose Sorting--';
            }

            return $json;
        }

        return [];
    }

    public function getTagOptions(){
        if(isset($this->attrData['tags']) && count($this->attrData['tags']) > 0){
            $json = $this->attrData['tags'];
            if(!isset($json[0])){
                $json[''] = '--Choose Tags--';
            }
            return $json;
        }
        return [];
    }

    public function onRun(){
        $this->posts = $this->getPost();
        // echo '<pre>';
        // print_r($this->fans);
        // exit();
    }



    protected function getPost(){
        $curl = new cURL();
        
        $options = [];
        switch ($this->property('filter')) {
            case 'video-type':
                $options['byType'] = 'video';
                break;
            case 'quiz':
                $options['byType'] = 'quiz';
                break;
            case 'post':
                $options['byType'] = 'post';
                break;
            case 'trending':
                break;
            case 'hits':
                $options['hits'] = '1';
                $options['hitsLimitCount'] = $this->property('hit_count')?$this->property('hit_count'):3000;
                break;
            case 'popular':
                break;
            default:
                break;
        }
        switch ($this->property('group')) {
            case 'category':
                if($category = $this->property('category')){
                    $options['category'] = $category;
                }
                break;
            case 'tag':
                if($tag = $this->property('tag')){
                    $options['tags'] = $tag;
                }
                break;
            default:
                break;
        }
        $options['sort'] = $this->property('sorting')?$this->property('sorting'):'published_at desc';
        $options['perPage'] = $this->property('limit')?$this->property('limit'):10;

        $key = md5(implode('-', $options));
        if(!$json = Cache::get($key, false)){
            $url = $curl->buildUrl(kincir_config('viral_host').'/info/feed', $options);
            $res = $curl->get($url);

            if($res->statusCode == 200 && !empty($res->body)){
                $json = $res->body;
                
                // if(get_env() == 'production')
                    Cache::put($key, $json, 60);
            }
        }
        // print_r($options);
        // exit();
        return json_decode($json, true);
    }
}
