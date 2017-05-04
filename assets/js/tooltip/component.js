var panels = window.panels, $ = jQuery;

module.exports = panels.view.tooltip.extend( {
	componentSettingsTemplate: _.template( $( '#component-options-tooltip' ).html().panelsProcessTemplate() ),


	events: {
		
	},
	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	render: function () {
		this.renderTooltip( this.componentSettingsTemplate() )
	}
} );
