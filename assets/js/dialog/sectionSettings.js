var panels = window.panels, $ = jQuery;

module.exports = panels.view.dialog.extend( {
	events: {
		'click .submit_form': 'onSubmitForm',
		'click .close_modal': 'onCloseDialog'
	},

	sectionView : null,

	form: null,

	/**
	 * The current settings, not yet saved to the model
	 */
	rows: {},

	initializeDialog: function () {
		
	},

	render: function(){
		var sectionDialog = this

		$.request('onLoadSectionSettings', {
			data: {
				id: this.model.get('id'),
				code: this.model.get('code'),
				config: this.model.get('config'),
				style: this.model.get('style')
			},
			success: function(data){
				this.success(data).done(function() {
					if(!_.isUndefined(data.result))
						sectionDialog.showAndBindDialog(data.result)
				});
			}
		})
	},

	showAndBindDialog: function(html){
		var sectionDialog = this

		this.renderDialog( this.parseDialogContent(html, {}))
		this.form = this.$el.find('form')
	},

	onSubmitForm: function(){
		this.sectionView.saveComponent(this.form.serializeObject())
		this.closeDialog()
	},

	onCloseDialog: function(){
		this.closeDialog();
	}
} );
