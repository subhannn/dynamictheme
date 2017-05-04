<?= Form::open([
    'class' => 'layout',
    'id' => 'post-form'
]) ?>
<div class="modal-header">
	<h4 class="modal-title">Setting Page</h4>
</div>
<div class="modal-body">
	<?= $ext->formRender() ?>
</div>
<div class="modal-footer">
    <div class="loading-indicator-container">
        <button
            type="submit"
            data-request="onSaveSettingPage"
            data-hotkey="ctrl+s, cmd+s"
            data-request-success="$(this).parents('.modal').modal('hide')"
            data-load-indicator="<?= e(trans('backend::lang.form.saving')) ?>"
            class="btn btn-primary">
            <?= e(trans('backend::lang.form.save')) ?>
        </button>
        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
    </div>
</div>
<?= Form::close() ?>