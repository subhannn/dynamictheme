var panels = window.panels, $ = jQuery;

module.exports = panels.view.tooltip.extend( {
	rowSettingsTemplate: _.template( $( '#row-options-tooltip' ).html().panelsProcessTemplate() ),

	// events: {
	// 	'click .delete_row'	: 'onDeleteRow'
	// },
	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	render: function () {
		this.renderTooltip( this.rowSettingsTemplate() )
	},
} );
