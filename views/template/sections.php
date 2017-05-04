<?php
	$attrStr = '';
	$arr = [
		'sections'	=> $id
	];

	foreach ($arr as $key => $value) {
		$attrStr .= ' '.$key.'="'.$value.'" ';
	}
?>
<?php if($wrap == '1'): ?>
<?= ($content)?$content:'' ?>
<?php else: ?>
<div class="th-section cleafix"<?= $attrStr ?>>
	<?= ($content)?$content:'' ?>
</div>
<?php endif; ?>