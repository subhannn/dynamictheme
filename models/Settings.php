<?php
namespace Kincir\Dynamictheme\Models;

use Model;
use anlutro\cURL\cURL;
use Cache;

class Settings extends Model{

    public $implement = [
    	'System.Behaviors.SettingsModel',
    	'Kincir.Helper.Behaviors.OctoberSettings'
    ];

    public $settingsCode = 'kincir_dynamic_page_settings';

    public $settingsFields = 'fields.yaml';

    private $google_font = [
    	'font_cache_key'	=> 'AIzaSyDvIh9SovHr8TBOrOUt1OGIc-aUXYky_qc',
    	'font_cache'		=> 'GOOGLE_FONT_API_CACHE',
    	'api_url'			=> 'https://www.googleapis.com/webfonts/v1/webfonts'
    ];

    public function getGoogleFontOptions(){
    	if(!$fonts = Cache::get($this->google_font['font_cache'], false)){
    		$curl = new cURL();
    		$options = [
    			'key'	=> $this->google_font['font_cache_key'],
    			'sort'	=> 'trending'
    		];
    		$url = $curl->buildUrl($this->google_font['api_url'], $options);
	        $res = $curl->get($url);

	        if($res->statusCode == 200 && !empty($res->body)){
	            $json = $res->body;
	            
	            Cache::put($this->google_font['font_cache'], $json, 60 * 24);
	        }
    	}

    	$data = @json_decode($fonts);
    	if(isset($data->items) && count($data->items) > 0){
    		$ft = [];
    		foreach ($data->items as $font) {
    			$ft[] = $font->family;
    		}

    		return $ft;
    	}

    	return [];
    }
}