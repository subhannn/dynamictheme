var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	dialogTemplate: _.template( $( '#dialog-template' ).html().panelsProcessTemplate() ),

	tabbed: false,
	rendered: false,
	builder: false,
	// className: 'control-popup modal fade',
	className: 'loader-backdrop-theme',

	dialogClass: '',
	parentDialog: false,
	dialogOpen: false,
	backdrop: null,

	adaptiveSize: false,

	options: {
		handler: null,
		extraData: {}
	},

	events: {
		// 'click .close_section': 'closeDialog'
	},

	initialize: function () {
		// The first time this dialog is opened, render it
		this.on( 'open_dialog', this.render );
		this.on( 'open_dialog', this.attach );

		this.initDialogEvent()

		if ( ! _.isUndefined( this.initializeDialog ) ) {
			this.initializeDialog();
		}
	},

	initDialogEvent: function(){
		var dialogOriginal = this
		this.$el.on('hide.bs.modal', function(){
            dialogOriginal.renderBackdrop(false)
            dialogOriginal.$el.find('.md-content').html('')
            dialogOriginal.builder.iframe.iframeContents.find('body > #livePreviewStyle').remove()
            dialogOriginal.$el.draggable('destroy')
            dialogOriginal.$el.removeAttr('style')
        })

        this.$el.on('hidden.bs.modal', function(){
            $(document.body).removeClass('modal-open')
        })

        this.$el.on('show.bs.modal', function(){
        	dialogOriginal.renderBackdrop(true)
            $(document.body).addClass('modal-open')
        })

        this.$el.on('shown.bs.modal', function(){
            dialogOriginal.renderBackdrop(false)
            
            if(dialogOriginal.adaptiveSize)
            	dialogOriginal.$el.addClass('size-adaptive')

            $('[data-control="themeForm"]').themeForm({
            	builder: dialogOriginal.builder,
            	view : dialogOriginal.view
            });

            dialogOriginal.dialogLimitHeight()

            dialogOriginal.$el.draggable({
            	cursor: "move",
            	handle: '.modal-header',
            	scroll: false,
            	containment: "body"
            });
        })

        this.$el.on('close.oc.popup', function(){
            dialogOriginal.$el.hide()
            return false
        })
	},

	dialogLimitHeight: function(){
		var dialogOriginal = this
		var headerHeight = this.$el.find('.modal-header').height()
		var footerHeight = this.$el.find('.modal-footer').height()

		$(window).on('resize', function(){
			var windowHeight = window.innerHeight

			var to = headerHeight + footerHeight
			var has = (windowHeight - to - 150)

			dialogOriginal.$el.find('.modal-body .tab-content, .md-body').css({
				height: has+'px'
			})
		})
	},

	/**
	 * Returns the next dialog in the sequence. Should be overwritten by a child dialog.
	 * @returns {null}
	 */
	getNextDialog: function () {
		return null;
	},

	/**
	 * Returns the previous dialog in this sequence. Should be overwritten by child dialog.
	 * @returns {null}
	 */
	getPrevDialog: function () {
		return null;
	},

	/**
	 * Adds a dialog class to uniquely identify this dialog type
	 */
	setDialogClass: function () {
		if ( this.dialogClass !== '' ) {
			this.$( '.so-panels-dialog' ).addClass( this.dialogClass );
		}
	},

	/**
	 * Set the builder that controls this dialog.
	 * @param {panels.view.builder} builder
	 */
	setBuilder: function ( builder ) {
		this.builder = builder;

		// Trigger an add dialog event on the builder so it can modify the dialog in any way
		builder.trigger( 'add_dialog', this, this.builder );

		return this;
	},

	/**
	 * Attach the dialog to the window
	 */
	attach: function () {
		this.$el.modal({ show: false, backdrop: false })
		this.$el.trigger('show.bs.modal')

		return this;
	},

	paramToObj: function(name, value) {
        if (value === undefined) value = ''
        if (typeof value == 'object') return value

        try {
            return JSON.parse(JSON.stringify(eval("({" + value + "})")))
        }
        catch (e) {
            throw new Error('Error parsing the '+name+' attribute value. '+e)
        }
    },

	/**
	 * Converts an HTML representation of the dialog into arguments for a dialog box
	 * @param html HTML for the dialog
	 * @param args Arguments passed to the template
	 * @returns {}
	 */
	parseDialogContent: function ( html ) {
		var r = {
			content: html.panelsProcessTemplate()
		}

		return r;

	},

	/**
	 * Render the dialog and initialize the tabs
	 *
	 * @param attributes
	 * @returns {panels.view.dialog}
	 */
	renderDialog: function ( attributes ) {
		var currentDialog = this
		this.$el.html( this.dialogTemplate( attributes ) );

		this.$el.trigger('shown.bs.modal')
		
		return this;
	},

	renderBackdrop: function(val) {
        if (val) {
            this.backdrop = $('<div class="popup-backdrop fade" id="backdrop" />')

            this.backdrop.appendTo('body')

            this.backdrop.addClass('in')
            this.backdrop.append('<div id="loader" class="modal-content popup-loading-indicator"><ul><li></li><li></li><li></li><li></li><li></li><li></li></ul></div>')
            this.backdrop.addClass('loading')
        }
        else if (!val) {
        	setTimeout(function(){
        		$('#backdrop').remove()
        	}, 100)
        	if(this.backdrop != null){
            	this.backdrop = null
        	}
        }
    },

	/**
	 * Open the dialog
	 */
	openDialog: function ( options ) {
		var dialogView = this
		options = _.extend( {
			silent: false,
			adaptiveSize: false
		}, options );

		if ( ! options.silent ) {
			this.trigger( 'open_dialog' );
		}
		
		if(options.adaptiveSize)
			this.adaptiveSize = options.adaptiveSize

		this.dialogOpen = true;
		this.$el.modal('show')

		// Start listen for keyboard keypresses.
		$( window ).on( 'keyup', this.keyboardListen );

		return this
	},

	/**
	 * Close the dialog
	 *
	 * @param e
	 * @returns {boolean}
	 */
	closeDialog: function ( options ) {
		// options = _.extend( {
		// 	silent: false
		// }, options );

		if(this.dialogOpen){
			this.$el.modal('hide');
			this.dialogOpen = false
		}
	},

	/**
	 * Keyboard events handler
	 */
	keyboardListen: function ( e ) {
		// [Esc] to close
		if ( e.which === 27 ) {
			$( '.so-panels-dialog-wrapper .so-close' ).trigger( 'click' );
		}
	},

	/**
	 * Navigate to the previous dialog
	 */
	navToPrevious: function () {
		this.closeDialog();

		var prev = this.getPrevDialog();
		if ( prev !== null && prev !== false ) {
			prev.openDialog();
		}
	},

	/**
	 * Navigate to the next dialog
	 */
	navToNext: function () {
		this.closeDialog();

		var next = this.getNextDialog();
		if ( next !== null && next !== false ) {
			next.openDialog();
		}
	},

	/**
	 * Get the values from the form and convert them into a data array
	 */
	getFormValues: function ( formSelector ) {
		if ( _.isUndefined( formSelector ) ) {
			formSelector = '.so-content';
		}

		var $f = this.$( formSelector );

		var data = {}, parts;

		// Find all the named fields in the form
		$f.find( '[name]' ).each( function () {
			var $$ = $( this );

			try {

				var name = /([A-Za-z_]+)\[(.*)\]/.exec( $$.attr( 'name' ) );
				if ( _.isEmpty( name ) ) {
					return true;
				}

				// Create an array with the parts of the name
				if ( _.isUndefined( name[2] ) ) {
					parts = $$.attr( 'name' );
				} else {
					parts = name[2].split( '][' );
					parts.unshift( name[1] );
				}

				parts = parts.map( function ( e ) {
					if ( ! isNaN( parseFloat( e ) ) && isFinite( e ) ) {
						return parseInt( e );
					} else {
						return e;
					}
				} );

				var sub = data;
				var fieldValue = null;

				var fieldType = (
					_.isString( $$.attr( 'type' ) ) ? $$.attr( 'type' ).toLowerCase() : false
				);

				// First we need to get the value from the field
				if ( fieldType === 'checkbox' ) {
					if ( $$.is( ':checked' ) ) {
						fieldValue = $$.val() !== '' ? $$.val() : true;
					} else {
						fieldValue = null;
					}
				}
				else if ( fieldType === 'radio' ) {
					if ( $$.is( ':checked' ) ) {
						fieldValue = $$.val();
					} else {
						//skip over unchecked radios
						return;
					}
				}
				else if ( $$.prop( 'tagName' ) === 'TEXTAREA' && $$.hasClass( 'wp-editor-area' ) ) {
					// This is a TinyMCE editor, so we'll use the tinyMCE object to get the content
					var editor = null;
					if ( typeof tinyMCE !== 'undefined' ) {
						editor = tinyMCE.get( $$.attr( 'id' ) );
					}

					if ( editor !== null && _.isFunction( editor.getContent ) && ! editor.isHidden() ) {
						fieldValue = editor.getContent();
					} else {
						fieldValue = $$.val();
					}
				}
				else if ( $$.prop( 'tagName' ) === 'SELECT' ) {
					var selected = $$.find( 'option:selected' );

					if ( selected.length === 1 ) {
						fieldValue = $$.find( 'option:selected' ).val();
					}
					else if ( selected.length > 1 ) {
						// This is a mutli-select field
						fieldValue = _.map( $$.find( 'option:selected' ), function ( n, i ) {
							return $( n ).val();
						} );
					}

				} else {
					// This is a fallback that will work for most fields
					fieldValue = $$.val();
				}

				// Now, we need to filter this value if necessary
				if ( ! _.isUndefined( $$.data( 'panels-filter' ) ) ) {
					switch ( $$.data( 'panels-filter' ) ) {
						case 'json_parse':
							// Attempt to parse the JSON value of this field
							try {
								fieldValue = JSON.parse( fieldValue );
							}
							catch ( err ) {
								fieldValue = '';
							}
							break;
					}
				}

				// Now convert this into an array
				if ( fieldValue !== null ) {
					for ( var i = 0; i < parts.length; i ++ ) {
						if ( i === parts.length - 1 ) {
							if ( parts[i] === '' ) {
								// This needs to be an array
								sub.push( fieldValue );
							} else {
								sub[parts[i]] = fieldValue;
							}
						} else {
							if ( _.isUndefined( sub[parts[i]] ) ) {
								if ( parts[i + 1] === '' ) {
									sub[parts[i]] = [];
								} else {
									sub[parts[i]] = {};
								}
							}
							sub = sub[parts[i]];
						}
					}
				}
			}
			catch ( error ) {
				// Ignore this error, just log the message for debugging
				console.log( 'Field [' + $$.attr('name') + '] could not be processed and was skipped - ' + error.message );
			}

		} ); // End of each through input fields

		return data;
	},

	/**
	 * Set a status message for the dialog
	 */
	setStatusMessage: function ( message, loading ) {
		this.$( '.so-toolbar .so-status' ).html( message );
		if ( ! _.isUndefined( loading ) && loading ) {
			this.$( '.so-toolbar .so-status' ).addClass( 'so-panels-loading' );
		}
	},

	/**
	 * Set the parent after.
	 */
	setParent: function ( text, dialog ) {
		this.parentDialog = {
			text: text,
			dialog: dialog
		};
	}
} );
