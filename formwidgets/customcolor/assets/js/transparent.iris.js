/**
 *
 * Codestar WP Color Picker v1.1.0
 * This is plugin for WordPress Color Picker Alpha Channel 
 *
 * Copyright 2015 Codestar <info@codestarlive.com>
 * GNU GENERAL PUBLIC LICENSE (http://www.gnu.org/licenses/gpl-2.0.txt)
 *
 */
;
(function($, window, document, undefined) {
	'use strict';
	// adding alpha support for Automattic Color.js toString function.
	if (typeof Color.fn.toString !== undefined) {
		Color.fn.toString = function() {
			// check for alpha
			if (this._alpha < 1) {
				return this.toCSS('rgba', this._alpha).replace(/\s+/g, '');
			}
			var hex = parseInt(this._color, 10).toString(16);
			if (this.error) {
				return '';
			}
			// maybe left pad it
			if (hex.length < 6) {
				for (var i = 6 - hex.length - 1; i >= 0; i--) {
					hex = '0' + hex;
				}
			}
			return '#' + hex;
		};
	}
	$.cs_ParseColorValue = function(val) {
		var value = val.replace(/\s+/g, ''),
			alpha = (value.indexOf('rgba') !== -1) ? parseFloat(value.replace(/^.*,(.+)\)/, '$1') * 100) : 100,
			rgba = (alpha < 100) ? true : false;
		return {
			value: value,
			alpha: alpha,
			rgba: rgba
		};
	};
	$.fn.cs_colorPicker = function() {
		return this.each(function() {
			var $this = $(this);
			// check for rgba enabled/disable
			if ($this.data('rgba') !== false) {
				// parse value
				var picker = $.cs_ParseColorValue($this.val());
				var imgTransparent = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAAHnlligAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHJJREFUeNpi+P///4EDBxiAGMgCCCAGFB5AADGCRBgYDh48CCRZIJS9vT2QBAggFBkmBiSAogxFBiCAoHogAKIKAlBUYTELAiAmEtABEECk20G6BOmuIl0CIMBQ/IEMkO0myiSSraaaBhZcbkUOs0HuBwDplz5uFJ3Z4gAAAABJRU5ErkJggg==")';
				// colorPicker core
				$this.colorPicker({
					// ColorPicker: clear
					clear: function() {
						$this.trigger('keyup');
					},
					// ColorPicker: change
					change: function(event, ui) {
						var ui_color_value = ui.color.toString();
						var rgbStr = ui.color.toCSS('rgb', 1).replace(/\s+/g, '')+','+
							ui.color.toCSS('rgb', 0.1).replace(/\s+/g, '');
						
						$this.closest('.picker-container').find('.cs-alpha-wrap').css('background', 'linear-gradient('+rgbStr+'), '+imgTransparent);
						$this.val(ui_color_value).trigger('change');
					},
					// ColorPicker: create
					create: function() {
						// set variables for alpha slider
						var a8cIris = $this.data('a8c-iris'),
							$container = $this.closest('.picker-container'),
							// appending alpha wrapper
							$alpha_wrap = $('<div class="iris-slider iris-strip cs-alpha-wrap">' + '<div class="iris-slider-offset"></div>' +
							 '</div>').appendTo($container.find('.iris-picker-inner')),
							$alpha_slider = $alpha_wrap.find('.iris-slider-offset'),
							$alpha_text = $alpha_wrap.find('.cs-alpha-text'),
							$alpha_offset = $alpha_wrap.find('.cs-alpha-slider-offset');
						// alpha slider
						$alpha_slider.slider({
							// slider: slide
							slide: function(event, ui) {
								var slide_value = parseFloat(ui.value / 100);
								// update iris data alpha && ColorPicker color option && alpha text
								a8cIris._color._alpha = slide_value;
								$this.colorPicker('color', a8cIris._color.toString());
								// console.log()
								// $alpha_text.text((slide_value < 1 ? slide_value : ''));
							},
							// slider: create
							create: function() {
								// change container picker width
								var iris_slider_width = a8cIris.picker.find('.iris-strip').width()
								$alpha_wrap.css({ width: iris_slider_width })
								var alpha_wrap_width = $alpha_wrap.width() + a8cIris.picker.width()
								a8cIris.picker.css( { width: alpha_wrap_width} );
								a8cIris.picker.find('.iris-square').css({ 'margin-right': '10px' });

								var slide_value = parseFloat(picker.alpha / 100),
									alpha_text_value = slide_value < 1 ? slide_value : '';

								var rgbStr = a8cIris._color.toCSS('rgb', 1).replace(/\s+/g, '')+','+
									a8cIris._color.toCSS('rgb', 0.1).replace(/\s+/g, '');
								
								// update alpha text && checkerboard background color
								// $alpha_text.text(alpha_text_value);
								$alpha_wrap.css('background', 'linear-gradient('+rgbStr+'), '+imgTransparent);
								// ColorPicker clear for update iris data alpha && alpha text && slider color option
								$container.on('click', '.picker-clear', function() {
									a8cIris._color._alpha = 1;
									$alpha_slider.slider('option', 'value', 100).trigger('slide');
								});
								// ColorPicker default button for update iris data alpha && alpha text && slider color option
								$container.on('click', '.picker-default', function() {
									var default_picker = $.cs_ParseColorValue($this.data('default-color')),
										default_value = parseFloat(default_picker.alpha / 100),
										default_text = default_value < 1 ? default_value : '';
									a8cIris._color._alpha = default_value;
									// $alpha_text.text(default_text);
									$alpha_slider.slider('option', 'value', default_picker.alpha).trigger('slide');
								});
								// show alpha wrapper on click color picker button
								$container.on('click', '.color-result', function() {
									$alpha_wrap.toggle();
								});
								// hide alpha wrapper on click body
								$('body').on('click.colorpicker', function() {
									$alpha_wrap.hide();
								});
							},
							// slider: options
							orientation: 'vertical',
							value: picker.alpha,
							step: 1,
							min: 1,
							max: 100
						});
					}
				});
			} else {
				// ColorPicker default picker
				$this.colorPicker({
					clear: function() {
						$this.trigger('keyup');
					},
					change: function(event, ui) {
						$this.val(ui.color.toString()).trigger('change');
					}
				});
			}
		});
	};
	$(document).render(function() {
		$('[data-control="colorpicker"]').cs_colorPicker()
	})
})(jQuery, window, document);