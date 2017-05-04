<?php namespace Kincir\Dynamictheme\Classes;

use Cms;
use File;
use Lang;
use Cache;
use Route;
use Config;
use Validator;
use Yaml;
use ApplicationException;
use Cms\Classes\CmsCompoundObject;
use Kincir\Dynamictheme\Classes\ParserTheme;


/**
 * Represents a static page.
 *
 * @package Kincir\StaticPage
 * @author Alexey Bobkov, Samuel Georges
 */
class Section extends CmsCompoundObject
{
    protected $configFile = 'config.yaml';

    /**
     * @var string The container name associated with the model, eg: pages.
     */
    protected $dirName = 'sections';

    protected $attrRegex = '/(\w+)\s*=\s*"([^"]*)"(?:\s|$)|(\w+)\s*=\s*\'([^\']*)\'(?:\s|$)|(\w+)\s*=\s*([^\s\'"]+)(?:\s|$)|"([^"]*)"(?:\s|$)|(\S+)(?:\s|$)/';

    /**
     * @var array The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'preview',
        'description',
        'markup',
        'settings',
        'alias',
        'viewId',
        'attr'
    ];

    public function afterFetch(){
        $this->parseComponentSettings();
        $this->loadConfiguration();
    }

    public function getCodeAttribute(){
        $code = pathinfo($this->fileName, PATHINFO_FILENAME);

        return $code;
    }

    public function getParentType($isSelector=false){
        if($isSelector){
            return '['.$this->dirName.'="'.$this->viewId.'"]';
        }else{
            return $this->dirName;
        }
    }

    public function getCodeClassParent(){
        return '\Cms\Classes\PageCode';
    }

    public function loadConfiguration(){
        $code = pathinfo($this->fileName, PATHINFO_FILENAME);
        $path = $this->getFilePath($code.'/'.$this->configFile);

        if(File::isFile($path)){
            $config = Yaml::parse(File::get($path));
            if(isset($config['attr']) && count($config['attr']) > 0){
                $this->setAttribute('attr', $config['attr']);
            }
        }
    }

    public function getTwigContent(){
        return $this->markupRegex();
    }

    public function markupRegex(){
        preg_match_all('/{%\s(.+).+%}/', $this->markup, $matches);
        $result = $this->markup;
        if(isset($matches[1]) && !empty($matches[1])){
            foreach ($matches[1] as $value) {
                preg_match_all($this->attrRegex, $value, $matchesAttr, PREG_SET_ORDER);

                $attr = [];
                foreach ($matchesAttr as $match) {
                    if (!empty($match[1])) {
                        $attr[strtolower($match[1])] = stripcslashes($match[2]);
                    } elseif (!empty($match[3])) {
                        $attr[strtolower($match[3])] = stripcslashes($match[4]);
                    } elseif (!empty($match[5])) {
                        $attr[strtolower($match[5])] = stripcslashes($match[6]);
                    } elseif (isset($match[7]) && strlen($match[7])) {
                        $attr[] = stripcslashes($match[7]);
                    } elseif (isset($match[8])) {
                        $attr[] = stripcslashes($match[8]);
                    }
                }

                $attr = array_merge($attr, [
                    'sectionId' => $this->viewId
                ]);
                
                $twig = 'thememodule';
                if(isset($attr[0])){
                    $twig = $attr[0];
                    $twig = preg_replace('/[\"\']/', '', $twig);
                    unset($attr[0]);
                }
                if($twig != 'thememodule')
                    continue;
                
                $name = 'DynamicThemeArticle';
                if(isset($attr[1])){
                    $name = $attr[1];
                    $name = preg_replace('/[\"\']/', '', $name);
                    unset($attr[1]);
                }

                $name2 = 'DynamicThemeFans';
                if(isset($attr[1])){
                    $name2 = $attr[1];
                    $name2 = preg_replace('/[\"\']/', '', $name2);
                    unset($attr[1]);
                }

                $out = '';
                foreach($attr as $key => $val){
                    $out .= $key.'="'.$val.'" ';
                }

                $replace = "{% $twig \"$name\" $out %}";
                $result = preg_replace('/{%\s('.$value.')\s%}/', $replace, $result);
            }
        }

        return $result;
    }

    protected function buildAttr($attributes){
        $partial = isset($attributes['partial'])?$attributes['partial']:'';
        $external = [
            'sectionId' => $this->viewId,
            'partial'   => $partial
        ];

        $attr = array_merge($external, []);
        $strAttr = '';
        foreach ($attr as $key => $value) {
            $strAttr .= ' '.$key."='".$value."' ";
        }

        return $strAttr;
    }
}
