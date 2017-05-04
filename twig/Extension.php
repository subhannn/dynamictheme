<?php namespace Kincir\Dynamictheme\Twig;

use URL;
use Twig_Extension;
use Twig_TokenParser;
use Twig_SimpleFilter;
use Twig_SimpleFunction;
use ApplicationException;
use Kincir\Dynamictheme\Classes\ParserTheme;
use Kincir\Dynamictheme\Classes\Section;
use Kincir\Dynamictheme\Classes\ContainerPage;

/**
 * The System Twig extension class implements common Twig functions and filters.
 *
 * @package october\system
 * @author Alexey Bobkov, Samuel Georges
 */
class Extension extends Twig_Extension
{
    protected $controller;

    protected $helper;

    /**
     * Creates the extension instance.
     */
    public function __construct($controller)
    {
        $this->controller = $controller;

        $this->helper = ParserTheme::instance()->setController($this->controller);
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'DynamicTheme';
    }

    /**
     * Returns a list of token parsers this extensions provides.
     *
     * @return array An array of token parsers
     */
    public function getTokenParsers()
    {
        $parsers = [
            new DynamicThemeTokenParser(),
            new SectionTokenParser(),
            new ThemeComponentTokenParser()
        ];

        return $parsers;
    }

    public function renderStyleDynamicTheme(){
        if(!$this->controller->getPage() instanceof ContainerPage)
            return;

        return $this->helper->renderCustomStyle();
    }

    public function themeComponentFunction($name, $parameters = []){
        return $this->helper->makeComponent($name, $parameters);
    }
}
