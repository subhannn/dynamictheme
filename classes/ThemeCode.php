<?php namespace Kincir\Dynamictheme\Classes;

use Cms\Classes\CodeBase;
use Cms\Classes\ComponentManager;
use Kincir\Dynamictheme\Classes\Section;
use Cms\Classes\CmsException;
use stdClass;
use Kincir\Dynamictheme\Classes\ParserTheme;
use Kincir\Dynamictheme\Classes\ThemeModule;

/**
 * Parent class for PHP classes created for page PHP sections.
 *
 * @package october\cms
 * @author Alexey Bobkov, Samuel Georges
 */
class ThemeCode extends CodeBase
{
    public function onLoadSection(){
        $section = post('code');
        $id = post('id');
        $attr = post();
        unset($attr['code']);
        unset($attr['id']);

        $components = [];
        if(isset($attr['components'])){
            $components = $attr['components'];
            unset($attr['components']);
        }

        $section = Section::loadCached($this->controller->getTheme(), $section);
        if($section){
            $section->{'viewId'} = $id;
            $section->syncOriginal();

            $helper = ParserTheme::instance();
            $helper->setController($this->controller);
            if($components){
                $helper->setDataSection($id, $components);
            }

            $result = $helper->renderPartial($section, $attr);

            return [
                'result'    => $result,
                'components'=> $this->getComponents()
            ];
        }
    }

    protected function getComponents(){
        $components = [];
        foreach ($this->controller->configuration['components'] as $comp) {
            $components[$comp->code] = [
                'code'      => $comp->code
            ];
        }

        return $components;
    }

	public function onLoadComponent(){
		$attr = post();
		$code = post('code');
        unset($attr['code']);

        $module = ThemeModule::find($code);

        if(!$module)
            throw new Exception("Error Processing Request", 1);
        
        return ParserTheme::instance()->setController($this->controller)->renderPartial($module, $attr);
	}
}
