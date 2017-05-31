var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	// template: _.template( $( '#section-container' ).html().panelsProcessTemplate() ),

	// templateComponentContainer: _.template( $( '#component-container' ).html().panelsProcessTemplate() ),

	options: {},

	builder: false,

	container: null,

	events: {
		'click [cmd="section-setting"]': 'onSettingClick'
	},

	rowView: null,

	dialog: null,

	components: [],

	/**
	 * Initialize the row view
	 */
	initialize: function () {
		this.model.component.on('add', this.onAddComponentColletions, this)

		this.on('reload', this.onReload, this)

		this.on('reinit_component', this.reInitComponent, this)
	},

	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	render: function () {

		if(this.rowView.$el.find('[sections="'+this.model.get('id')+'"]').length == 0){
			this.builder.iframe.callPartial('onLoadSection', this.model.toJSON(), 'onLoadPartial', this)
		}else{
			this.$el = null
			this.setElement( this.rowView.$el.find('[sections="'+this.model.get('id')+'"]') )
			this.$el.data( 'view', this )

			this.model.initComponent()

			this.visualCreate()
		}
	},

	onLoadPartial: function(data){
		var thisView = this
		var ele = this.rowView.$el.find('[sections="'+this.model.get('id')+'"]')

		if(ele.length == 0){
			this.builder.iframe.appendTo(this.rowView.$el, data.result)

			thisView.setElement(this.rowView.$el.find('[sections="'+this.model.get('id')+'"]'))
			// // this.setElement( data.result );

			this.model.set('components', data.components)
			this.$el.data( 'view', this );
			this.$el.attr({
				id: this.model.get('id')
			})

			// this.$el.appendTo( this.rowView.$el );
			this.model.initComponent()

			this.visualCreate()
		}else{
			ele.remove();
			this.builder.iframe.appendTo(this.rowView.$el, data.result)
			thisView.setElement(this.rowView.$el.find('[sections="'+this.model.get('id')+'"]'))

			this.$el.data( 'view', this );
			this.$el.attr({
				id: this.model.get('id')
			})

			// this.$el.appendTo( this.rowView.$el );

			this.visualCreate()

			this.trigger('reinit_component')
		}
	},

	visualCreate: function(){
		this.$el.addClass('loaded')
		this.$el.hide().fadeIn( 'fast' );
		
		if(this.model.get('configForm') == true){
			new panels.tooltip.section({
				builder: this.builder,
				position: 'center'
			})
			.bind(this)
		}
	},

	getDialog: function(){
		if(this.dialog == null){
			this.dialog = new panels.dialog.sectionSettings( {
				model: this.model
			} );
			this.dialog.setBuilder( this.builder );

			// Store the widget view
			this.dialog.view = this;
		}

		return this.dialog
	},

	onSettingClick: function(e){
		this.getDialog().openDialog()
	},

	saveComponent: function(obj){
		this.model.set(obj)
		
		this.trigger('reload')
		
		this.builder.model.refreshPanelsData({
			silent: true
		});
		this.builder.sortCollections();
	},

	onReload: function(){
		var data = this.model.toJSON()
		if(this.model.component.length > 0)
			data['components'] = {};

		_.each(this.model.component.models, function(compModel, i){
			data['components'][compModel.get('code')] = compModel.toJSON()
		})
		
		this.builder.iframe.callPartial('onLoadSection', data, 'onLoadPartial', this)
	},

	onAddComponentColletions: function(row, collection, options){
		var componentView = new panels.view.component({ 
			model: row
		})

		componentView.builder = this.builder;
		componentView.parentView = this
		componentView.render();
		componentView.visualCreate()

		this.components.push(componentView)
	},

	reInitComponent: function(){
		_.each(this.components, function(componentView, i){
			componentView.render()
			componentView.visualCreate()
		})
	}
} );
