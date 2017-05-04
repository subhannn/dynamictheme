var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	builderAction: _.template($('#builder-action').html().panelsProcessTemplate()),

	builder: null,

	size: {
		mobile: 480,
		tablet: 768,
		desktop: 1200
	},

	events: {
		'click .btn-desktop': 'onClickDesktopPreview',
		'click .btn-tablet': 'onClickTabletPreview',
		'click .btn-mobile': 'onClickMobilePreview',
		'click .btn-save': 'onSave',
		'click .btn-preview': 'onPreview',
		'click [cmd="export_json"]': 'onExport',
		'click [cmd="import_json"]': 'onImport',
		'click [cmd="setting_page"]': 'onSettingPage',
		'click [cmd="clear_layout"]': 'onClearLayout',
	},

	initialize: function () {
	},

	render: function(){
		if(this.builder.options.container.find('.floating-menu').length == 0){
			this.setElement(this.builderAction())

			this.$el.appendTo(this.builder.options.container)

			this.showVisual()

			this.$('[data-control="tooltip"]').tooltip({
				trigger: 'hover'
			})
			.on('hide.bs.tooltip', function(e){
				$(this).next('.tooltip').remove()
			})
		}
	},

	showVisual: function(){
		this.$el.hide().fadeIn( 'fast' );
	},

	onClickDesktopPreview: function(e){
		this.$('.btn-orientation').removeClass('active')
		this.builder.iframe.$el.css({
			'max-width': 'none'
		});
		$(e.currentTarget).addClass('active')
	},

	onClickTabletPreview: function(e){
		this.$('.btn-orientation').removeClass('active')
		this.builder.iframe.$el.addClass('modepreview');
		this.builder.iframe.$el.css({
			'max-width': this.size.tablet+'px'
		});
		$(e.currentTarget).addClass('active')
	},

	onClickMobilePreview: function(e){
		this.$('.btn-orientation').removeClass('active')
		this.builder.iframe.$el.addClass('modepreview');
		this.builder.iframe.$el.css({
			'max-width': this.size.mobile+'px'
		});
		$(e.currentTarget).addClass('active')
	},

	onSettingPage: function(e){
		e.preventDefault()

		$.popup({
			handler: 'onSettingPage'
		})
	},

	export: function(filename){
		var data = JSON.stringify(this.builder.model.getPanelsData())

	    if(!data) {
	        console.error('No data')
	        return;
	    }

	    if(!filename) filename = 'export-theme.json'

	    if(typeof data === "object"){
	        data = JSON.stringify(data, undefined, 4)
	    }

	    var blob = new Blob([data], {type: 'text/json'}),
	        e    = document.createEvent('MouseEvents'),
	        a    = document.createElement('a')

	    a.download = filename
	    a.href = window.URL.createObjectURL(blob)
	    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
	    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
	    a.dispatchEvent(e)
	},

	onImport: function(e){
		e.preventDefault()
		var themeView = this
		var input = $('<input />')
			.attr({
				'type' : 'file',
				'name' : 'import-file-json',
				'id'   : 'upload-file-json',
				'accept': '.json'
			})
			.appendTo('body')

		input[0].onclick = function(e){
			var inputFile = this
			input[0]['checkImport'] = false

			document.body.onfocus = function(as){
				if(input[0].checkImport == false){
					input[0]['checkImport'] = true
					setTimeout(function(){
						themeView.checkImport(input)
					}, 100)
				}
			}
		}
		input.hide()
		input.trigger('click')
	},

	checkImport: function(file){
		var themeView = this
		if(file[0].files.length == 0){
			file.remove()
			return
		}

		var fr = new FileReader();
		fr.onload = function(e) {
			var result = JSON.parse(e.target.result);

			if(themeView.validateDataJson(result)){
				// Put to textfield and refresh
				themeView.builder.dataField.val(JSON.stringify(result))
				themeView.builder.model.importFromData(result)
			}else{
				alert('Invalid JSON File')
			}
			file.remove()
		}

		fr.readAsText(file[0].files.item(0));
	},

	validateDataJson: function(data){
		if(typeof data == 'string'){
			data = JSON.parse(data)
		}

		if(_.isUndefined(data.rows))
			return false

		return true
	},

	onExport: function(e){
		e.preventDefault()

		this.export()
	},

	onPreview: function(){
		this.builder.iframe.trigger('look_preview')
	},

	onClearLayout: function(e){
		e.preventDefault()
		if(confirm('Are you sure clear this layout?')){
			this.builder.model.clearLayout()
		}
	}
});