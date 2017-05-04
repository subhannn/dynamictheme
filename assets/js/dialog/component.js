var panels = window.panels, $ = jQuery;

module.exports = panels.view.dialog.extend( {
	events: {
		'click .submit_form': 'onSubmitForm',
		'click .close_modal': 'onCloseDialog'
	},

	componentView : null,

	form: null,

	/**
	 * The current settings, not yet saved to the model
	 */
	rows: {},

	initializeDialog: function () {
		
	},

	render: function(){
		var componentDialog = this

		$.request('onLoadComponent', {
			data: {
				componentClass: this.model.get('component'),
				code: this.model.get('code'),
				config: this.model.get('config'),
				style: this.model.get('style')
			},
			success: function(data){
				this.success(data).done(function() {
					componentDialog.showAndBindDialog(data.result)
				});
			}
		})
	},

	showAndBindDialog: function(html){
		var componentDialog = this

		this.renderDialog( this.parseDialogContent(html, {}))
		this.form = this.$el.find('form')
	},

	onSubmitForm: function(){
		// console.log(this.form.serializeObject())
		this.componentView.saveComponent(this.form.serializeObject())
		this.closeDialog()
	},

	onCloseDialog: function(){
		this.closeDialog();
	}
} );
