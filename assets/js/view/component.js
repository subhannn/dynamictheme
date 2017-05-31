var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	options: {},

	builder: false,

	events: {
		'click [cmd="component-setting"]': 'onSettingClick'
	},

	parentView: null,

	showOption: false,

	dialog: null,

	tooltip: null,

	/**
	 * Initialize the row view
	 */
	initialize: function () {
		this.on('reload', this.onReload, this)
	},

	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	render: function () {
		if(this.parentView.$el.find('[modules="'+this.model.get('code')+'"]').is(':empty')){
			this.builder.iframe.callPartial('onLoadModuleSetting', this.model.toJSON(), 'callbackPartial', this)
		}else{
			this.$el = null
			this.setElement(this.parentView.$el.find('[modules="'+this.model.get('code')+'"]'))
			this.$el.data('view', this)
			this.$el.addClass('loaded')
		}
	},

	callbackPartial: function(data){
		var container = this.parentView.$el.find('[modules="'+this.model.get('code')+'"]').parent()

		// this.remove()
		if(this.$el.hasClass('loaded')){
			this.builder.iframe.html(this.$el, data.result)
		}else{
			this.builder.iframe.appendTo(container, data.result)
			this.setElement(this.parentView.$el.find('[modules="'+this.model.get('code')+'"]'))
		}
		var originalView = this
		originalView.$el.data('view', this)
		originalView.$el.addClass('loaded')
		originalView.visualCreate()
	},

	visualCreate: function(){
		var thisView = this
		this.$el.hide().fadeIn( 'fast' );
		new panels.tooltip.component({
			builder: this.builder,
			position: 'center'
		})
		.bind(this)

		this.$el.on('dblclick', function(){
			thisView.onSettingClick()
		})

		if(this.$el.children().length == 0){
			this.$el.html('<div class="default_modules">'+this.model.get('code')+' modules</div>')
		}
	},

	getDialog: function(){
		if(this.dialog == null){
			this.dialog = new panels.dialog.component( {
				model: this.model
			} );
			this.dialog.setBuilder( this.builder );

			// Store the widget view
			this.dialog.view = this;
		}

		return this.dialog
	},

	saveComponent: function(obj){
		this.model.set(obj)
		
		this.trigger('reload')
		
		this.builder.model.refreshPanelsData({
			silent: true
		});
		this.builder.sortCollections();
	},

	onSettingClick: function(e){
		this.getDialog().openDialog()
	},

	onReload: function(){
		var data = this.model.toJSON()
		data['nonwrap'] = '1';
		
		this.builder.iframe.callPartial('onLoadModuleSetting', data, 'callbackPartial', this)
	}
} );
