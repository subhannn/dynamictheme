var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	containerTooltip: _.template( $( '#tooltip-container' ).html().panelsProcessTemplate() ),

	builder: false,

	tooltipShow: false,

	bind: null,

	color: null,

	position: null,

	/**
	 * Initialize the row view
	 */
	initialize: function (options) {
		this.on( 'show_tooltip', this.render );
		this.builder = options.builder
		this.position = options.position
	},

	bind: function(bind){
		this.bind = bind

		this.bind.$el.bind('mouseenter', {'this': this}, this.onHoverIn)
		this.bind.$el.bind('mouseleave', {'this': this}, this.onHoverOut)
	},

	getRandomColor: function() {
	    var letters = '0123456789ABCDE';
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	},

	onHoverIn: function(e){
		var $target = $(e.currentTarget)
		e.data.this.showTooltip($target)
	},

	onHoverOut: function(e){
		var $target = $(e.currentTarget)
		e.data.this.closeTooltip($target)
	},

	showTooltip: function($target){
		var tooltipView = this
		this.trigger( 'show_tooltip' );

		$target.addClass('hover')
		$target.prepend(this.$el).fadeIn('fast')

		this.$('[data-toggle="tooltip"]').tooltip()
	},

	closeTooltip: function($target){
		$target.removeClass('hover')
		this.remove()
	},

	renderTooltip: function(html){
		this.bind.$el.find('[data-parent-id="'+this.bind.model.id+'"]').remove()
		this.setElement(this.containerTooltip({
			content: html
		}))
		this.$el.attr({
			'data-parent-id': this.bind.model.id
		})
		this.setTooltip()
	},

	setTooltip: function(){
		if(this.color == null)
			this.color = this.getRandomColor()

		this.$el.find('.th-border').css({
			'background-color': this.color
		});
		this.$el.find('.tooltip-settings').css({
			'background-color': this.color
		});

		this.$el.find('.tooltip-settings').addClass(this.position)
		if(this.position == 'center'){
			var width = this.$el.find('.tooltip-settings').width()
			width = width/2;

			this.$el.find('.tooltip-settings').css({
				left: '50%'
			})
		}else{
			this.$el.find('.tooltip-settings').css({
				left: 0
			})
		}
	}
} );
