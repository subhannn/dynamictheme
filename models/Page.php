<?php namespace Kincir\Dynamictheme\Models;

use Model;
use Lang;
use Config;
use Cms\Classes\Theme;
use Cms\Classes\Layout;
use Event;

/**
 * Model
 */
class Page extends Model
{
    use \October\Rain\Database\Traits\Validation;

    use \October\Rain\Database\Traits\NestedTree;

    /*
     * Validation
     */
    public $rules = [
        'title' => 'required|max:80',
        'slug' => ['required', 'regex:/^[a-z0-9\/\:_\-\*\[\]\+\?\|]*$/i', 'unique:kincir_dynamictheme_page']
    ];

    /*
     * Disable timestamps by default.
     * Remove this line if timestamps are defined in the database table.
     */
    public $timestamps = true;

    /**
     * @var string The database table used by the model.
     */
    public $table = 'kincir_dynamictheme_page';

    public $jsonable = ['data'];

    public $url;

    public function scopeGetDropdownPages($query){
        $get = $query->getNested();
        $list = [];
        $this->buildDropdown($get, $list, true);
        return $list;
    }

    public function afterValidate() {
        if(post('draft') == '1'){
            $this->status = '2';
        }else if(post('publish') == '1'){
            $this->status = '1';
        }

        if(isset($this->data) && count($this->data) > 0){
            $arr = json_decode($this->getOriginal('data'), true);
            if(isset($arr['config'])){
                $this->data = array_merge(['config'=>$arr['config']], $this->data);
            }
        }
    }



    public function scopeUrlLists($query){
        $cacheable = Config::get('cms.enableRoutesCache');
        $cached = $cacheable ? Cache::get(self::CACHE_KEY, false) : false;

        if (!$cached || ($unserialized = @unserialize($cached)) === false) {
            $get = $query->getNested();

            $list = [];
            $this->buildDropdown($get, $list);

            $unserialized = $list;
        }
        
        return $unserialized;
    }

    public function buildDropdown($get, &$list, $withLabel=false){
        foreach ($get as $row) {
            if($withLabel){
                $label = $row->title.' - '.$row->url;
                $list[$row->id] = $label;
            }else{
                $list[$row->slug] = $row;
            }

            if($row->children){
                $this->buildDropdown($row->children, $list, $withLabel);
            }
        }
    }

    public function afterFetch(){
        if($this->parent){
            foreach ($this->getParents() as $row) {
                $this->url .= $row->slug;
            }
            $this->url .= $this->slug;
            $this->url = $this->getUrlAttribute($this->url);
        }else{
            $this->url = $this->getUrlAttribute($this->slug);
        }
    }

    public function beforeSave(){
        if(isset($this->data['config'])){

        }
    }

    public function getLayoutOptions()
    {
        if (!($theme = Theme::getEditTheme())) {
            throw new ApplicationException(Lang::get('cms::lang.theme.edit.not_found'));
        }

        $layouts = Layout::listInTheme($theme, true);
        $result = [];
        $result[null] = Lang::get('cms::lang.page.no_layout');
        foreach ($layouts as $layout) {
            $baseName = $layout->getBaseFileName();
            $result[$baseName] = strlen($layout->name) ? $layout->name : $baseName;
        }

        return $result;
    }

    public function getSubdomainOptions(){
        $subdomain = Event::fire('plugin.kincir.registerSubdomain');
        $subs = [];
        if(is_array($subdomain)){
            foreach ($subdomain as $value) {
                $subs = array_merge($subs, $value);
            }
        }
        return $subs;
    }

    public function getPageUrl(){
        $parameters = [];
        $url = $this->url;

        if(isset($this->data['sub_domain']) && !empty($this->data['sub_domain'])){
            $subdomain = explode(',', $this->data['sub_domain']);
            $url = url($url);
            $url = overrideSubDomain($subdomain[0], $url);
        }

        return $url;
    }

    public function getUrlAttribute($url=null){
        $parameters = [];
        if(isset($this->data['default_slug_parameter']) && !empty($this->data['default_slug_parameter'])){
            $parameters = @json_decode($this->data['default_slug_parameter'], true);
        }

        return urlFromPattern($url, $parameters);
    }
}