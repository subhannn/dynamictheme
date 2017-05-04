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

    public function getFilterDateOptions(){
        return [
            ''               => '---Choose Filter By Date--',
            'last_1_week'    => '1 Last Week',
            'last_2_week'    => '2 Last Week',
            'last_3_week'    => '3 Last Week',
            'last_1_month'   => '1 Last Month',
            'last_2_month'   => '2 Last Month',
            'last_3_month'   => '3 Last Month'
        ];
    }

    public function getExcludeTypeOptions(){
        return [
            ''               => '---Choose Exclude Type--',
            'tag'            => 'Tagging',
            'category'       => 'Category'
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

    public function getExcludeCategoryOptions(){
        return $this->getCategoryOptions();
    }

    public function getExcludeTagOptions(){
        return $this->getTagOptions();
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

        if($this->property('filterDate')){
            $options['dateRange'] = $this->property('filterDate');
        }

        if($this->property('excludeType')){
            $excludeType = $this->property('excludeType');
            $options['excludeType'] = $excludeType;
            if($excludeType == 'tag'){
                $options['exclude'] = $this->property('excludeTag')?$this->property('excludeTag'):'';
            }else if($excludeType == 'category'){
                $options['exclude'] = $this->property('excludeCategory')?$this->property('excludeCategory'):'';
            }
        }

        $key = md5(implode('-', $options));
        $json = [];
        $limit = $options['perPage'];
        if(!$json = Cache::get($key, false)){
            $json = [];
            if($options['sort'] == 'random'){
                $options['perPage'] += 5;
            }
            $url = $curl->buildUrl(kincir_config('viral_host').'/info/feed', $options);
            $res = $curl->get($url);

            if($res->statusCode == 200 && !empty($res->body)){
                $json = $res->body;
                
                if(kincir_config('cms.enableAssetCache'))
                    Cache::put($key, $json, 15);
            }
        }

        if($options['sort'] == 'random' && $json){
            $json = json_decode($json, true);
            shuffle($json);
            array_splice($json, $limit);
            return $json;
        }
        
        return json_decode($json, true);
    }
}
