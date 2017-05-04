var panels = window.panels, $ = jQuery;

module.exports = panels.view.tooltip.extend( {
	sectionSettingsTemplate: _.template( $( '#section-options-tooltip' ).html().panelsProcessTemplate() ),

	render: function () {
		this.renderTooltip( this.sectionSettingsTemplate() )
	},
} );
