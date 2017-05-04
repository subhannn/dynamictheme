var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {

	builder: null,

	id: 'themeIframe',

	iframeContents: null,

	container: null,

	parentContainer: null,

	containerId: 'containerTheme',

	previewIframe: null,

	previewFrameId: 1,

	backdrop : null,

	iframeStyle: {
		top: 0,
	    right: 0,
	    left: 0,
	    bottom: 0,
	    position: 'absolute',
	    width: '100%',
	    height: '100%',
	    border: 'none'
	},

	containerStyle: {
		position: 'relative',
	    width: '100%',
	    height: '100%'
	},

	initialize: function () {
		var liveView = this
		this.on('look_preview', this.onPreview, this)

		$(document)
	        .on('ajaxPromise', function(event, context) {
	            liveView.renderBackdrop(true)
	        })
	        .on('ajaxFail', function(event, context) {
	            liveView.renderBackdrop(false)
	        })
	        .on('ajaxDone', function(event, context) {
	            liveView.renderBackdrop(false)
	        })
	},

	render: function (container) {
		container.css(this.containerStyle)

		this.parentContainer = container
		
		this.createIframe()

		var live = this
		$('#test').on('click', function(){
			live.test()
		});
	},

	createIframe: function(){
		if( _.isNull( this.previewIframe )  ) {
			// this.previewIframe.remove();
			var frameId = this.id + '-' +this.previewFrameId

			this.previewIframe = $('<iframe src="javascript:false;" />')
				.attr({
					id: frameId,
					name: frameId,
					// scrolling: 'no'
				})
				.css(this.iframeStyle)
		}
		
		this.setElement(this.previewIframe)

		this.$el.appendTo(this.parentContainer)

		this.bindIframe(this.previewIframe)

		this.postToIframe()

		return this
	},

	bindIframe: function(iframe){
		var iframeView = this

		this.builder.model.on( 'refresh_preview', this.handleRefreshData, this );

		this.builder.model.on( 'refresh_panels_data', this.handleLoadData, this );

		iframe.data( 'iframeready', false )
			.on( 'iframeready', function () {
				$('#backdrop').remove()

				var $$ = $( this )

				iframeView.iframeContents = $$.contents()

				if( $$.data( 'iframeready' ) ) {
					// Skip this if the iframeready function has already run
					return;
				}

				$$.data( 'iframeready', true );
				iframeView.container = iframeView.iframeContents.find('body').attr({
					id: iframeView.containerId
				});
				
				iframeView.builder.attachBuilderToIframe(iframeView.iframeContents)
			} )
			.on( 'load', function(){
				var $$ = $( this );
				if( ! $$.data( 'iframeready' )  ) {
					iframeView.renderBackdrop(false)
					$$.trigger('iframeready');
				}
			} );
	},

	handleRefreshData: function () {
		// console.log('refreshPreview')
		if ( ! this.$el.is( ':visible' ) ) {
			return this;
		}

		this.refreshPreview( this.builder.model.getPanelsData() );
	},

	handleLoadData: function (data) {
		// console.log('refreshPreview')
		if ( ! this.$el.is( ':visible' ) ) {
			return this;
		}

		this.refreshPreview( data );
	},

	refreshPreview: function ( data ) {
		this.createIframe()

		this.postToIframe(
			{
				config: JSON.stringify( data )
			}
		);

		// this.previewIframe.data( 'load-start', new Date().getTime() );
	},

	callPartial: function(handler, data, callback, obj = null){
		var iframeView = this
		if(typeof data == 'undefined') var data = {};
		setTimeout(function(){
			iframeView.renderBackdrop(true)
		}, 200)
		$.ajax({
			url: themeOptions.page_url+'?preview_editing_theme=1',
			method: 'post',
			headers: {
	            'X-OCTOBER-REQUEST-HANDLER': handler
	        },
	        data: data,
	        success: function(data){
	        	iframeView.el.contentWindow.$(iframeView.el.contentDocument).trigger('render')
	        	iframeView.renderBackdrop(false)
	        	obj[callback](data)
	        },
	        fail: function(){
	        	iframeView.renderBackdrop(false)
	        }
		})

		return this
	},

	appendTo: function(target, html){
		this.el.contentWindow.$(this.el.contentDocument).trigger('notify', function($document){
			var content = $(html)
			$document.find(target).append(content)
		})
	},

	html: function(target, html){
		this.el.contentWindow.$(this.el.contentDocument).trigger('notify', function($document){
			var content = $(html)
			$document.find(target).empty()
			$document.find(target).append(content)
		})
	},

	onPreview: function(){
		this.preview({
			config: JSON.stringify(this.builder.model.getPanelsData())
		})
	},

	preview: function(data){
		if(typeof data == 'undefined') var data = {
			test: 'hai',
			bee: 'ahai'
		};
		
		var tempForm = $('<form id="soPostToPreviewFrame" method="post" />')
			.attr( {
				id: this.previewIframe.attr('id'),
				target: '#newTab',
				action: themeOptions.page_url+'?preview_editing_theme=1&preview=1'
			} )
			.appendTo( 'body' );

		$.each( data, function( name, value ){
			$('<input type="hidden" />')
				.attr( {
					name: name,
					value: value
				} )
				.appendTo( tempForm );
		} );

		tempForm
			.submit()
			.remove();

		return this
	},

	postToIframe: function(data){
		if(typeof data == 'undefined') var data = {
			test: 'hai',
			bee: 'ahai'
		};
		this.renderBackdrop(true)
		var tempForm = $('<form id="soPostToPreviewFrame" method="post" />')
			.attr( {
				id: this.previewIframe.attr('id'),
				target: this.previewIframe.attr('id'),
				action: themeOptions.page_url+'?preview_editing_theme=1'
			} )
			.appendTo( 'body' );

		$.each( data, function( name, value ){
			$('<input type="hidden" />')
				.attr( {
					name: name,
					value: value
				} )
				.appendTo( tempForm );
		} );

		tempForm
			.submit()
			.remove();

		return this
	},

	renderBackdrop: function(val) {
        if (val) {
            this.backdrop = $('<div class="popup-backdrop fade" id="backdrop" />')

            this.backdrop.appendTo('body')

            this.backdrop.addClass('in')
            this.backdrop.append('<div id="loader" class="modal-content popup-loading-indicator"><ul><li></li><li></li><li></li><li></li><li></li><li></li></ul></div>')
            this.backdrop.addClass('loading')
        }
        else if (!val) {
        	$('#backdrop').remove()
        	if(this.backdrop != null){
            	this.backdrop = null
        	}
        }
    },
})