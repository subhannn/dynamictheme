<?php namespace Kincir\Dynamictheme\Classes;

class CssHelper
{
	use \October\Rain\Support\Traits\Singleton;

	protected $css = [
		'text_color'	=> 'color: [value]',
		'border_width'	=> 'border-width: [value]',
		'border_color'	=> 'border-color: [value]',
		'border_style'	=> 'border-style: [value]',
		'border_radius'	=> 'border-radius: [value]'
	];

	public function getGlobalCss($keys = 'global', $styles=[]){
		$css = '';
		if(!is_array($styles))
			return '';

		foreach ($styles as $key => $value) {
			if(isset($this->css[$key]) && !empty($value)){
				$css .= $this->smartReplace($this->css[$key], $value);
			}
		}

		if($css){
			return "<style type=\"text/css\">[th-style=\"$keys\"]{".$css."}</style>";
		}

		return $css;
	}

	protected function smartReplace($str, $value){
		$search = '[value]';
		$replace = $value;

		return str_replace($search, $replace, $str).";";
	}
}