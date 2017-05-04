<?php namespace Kincir\Dynamictheme\FormWidgets;

use Lang;
use ApplicationException;
use Backend\Classes\FormWidgetBase;
use Kincir\Dynamictheme\Classes\BaseModelForm;

class FontInput extends FormWidgetBase
{
    protected $css;

    /**
     * {@inheritDoc}
     */
    public function init()
    {
        $this->fillFromConfig([
            'css',
            // 'allowedUnit',
            // 'placeholder'
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
        $this->vars['fieldOptions'] = BaseModelForm::instance()->getFontList();
    }

    /**
     * {@inheritDoc}
     */
    protected function loadAssets()
    {
        // $this->addCss('css/style.css');
        // $this->addJs('js/cssinput.js');
    }
}