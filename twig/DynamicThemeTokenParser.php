<?php 
namespace Kincir\Dynamictheme\Twig;

use Twig_Token;
use Twig_TokenParser;
use Twig_Node;

/**
 *
 * @package october\cms
 * @author Alexey Bobkov, Samuel Georges
 */
class DynamicThemeTokenParser extends Twig_TokenParser
{
    /**
     * Parses a token and returns a node.
     *
     * @param Twig_Token $token A Twig_Token instance
     *
     * @return Twig_NodeInterface A Twig_NodeInterface instance
     */
    public function parse(Twig_Token $token)
    {
        $stream = $this->parser->getStream();
        $stream->expect(Twig_Token::BLOCK_END_TYPE);
        return new DynamicThemeNodeParser($token->getLine());
    }

    /**
     * Gets the tag name associated with this token parser.
     *
     * @return string The tag name
     */
    public function getTag()
    {
        return 'dynamicpage';
    }
}
