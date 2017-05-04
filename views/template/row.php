<?php
	$attr = '';
	$arr = [
		'rows'	=> $row->id
	];

	$attr = '';
	foreach ($arr as $key => $value) {
		$attr .= ' '.$key.'="'.$value.'" ';
	}
?>
<div class="th-row clearfix"<?= $attr ?>>
	<?= ($content)?$content:'' ?>
</div>