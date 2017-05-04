var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	containerTooltip: _.template( $( '#tooltip-modal' ).html().panelsProcessTemplate() ),

	builder: null,

	parent: null,

	defaultStyle: {
		position: 'fixed',
		'z-index': 99999999999,
		width: '400px',
		height: '200px',
		top: '100px',
		left: '100px'
	},

	initialize: function () {
		
	},
	
	render: function(){
		this.parent.prop('disabled', true)
		this.setElement(this.containerTooltip())
		this.$el.appendTo(this.builder.$el)

		this.$el.css(this.defaultStyle)
		this.calculateCenterArrow()

		this.$el.parents('body').addClass('modal-show')
		var viewThis = this
		this.builder.iframe.el.contentWindow.$(this.builder.iframe.el.contentWindow).on('scroll resize', function(e){
			var top = viewThis.parent.offset().top-$(this).scrollTop()
			var left = viewThis.parent.offset().left-$(this).scrollLeft()
			viewThis.calculateCenterArrow(top, left)
		})

		setTimeout(function(){
			viewThis.bindClose()
		}, 500)
	},

	bindClose: function(){
		var viewThis = this
		this.builder.iframe.el.contentWindow.$('body.modal-show').on('click', function(){
			viewThis.destroyTooltipModal()
		})
	},

	calculateCenterArrow: function(top, left){
		var widthEle = this.$el.outerWidth()
		var centerEle = widthEle / 2;
		
		var position = this.parent.offset()
		if(_.isUndefined(top))
			top = position.top
		if(_.isUndefined(left))
			left = position.left

		var tarWidth = this.parent.outerWidth()
		var tarHeight = this.parent.outerHeight()

		this.$el.css({
			top: ( top + ( tarHeight / 2 ) + 10 ) + 5,
			left: ( ( left + ( tarWidth / 2 ) ) - centerEle )
		})
	},

	destroyTooltipModal: function(){
		this.$el.parents('body').removeClass('modal-show')
		this.remove()
		// this.builder.iframe.el.contentWindow.$('#containerTheme').removeClass('modal-show')
		this.parent.prop('disabled', false)
	}
});
