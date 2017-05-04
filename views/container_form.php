<div class="modal-header">
    <h4 class="modal-title"><?= $title ?></h4>
</div>
<div class="modal-body">
	<form method="post" data-change-monitor>
		<?= $content ?>
	</form>
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-primary submit_form">Insert</button>
    <button type="button" class="btn btn-danger close_modal">Cancel</button>
</div>