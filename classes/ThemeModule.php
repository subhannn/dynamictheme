<?php namespace Kincir\Dynamictheme\Classes;

use Cms;
use File;
use Lang;
use Cache;
use Route;
use Config;
use Validator;
use Yaml;
use ApplicationException;
use Cms\Classes\CmsCompoundObject;
use Kincir\Dynamictheme\Classes\ParserTheme;


/**
 * Represents a static page.
 *
 * @package Kincir\StaticPage
 * @author Alexey Bobkov, Samuel Georges
 */
class ThemeModule extends CmsCompoundObject
{
    protected $configFile = 'config.yaml';

    /**
     * @var string The container name associated with the model, eg: pages.
     */
    protected $dirName = 'modules';

    /**
     * @var array The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'markup',
        'settings',
        'alias',
        'viewId',
        'attr'
    ];

    public function afterFetch(){
        $this->parseComponentSettings();
        $this->loadConfiguration();
    }

    public function getViewIdAttribute(){
        return $this->getCodeAttribute();
    }

    public function getCodeAttribute(){
        $code = pathinfo($this->fileName, PATHINFO_FILENAME);

        return $code;
    }

    public function getParentType($isSelector=false){
        if($isSelector){
            return '['.$this->dirName.'="'.$this->code.'"]';
        }else{
            return $this->dirName;
        }
    }

    public function getCodeClassParent(){
        return '\Kincir\Dynamictheme\Classes\ThemeCode';
    }

    public function loadConfiguration(){
        $code = pathinfo($this->fileName, PATHINFO_FILENAME);
        $path = $this->getFilePath($code.'/'.$this->configFile);

        $config_attr = $this->default_config();
        if(File::isFile($path)){
            $config = Yaml::parse(File::get($path));
            if(isset($config['attr']) && count($config['attr']) > 0){
                $config_attr = array_merge($config_attr, $config['attr']);
                // $this->setAttribute('attr', );
            }
        }

        $this->setAttribute('attr', $config_attr);
    }

    private function default_config(){
        return [
            'disable_on'    => [
                'label' => 'Disable On',
                'type'  => 'checkboxlist',
                'tab'   => 'Responsive',
                'tabSort' => '4',
                'options' => [
                    'mobile'    => 'Mobile',
                    'tablet'    => 'Tablet',
                    'desktop'   => 'Desktop'
                ]
            ]
        ];
    }

    public function getDisableOnValue($value){
        if(!is_array($value)) return '';
        
        $helper = ParserTheme::instance();
        $isEditing = $helper->isEditingMode();

        $cls = [];
        if(in_array('mobile', $value)){
            $cls[] = $isEditing?'hidden-on-mobile':'hidden-xs';
        }
        if(in_array('tablet', $value)){
            $cls[] = $isEditing?'hidden-on-tablet':'hidden-md hidden-ms';
        }
        if(in_array('desktop', $value)){
            $cls[] = $isEditing?'hidden-on-desktop':'hidden-lg';
        }

        return implode(' ', $cls);
    }
}
