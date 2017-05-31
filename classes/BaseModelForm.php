<?php
namespace Kincir\Dynamictheme\Classes;

use Cms\Classes\ComponentManager;
use Cms\Classes\Theme;

class BaseModelForm{
	use \October\Rain\Support\Traits\Singleton;

	public $exists = false;

	protected $attributes = [];

	protected $config;

	protected $objPartial;

	public function __construct($objPartial, $config = [], $attributes = []){
		$this->objPartial = $objPartial;
		$this->fill($attributes);
		$this->normalizeConfig($config);
	}

	public function fill($attributes=[]){
		// if(!is_array($attributes))
		// 	return;

		// foreach ($attributes as $key => $value) {
		// 	$this->{$key} = $value;
		// }
		$this->attributes = $attributes;
	}

	protected function normalizeConfig($config){
		if(!isset($config->tabs))
			return;
		if(!isset($config->tabs['fields']))
			return;

		$fields = ($config->tabs['fields'])?:[];
		foreach ($fields as $key => $value) {
			$index = $this->splitIndex($key);
			if(strpos($index, '-') !== false){
				list($cmp, $name) = explode('-', $index);
				$this->config[$cmp][$name] = $value;
				$this->setDefaultValue($name, $key);
			}else{
				$this->config[$index] = $value;
				$this->setDefaultValue($index, $key);
			}
		}
	}

	protected function setDefaultValue($key, $attributeName){
		if(!isset($this->$key))
			$this->{$key} = null;

		$value = isset($this->attributes[$attributeName])?$this->attributes[$attributeName]:null;

		$this->{$attributeName} = $this->getValueByOverride($attributeName, $value);
	}

	protected function getValueByOverride($attributeName, $value){
		if($value == null) return $value;

		$alias = $attr = '';
		if(strpos($attributeName, '-') !== false){
			list($alias, $attr) = explode('-', $attributeName);
		}

		if($alias && $attr){
			if($componentObj = $this->findByComponentName($alias)){
				$methodName = 'get'.studly_case($attr).'OverrideValue';
				if ($componentObj && $componentObj->methodExists($methodName)) {
	                $result = $componentObj->$methodName($value);
	                return ($result) ?$result: $value;
	            }
			}
		}

		return ($value)?$value:null;
	}

	protected function findByComponentName($name){
  		if(!$this->objPartial)
  			return false;

        if(isset($this->objPartial->components[$name])){
            return $this->objPartial->components[$name];
        }

        return false;
	}

	protected function splitIndex($index){
		preg_match('/(config|style)\[(.+)\]/', $index, $match);
		if($match){
			return isset($match[2])?$match[2]:$index;
		}

		return $index;
	}

	public function getDropdownOptions($attribute=[], $value, $data){
		$alias = $attr = '';
		if(strpos($attribute, '-') !== false){
			list($alias, $attr) = explode('-', $attribute);
		}
		
		if($attr && $alias){
			if($componentObj = $this->findByComponentName($alias)){
				$methodName = 'get'.studly_case($attr).'Options';
				if ($componentObj && $componentObj->methodExists($methodName)) {
	                $result = $componentObj->$methodName();
	                return ($result) ?$result: [];
	            }
			}
		}else if(isset($this->config[$attribute]) && $this->config[$attribute]['font'] == true){
			return $this->getFontList();
		}

		return [];
	}
}