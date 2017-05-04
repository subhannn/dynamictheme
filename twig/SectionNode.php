<?php namespace Kincir\Dynamictheme\Twig;

use Twig_Node;
use Twig_Compiler;
use Twig_NodeInterface;

/**
 * Represents a section node
 *
 * @package october\cms
 * @author Alexey Bobkov, Samuel Georges
 */
class SectionNode extends Twig_Node
{
    public function __construct(Twig_NodeInterface $nodes, $paramNames, $lineno, $tag = 'section')
    {
        parent::__construct(['nodes' => $nodes], ['names' => $paramNames], $lineno, $tag);
    }

    /**
     * Compiles the node to PHP.
     *
     * @param Twig_Compiler $compiler A Twig_Compiler instance
     */
    public function compile(Twig_Compiler $compiler)
    {
        $compiler->addDebugInfo($this);

        $compiler->write("\$context['__cms_section_params'] = [];\n");

        for ($i = 1; $i < count($this->getNode('nodes')); $i++) {
            $compiler->write("\$context['__cms_section_params']['".$this->getAttribute('names')[$i-1]."'] = ");
            $compiler->subcompile($this->getNode('nodes')->getNode($i));
            $compiler->write(";\n");
        }

        $compiler
            ->write("echo \$this->env->getExtension('DynamicTheme')->sectionFunction(")
            ->subcompile($this->getNode('nodes')->getNode(0))
            ->write(", \$context['__cms_section_params']")
            ->write(");\n")
        ;

        $compiler->write("unset(\$context['__cms_section_params']);\n");
    }
}
