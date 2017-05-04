var panels = window.panels, $ = jQuery;

module.exports = panels.view.dialog.extend( {

	dialogSectionTemplate: $( '#section-dialog' ).html().panelsProcessTemplate(),

	sectionItemTemplate: _.template( $( '#section-item' ).html().panelsProcessTemplate() ),

	dialogClass: 'so-panels-dialog-row-edit',
	styleType: 'row',

	dialogType: 'edit',

	events: {
		'click .section-item': 'onClickSection',
		'click .insert_section': 'onInsertSection',
		'click .close_section': 'onCloseDialog',
		'dblclick .section-item': 'onInsertSection'
	},

	/**
	 * The current settings, not yet saved to the model
	 */
	rows: {},

	initializeDialog: function () {
		
	},

	render: function(){
		var sectionDialog = this
		$.request('onLoadSectionsList', {
			success: function(data){
				this.success(data).done(function() {
					sectionDialog.renderDialog( sectionDialog.parseDialogContent(data.result, {})  )

					_.each( data.sections, function ( widget ) {
						// $w.data( 'data', widget ).appendTo( this.$( '#list-section' ) );

						sectionDialog.$( '[data-code="'+widget.code+'"]' ).data('data', widget);
					}, this );
				});
			}
		})
	},

	setCurrentRows: function(rows){
		this.rows = rows

		return this
	},

	onClickSection: function(e){
		$('.section-item').removeClass('selected')

		$(e.currentTarget).addClass('selected')
	},

	onInsertSection: function(e){
		var $w = this.getSectionSelected();
		var config = $w.data('data');

		var section = new panels.model.section( {
			id: this.builder.model.generateUUID(),
			code: config.code,
			configForm: config.configForm,
			components: config.components
		});

		section.builder = this.builder.model
		
		// // Add the widget to the cell model
		section.rows = this.rows;
		section.config = config
		section.rows.sections.add( section );

		this.closeDialog();

		this.builder.model.refreshPanelsData({
			silent: true
		});
	},

	getSectionSelected: function(){
		var $currSelect = $('.section-item.selected')

		return $currSelect
	},

	onCloseDialog: function(){
		this.closeDialog();
	}
} );
