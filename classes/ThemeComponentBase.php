<?php namespace Kincir\Dynamictheme\Classes;

use Cms\Classes\ComponentBase;
use Cms\Classes\ComponentHelpers;
use ApplicationException;
use stdClass;
use Kincir\Dynamictheme\Models\Settings;
use View;
use Kincir\Dynamictheme\Classes\CssHelper;

class ThemeComponentBase extends ComponentBase
{
    use \System\Traits\ConfigMaker;
    use \Backend\Traits\WidgetMaker;

    public $className;

    protected $partials = null;

    protected $requiredConfig = ['propertieConfig'];

    protected $requiredProperties = ['fields'];

    protected $propertiesConfig = [];

    protected $configForm = null;

    protected $styleForm = null;

    protected $formWidget = null;

    protected $formStyleWidget = null;

    public function __construct($cmsObject = null, $properties = []){

        if(!isset($this->propertieConfig))
            throw new ApplicationException('propertieConfig not found');

        parent::__construct($cmsObject, $properties);

        // $this->validatePartialComponent($properties);
    }

    public function componentDetails(){
        return $this->componentDetails();
    }

    public function defineProperties(){
        return $this->propertiesConfig;
    }

    public function getComponentAttributes(){
        return $this->defineProperties();
    }

    public function getComponentPartials(){
        $name = pathinfo($this->partials, PATHINFO_FILENAME);

        return $name;
    }

    public function getConfigProperties(){
        $config = $this->makeConfig( $this->propertieConfig, $this->requiredProperties);

        if(isset($config->fields))
            $config = (array) $config->fields;

        $newConfig = [];
        $counter = 0;
        foreach ($config as $key => $value) {
            // $callableInput = ['dropdown'];

            // if(isset($value['type']) && in_array($value['type'], $callableInput))
            //     $value['callable'] = 'component|'.$this->alias;
            $value = $this->fixAliasing($this->alias, $value);
            
            if(!isset($value['indexField']))
                $value['indexField'] = $counter;

            if(!isset($value['group']))
                $value['group'] = 'Component ('.$this->alias.')';

            $newConfig[$this->alias.'-'.$key] = $value;
            $counter++;
        }

        return $newConfig;
    }

    protected function fixAliasing($alias, $config){
        foreach ($config as $key => $value) {
            if($key == 'field')
                $config[$key] = $alias.'-'.$value;

            if(is_array($value)){
                $config[$key] = $this->fixAliasing($alias, $value);
            }
        }

        return $config;
    }

    public function __call($name, $args){
        if(method_exists($this, $name))
            return call_user_func_array([$this, $name], $args);

        if($property = $this->property($name)){
            return $property;
        }

        return null;
    }

    public function __get($name){
        if($property = $this->property($name)){
            return $property;
        }

        return null;
    }

    public function __set($name, $value=null){
        $this->setProperty($name, $value);
    }
}
