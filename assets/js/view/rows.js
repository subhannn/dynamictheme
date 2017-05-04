var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	template: _.template( $( '#panel-rows' ).html().panelsProcessTemplate() ),

	rowPanelTemplate: _.template($('#button-panel-rows').html().panelsProcessTemplate()),

	options: {},

	builder: false,

	events: {
		'click .add_row': 'onAddRow',
		'click .add_section': 'onAddSection',
		'click .delete_row': 'visualDestroyModel'
	},

	className: 'highlight-row',

	dialog: null,

	tooltipDialog: null,

	/**
	 * Initialize the row view
	 */
	initialize: function () {
		this.model.sections.on('add', this.onAddSectionColletion, this)

		this.model.on( 'destroy', this.onModelDestroy, this );
		this.model.on( 'visual_destroy', this.visualDestroyModel, this );
	},

	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	renderRow: function (options, collection) {
		var viewOriginal = this
		var ele = this.builder.iframe.iframeContents.find('[rows="'+this.model.get('id')+'"]')
		
		if(ele.length == 0){
			this.setElement(this.template())
			this.$el.attr({
				class: 'th-row clearfix ui-sortable-handle',
				rows: this.model.get('id')
			})

			// Attach the row elements to this builder
			if ( _.isUndefined( options.at ) || collection.length <= 1 ) {
				// Insert this at the end of the widgets container
				this.$el.appendTo( this.builder.$el );
			} else {
				// We need to insert this at a specific position
				this.$el.insertAfter(
					this.builder.$( '.highlight-row' ).eq( options.at - 1 )
				);
			}
		}else{
			this.$el = null
			this.setElement(ele)
		}

		this.$el.addClass('loaded')
		this.$el.attr('model-id', this.model.get('id'))
		this.$el.addClass(this.className)
		this.$el.append( this.rowPanelTemplate() )
		this.$el.data('view', this)

		this.$('[data-toggle="tooltip"]').tooltip({
			trigger: 'hover'
		})
		.on('hide.bs.tooltip', function(e){
			$(this).next('.tooltip').remove()
		})

		new panels.tooltip.row({
			builder: this.builder,
			position: 'left'
		})
		.bind(this)
	},

	visualDestroyModel: function () {
		var thisView = this;
		this.$el.fadeOut( 'normal', function () {
			thisView.model.destroy();
			thisView.builder.model.refreshPanelsData({
				silent: true
			});
		} );
	},

	onModelDestroy: function () {
		this.remove();
	},

	visualCreate: function(){
		this.$el.hide().fadeIn( 'fast' );
	},

	// onAddRow: function(e){
	// 	var $target = $(e.currentTarget)
	// 	this.tooltipDialog = new panels.view.tooltipmodal()
	// 	this.tooltipDialog.builder = this.builder
	// 	this.tooltipDialog.parent = $target
	// 	this.tooltipDialog.render()
	// },

	onAddRow: function(){
		var newModel = new panels.model.rows({
			id: this.builder.model.generateUUID(),
		});

		newModel.builder = this.builder
		var options = {};
		if ( this.builder.model.rows.length >= 1) {
			options.at = this.$el.index() + 1;
		}

		// Set up the model and add it to the builder
		newModel.collection = this.builder.model.rows;
		this.builder.model.rows.add( newModel, options );

		this.builder.model.refreshPanelsData({
			silent: true
		});
	},

	getSectionDialog: function(){
		if(this.dialog == null){
			this.dialog = new panels.dialog.section( {
				model: this.model
			} );
			this.dialog.setBuilder( this.builder );
		}

		return this.dialog
	},

	onAddSection: function(){
		// this.builder.dialog.section.setCurrentRows(this.model).openDialog({
		// 	adaptiveSize: true
		// })
		this.getSectionDialog().setCurrentRows(this.model).openDialog({
			adaptiveSize: true
		})
	},

	onAddSectionColletion: function(row, collection, options){
		var sectionView = new panels.view.section({ model: row })
		sectionView.builder = this.builder;
		sectionView.rowView = this
		sectionView.render();

		this.$el.find('.add_section').remove()
	}
} );
