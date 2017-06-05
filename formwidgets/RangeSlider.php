<?php namespace Kincir\Dynamictheme\FormWidgets;

use Lang;
use ApplicationException;
use Backend\Classes\FormWidgetBase;

class RangeSlider extends FormWidgetBase
{
	/**
	 * Min value of integer slider
	 * @var integer
	 */
	public $min = 0;

	/**
	 * Max value of integer slider
	 * @var integer
	 */
	public $max = 100;

	/**
	 * Range of slider can min, max, or true
	 * @var string
	 */
	public $range = 'min';

	/**
	 * Mode of slider, you can number or css
	 * @var string
	 */
	public $mode = 'number';

	/**
	 * Css style point px, em, 
	 * @var string
	 */
	public $cssStylePoint = 'px';

	/**
     * {@inheritDoc}
     */
    public function init()
    {
        $this->fillFromConfig([
        	'min',
        	'max',
        	'orientation',
        	'range',
        	'mode',
        	'cssStylePoint'
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