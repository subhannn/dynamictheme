<?php namespace Kincir\Dynamictheme\FormWidgets;

use Lang;
use ApplicationException;
use Backend\Classes\FormWidgetBase;

class CssInput extends FormWidgetBase
{
    protected $column = 4;

    protected $allowedUnit = ['px', 'em', '%'];

    protected $placeholder = ['Top', 'Right', 'Bottom', 'Left'];

    /**
     * {@inheritDoc}
     */
    public function init()
    {
        $this->fillFromConfig([
            'column',
            'allowedUnit',
            'placeholder'
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
        $value = $this->getLoadValue();
        $this->vars['column'] = ceil(12/$this->column);
        $this->vars['field'] = $this->formField;
        $this->vars['input'] = range(0, ($this->column-1));
        $this->vars['value'] = explode(' ', $value);
    }

    /**
     * {@inheritDoc}
     */
    protected function loadAssets()
    {
        $this->addCss('css/style.css');
        $this->addJs('js/cssinput.js');
    }
}