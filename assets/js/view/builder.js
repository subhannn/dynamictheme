var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	template: _.template( $( '#builder-container' ).html().panelsProcessTemplate() ),

	config: {},

	dialog: {},

	dataField: false,

	currentData: '',

	rowsSortable: false,

	dialog: {},
	
	tooltip: {},

	iframe: null,

	theme: null,

	/**
	 * Initialize the row view
	 */
	initialize: function (options) {
		var builder = this
		
		this.iframe = new panels.view.live()
		this.iframe.builder = this

		this.theme = new panels.view.theme()
		this.theme.builder = this

		// this.model.rows.add
		this.model.rows.on('add', this.onAddRow, this)

		this.model.on( 'change:data load_panels_data', this.storeModelData, this );

		this.on( 'content_change', this.handleContentChange, this );
	},

	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	render: function () {
		// this.setElement( this.template() );

		return this;
	},

	attach: function(options){
		var builderView = this

		this.options = _.extend(options, this.options)
		this.iframe.render(options.container)

		return this;
	},

	attachBuilderToIframe: function(iframeContainer){
		var thisView = this
		var containerRow = iframeContainer.find('.container-rows');

		if(containerRow.length > 0){
			this.setElement(containerRow)

			this.bindActionRow()
			this.initBuilder()

			this.theme.render()
		}
	},

	initBuilder: function(){
		if (this.dataField.val() !== '' ) {
			var data = this.dataField.val();
			try {
				data = JSON.parse( data );
			}
			catch ( err ) {
				data = {};
			}
			this.model.loadPanelsData( data );
		}else{
			this.model.addRow({
				noAnimate: false
			}, {
				id: this.model.generateUUID()
			})

			this.model.refreshPanelsData({
				silent: true
			});
		}
	},

	createOne: function(){
		// add auto new row first create
		this.model.addRow({
			noAnimate: false
		}, {
			id: this.model.generateUUID()
		})

		this.model.refreshPanelsData({
			silent: true
		});

		return this;
	},

	bindActionRow: function(){
		// Create the sortable for the rows
		var builderView = this;

		this.rowsSortable = this.$el.sortable( {
			placeholder: "highlight-row drag-highlight",
			items: '.th-row',
			axis: 'y',
			tolerance: 'pointer',
			scroll: false,
			stop: function ( e, ui ) {
				ui.item.removeAttr('style')

				// Sort the rows collection after updating all the indexes.
				builderView.sortCollections();
			}
		} );

		return this;
	},

	/**
	 * Set the field that's used to store the data
	 * @param field
	 */
	setDataField: function ( field) {
		if($('input[name="'+field+'"]').length > 0){
			var dataField = $('input[name="'+field+'"]');
		}else{
			var dataField = $('<input type="hidden" />')
				.attr( {
					name: field
				} );
		}

		dataField.appendTo( this.options.container );

		this.dataField = dataField;
		this.dataField.data( 'builder', this );

		if (dataField.val() !== '' ) {
			var data = this.dataField.val();
			try {
				data = JSON.parse( data );
			}
			catch ( err ) {
				data = {};
			}
			this.currentData = data;
			this.model.trigger( 'refresh_panels_data', data );
		}

		return this;
	},

	sortCollections: function () {
		// Give the rows their indexes
		this.$( '.highlight-row' ).each( function ( i ) {
			var $$ = $( this );
			$$.data( 'view' ).model.indexes = {
				builder: (i+1),
			};
		} );

		// Sort the rows by their visual index
		this.model.rows.visualSort();

		// Update the builder model to reflect the newly ordered data.
		this.model.refreshPanelsData({
			silent: true
		});
	},

	/**
	 * Store the model data in the data html field set in this.setDataField.
	 */
	storeModelData: function () {
		var data = JSON.stringify( this.model.get( 'data' ) );
		
		if ( $( this.dataField ).val() !== data ) {
			// If the data is different, set it and trigger a content_change event
			$( this.dataField ).val( data );
			$( this.dataField ).trigger( 'change' );
			this.trigger( 'content_change' );
		}
	},

	onAddRow: function(row, collection, options){
		options = _.extend( {noAnimate: false}, options );

		// Create a view for the row
		var rowView = new panels.view.rows( {model: row} );
		rowView.builder = this;
		rowView.renderRow(options, collection);

		if ( options.noAnimate === false ) {
			rowView.visualCreate();
		}
	},

	/**
	 * Refresh the row sortable
	 */
	refreshSortable: function () {
		// Refresh the sortable to account for the new row
		if ( ! _.isNull( this.rowsSortable ) ) {
			this.rowsSortable.sortable( 'refresh' );
		}
	},
} );
