<?php namespace Kincir\Dynamictheme\Classes;

use Url;
use Html;
use Block;

/**
 * Asset Maker Trait
 * Adds asset based methods to a class
 *
 * @package october\system
 * @author Alexey Bobkov, Samuel Georges
 */
trait StyleTrait
{

    /**
     * @var array Collection of assets to display in the layout.
     */
    protected $assets = [
        'inline'    => [],
        'external'  => [
            'css'   => [],
            'script'=> []
        ]
    ];

    /**
     * Disables the use, and subequent broadcast, of assets. This is useful
     * to call during an AJAX request to speed things up. This method works
     * by specifically targeting the hasAssetsDefined method.
     * @return void
     */
    public function flushAssets()
    {
        
    }

    /**
     * Outputs `<link>` and `<script>` tags to load assets previously added with addJs and addCss method calls
     * @param string $type Return an asset collection of a given type (css, rss, js) or null for all.
     * @return string
     */
    public function makeAssets($type = null)
    {
        
    }

    /**
     * Adds JavaScript asset to the asset list. Call $this->makeAssets() in a view
     * to output corresponding markup.
     * @param string $name Specifies a path (URL) to the script.
     * @param array $attributes Adds extra HTML attributes to the asset link.
     * @return void
     */
    public function addStyleRule($style)
    {
        $this->assets['inline'] = array_merge($this->assets['inline'], $style);
    }

    public function getInlineAssets(){
        return $this->assets;
    }

    public function addExternalCss($link=''){
        if(!$link) return;
        
        $this->assets['external']['css'][] = $link;
    }

    public function makeAttachExternalAssets(){
        $result = '';
        $this->removeDuplicates();

        foreach ($this->assets['external']['css'] as $css) {
            $attributes = Html::attributes([
                'rel'  => 'stylesheet',
                'href' => $css
            ]);

            $result .= '<link' . $attributes . '>' . PHP_EOL;
        }

        foreach ($this->assets['external']['script'] as $script) {
            $attributes = Html::attributes([
                'src' => $script
            ]);

            $result .= '<script' . $attributes . '></script>' . PHP_EOL;
        }

        Block::append('styles', $result);
    }

    public function makeInlineStyle(){
        $formHelper = FormHelper::instance();
        $styleStr = $formHelper->covertStyle($this->assets['inline']);

        Block::append('styles', $styleStr);
    }

    protected function removeDuplicates()
    {
        foreach ($this->assets['external'] as $type => &$collection) {

            $pathCache = [];
            foreach ($collection as $key => $asset) {
                if (isset($pathCache[$asset])) {
                    array_forget($collection, $asset);
                    continue;
                }
            }
        }
    }

    // <link href="https://fonts.googleapis.com/css?family=Cookie|Indie+Flower|Kaushan+Script|Kumar+One|Lato|Lobster|Orbitron|Pacifico|Playfair+Display|Quicksand" rel="stylesheet">
}
