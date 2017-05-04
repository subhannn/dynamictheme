<?php namespace Cms\Widgets;

use URL;
use Str;
use Lang;
use File;
use Form;
use Input;
use Request;
use Response;
use Exception;
use SystemException;
use ApplicationException;
use Backend\Classes\WidgetBase;

class Theme extends WidgetBase
{
	
	public function __construct($controller, $alias)
    {
        $this->alias = $alias;
        
        parent::__construct($controller, []);
    }
}