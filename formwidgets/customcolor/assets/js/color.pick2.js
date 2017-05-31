( function( $, undef ){

	var ColorPicker,
		// html stuff
		_before = '<a tabindex="0" class="color-result" />',
		_after = '<div class="picker-holder" />',
		_wrap = '<div class="picker-container" />',
		_button = '<input type="button" class="button button-small hidden" />';

	// jQuery UI Widget constructor
	ColorPicker = {
		options: {
			defaultColor: false,
			change: false,
			clear: false,
			hide: true,
			palettes: true,
			width: 255,
			mode: 'hsv',
			type: 'full',
			slider: 'horizontal',
			text: {
	            clear: 'Clear',
	            current: 'Current Color',
	            defaultString: 'Default',
	            pick: 'Select Color'
	        }
		},
		_createHueOnly: function() {
			var self = this,
				el = self.element,
				color;

			// hide input
			el.hide();
			// max saturated color for hue to be obvious
			color = 'hsl(' + el.val() + ', 100, 50)';

			el.iris( {
				mode: 'hsl',
				type: 'hue',
				hide: false,
				color: color,
				change: function( event, ui ) {
					if ( $.isFunction( self.options.change ) ) {
						self.options.change.call( this, event, ui );
					}
				},
				width: self.options.width,
				slider: self.options.slider
			} );
		},
		_create: function() {
			// bail early for unsupported Iris.
			if ( ! $.support.iris ) {
				return;
			}

			var self = this,
				el = self.element;

			$.extend( self.options, el.data() );

			// hue-only gets created differently
			if ( self.options.type === 'hue' ) {
				return self._createHueOnly();
			}

			// keep close bound so it can be attached to a body listener
			self.close = $.proxy( self.close, self );

			self.initialValue = el.val();

			// Set up HTML structure, hide things
			el.addClass( 'color-picker' ).hide().wrap( _wrap );
			self.wrap = el.parent();
			self.toggler = $( _before ).insertBefore( el ).css( { backgroundColor: self.initialValue } ).attr( 'title', self.options.text.pick ).attr( 'data-current', self.options.text.current );
			self.pickerContainer = $( _after ).insertAfter( el );
			self.button = $( _button );

			if ( self.options.defaultColor ) {
				self.button.addClass( 'picker-default' ).val( self.options.text.defaultString );
			} else {
				self.button.addClass( 'picker-clear' ).val( self.options.text.clear );
			}

			el.wrap( '<span class="picker-input-wrap" />' ).after(self.button);

			el.iris( {
				target: self.pickerContainer,
				hide: self.options.hide,
				width: self.options.width,
				mode: self.options.mode,
				palettes: self.options.palettes,
				change: function( event, ui ) {
					self.toggler.css( { backgroundColor: ui.color.toString() } );
					// check for a custom cb
					if ( $.isFunction( self.options.change ) ) {
						self.options.change.call( this, event, ui );
					}
				}
			} );

			el.val( self.initialValue );
			self._addListeners();
			if ( ! self.options.hide ) {
				self.toggler.click();
			}
		},
		_addListeners: function() {
			var self = this;

			// prevent any clicks inside this widget from leaking to the top and closing it
			self.wrap.on( 'click.colorpicker', function( event ) {
				event.stopPropagation();
			});

			self.toggler.click( function(){
				if ( self.toggler.hasClass( 'picker-open' ) ) {
					self.close();
				} else {
					self.open();
				}
			});

			self.element.change( function( event ) {
				var me = $( this ),
					val = me.val();
				// Empty = clear
				if ( val === '' || val === '#' ) {
					self.toggler.css( 'backgroundColor', '' );
					// fire clear callback if we have one
					if ( $.isFunction( self.options.clear ) ) {
						self.options.clear.call( this, event );
					}
				}
			});

			// open a keyboard-focused closed picker with space or enter
			self.toggler.on( 'keyup', function( event ) {
				if ( event.keyCode === 13 || event.keyCode === 32 ) {
					event.preventDefault();
					self.toggler.trigger( 'click' ).next().focus();
				}
			});

			self.button.click( function( event ) {
				var me = $( this );
				if ( me.hasClass( 'picker-clear' ) ) {
					self.element.val( '' );
					self.element.trigger('change')
					self.toggler.css( 'backgroundColor', '' );
					if ( $.isFunction( self.options.clear ) ) {
						self.options.clear.call( this, event );
					}
				} else if ( me.hasClass( 'picker-default' ) ) {
					self.element.val( self.options.defaultColor ).change();
				}
			});
		},
		open: function() {
			this.element.show().iris( 'toggle' ).focus();
			this.button.removeClass( 'hidden' );
			this.wrap.addClass( 'picker-active' );
			this.toggler.addClass( 'picker-open' );
			// $( 'body' ).trigger( 'click.colorpicker' ).on( 'click.colorpicker', this.close );
		},
		close: function() {
			this.element.hide().iris( 'toggle' );
			this.button.addClass( 'hidden' );
			this.wrap.removeClass( 'picker-active' );
			this.toggler.removeClass( 'picker-open' );
			// $( 'body' ).off( 'click.colorpicker', this.close );
		},
		// $("#input").ColorPicker('color') returns the current color
		// $("#input").ColorPicker('color', '#bada55') to set
		color: function( newColor ) {
			if ( newColor === undef ) {
				return this.element.iris( 'option', 'color' );
			}
			this.element.iris( 'option', 'color', newColor );
		},
		//$("#input").ColorPicker('defaultColor') returns the current default color
		//$("#input").ColorPicker('defaultColor', newDefaultColor) to set
		defaultColor: function( newDefaultColor ) {
			if ( newDefaultColor === undef ) {
				return this.options.defaultColor;
			}

			this.options.defaultColor = newDefaultColor;
		}
	};

	$.widget( 'oc.colorPicker', ColorPicker );
}( jQuery ) );