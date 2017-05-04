module.exports = Backbone.Model.extend( {
	rows: null,

	defaults: {
		id: null,
		code: null,
		configForm: false,
		style: {},
		config: {}
	},

	component : null,

	config: {},

	builder: null,

	// indexes: null,

	initialize: function () {
		this.component = new panels.collection.component()
	},

	initComponent: function(){
		var sectionModel = this
		if(this.get('components')){
			_.each(this.get('components'), function(component, i){
				var newModelCompo = new panels.model.component(component)

				newModelCompo.section = sectionModel
				sectionModel.component.add(newModelCompo, {})
			})
		}
		this.unset('components')

		this.builder.refreshPanelsData({
			silent: true
		})
	}
} );
