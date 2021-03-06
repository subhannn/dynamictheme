<?php 
namespace Kincir\DynamicTheme\Controllers;

use Flash;
use BackendMenu;
use Backend\Classes\Controller;
use Kincir\Dynamictheme\Models\Page;

class Index extends Controller
{
    public $implement = [
        'Kincir.DynamicTheme.Behaviors.EditingThemeController',
        'Backend\Behaviors\FormController'
    ];

    public $formConfig = 'config_form.yaml';

    public function __construct()
    {
        parent::__construct();

        BackendMenu::setContext('Kincir.Dynamictheme', 'theme', true);
    }

    public function onCreate(){
        $ext = $this->asExtension('FormController');
        $ext->create();

        return view('kincir.dynamictheme::popup_setting_page', [
            'handler' => 'onCreateSave',
            'refresh' => true,
            'ext'   => $ext
        ])->render();
    }

    public function onCreateSave(){
        return $this->asExtension('FormController')->create_onSave();
    }

    public function index(){
        $this->prepareVars();
    }

    public function onSaveSettingPage($id=null){
        if(!$id)
            $id = input('id');

        $ext = $this->asExtension('FormController');

        return $ext->update_onSave($id);
    }

    public function onSettingPage($id=null){
        if(!$id)
            $id = input('id');

        $page = Page::find($id);

        if(!$page)
            throw new ApplicationException("Page ID Not found.");

        $ext = $this->asExtension('FormController');
        $ext->initForm($page);

        return view('kincir.dynamictheme::popup_setting_page', [
            'handler' => 'onSaveSettingPage',
            'ext'   => $ext,
            'refresh' => input('refresh', false)?true:false
        ])->render();
    }

    public function prepareVars(){
        $links = Page::getNested();
        $this->vars['list'] = $links;
    }

    public function onRemoveItem()
    {
        $id = post('id', 0);
        if (!$page = Page::find($id))
            throw new Exception('Static Page ID not found.');

        $page->delete();

        $this->prepareVars();

        return [
            '#reorderRecords' => $this->makePartial('listpage', ['lists' => $this->vars['list']])
        ];
    }

    public function onMove(){
        $sourceNode = Page::find(post('sourceNode'));
        $targetNode = post('targetNode') ? Page::find(post('targetNode')) : null;

        if ($sourceNode == $targetNode)
            return;

        switch (post('position')) {
            case 'before': $sourceNode->moveBefore($targetNode); break;
            case 'after': $sourceNode->moveAfter($targetNode); break;
            case 'child': $sourceNode->makeChildOf($targetNode); break;
            default: $sourceNode->makeRoot(); break;
        }
    }
}