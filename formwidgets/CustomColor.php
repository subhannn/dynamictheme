<?php namespace Kincir\Dynamictheme\FormWidgets;

use Lang;
use ApplicationException;
use Backend\Classes\FormWidgetBase;

class CustomColor extends FormWidgetBase
{
    public $clear = false;

    public $defaultColor = '#ffffff';

    /**
     * {@inheritDoc}
     */
    public function init()
    {
        $this->fillFromConfig([
            'clear',
            'defaultColor'
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
        $this->vars['field'] = $this->formField;
        $this->vars['value'] = $this->getLoadValue();

        if($this->clear)
            $this->vars['clear'] = true;

        if($this->clear == false)
            $this->vars['defaultColor'] = $this->defaultColor;
    }

    /**
     * {@inheritDoc}
     */
    protected function loadAssets()
    {
        $this->addJs('js/iris.js', 'core');
        $this->addJs('js/color.pick2.js', 'core');
        $this->addJs('js/transparent.iris.js', 'core');
        $this->addCss('css/style.css', 'core');
    }
}