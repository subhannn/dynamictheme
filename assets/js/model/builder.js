module.exports = Backbone.Model.extend( {
	layoutPosition: {
		BEFORE: 'before',
		AFTER: 'after',
		REPLACE: 'replace',
	},

	rows: {},

	defaults: {
		'data': {
			'row': []
		}
	},

	builderView: null,

	initialize: function () {
		// These are the main rows in the interface
		this.rows = new panels.collection.rows();
	},

	/**
	 * Add a new row to this builder.
	 *
	 * @param weights
	 */
	addRow: function ( options, data ) {
		options = _.extend( {
			noAnimate: false
		}, options );
		// Create the actual row
		var row = new panels.model.rows(data);
		row.collection = this.rows
		row.builder = this

		this.rows.add( row, options );

		return row;
	},

	setBuilderView: function(builderView){
		this.builderView = builderView
	},

	loadPanelsData: function ( data, position ) {
		try {
			var builderModel = this
			_.each(data.rows, function(row, i){
				var newRow = builderModel.addRow({noAnimate:true}, row)
				newRow.initSections()
			})
		}catch ( err ) {
			console.log( 'Error loading data: ' + err.message );
		}
	},

	importFromData: function(data){
		this.rows.reset()
		this.trigger( 'refresh_panels_data', data );
	},

	clearLayout: function(){
		var thisModel = this
		this.rows.reset()
		this.builderView.dataField.val('')
		
		this.trigger( 'refresh_panels_data', {} );
	},

	/**
	 * Convert the content of the builder into a object that represents the page builder data
	 */
	getPanelsData: function () {

		var builder = this;

		var data = {
			'rows': []
		};
		var widgetId = 0;

		this.rows.each( function ( row, ri ) {
			var singleRow = {
				'id' : row.id,
				'sections': []
			};

			row.sections.each( function ( section, idx ) {
				var singleSection = section.toJSON()
				singleSection.components = [];
				
				// console.log(section)
				section.component.each(function(component, idx){
					singleSection.components.push(component.toJSON())
				})

				singleRow.sections.push(singleSection)
			});
			
			data.rows.push(singleRow);
		} );

		return data;
	},

	/**
	 * This will check all the current entries and refresh the panels data
	 */
	refreshPanelsData: function ( args ) {
		args = _.extend( {
			silent: false
		}, args );

		var oldData = this.get( 'data' );
		var newData = this.getPanelsData();
		this.set( 'data', newData, {silent: true} );

		if ( JSON.stringify( newData ) !== JSON.stringify( oldData ) ) {
			// The default change event doesn't trigger on deep changes, so we'll trigger our own
			this.trigger( 'change' );
			this.trigger( 'change:data' );
			this.trigger( 'check_model_row' )
			
			if(this.rows.length == 0){
				this.addRow({
					noAnimate: false
				}, {
					id: this.generateUUID()
				})

				this.refreshPanelsData({
					silent: true
				});
			}
		}
	},

	/**
	 * Empty all the rows and the cells/widgets they contain.
	 */
	emptyRows: function () {
		_.invoke( this.rows.toArray(), 'destroy' );
		this.rows.reset();

		return this;
	},

	isValidLayoutPosition: function ( position ) {
		return position === this.layoutPosition.BEFORE ||
		       position === this.layoutPosition.AFTER ||
		       position === this.layoutPosition.REPLACE;
	},

	generateUUID: function(){
		// var d = new Date().getTime();
		// if( window.performance && typeof window.performance.now === "function" ){
		// 	d += performance.now(); //use high-precision timer if available
		// }
		// var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function(c) {
		// 	var r = (d + Math.random()*16)%16 | 0;
		// 	d = Math.floor(d/16);
		// 	return ( c == 'x' ? r : (r&0x3|0x8) ).toString(16);
		// } );
		// return uuid;

		var date = new Date();
		var components = [
		    date.getYear(),
		    date.getMonth(),
		    date.getDate(),
		    date.getHours(),
		    date.getMinutes(),
		    date.getSeconds(),
		    date.getMilliseconds()
		];

		var id = components.join("");

		return id;
	}

} );
