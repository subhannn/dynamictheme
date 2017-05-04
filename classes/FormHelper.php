<?php namespace Kincir\Dynamictheme\Classes;

use stdClass;
use Kincir\Dynamictheme\Classes\AttributesHelper;

class FormHelper
{
	use \October\Rain\Support\Traits\Singleton;

	protected $defaultFieldConfig = [
		'colorpicker'	=> [
			'availableColors' => ['#3498db', '#e67e22', '#ecf0f1']
		],
		'kincirmediafinder'	=> [
			'callback'	=> false,
			'width'		=> '200px',
			'height'	=> '100px'
		],
		// 'fontlist'		=> [
		// 	'type'		=> 'dropdown',
		// 	'font'		=> true,
		// ]
	];

	protected $styles = [];

	protected $partialObj = null;

	public function setPartialObj($partialObj){
		$this->partialObj = $partialObj;

		return $this;
	}

	public function parse($config=[]){
		$configForm = [];
		$design = [];
		$counter = 0;
		$this->styles = [];
		foreach ($config as $key => $value) {
			$type = isset($value['type'])?$value['type']:'text';
			$attr = $value;
			if(isset($this->defaultFieldConfig[$type]))
				$attr = array_merge($attr, $this->defaultFieldConfig[$type]);

			if(!isset($attr['indexField'])){
				$attr['indexField'] = $counter;
			}

			if(isset($attr['css']) && !empty($attr['css'])){
				$attr['tab'] = 'Design';
				$attr['tabSort'] = 2;
				$this->styles[$key] = $attr['css'] = $this->overrideStyle($attr);
				$attr['arrName'] = 'style';
			}else{
				$attr['tab'] = 'General';
				$attr['tabSort'] = 1;
				$attr['arrName'] = 'config';
			}
			$configForm[$key] = $attr;
			$counter++;
		}

		$configForm = $this->grouping($configForm);
		// uasort($configForm, function ($item1, $item2) {
		// 	return $item2['tabSort'] <= $item1['tabSort'];
		// });

		$form = new stdClass();
		$form->{'tabs'} = [];
		$form->tabs['fields'] = $configForm;

		return $form;
	}

	protected function grouping($configForm=[]){
		$group = [
			'outside'	=> [],
			'group'		=> []
		];

		foreach ($configForm as $key => $value) {
			if(isset($value['group'])){
				// group
				$group['group'][$value['group']][$key] = $value;
			}else{
				// outside
				$group['outside'][$key] = $value;
			}
		}

		uasort($group['outside'], function ($item1, $item2) {
			return $item2['indexField'] <= $item1['indexField'];
		});

		$groups = $group['outside'];
		foreach ($group['group'] as $value) {
			uasort($value, function ($item1, $item2) {
				return $item2['indexField'] <= $item1['indexField'];
			});
			$groups += $value;
		}

		return $groups;
	}

	protected function overrideStyle($attribute){
		if(!isset($attribute['css']['selector']))
			return $attribute['css'];
		
		$attribute['css'] = array_merge($attribute['css'], [
			'selector'	=> $this->getParentSelector($attribute['css']['selector']),
			'attr'		=> $attribute,
			'type'		=> isset($attribute['css']['type'])?$attribute['css']['type']:'refresh'
		]);

		return $attribute['css'];
	}

	protected function getParentSelector($selector){
		$parent = '';
		if(strpos('{parent}', $selector) !== false){
			$selector = str_replace('{parent}', '', $selector);
		}

		if($this->partialObj != null && method_exists($this->partialObj, 'getParentType')){
			$parent = $this->partialObj->getParentType(true);
		}

		return $parent.' '.$selector;
	}

	public function parsePost($posts=[]){
		if(is_array($posts) && !empty($posts)){
			$arr = [];
			foreach ($posts as $key => $post) {
				if(is_array($post) && !empty($post)){
					foreach ($post as $index => $value) {
						$arr[$index] = $value;
					}
				}
			}

			return $arr;
		}

		return [];
	}

	public function parseStyleToArray($config=[], $attributes=[]){
		$this->parse($config);

		$style = [];
		if(is_array($this->styles) && !empty($this->styles)){
			foreach ($this->styles as $key => $value) {
				if(isset($attributes[$key]) && !empty($attributes[$key])){
					$search = '[value]';
					$replace = new AttributesHelper($value['attr'], $attributes[$key]);
					$selector = (!empty($parentSelector)?$parentSelector.' ':'').$value['selector'];
					$style[$selector][] = str_replace($search, $replace, $value['style']);
				}
			}
		}
		
		return $style;
	}

	public function getStylesArray(){
		$styles = [];
		foreach ($this->styles as $key => $value) {
			$styles[$key] = [
				'selector'	=> $value['selector'],
				'style'		=> $value['style']
			];
		}

		return $styles;
	}

	public function covertStyle($style=[]){
		if(!$style)
			return '';

		$s = '';
		foreach ($style as $key => $value) {
			$s .= $key."{\n";
			foreach ($value as $css) {
				$s .= "\t".$css."\n";
			}
			$s .= "}\n";
		}

		return '<style type="text/css">'.$s.'</style>';
	}

	public function splitComponentAttr($attributes, $alias){
		if(!$attributes)
			return [];

		$attr = [];
		foreach ($attributes as $key => $value) {
			if(strpos($key, '-') !== false && $split = explode('-', $key)){
				list($comp, $index) = $split;
				$attr[$comp][$index] = $value;
			}
		}

		return isset($attr[$alias])?$attr[$alias]:[];
	}
}