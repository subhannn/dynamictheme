(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var panels = window.panels;

module.exports = Backbone.Collection.extend( {
	model: panels.model.component,

	/**
	 * Destroy all the rows in this collection
	 */
	empty: function () {
		var model;
		do {
			model = this.collection.first();
			if ( ! model ) {
				break;
			}

			model.destroy();
		} while ( true );
	},

	visualSortComparator: function ( item ) {
		if ( ! _.isNull( item.indexes ) ) {
			return item.indexes.builder;
		} else {
			return null;
		}
	},

	visualSort: function(){
		var oldComparator = this.comparator;
		this.comparator = this.visualSortComparator;
		this.sort();
		this.comparator = oldComparator;
	}
} );
},{}],2:[function(require,module,exports){
var panels = window.panels;

module.exports = Backbone.Collection.extend( {
	model: panels.model.rows,

	/**
	 * Destroy all the rows in this collection
	 */
	empty: function () {
		var model;
		do {
			model = this.collection.first();
			if ( ! model ) {
				break;
			}

			model.destroy();
		} while ( true );
	},

	visualSortComparator: function ( item ) {
		if ( ! _.isNull( item.indexes ) ) {
			return item.indexes.builder;
		} else {
			return null;
		}
	},

	visualSort: function(){
		var oldComparator = this.comparator;
		this.comparator = this.visualSortComparator;
		this.sort();
		// this.comparator = oldComparator;
	}
} );

},{}],3:[function(require,module,exports){
var panels = window.panels;

module.exports = Backbone.Collection.extend( {
	model: panels.model.section,

	/**
	 * Destroy all the rows in this collection
	 */
	empty: function () {
		var model;
		do {
			model = this.collection.first();
			if ( ! model ) {
				break;
			}

			model.destroy();
		} while ( true );
	},

	visualSortComparator: function ( item ) {
		if ( ! _.isNull( item.indexes ) ) {
			return item.indexes.builder;
		} else {
			return null;
		}
	},

	visualSort: function(){
		var oldComparator = this.comparator;
		this.comparator = this.visualSortComparator;
		this.sort();
		this.comparator = oldComparator;
	}
} );
},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = panels.view.dialog.extend( {

	dialogSectionTemplate: $( '#section-dialog' ).html().panelsProcessTemplate(),

	sectionItemTemplate: _.template( $( '#section-item' ).html().panelsProcessTemplate() ),

	dialogClass: 'so-panels-dialog-row-edit',
	styleType: 'row',

	dialogType: 'edit',

	events: {
		'click .section-item': 'onClickSection',
		'click .insert_section': 'onInsertSection',
		'click .close_section': 'onCloseDialog',
		'dblclick .section-item': 'onInsertSection'
	},

	/**
	 * The current settings, not yet saved to the model
	 */
	rows: {},

	initializeDialog: function () {
		
	},

	render: function(){
		var sectionDialog = this
		$.request('onLoadSectionsList', {
			success: function(data){
				this.success(data).done(function() {
					sectionDialog.renderDialog( sectionDialog.parseDialogContent(data.result, {})  )

					_.each( data.sections, function ( widget ) {
						// $w.data( 'data', widget ).appendTo( this.$( '#list-section' ) );

						sectionDialog.$( '[data-code="'+widget.code+'"]' ).data('data', widget);
					}, this );
				});
			}
		})
	},

	setCurrentRows: function(rows){
		this.rows = rows

		return this
	},

	onClickSection: function(e){
		$('.section-item').removeClass('selected')

		$(e.currentTarget).addClass('selected')
	},

	onInsertSection: function(e){
		var $w = this.getSectionSelected();
		var config = $w.data('data');

		var section = new panels.model.section( {
			id: this.builder.model.generateUUID(),
			code: config.code,
			configForm: config.configForm,
			components: config.components
		});

		section.builder = this.builder.model
		
		// // Add the widget to the cell model
		section.rows = this.rows;
		section.config = config
		section.rows.sections.add( section );

		this.closeDialog();

		this.builder.model.refreshPanelsData({
			silent: true
		});
	},

	getSectionSelected: function(){
		var $currSelect = $('.section-item.selected')

		return $currSelect
	},

	onCloseDialog: function(){
		this.closeDialog();
	}
} );

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
+function ($) { "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype

    var DropdownCallable = function (element, options) {
        this.$el = $(element)
        this.options = options || {}
        this.$form = $(element).closest('form')
        this.indicatorContainer = null

        $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }

    DropdownCallable.prototype = Object.create(BaseProto)
    DropdownCallable.prototype.constructor = DropdownCallable

    DropdownCallable.prototype.init = function() {
        var ini = this
        ini.$el.select2({
            ajax: {
                url: window.location.href,
                method: 'post',
                dataType : 'json',
                data: function (params) {
                    return {
                        s: params.term
                    }
                },
                headers : {
                    'X-OCTOBER-REQUEST-HANDLER': ini.options.handleCallable
                },
                processResults: function(data){
                    var dd = []
                    if(!_.isUndefined(data.result)){
                        _.each(data.result, function(val, id){
                            dd.push({
                                id: id,
                                text: val
                            })
                        })
                    }

                    return {
                        results: dd
                    }
                }
            },
            minimumInputLength: 1,
            // tags: true,
            // tokenSeparators: [',']
        })
    }

    DropdownCallable.prototype.dispose = function() {

        BaseProto.dispose.call(this)
    }

    DropdownCallable.DEFAULTS = {
        handleCallable: null
    }

    // FORM WIDGET PLUGIN DEFINITION
    // ============================

    var old = $.fn.dropdownCallable

    $.fn.dropdownCallable = function (option) {
        var args = arguments,
            result

        this.each(function () {
            var $this   = $(this)
            var data    = $this.data('oc.formwidget')
            var options = $.extend({}, DropdownCallable.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.formwidget', (data = new DropdownCallable(this, options)))
            if (typeof option == 'string') result = data[option].call($this)
            if (typeof result != 'undefined') return false
        })

        return result ? result : this
      }

    $.fn.dropdownCallable.Constructor = DropdownCallable

    // FORM WIDGET NO CONFLICT
    // =================

    $.fn.dropdownCallable.noConflict = function () {
        $.fn.dropdownCallable = old
        return this
    }

    $(document).render(function() {
        $('[data-handle-callable]').dropdownCallable();
    })

}(window.jQuery);

},{}],8:[function(require,module,exports){
(function ($) {

    window.addRule = function (selector, styles, sheet) {

        if (typeof styles !== "string") {
            var clone = "";
            for (var style in styles) {
                var val = styles[style];

                style = style.replace(/([A-Z])/g, "-$1").toLowerCase(); // convert to dash-case
                clone += style + ":" + (style === "content" ? '"' + val + '"' : val) + "; ";
            }
            styles = clone;
        }
        // console.log(sheet)
        sheet = sheet || document.styleSheets[0];
        if(typeof sheet.styleSheets == 'object'){
            var stylesheet = null;
            if(sheet.styleSheets.length){
                var stylesheet = sheet.getElementById('livePreviewStyle')
                if(stylesheet == null){
                    stylesheet = sheet.createElement('style')
                    stylesheet.id = 'livePreviewStyle'
                    sheet.getElementsByTagName('body')[0].appendChild(stylesheet);
                }
                stylesheet = sheet.styleSheets[sheet.styleSheets.length - 1];

                stylesheet.addRule(selector, styles);
            }
        }
    };

    if ($) {
        $.fn.addRule = function (styles, sheet) {
            addRule(this.selector, styles, sheet);
            return this;
        };
    }

}(window.jQuery));

+function ($) { "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype

    var ThemeForm = function (element, options) {
        this.$el = $(element)
        this.options = options || {}
        this.$style = null

        $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }

    ThemeForm.prototype = Object.create(BaseProto)
    ThemeForm.prototype.constructor = ThemeForm

    ThemeForm.prototype.init = function() {
        this.$el.find('[name^="_"]').prop('disabled', true)
        this.$el.on('change', '[name]:not([data-preview-style])', this.proxy(this.bindByChange, this))
        this.$el.on('change', '[data-preview-style]', this.proxy(this.bindByChange, this))
    }

    ThemeForm.prototype.bindByChange = function(e){
        var $target = $(e.target)
        this.proccessPreview($target)
    }

    ThemeForm.prototype.proccessPreview = function($target) {
        var checkbox = $target.not(':not(input[type=checkbox], input[type=radio])')
        var input = $target.not('input[type=checkbox], input[type=radio], input[type=button], input[type=submit]')
        var value = false;
        if(checkbox.length > 0){ // check
            value = checkbox.prop('checked')?'1':'0'
        }else if(input.length > 0){ // val
            value = input.val()
        }
        
        if(!value) return;

        if($target.data('preview-style')){
            var attr = $target.data('preview-style');
        }else{
            var attr = this.options.preview.style;
        }

        if(this.options.preview.type == 'font'){
            this.font(value, attr)
        }else if(this.options.preview.type == 'refresh'){
            this.addCss(attr, value)
        }
    }

    ThemeForm.prototype.font = function(value, attr) {
        this.addCss(attr, "'"+value+"'")
    }

    ThemeForm.prototype.addCss = function(attribute, value) {
        if(attribute.indexOf('[value]') < 0){
            attribute = attribute+': [value];'
        }

        attribute = attribute.replace(/\[value\]/, value)

        // console.log(attribute)

        addRule(this.options.preview.selector, attribute, this.options.builder.iframe.$el[0].contentDocument)
    }    

    ThemeForm.prototype.dispose = function() {

        BaseProto.dispose.call(this)
    }

    ThemeForm.DEFAULTS = {
        previewSelector: null,
        builder: null
    }

    // FORM WIDGET PLUGIN DEFINITION
    // ============================

    var old = $.fn.themeForm

    $.fn.themeForm = function (option) {
        var args = arguments,
            result

        this.each(function () {
            var $this   = $(this)
            var data    = $this.data('oc.formwidget')
            var options = $.extend({}, ThemeForm.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.formwidget', (data = new ThemeForm(this, options)))
            if (typeof option == 'string') result = data[option].call($this)
            if (typeof result != 'undefined') return false
        })

        return result ? result : this
      }

    $.fn.themeForm.Constructor = ThemeForm

    // FORM WIDGET NO CONFLICT
    // =================

    $.fn.themeForm.noConflict = function () {
        $.fn.themeForm = old
        return this
    }

    // $(document).render(function() {
    //     $('[data-control="themeForm"]').themeForm();
    // })

}(window.jQuery);

},{}],9:[function(require,module,exports){
/* global Backbone, _, jQuery, console, require, themeOptions */
/**
 * Convert template into something compatible with Underscore.js templates
 *
 * @param s
 * @return {*}
 */
String.prototype.panelsProcessTemplate = function() {
    var s = this;
    s = s.replace(/{{%/g, '<%');
    s = s.replace(/%}}/g, '%>');
    s = s.trim();
    return s;
};

$.fn.serializeObject = function(){

  var self = this,
      json = {},
      push_counters = {},
      patterns = {
        "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_-]+)\])*$/,
        "key":      /[a-zA-Z0-9_-]+|(?=\[\])/g,
        "push":     /^$/,
        "fixed":    /^\d+$/,
        "named":    /^[a-zA-Z0-9_-]+$/
      };


  this.build = function(base, key, value){
    base[key] = value;
    return base;
  };

  this.push_counter = function(key){
    if(push_counters[key] === undefined){
      push_counters[key] = 0;
    }
    return push_counters[key]++;
  };

  $.each($(this).serializeArray(), function(){
    // skip invalid keys
    if(!patterns.validate.test(this.name)){
      return;
    }

    var k,
        keys = this.name.match(patterns.key),
        merge = this.value,
        reverse_key = this.name;

    while((k = keys.pop()) !== undefined){

      // adjust reverse_key
      reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

      // push
      if(k.match(patterns.push)){
        merge = self.build([], self.push_counter(reverse_key), merge);
      }

      // fixed
      else if(k.match(patterns.fixed)){
        merge = self.build([], k, merge);
      }

      // named
      else if(k.match(patterns.named)){
        merge = self.build({}, k, merge);
      }
    }

    json = $.extend(true, json, merge);
  });
  return json;
};

jQuery(function($) {
    var dropdown = require('./javascript/dropdown')
    var previewForm = require('./javascript/previewForm')

    var panels = {};
    // Store everything globally
    window.panels = panels;
    window.siteoriginPanels = panels;
    // The models
    panels.model = {};
    panels.model.builder = require('./model/builder');
    panels.model.rows = require('./model/rows');
    panels.model.section = require('./model/section');
    panels.model.component = require('./model/component');
    // The collections
    panels.collection = {};
    panels.collection.rows = require('./collection/rows');
    panels.collection.section = require('./collection/section');
    panels.collection.component = require('./collection/component');
    // The views
    panels.view = {};
    panels.view.builder = require('./view/builder');
    panels.view.rows = require('./view/rows');
    panels.view.dialog = require('./view/dialog');
    panels.view.section = require('./view/section');
    panels.view.tooltip = require('./view/tooltip');
    panels.view.component = require('./view/component');
    panels.view.live = require('./view/live');
    panels.view.theme = require('./view/theme');
    panels.view.tooltipmodal = require('./view/tooltipmodal');
    // The dialogs
    panels.dialog = {};
    panels.dialog.section = require('./dialog/section');
    panels.dialog.component = require('./dialog/component');
    panels.dialog.sectionSettings = require('./dialog/sectionSettings');

    // The tooltip
    panels.tooltip = {};
    panels.tooltip.row = require('./tooltip/row');
    panels.tooltip.component = require('./tooltip/component');
    panels.tooltip.section = require('./tooltip/section');
    var container = $('#wrap');
    if (container.length > 0) {
        // If we have a container, then set up the main builder
        var panels = window.siteoriginPanels;
        var builderModel = new panels.model.builder()
        var builderView = new panels.view.builder({
            model: builderModel
        });
        builderView.render().attach({
            container: container
        }).setDataField('editing_data');
        builderModel.setBuilderView(builderView)
    }
});
},{"./collection/component":1,"./collection/rows":2,"./collection/section":3,"./dialog/component":4,"./dialog/section":5,"./dialog/sectionSettings":6,"./javascript/dropdown":7,"./javascript/previewForm":8,"./model/builder":10,"./model/component":11,"./model/rows":12,"./model/section":13,"./tooltip/component":14,"./tooltip/row":15,"./tooltip/section":16,"./view/builder":17,"./view/component":18,"./view/dialog":19,"./view/live":20,"./view/rows":21,"./view/section":22,"./view/theme":23,"./view/tooltip":24,"./view/tooltipmodal":25}],10:[function(require,module,exports){
module.exports = Backbone.Model.extend( {
	layoutPosition: {
		BEFORE: 'before',
		AFTER: 'after',
		REPLACE: 'replace',
	},

	rows: {},

	defaults: {
		'data': {
			'row': []
		}
	},

	builderView: null,

	initialize: function () {
		// These are the main rows in the interface
		this.rows = new panels.collection.rows();
	},

	/**
	 * Add a new row to this builder.
	 *
	 * @param weights
	 */
	addRow: function ( options, data ) {
		options = _.extend( {
			noAnimate: false
		}, options );
		// Create the actual row
		var row = new panels.model.rows(data);
		row.collection = this.rows
		row.builder = this

		this.rows.add( row, options );

		return row;
	},

	setBuilderView: function(builderView){
		this.builderView = builderView
	},

	loadPanelsData: function ( data, position ) {
		try {
			var builderModel = this
			_.each(data.rows, function(row, i){
				var newRow = builderModel.addRow({noAnimate:true}, row)
				newRow.initSections()
			})
		}catch ( err ) {
			console.log( 'Error loading data: ' + err.message );
		}
	},

	importFromData: function(data){
		this.rows.reset()
		this.trigger( 'refresh_panels_data', data );
	},

	clearLayout: function(){
		var thisModel = this
		this.rows.reset()
		this.builderView.dataField.val('')
		
		this.trigger( 'refresh_panels_data', {} );
	},

	/**
	 * Convert the content of the builder into a object that represents the page builder data
	 */
	getPanelsData: function () {

		var builder = this;

		var data = {
			'rows': []
		};
		var widgetId = 0;

		this.rows.each( function ( row, ri ) {
			var singleRow = {
				'id' : row.id,
				'sections': []
			};

			row.sections.each( function ( section, idx ) {
				var singleSection = section.toJSON()
				singleSection.components = [];
				
				// console.log(section)
				section.component.each(function(component, idx){
					singleSection.components.push(component.toJSON())
				})

				singleRow.sections.push(singleSection)
			});
			
			data.rows.push(singleRow);
		} );

		return data;
	},

	/**
	 * This will check all the current entries and refresh the panels data
	 */
	refreshPanelsData: function ( args ) {
		args = _.extend( {
			silent: false
		}, args );

		var oldData = this.get( 'data' );
		var newData = this.getPanelsData();
		this.set( 'data', newData, {silent: true} );

		if ( JSON.stringify( newData ) !== JSON.stringify( oldData ) ) {
			// The default change event doesn't trigger on deep changes, so we'll trigger our own
			this.trigger( 'change' );
			this.trigger( 'change:data' );
			this.trigger( 'check_model_row' )
			
			if(this.rows.length == 0){
				this.addRow({
					noAnimate: false
				}, {
					id: this.generateUUID()
				})

				this.refreshPanelsData({
					silent: true
				});
			}
		}
	},

	/**
	 * Empty all the rows and the cells/widgets they contain.
	 */
	emptyRows: function () {
		_.invoke( this.rows.toArray(), 'destroy' );
		this.rows.reset();

		return this;
	},

	isValidLayoutPosition: function ( position ) {
		return position === this.layoutPosition.BEFORE ||
		       position === this.layoutPosition.AFTER ||
		       position === this.layoutPosition.REPLACE;
	},

	generateUUID: function(){
		// var d = new Date().getTime();
		// if( window.performance && typeof window.performance.now === "function" ){
		// 	d += performance.now(); //use high-precision timer if available
		// }
		// var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function(c) {
		// 	var r = (d + Math.random()*16)%16 | 0;
		// 	d = Math.floor(d/16);
		// 	return ( c == 'x' ? r : (r&0x3|0x8) ).toString(16);
		// } );
		// return uuid;

		var date = new Date();
		var components = [
		    date.getYear(),
		    date.getMonth(),
		    date.getDate(),
		    date.getHours(),
		    date.getMinutes(),
		    date.getSeconds(),
		    date.getMilliseconds()
		];

		var id = components.join("");

		return id;
	}

} );

},{}],11:[function(require,module,exports){
module.exports = Backbone.Model.extend( {
	section: null,
	
	config: null,
	
	code: null,

	template : null,

	default: {
		code: null,
		component: null,
		style: {},
		config: {}
	},
	
	initialize: function () {
		
	},



} );

},{}],12:[function(require,module,exports){
module.exports = Backbone.Model.extend( {
	/* The builder model */
	builder: null,

	defaults: {
		id: null,
		style: {},
		config: {}
	},

	sections: null,

	indexes: {},

	/**
	 * Initialize the row model
	 */
	initialize: function () {
		this.on( 'destroy', this.onDestroy, this );

		this.sections = new panels.collection.section()
	},

	sync: function () { return false; },

	initSections: function(){
		var rowModel = this
		_.each(this.get('sections'), function(section, i){
			var sectionModel = new panels.model.section(section);
			
			// Add the widget to the cell model
			sectionModel.rows = rowModel
			if(!_.isUndefined(themeOptions.sections[section.code])){
				sectionModel.config = themeOptions.sections[section.code]
			}else{
				sectionModel.config = {}
			}
			sectionModel.builder = rowModel.builder
			rowModel.sections.add( sectionModel )
			sectionModel.initComponent()
		})
		this.unset('sections')
	},

	onDestroy: function () {
	},
} );

},{}],13:[function(require,module,exports){
module.exports = Backbone.Model.extend( {
	rows: null,

	defaults: {
		id: null,
		code: null,
		configForm: false,
		style: {},
		config: {}
	},

	component : null,

	config: {},

	builder: null,

	// indexes: null,

	initialize: function () {
		this.component = new panels.collection.component()
	},

	initComponent: function(){
		var sectionModel = this
		if(this.get('components')){
			_.each(this.get('components'), function(component, i){
				var newModelCompo = new panels.model.component(component)

				newModelCompo.section = sectionModel
				sectionModel.component.add(newModelCompo, {})
			})
		}
		this.unset('components')

		this.builder.refreshPanelsData({
			silent: true
		})
	}
} );

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = panels.view.tooltip.extend( {
	sectionSettingsTemplate: _.template( $( '#section-options-tooltip' ).html().panelsProcessTemplate() ),

	render: function () {
		this.renderTooltip( this.sectionSettingsTemplate() )
	},
} );

},{}],17:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	template: _.template( $( '#builder-container' ).html().panelsProcessTemplate() ),

	config: {},

	dialog: {},

	dataField: false,

	currentData: '',

	rowsSortable: false,

	dialog: {},
	
	tooltip: {},

	iframe: null,

	theme: null,

	/**
	 * Initialize the row view
	 */
	initialize: function (options) {
		var builder = this
		
		this.iframe = new panels.view.live()
		this.iframe.builder = this

		this.theme = new panels.view.theme()
		this.theme.builder = this

		// this.model.rows.add
		this.model.rows.on('add', this.onAddRow, this)

		this.model.on( 'change:data load_panels_data', this.storeModelData, this );

		this.on( 'content_change', this.handleContentChange, this );
	},

	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	render: function () {
		// this.setElement( this.template() );

		return this;
	},

	attach: function(options){
		var builderView = this

		this.options = _.extend(options, this.options)
		this.iframe.render(options.container)

		return this;
	},

	attachBuilderToIframe: function(iframeContainer){
		var thisView = this
		var containerRow = iframeContainer.find('.container-rows');

		if(containerRow.length > 0){
			this.setElement(containerRow)

			this.bindActionRow()
			this.initBuilder()

			this.theme.render()
		}
	},

	initBuilder: function(){
		if (this.dataField.val() !== '' ) {
			var data = this.dataField.val();
			try {
				data = JSON.parse( data );
			}
			catch ( err ) {
				data = {};
			}
			this.model.loadPanelsData( data );
		}else{
			this.model.addRow({
				noAnimate: false
			}, {
				id: this.model.generateUUID()
			})

			this.model.refreshPanelsData({
				silent: true
			});
		}
	},

	createOne: function(){
		// add auto new row first create
		this.model.addRow({
			noAnimate: false
		}, {
			id: this.model.generateUUID()
		})

		this.model.refreshPanelsData({
			silent: true
		});

		return this;
	},

	bindActionRow: function(){
		// Create the sortable for the rows
		var builderView = this;

		this.rowsSortable = this.$el.sortable( {
			placeholder: "highlight-row drag-highlight",
			items: '.th-row',
			axis: 'y',
			tolerance: 'pointer',
			scroll: false,
			stop: function ( e, ui ) {
				ui.item.removeAttr('style')

				// Sort the rows collection after updating all the indexes.
				builderView.sortCollections();
			}
		} );

		return this;
	},

	/**
	 * Set the field that's used to store the data
	 * @param field
	 */
	setDataField: function ( field) {
		if($('input[name="'+field+'"]').length > 0){
			var dataField = $('input[name="'+field+'"]');
		}else{
			var dataField = $('<input type="hidden" />')
				.attr( {
					name: field
				} );
		}

		dataField.appendTo( this.options.container );

		this.dataField = dataField;
		this.dataField.data( 'builder', this );

		if (dataField.val() !== '' ) {
			var data = this.dataField.val();
			try {
				data = JSON.parse( data );
			}
			catch ( err ) {
				data = {};
			}
			this.currentData = data;
			this.model.trigger( 'refresh_panels_data', data );
		}

		return this;
	},

	sortCollections: function () {
		// Give the rows their indexes
		this.$( '.highlight-row' ).each( function ( i ) {
			var $$ = $( this );
			$$.data( 'view' ).model.indexes = {
				builder: (i+1),
			};
		} );

		// Sort the rows by their visual index
		this.model.rows.visualSort();

		// Update the builder model to reflect the newly ordered data.
		this.model.refreshPanelsData({
			silent: true
		});
	},

	/**
	 * Store the model data in the data html field set in this.setDataField.
	 */
	storeModelData: function () {
		var data = JSON.stringify( this.model.get( 'data' ) );
		
		if ( $( this.dataField ).val() !== data ) {
			// If the data is different, set it and trigger a content_change event
			$( this.dataField ).val( data );
			$( this.dataField ).trigger( 'change' );
			this.trigger( 'content_change' );
		}
	},

	onAddRow: function(row, collection, options){
		options = _.extend( {noAnimate: false}, options );

		// Create a view for the row
		var rowView = new panels.view.rows( {model: row} );
		rowView.builder = this;
		rowView.renderRow(options, collection);

		if ( options.noAnimate === false ) {
			rowView.visualCreate();
		}
	},

	/**
	 * Refresh the row sortable
	 */
	refreshSortable: function () {
		// Refresh the sortable to account for the new row
		if ( ! _.isNull( this.rowsSortable ) ) {
			this.rowsSortable.sortable( 'refresh' );
		}
	},
} );

},{}],18:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	options: {},

	builder: false,

	events: {
		'click [cmd="component-setting"]': 'onSettingClick'
	},

	sectionView: null,

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
		if(this.sectionView.$el.find('[modules="'+this.model.get('code')+'"]').is(':empty')){
			this.builder.iframe.callPartial('onLoadComponent', this.model.toJSON(), 'callbackPartial', this)
		}else{
			this.$el = null
			this.setElement(this.sectionView.$el.find('[modules="'+this.model.get('code')+'"]'))
			this.$el.data('view', this)
			this.$el.addClass('loaded')
		}
	},

	callbackPartial: function(data){
		var container = this.sectionView.$el.find('[modules="'+this.model.get('code')+'"]').parent()

		// this.remove()
		if(this.$el.hasClass('loaded')){
			this.builder.iframe.html(this.$el, data.result)
		}else{
			this.builder.iframe.appendTo(container, data.result)
			this.setElement(this.sectionView.$el.find('[modules="'+this.model.get('code')+'"]'))
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
			this.dialog.componentView = this;
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
		
		this.builder.iframe.callPartial('onLoadComponent', data, 'callbackPartial', this)
	}
} );

},{}],19:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	dialogTemplate: _.template( $( '#dialog-template' ).html().panelsProcessTemplate() ),

	tabbed: false,
	rendered: false,
	builder: false,
	// className: 'control-popup modal fade',
	className: 'loader-backdrop-theme',

	dialogClass: '',
	parentDialog: false,
	dialogOpen: false,
	backdrop: null,

	adaptiveSize: false,

	options: {
		handler: null,
		extraData: {}
	},

	events: {
		// 'click .close_section': 'closeDialog'
	},

	initialize: function () {
		// The first time this dialog is opened, render it
		this.on( 'open_dialog', this.render );
		this.on( 'open_dialog', this.attach );

		this.initDialogEvent()

		if ( ! _.isUndefined( this.initializeDialog ) ) {
			this.initializeDialog();
		}
	},

	initDialogEvent: function(){
		var dialogOriginal = this
		this.$el.on('hide.bs.modal', function(){
            dialogOriginal.renderBackdrop(false)
            dialogOriginal.$el.find('.md-content').html('')
            dialogOriginal.builder.iframe.iframeContents.find('body > #livePreviewStyle').remove()
            dialogOriginal.$el.draggable('destroy')
            dialogOriginal.$el.removeAttr('style')
        })

        this.$el.on('hidden.bs.modal', function(){
            $(document.body).removeClass('modal-open')
        })

        this.$el.on('show.bs.modal', function(){
        	dialogOriginal.renderBackdrop(true)
            $(document.body).addClass('modal-open')
        })

        this.$el.on('shown.bs.modal', function(){
            dialogOriginal.renderBackdrop(false)
            
            if(dialogOriginal.adaptiveSize)
            	dialogOriginal.$el.addClass('size-adaptive')

            $('[data-control="themeForm"]').themeForm({
            	builder: dialogOriginal.builder
            });

            dialogOriginal.dialogLimitHeight()

            dialogOriginal.$el.draggable({
            	cursor: "move",
            	handle: '.modal-header',
            	scroll: false,
            	containment: "body"
            });
        })

        this.$el.on('close.oc.popup', function(){
            dialogOriginal.$el.hide()
            return false
        })
	},

	dialogLimitHeight: function(){
		var dialogOriginal = this
		var headerHeight = this.$el.find('.modal-header').height()
		var footerHeight = this.$el.find('.modal-footer').height()

		$(window).on('resize', function(){
			var windowHeight = window.innerHeight

			var to = headerHeight + footerHeight
			var has = (windowHeight - to - 150)

			dialogOriginal.$el.find('.modal-body .tab-content, .md-body').css({
				height: has+'px'
			})
		})
	},

	/**
	 * Returns the next dialog in the sequence. Should be overwritten by a child dialog.
	 * @returns {null}
	 */
	getNextDialog: function () {
		return null;
	},

	/**
	 * Returns the previous dialog in this sequence. Should be overwritten by child dialog.
	 * @returns {null}
	 */
	getPrevDialog: function () {
		return null;
	},

	/**
	 * Adds a dialog class to uniquely identify this dialog type
	 */
	setDialogClass: function () {
		if ( this.dialogClass !== '' ) {
			this.$( '.so-panels-dialog' ).addClass( this.dialogClass );
		}
	},

	/**
	 * Set the builder that controls this dialog.
	 * @param {panels.view.builder} builder
	 */
	setBuilder: function ( builder ) {
		this.builder = builder;

		// Trigger an add dialog event on the builder so it can modify the dialog in any way
		builder.trigger( 'add_dialog', this, this.builder );

		return this;
	},

	/**
	 * Attach the dialog to the window
	 */
	attach: function () {
		this.$el.modal({ show: false, backdrop: false })
		this.$el.trigger('show.bs.modal')

		return this;
	},

	paramToObj: function(name, value) {
        if (value === undefined) value = ''
        if (typeof value == 'object') return value

        try {
            return JSON.parse(JSON.stringify(eval("({" + value + "})")))
        }
        catch (e) {
            throw new Error('Error parsing the '+name+' attribute value. '+e)
        }
    },

	/**
	 * Converts an HTML representation of the dialog into arguments for a dialog box
	 * @param html HTML for the dialog
	 * @param args Arguments passed to the template
	 * @returns {}
	 */
	parseDialogContent: function ( html ) {
		var r = {
			content: html.panelsProcessTemplate()
		}

		return r;

	},

	/**
	 * Render the dialog and initialize the tabs
	 *
	 * @param attributes
	 * @returns {panels.view.dialog}
	 */
	renderDialog: function ( attributes ) {
		var currentDialog = this
		this.$el.html( this.dialogTemplate( attributes ) );

		this.$el.trigger('shown.bs.modal')
		
		return this;
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
        	setTimeout(function(){
        		$('#backdrop').remove()
        	}, 100)
        	if(this.backdrop != null){
            	this.backdrop = null
        	}
        }
    },

	/**
	 * Open the dialog
	 */
	openDialog: function ( options ) {
		var dialogView = this
		options = _.extend( {
			silent: false,
			adaptiveSize: false
		}, options );

		if ( ! options.silent ) {
			this.trigger( 'open_dialog' );
		}
		
		if(options.adaptiveSize)
			this.adaptiveSize = options.adaptiveSize

		this.dialogOpen = true;
		this.$el.modal('show')

		// Start listen for keyboard keypresses.
		$( window ).on( 'keyup', this.keyboardListen );

		return this
	},

	/**
	 * Close the dialog
	 *
	 * @param e
	 * @returns {boolean}
	 */
	closeDialog: function ( options ) {
		// options = _.extend( {
		// 	silent: false
		// }, options );

		if(this.dialogOpen){
			this.$el.modal('hide');
			this.dialogOpen = false
		}
	},

	/**
	 * Keyboard events handler
	 */
	keyboardListen: function ( e ) {
		// [Esc] to close
		if ( e.which === 27 ) {
			$( '.so-panels-dialog-wrapper .so-close' ).trigger( 'click' );
		}
	},

	/**
	 * Navigate to the previous dialog
	 */
	navToPrevious: function () {
		this.closeDialog();

		var prev = this.getPrevDialog();
		if ( prev !== null && prev !== false ) {
			prev.openDialog();
		}
	},

	/**
	 * Navigate to the next dialog
	 */
	navToNext: function () {
		this.closeDialog();

		var next = this.getNextDialog();
		if ( next !== null && next !== false ) {
			next.openDialog();
		}
	},

	/**
	 * Get the values from the form and convert them into a data array
	 */
	getFormValues: function ( formSelector ) {
		if ( _.isUndefined( formSelector ) ) {
			formSelector = '.so-content';
		}

		var $f = this.$( formSelector );

		var data = {}, parts;

		// Find all the named fields in the form
		$f.find( '[name]' ).each( function () {
			var $$ = $( this );

			try {

				var name = /([A-Za-z_]+)\[(.*)\]/.exec( $$.attr( 'name' ) );
				if ( _.isEmpty( name ) ) {
					return true;
				}

				// Create an array with the parts of the name
				if ( _.isUndefined( name[2] ) ) {
					parts = $$.attr( 'name' );
				} else {
					parts = name[2].split( '][' );
					parts.unshift( name[1] );
				}

				parts = parts.map( function ( e ) {
					if ( ! isNaN( parseFloat( e ) ) && isFinite( e ) ) {
						return parseInt( e );
					} else {
						return e;
					}
				} );

				var sub = data;
				var fieldValue = null;

				var fieldType = (
					_.isString( $$.attr( 'type' ) ) ? $$.attr( 'type' ).toLowerCase() : false
				);

				// First we need to get the value from the field
				if ( fieldType === 'checkbox' ) {
					if ( $$.is( ':checked' ) ) {
						fieldValue = $$.val() !== '' ? $$.val() : true;
					} else {
						fieldValue = null;
					}
				}
				else if ( fieldType === 'radio' ) {
					if ( $$.is( ':checked' ) ) {
						fieldValue = $$.val();
					} else {
						//skip over unchecked radios
						return;
					}
				}
				else if ( $$.prop( 'tagName' ) === 'TEXTAREA' && $$.hasClass( 'wp-editor-area' ) ) {
					// This is a TinyMCE editor, so we'll use the tinyMCE object to get the content
					var editor = null;
					if ( typeof tinyMCE !== 'undefined' ) {
						editor = tinyMCE.get( $$.attr( 'id' ) );
					}

					if ( editor !== null && _.isFunction( editor.getContent ) && ! editor.isHidden() ) {
						fieldValue = editor.getContent();
					} else {
						fieldValue = $$.val();
					}
				}
				else if ( $$.prop( 'tagName' ) === 'SELECT' ) {
					var selected = $$.find( 'option:selected' );

					if ( selected.length === 1 ) {
						fieldValue = $$.find( 'option:selected' ).val();
					}
					else if ( selected.length > 1 ) {
						// This is a mutli-select field
						fieldValue = _.map( $$.find( 'option:selected' ), function ( n, i ) {
							return $( n ).val();
						} );
					}

				} else {
					// This is a fallback that will work for most fields
					fieldValue = $$.val();
				}

				// Now, we need to filter this value if necessary
				if ( ! _.isUndefined( $$.data( 'panels-filter' ) ) ) {
					switch ( $$.data( 'panels-filter' ) ) {
						case 'json_parse':
							// Attempt to parse the JSON value of this field
							try {
								fieldValue = JSON.parse( fieldValue );
							}
							catch ( err ) {
								fieldValue = '';
							}
							break;
					}
				}

				// Now convert this into an array
				if ( fieldValue !== null ) {
					for ( var i = 0; i < parts.length; i ++ ) {
						if ( i === parts.length - 1 ) {
							if ( parts[i] === '' ) {
								// This needs to be an array
								sub.push( fieldValue );
							} else {
								sub[parts[i]] = fieldValue;
							}
						} else {
							if ( _.isUndefined( sub[parts[i]] ) ) {
								if ( parts[i + 1] === '' ) {
									sub[parts[i]] = [];
								} else {
									sub[parts[i]] = {};
								}
							}
							sub = sub[parts[i]];
						}
					}
				}
			}
			catch ( error ) {
				// Ignore this error, just log the message for debugging
				console.log( 'Field [' + $$.attr('name') + '] could not be processed and was skipped - ' + error.message );
			}

		} ); // End of each through input fields

		return data;
	},

	/**
	 * Set a status message for the dialog
	 */
	setStatusMessage: function ( message, loading ) {
		this.$( '.so-toolbar .so-status' ).html( message );
		if ( ! _.isUndefined( loading ) && loading ) {
			this.$( '.so-toolbar .so-status' ).addClass( 'so-panels-loading' );
		}
	},

	/**
	 * Set the parent after.
	 */
	setParent: function ( text, dialog ) {
		this.parentDialog = {
			text: text,
			dialog: dialog
		};
	}
} );

},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	template: _.template( $( '#panel-rows' ).html().panelsProcessTemplate() ),

	rowPanelTemplate: _.template($('#button-panel-rows').html().panelsProcessTemplate()),

	options: {},

	builder: false,

	events: {
		'click .add_row': 'onAddRow',
		'click .add_section': 'onAddSection',
		'click .delete_row': 'visualDestroyModel'
	},

	className: 'highlight-row',

	dialog: null,

	tooltipDialog: null,

	/**
	 * Initialize the row view
	 */
	initialize: function () {
		this.model.sections.on('add', this.onAddSectionColletion, this)

		this.model.on( 'destroy', this.onModelDestroy, this );
		this.model.on( 'visual_destroy', this.visualDestroyModel, this );
	},

	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	renderRow: function (options, collection) {
		var viewOriginal = this
		var ele = this.builder.iframe.iframeContents.find('[rows="'+this.model.get('id')+'"]')
		
		if(ele.length == 0){
			this.setElement(this.template())
			this.$el.attr({
				class: 'th-row clearfix ui-sortable-handle',
				rows: this.model.get('id')
			})

			// Attach the row elements to this builder
			if ( _.isUndefined( options.at ) || collection.length <= 1 ) {
				// Insert this at the end of the widgets container
				this.$el.appendTo( this.builder.$el );
			} else {
				// We need to insert this at a specific position
				this.$el.insertAfter(
					this.builder.$( '.highlight-row' ).eq( options.at - 1 )
				);
			}
		}else{
			this.$el = null
			this.setElement(ele)
		}

		this.$el.addClass('loaded')
		this.$el.attr('model-id', this.model.get('id'))
		this.$el.addClass(this.className)
		this.$el.append( this.rowPanelTemplate() )
		this.$el.data('view', this)

		this.$('[data-toggle="tooltip"]').tooltip({
			trigger: 'hover'
		})
		.on('hide.bs.tooltip', function(e){
			$(this).next('.tooltip').remove()
		})

		new panels.tooltip.row({
			builder: this.builder,
			position: 'left'
		})
		.bind(this)
	},

	visualDestroyModel: function () {
		var thisView = this;
		this.$el.fadeOut( 'normal', function () {
			thisView.model.destroy();
			thisView.builder.model.refreshPanelsData({
				silent: true
			});
		} );
	},

	onModelDestroy: function () {
		this.remove();
	},

	visualCreate: function(){
		this.$el.hide().fadeIn( 'fast' );
	},

	// onAddRow: function(e){
	// 	var $target = $(e.currentTarget)
	// 	this.tooltipDialog = new panels.view.tooltipmodal()
	// 	this.tooltipDialog.builder = this.builder
	// 	this.tooltipDialog.parent = $target
	// 	this.tooltipDialog.render()
	// },

	onAddRow: function(){
		var newModel = new panels.model.rows({
			id: this.builder.model.generateUUID(),
		});

		newModel.builder = this.builder
		var options = {};
		if ( this.builder.model.rows.length >= 1) {
			options.at = this.$el.index() + 1;
		}

		// Set up the model and add it to the builder
		newModel.collection = this.builder.model.rows;
		this.builder.model.rows.add( newModel, options );

		this.builder.model.refreshPanelsData({
			silent: true
		});
	},

	getSectionDialog: function(){
		if(this.dialog == null){
			this.dialog = new panels.dialog.section( {
				model: this.model
			} );
			this.dialog.setBuilder( this.builder );
		}

		return this.dialog
	},

	onAddSection: function(){
		// this.builder.dialog.section.setCurrentRows(this.model).openDialog({
		// 	adaptiveSize: true
		// })
		this.getSectionDialog().setCurrentRows(this.model).openDialog({
			adaptiveSize: true
		})
	},

	onAddSectionColletion: function(row, collection, options){
		var sectionView = new panels.view.section({ model: row })
		sectionView.builder = this.builder;
		sectionView.rowView = this
		sectionView.render();

		this.$el.find('.add_section').remove()
	}
} );

},{}],22:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	// template: _.template( $( '#section-container' ).html().panelsProcessTemplate() ),

	// templateComponentContainer: _.template( $( '#component-container' ).html().panelsProcessTemplate() ),

	options: {},

	builder: false,

	container: null,

	events: {
		'click [cmd="section-setting"]': 'onSettingClick'
	},

	rowView: null,

	dialog: null,

	components: [],

	/**
	 * Initialize the row view
	 */
	initialize: function () {
		this.model.component.on('add', this.onAddComponentColletions, this)

		this.on('reload', this.onReload, this)

		this.on('reinit_component', this.reInitComponent, this)
	},

	/**
	 * Render the row.
	 *
	 * @returns {panels.view.row}
	 */
	render: function () {

		if(this.rowView.$el.find('[sections="'+this.model.get('id')+'"]').length == 0){
			this.builder.iframe.callPartial('onLoadSection', this.model.toJSON(), 'onLoadPartial', this)
		}else{
			this.$el = null
			this.setElement( this.rowView.$el.find('[sections="'+this.model.get('id')+'"]') )
			this.$el.data( 'view', this )

			this.model.initComponent()

			this.visualCreate()
		}
	},

	onLoadPartial: function(data){
		var thisView = this
		var ele = this.rowView.$el.find('[sections="'+this.model.get('id')+'"]')

		if(ele.length == 0){
			this.builder.iframe.appendTo(this.rowView.$el, data.result)

			thisView.setElement(this.rowView.$el.find('[sections="'+this.model.get('id')+'"]'))
			// // this.setElement( data.result );

			this.model.set('components', data.components)
			this.$el.data( 'view', this );
			this.$el.attr({
				id: this.model.get('id')
			})

			// this.$el.appendTo( this.rowView.$el );
			this.model.initComponent()

			this.visualCreate()
		}else{
			ele.remove();
			this.builder.iframe.appendTo(this.rowView.$el, data.result)
			thisView.setElement(this.rowView.$el.find('[sections="'+this.model.get('id')+'"]'))

			this.$el.data( 'view', this );
			this.$el.attr({
				id: this.model.get('id')
			})

			// this.$el.appendTo( this.rowView.$el );

			this.visualCreate()

			this.trigger('reinit_component')
		}
	},

	visualCreate: function(){
		this.$el.addClass('loaded')
		this.$el.hide().fadeIn( 'fast' );
		
		if(this.model.get('configForm') == true){
			new panels.tooltip.section({
				builder: this.builder,
				position: 'center'
			})
			.bind(this)
		}
	},

	getDialog: function(){
		if(this.dialog == null){
			this.dialog = new panels.dialog.sectionSettings( {
				model: this.model
			} );
			this.dialog.setBuilder( this.builder );

			// Store the widget view
			this.dialog.sectionView = this;
		}

		return this.dialog
	},

	onSettingClick: function(e){
		this.getDialog().openDialog()
	},

	saveComponent: function(obj){
		this.model.set(obj)
		
		this.trigger('reload')
		
		this.builder.model.refreshPanelsData({
			silent: true
		});
		this.builder.sortCollections();
	},

	onReload: function(){
		var data = this.model.toJSON()
		if(this.model.component.length > 0)
			data['components'] = {};

		_.each(this.model.component.models, function(compModel, i){
			data['components'][compModel.get('code')] = compModel.toJSON()
		})
		
		this.builder.iframe.callPartial('onLoadSection', data, 'onLoadPartial', this)
	},

	onAddComponentColletions: function(row, collection, options){
		var componentView = new panels.view.component({ 
			model: row
		})

		componentView.builder = this.builder;
		componentView.sectionView = this
		componentView.render();
		componentView.visualCreate()

		this.components.push(componentView)
	},

	reInitComponent: function(){
		_.each(this.components, function(componentView, i){
			componentView.render()
			componentView.visualCreate()
		})
	}
} );

},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{}]},{},[9]);
