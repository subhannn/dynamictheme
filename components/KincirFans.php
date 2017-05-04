<?php namespace Kincir\Dynamictheme\Components;

use Kincir\Dynamictheme\Classes\ThemeComponentBase;
use anlutro\cURL\cURL;
use Cache;

class KincirFans extends ThemeComponentBase
{

    public $propertieConfig = 'properties.yaml';

    public $idols = null;

    protected $attrData = [];
    
    public function componentDetails()
    {
        return [
            'name'        => 'Kincir Fans',
            'description' => 'Kincir Fans.'
        ];
    }

    public function getFansOverrideValue($value){
        $data = [];

        if($result = $this->getIdolsList($value)){
            foreach ($result as $row) {
                $data[$row['id']] = $row['name'];
            }
        }

        return $data;
    }

    public function init(){
    }

    public function onRun(){
        $this->idols = $this->getIdolsList($this->fans?$this->fans:[]);
        // echo '<pre>';
        // print_r($this->idols);
        // exit();
    }

    protected function getIdolsList($list=[]){
        $result = [];
        if($list){
            $key = md5(implode('|', $list));
            if(get_env() != 'production' || !$result = Cache::get($key, false)){
                $result = $this->_call('api/lookup', 'post', [
                    'list'  => implode(',', $list)
                ]);

                if(get_env() == 'production')
                    Cache::put($key, $result, 60);
            }
        }
        
        return $result;
    }

    protected function _call($url, $method='post', $data=[]){
        $curl = new cURL();
        $method = strtolower($method?$method:'post');

        $req = $curl->newRequest($method, url($url), $data)
            ->setHeader('Referer', url())
            ->setOption(CURLOPT_SSL_VERIFYHOST, 0)
            ->setOption(CURLOPT_SSL_VERIFYPEER, 0)
            ->setHeader('Host', $_SERVER['HTTP_HOST']);
        $res = $req->send();

        if(isset($res->statusCode) && $res->statusCode == '200'){
            $json = json_decode($res->body, true);
            $json = isset($json['result'])?$json['result']['data']:[];

            return $json;
        }

        return [];
    }
}
