<?php namespace Kincir\Dynamictheme\Classes;

use Cms\Classes\Theme;
use Kincir\Dynamictheme\Models\Settings;

class FontHelper
{
	use \October\Rain\Support\Traits\Singleton;	
	use \Kincir\Dynamictheme\Classes\StyleTrait;

	public static $font_bundle = [
        'style' => [
            'font_family'   => "font-family: '[value]' !important;",
            'font_weight'   => 'font-weight: bold !important;',
            'font_style'    => 'font-style: italic !important;',
            'text_transform'=> 'text-transform: uppercase !important;',
            'text_decoration'=> 'text-decoration: underline !important;'
        ]
    ];

    protected $google_font_url = 'https://fonts.googleapis.com/css?family=';

    protected $font_load = [];

    public function getFontReplacer($value=[]){
    	if(!$value)
    		return '';

    	$str = '';
    	foreach ($value as $key => $val) {
    		if(isset(self::$font_bundle['style'][$key]) && !empty($val)){
    			if($key == 'font_family')
    				$this->font_load[] = $val;

    			$rep = self::$font_bundle['style'][$key];
    			$search = '[value]';
    			$str .= str_replace($search, $val, $rep);
    		}
    	}

    	return $str;
    }

    public function getFontLoad(){
    	return $this->font_load;
    }

    public function getCustomFontLoad(){
    	$setting = Settings::instance();

    	$fonts = $setting->google_font;
    	$fonts = $fonts?explode(',', $fonts):[];

    	$result = array_intersect($fonts, $this->font_load);

    	$fonts = str_replace(' ', '+', implode('|', $result));
    	if(!$fonts) return '';

    	return $this->google_font_url.$fonts;
    }

	public function getFontList(){
        $external = $this->getExternalFont();
        $default = $this->defaultGoogleFont();
        $all = array_merge($default, $external);

        return $all;
    }

    public function defaultGoogleFont(){
    	$setting = Settings::instance();

    	$fonts = $setting->google_font;
    	$fonts = $fonts?explode(',', $fonts):[];
    	$fonts = array_combine($fonts, $fonts);
    	arsort($fonts);

    	return $fonts;
    }

    public function getDefaultGoogleFontLink(){
    	$setting = Settings::instance();

    	$fonts = $setting->google_font;
    	$fonts = str_replace(',', '|', $fonts);
    	$fonts = str_replace(' ', '+', $fonts);

    	$google_font = $this->google_font_url.$fonts;

    	return $google_font;
    }

    public function getExternalFont(){
        $theme = Theme::getActiveTheme();
        $themeConfig = $theme->getConfig();
        $fonts = [];

        /**
         * External Font
         */
        if(isset($themeConfig['theme']) && isset($themeConfig['theme']['font']) && count($themeConfig['theme']['font']) > 0){
            foreach ($themeConfig['theme']['font'] as $font) {
                $fonts[$font] = $font;
            }
        }

        return $fonts;
    }
}