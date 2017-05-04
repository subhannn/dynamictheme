<?php if($wrap == '1'): ?>
<?= ($content)?$content:'' ?>
<?php else: ?>
<div class="th-component clearfix" modules="<?= $id ?>">
	<?= ($content)?$content:'' ?>
</div>
<?php endif; ?>