<?php namespace Kincir\Dynamictheme\FormWidgets;

use Lang;
use ApplicationException;
use Backend\Classes\FormWidgetBase;
use Kincir\Dynamictheme\Classes\BaseModelForm;
use Kincir\Dynamictheme\Classes\FontHelper;

class FontInput extends FormWidgetBase
{
    /**
     * {@inheritDoc}
     */
    public function init()
    {
        $this->fillFromConfig([
        ]);
    }

    /**
     * {@inheritDoc}
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('input');
    }

    /**
     * Prepares the list data
     */
    public function prepareVars()
    {
        $this->vars['fieldOptions'] = FontHelper::instance()->getFontList();
        $this->vars['field'] = $this->formField;
        $this->vars['value'] = $this->getLoadValue();
    }

    public function getCss($type){
        $css = $this->getConfig('css');
        $style = isset(FontHelper::$font_bundle['style'][$type])?FontHelper::$font_bundle['style'][$type]:'';

        return [
            'selector'  => $css['selector'],
            'type'      => 'font',
            'style'     => $style
        ];
    }

    /**
     * {@inheritDoc}
     */
    protected function loadAssets()
    {
        $this->addCss('css/style.css');
        $this->addJs('js/script.js');
    }
}