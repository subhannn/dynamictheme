<?php namespace Kincir\Dynamictheme\Classes;

use Kincir\MediaManager\Classes\KincirMediaLibrary;

class AttributesHelper
{
	protected $attributes = [];

	protected $value = null;

	protected $getMethod = [
		'kincirmediafinder'	=> 'getMediaFinder'
	];

	public function __construct($attributes=[], $value=''){
		$this->attributes = $attributes;
		$this->value = $value;
	}

	protected function getValueAttributes(){
		if(!isset($this->attributes['type']))
			return null;

		$type = $this->attributes['type'];

		if(!isset($this->getMethod[$type]))
			return $this->value;

		if(!method_exists($this, $this->getMethod[$type]))
			return $this->value;

		return call_user_func_array([$this, $this->getMethod[$type]], []);
	}

	protected function getMediaFinder(){
		$detail = KincirMediaLibrary::instance()->getItems($this->value);
		if(!isset($detail->publicUrl))
			return '';

		return url($detail->publicUrl);
	}

	public function __toString(){
		return $this->getValueAttributes();
	}
}