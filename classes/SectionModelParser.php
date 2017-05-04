<?php
namespace Kincir\DynamicTheme\Classes;

// use October\Rain\Halcyon\Model;
use Cms\Classes\CmsCompoundObject;
use Cms\Classes\ComponentManager;

class SectionModelParser extends CmsCompoundObject
{
    /**
     * @var array The attributes that are mass assignable.
     */
    protected $fillable = [
    	'title',
        'preview',
        'markup'
    ];

    public $component = [];

    public $alias = null;

    protected $dirName = 'sections';

    public function afterFetch(){
    	$this->parseComponent();
    	$this->parseAlias();
    }

    // public function getFilePath($fileName = null)
    // {
    //     if ($fileName === null) {
    //         $fileName = $this->fileName;
    //     }

    //     return $this->getDatasource()->getBasePath().'/'.$this->getObjectTypeDirName().'/'.$fileName;
    // }

    protected function parseAlias(){
    	$code = pathinfo($this->fileName, PATHINFO_FILENAME);

    	$this->alias = $code;
    }

    protected function parseComponent(){
    	$settings = $this->getSettingsAttribute();

    	$component = [];
    	$counter = 1;
    	$manager = ComponentManager::instance()->listComponents();
    	$manager = array_keys($manager);

    	foreach ($settings as $setting => $value) {
    		if(!is_array($value)){
    			continue;
    		}

    		$parts = explode(' ', $setting);
    		$comp = isset($parts[0])?$parts[0]:'unset';
    		$componentAlias = isset($parts[1])?$parts[1]:'component'.$counter;

    		if(strpos($comp, 'DynamicTheme') !== false && in_array($comp, $manager)){
    			$component[$setting] = $value;
    			unset($this->attributes[$setting]);
    		}
    	}

    	$this->component = $component;
    }
}