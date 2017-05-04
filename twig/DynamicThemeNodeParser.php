<?php namespace Kincir\Dynamictheme\Twig;

use Twig_Node;
use Twig_Compiler;
use Twig_NodeInterface;

/**
 * Represents a "styles" node
 *
 * @package october\cms
 * @author Alexey Bobkov, Samuel Georges
 */
class DynamicThemeNodeParser extends Twig_Node
{
    public function __construct($lineno)
    {
        parent::__construct([], [], $lineno);
    }

    /**
     * Compiles the node to PHP.
     *
     * @param Twig_Compiler $compiler A Twig_Compiler instance
     */
    public function compile(Twig_Compiler $compiler)
    {

        $compiler
            ->addDebugInfo($this)
            ->write("echo \$this->env->getExtension('DynamicTheme')->renderStyleDynamicTheme();\n");
    }
}