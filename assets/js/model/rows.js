module.exports = Backbone.Model.extend( {
	/* The builder model */
	builder: null,

	defaults: {
		id: null,
		style: {},
		config: {}
	},

	sections: null,

	indexes: {},

	/**
	 * Initialize the row model
	 */
	initialize: function () {
		this.on( 'destroy', this.onDestroy, this );

		this.sections = new panels.collection.section()
	},

	sync: function () { return false; },

	initSections: function(){
		var rowModel = this
		_.each(this.get('sections'), function(section, i){
			var sectionModel = new panels.model.section(section);
			
			// Add the widget to the cell model
			sectionModel.rows = rowModel
			if(!_.isUndefined(themeOptions.sections[section.code])){
				sectionModel.config = themeOptions.sections[section.code]
			}else{
				sectionModel.config = {}
			}
			sectionModel.builder = rowModel.builder
			rowModel.sections.add( sectionModel )
			sectionModel.initComponent()
		})
		this.unset('sections')
	},

	onDestroy: function () {
	},
} );
