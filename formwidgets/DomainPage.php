<?php namespace Kincir\Dynamictheme\FormWidgets;

use Lang;
use ApplicationException;
use Backend\Classes\FormWidgetBase;

class CssInput extends FormWidgetBase
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
        
    }

    /**
     * {@inheritDoc}
     */
    protected function loadAssets()
    {
    }
}