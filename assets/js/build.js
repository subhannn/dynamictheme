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

	view : null,

	form: null,

	/**
	 * The current settings, not yet saved to the model
	 */
	rows: {},

	initializeDialog: function () {
		
	},

	render: function(){
		var componentDialog = this

		$.request('onLoadModuleSetting', {
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
		this.view.saveComponent(this.form.serializeObject())
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

	view : null,

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
		this.view.saveComponent(this.form.serializeObject())
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
+function ($) { "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype

    var ThemeForm = function (element, options) {
        this.$el = $(element)
        this.options = options || {}
        this.$style = null
        this.$preview = null;
        this.style = null;
        this.oldStyle = null;

        $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }

    ThemeForm.prototype = Object.create(BaseProto)
    ThemeForm.prototype.constructor = ThemeForm

    ThemeForm.prototype.init = function() {
        this.bindStyle()
        var self = this
        $(this.$el.prop('elements')).each(function(){
            var $self = $(this)
            if($self.parents('[data-preview]').length > 0){
                $self.bind('change input', self.proxy(self.bindByChange, self))
            }
        });

        this.$el.closest('.modal-dialog').find('.close_modal').on('click', function(e){
            self.style.html(self.oldStyle)
        })
    }

    ThemeForm.prototype.bindStyle = function(e){
        this.style = this.options.view.$el.find('> style');
        if(this.style.length == 0){
            var style = $('<style type="text/css"></style>');
            this.options.view.$el.append(style)
            this.style = style
        }
        this.oldStyle = this.style.html()
    }

    ThemeForm.prototype.bindByChange = function(e){
        this.proccessPreview()
    }

    ThemeForm.prototype.proccessPreview = function() {
        var self = this
        var style = CSSOM.parse('')
        var listCss = {}
        $(this.$el.prop('elements')).each(function(){
            var $self = $(this)
            console.log($self)
            if($self.parents('[data-preview]').length > 0){
                var parentData = $self.parents('[data-preview]').data();
                this.preview = parentData.preview
                var fieldName = $self.attr('name')
                

                if($self.is(':checkbox')){
                    var val = $self.prop('checked')?'1':false
                }else{
                    var val = $self.val()
                }
                
                var isFalse = ['0', 'undefined'];
                val = isFalse.indexOf(val)>=0?false:val
                console.log(fieldName)
                console.log(val)
                if(val && !_.isUndefined(fieldName)){
                    if(this.preview.type == 'font'){
                        var attr = this.preview.style
                        attr = attr.replace(/\[value\]/, val)
                        if(_.isUndefined(listCss[this.preview.selector])){
                            listCss[this.preview.selector] = {}
                        }
                        
                        if(_.isUndefined(listCss[this.preview.selector][fieldName])){
                            listCss[this.preview.selector][fieldName] = {}
                        }

                        listCss[this.preview.selector][fieldName] = attr
                    }else if(this.preview.type == 'refresh'){
                        var attr = this.preview.style
                        attr = attr.replace(/\[value\]/, val)
                        if(_.isUndefined(listCss[this.preview.selector])){
                            listCss[this.preview.selector] = {}
                        }
                        
                        if(_.isUndefined(listCss[this.preview.selector][fieldName])){
                            listCss[this.preview.selector][fieldName] = {}
                        }

                        listCss[this.preview.selector][fieldName] = attr
                    }
                }
            }
        });
        
        $.each(listCss, function(selector, attr){
            var selec = selector + '{ '
            $.each(attr, function(fieldName, prop){
                selec += prop
            })
            selec += '}'
            style.insertRule(selec)
        })
        
        this.style.html(style.toString())
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
//.CommonJS
var CSSOM = {
    CSSRule: require("./CSSRule").CSSRule,
    MatcherList: require("./MatcherList").MatcherList
};
///CommonJS


/**
 * @constructor
 * @see https://developer.mozilla.org/en/CSS/@-moz-document
 */
CSSOM.CSSDocumentRule = function CSSDocumentRule() {
    CSSOM.CSSRule.call(this);
    this.matcher = new CSSOM.MatcherList();
    this.cssRules = [];
};

CSSOM.CSSDocumentRule.prototype = new CSSOM.CSSRule();
CSSOM.CSSDocumentRule.prototype.constructor = CSSOM.CSSDocumentRule;
CSSOM.CSSDocumentRule.prototype.type = 10;
//FIXME
//CSSOM.CSSDocumentRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSDocumentRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

Object.defineProperty(CSSOM.CSSDocumentRule.prototype, "cssText", {
  get: function() {
    var cssTexts = [];
    for (var i=0, length=this.cssRules.length; i < length; i++) {
        cssTexts.push(this.cssRules[i].cssText);
    }
    return "@-moz-document " + this.matcher.matcherText + " {" + cssTexts.join("") + "}";
  }
});


//.CommonJS
exports.CSSDocumentRule = CSSOM.CSSDocumentRule;
///CommonJS

},{"./CSSRule":16,"./MatcherList":22}],10:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSStyleDeclaration: require("./CSSStyleDeclaration").CSSStyleDeclaration,
	CSSRule: require("./CSSRule").CSSRule
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#css-font-face-rule
 */
CSSOM.CSSFontFaceRule = function CSSFontFaceRule() {
	CSSOM.CSSRule.call(this);
	this.style = new CSSOM.CSSStyleDeclaration();
	this.style.parentRule = this;
};

CSSOM.CSSFontFaceRule.prototype = new CSSOM.CSSRule();
CSSOM.CSSFontFaceRule.prototype.constructor = CSSOM.CSSFontFaceRule;
CSSOM.CSSFontFaceRule.prototype.type = 5;
//FIXME
//CSSOM.CSSFontFaceRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSFontFaceRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

// http://www.opensource.apple.com/source/WebCore/WebCore-955.66.1/css/WebKitCSSFontFaceRule.cpp
Object.defineProperty(CSSOM.CSSFontFaceRule.prototype, "cssText", {
  get: function() {
    return "@font-face {" + this.style.cssText + "}";
  }
});


//.CommonJS
exports.CSSFontFaceRule = CSSOM.CSSFontFaceRule;
///CommonJS

},{"./CSSRule":16,"./CSSStyleDeclaration":17}],11:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule
};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/shadow-dom/#host-at-rule
 */
CSSOM.CSSHostRule = function CSSHostRule() {
	CSSOM.CSSRule.call(this);
	this.cssRules = [];
};

CSSOM.CSSHostRule.prototype = new CSSOM.CSSRule();
CSSOM.CSSHostRule.prototype.constructor = CSSOM.CSSHostRule;
CSSOM.CSSHostRule.prototype.type = 1001;
//FIXME
//CSSOM.CSSHostRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSHostRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

Object.defineProperty(CSSOM.CSSHostRule.prototype, "cssText", {
	get: function() {
		var cssTexts = [];
		for (var i=0, length=this.cssRules.length; i < length; i++) {
			cssTexts.push(this.cssRules[i].cssText);
		}
		return "@host {" + cssTexts.join("") + "}";
	}
});


//.CommonJS
exports.CSSHostRule = CSSOM.CSSHostRule;
///CommonJS

},{"./CSSRule":16}],12:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule,
	CSSStyleSheet: require("./CSSStyleSheet").CSSStyleSheet,
	MediaList: require("./MediaList").MediaList
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssimportrule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSImportRule
 */
CSSOM.CSSImportRule = function CSSImportRule() {
	CSSOM.CSSRule.call(this);
	this.href = "";
	this.media = new CSSOM.MediaList();
	this.styleSheet = new CSSOM.CSSStyleSheet();
};

CSSOM.CSSImportRule.prototype = new CSSOM.CSSRule();
CSSOM.CSSImportRule.prototype.constructor = CSSOM.CSSImportRule;
CSSOM.CSSImportRule.prototype.type = 3;

Object.defineProperty(CSSOM.CSSImportRule.prototype, "cssText", {
  get: function() {
    var mediaText = this.media.mediaText;
    return "@import url(" + this.href + ")" + (mediaText ? " " + mediaText : "") + ";";
  },
  set: function(cssText) {
    var i = 0;

    /**
     * @import url(partial.css) screen, handheld;
     *        ||               |
     *        after-import     media
     *         |
     *         url
     */
    var state = '';

    var buffer = '';
    var index;
    for (var character; (character = cssText.charAt(i)); i++) {

      switch (character) {
        case ' ':
        case '\t':
        case '\r':
        case '\n':
        case '\f':
          if (state === 'after-import') {
            state = 'url';
          } else {
            buffer += character;
          }
          break;

        case '@':
          if (!state && cssText.indexOf('@import', i) === i) {
            state = 'after-import';
            i += 'import'.length;
            buffer = '';
          }
          break;

        case 'u':
          if (state === 'url' && cssText.indexOf('url(', i) === i) {
            index = cssText.indexOf(')', i + 1);
            if (index === -1) {
              throw i + ': ")" not found';
            }
            i += 'url('.length;
            var url = cssText.slice(i, index);
            if (url[0] === url[url.length - 1]) {
              if (url[0] === '"' || url[0] === "'") {
                url = url.slice(1, -1);
              }
            }
            this.href = url;
            i = index;
            state = 'media';
          }
          break;

        case '"':
          if (state === 'url') {
            index = cssText.indexOf('"', i + 1);
            if (!index) {
              throw i + ": '\"' not found";
            }
            this.href = cssText.slice(i + 1, index);
            i = index;
            state = 'media';
          }
          break;

        case "'":
          if (state === 'url') {
            index = cssText.indexOf("'", i + 1);
            if (!index) {
              throw i + ': "\'" not found';
            }
            this.href = cssText.slice(i + 1, index);
            i = index;
            state = 'media';
          }
          break;

        case ';':
          if (state === 'media') {
            if (buffer) {
              this.media.mediaText = buffer.trim();
            }
          }
          break;

        default:
          if (state === 'media') {
            buffer += character;
          }
          break;
      }
    }
  }
});


//.CommonJS
exports.CSSImportRule = CSSOM.CSSImportRule;
///CommonJS

},{"./CSSRule":16,"./CSSStyleSheet":19,"./MediaList":23}],13:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule,
	CSSStyleDeclaration: require('./CSSStyleDeclaration').CSSStyleDeclaration
};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/css3-animations/#DOM-CSSKeyframeRule
 */
CSSOM.CSSKeyframeRule = function CSSKeyframeRule() {
	CSSOM.CSSRule.call(this);
	this.keyText = '';
	this.style = new CSSOM.CSSStyleDeclaration();
	this.style.parentRule = this;
};

CSSOM.CSSKeyframeRule.prototype = new CSSOM.CSSRule();
CSSOM.CSSKeyframeRule.prototype.constructor = CSSOM.CSSKeyframeRule;
CSSOM.CSSKeyframeRule.prototype.type = 9;
//FIXME
//CSSOM.CSSKeyframeRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSKeyframeRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

// http://www.opensource.apple.com/source/WebCore/WebCore-955.66.1/css/WebKitCSSKeyframeRule.cpp
Object.defineProperty(CSSOM.CSSKeyframeRule.prototype, "cssText", {
  get: function() {
    return this.keyText + " {" + this.style.cssText + "} ";
  }
});


//.CommonJS
exports.CSSKeyframeRule = CSSOM.CSSKeyframeRule;
///CommonJS

},{"./CSSRule":16,"./CSSStyleDeclaration":17}],14:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule
};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/css3-animations/#DOM-CSSKeyframesRule
 */
CSSOM.CSSKeyframesRule = function CSSKeyframesRule() {
	CSSOM.CSSRule.call(this);
	this.name = '';
	this.cssRules = [];
};

CSSOM.CSSKeyframesRule.prototype = new CSSOM.CSSRule();
CSSOM.CSSKeyframesRule.prototype.constructor = CSSOM.CSSKeyframesRule;
CSSOM.CSSKeyframesRule.prototype.type = 8;
//FIXME
//CSSOM.CSSKeyframesRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSKeyframesRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

// http://www.opensource.apple.com/source/WebCore/WebCore-955.66.1/css/WebKitCSSKeyframesRule.cpp
Object.defineProperty(CSSOM.CSSKeyframesRule.prototype, "cssText", {
  get: function() {
    var cssTexts = [];
    for (var i=0, length=this.cssRules.length; i < length; i++) {
      cssTexts.push("  " + this.cssRules[i].cssText);
    }
    return "@" + (this._vendorPrefix || '') + "keyframes " + this.name + " { \n" + cssTexts.join("\n") + "\n}";
  }
});


//.CommonJS
exports.CSSKeyframesRule = CSSOM.CSSKeyframesRule;
///CommonJS

},{"./CSSRule":16}],15:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule,
	MediaList: require("./MediaList").MediaList
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssmediarule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSMediaRule
 */
CSSOM.CSSMediaRule = function CSSMediaRule() {
	CSSOM.CSSRule.call(this);
	this.media = new CSSOM.MediaList();
	this.cssRules = [];
};

CSSOM.CSSMediaRule.prototype = new CSSOM.CSSRule();
CSSOM.CSSMediaRule.prototype.constructor = CSSOM.CSSMediaRule;
CSSOM.CSSMediaRule.prototype.type = 4;
//FIXME
//CSSOM.CSSMediaRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSMediaRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

// http://opensource.apple.com/source/WebCore/WebCore-658.28/css/CSSMediaRule.cpp
Object.defineProperty(CSSOM.CSSMediaRule.prototype, "cssText", {
  get: function() {
    var cssTexts = [];
    for (var i=0, length=this.cssRules.length; i < length; i++) {
      cssTexts.push(this.cssRules[i].cssText);
    }
    return "@media " + this.media.mediaText + " {" + cssTexts.join("") + "}";
  }
});


//.CommonJS
exports.CSSMediaRule = CSSOM.CSSMediaRule;
///CommonJS

},{"./CSSRule":16,"./MediaList":23}],16:[function(require,module,exports){
//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#the-cssrule-interface
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSRule
 */
CSSOM.CSSRule = function CSSRule() {
	this.parentRule = null;
	this.parentStyleSheet = null;
};

CSSOM.CSSRule.UNKNOWN_RULE = 0;                 // obsolete
CSSOM.CSSRule.STYLE_RULE = 1;
CSSOM.CSSRule.CHARSET_RULE = 2;                 // obsolete
CSSOM.CSSRule.IMPORT_RULE = 3;
CSSOM.CSSRule.MEDIA_RULE = 4;
CSSOM.CSSRule.FONT_FACE_RULE = 5;
CSSOM.CSSRule.PAGE_RULE = 6;
CSSOM.CSSRule.KEYFRAMES_RULE = 7;
CSSOM.CSSRule.KEYFRAME_RULE = 8;
CSSOM.CSSRule.MARGIN_RULE = 9;
CSSOM.CSSRule.NAMESPACE_RULE = 10;
CSSOM.CSSRule.COUNTER_STYLE_RULE = 11;
CSSOM.CSSRule.SUPPORTS_RULE = 12;
CSSOM.CSSRule.DOCUMENT_RULE = 13;
CSSOM.CSSRule.FONT_FEATURE_VALUES_RULE = 14;
CSSOM.CSSRule.VIEWPORT_RULE = 15;
CSSOM.CSSRule.REGION_STYLE_RULE = 16;


CSSOM.CSSRule.prototype = {
	constructor: CSSOM.CSSRule
	//FIXME
};


//.CommonJS
exports.CSSRule = CSSOM.CSSRule;
///CommonJS

},{}],17:[function(require,module,exports){
//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
 */
CSSOM.CSSStyleDeclaration = function CSSStyleDeclaration(){
	this.length = 0;
	this.parentRule = null;

	// NON-STANDARD
	this._importants = {};
};


CSSOM.CSSStyleDeclaration.prototype = {

	constructor: CSSOM.CSSStyleDeclaration,

	/**
	 *
	 * @param {string} name
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
	 * @return {string} the value of the property if it has been explicitly set for this declaration block.
	 * Returns the empty string if the property has not been set.
	 */
	getPropertyValue: function(name) {
		return this[name] || "";
	},

	/**
	 *
	 * @param {string} name
	 * @param {string} value
	 * @param {string} [priority=null] "important" or null
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
	 */
	setProperty: function(name, value, priority) {
		if (this[name]) {
			// Property already exist. Overwrite it.
			var index = Array.prototype.indexOf.call(this, name);
			if (index < 0) {
				this[this.length] = name;
				this.length++;
			}
		} else {
			// New property.
			this[this.length] = name;
			this.length++;
		}
		this[name] = value + "";
		this._importants[name] = priority;
	},

	/**
	 *
	 * @param {string} name
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
	 * @return {string} the value of the property if it has been explicitly set for this declaration block.
	 * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
	 */
	removeProperty: function(name) {
		if (!(name in this)) {
			return "";
		}
		var index = Array.prototype.indexOf.call(this, name);
		if (index < 0) {
			return "";
		}
		var prevValue = this[name];
		this[name] = "";

		// That's what WebKit and Opera do
		Array.prototype.splice.call(this, index, 1);

		// That's what Firefox does
		//this[index] = ""

		return prevValue;
	},

	getPropertyCSSValue: function() {
		//FIXME
	},

	/**
	 *
	 * @param {String} name
	 */
	getPropertyPriority: function(name) {
		return this._importants[name] || "";
	},


	/**
	 *   element.style.overflow = "auto"
	 *   element.style.getPropertyShorthand("overflow-x")
	 *   -> "overflow"
	 */
	getPropertyShorthand: function() {
		//FIXME
	},

	isPropertyImplicit: function() {
		//FIXME
	},

	// Doesn't work in IE < 9
	get cssText(){
		var properties = [];
		for (var i=0, length=this.length; i < length; ++i) {
			var name = this[i];
			var value = this.getPropertyValue(name);
			var priority = this.getPropertyPriority(name);
			if (priority) {
				priority = " !" + priority;
			}
			properties[i] = name + ": " + value + priority + ";";
		}
		return properties.join(" ");
	},

	set cssText(text){
		var i, name;
		for (i = this.length; i--;) {
			name = this[i];
			this[name] = "";
		}
		Array.prototype.splice.call(this, 0, this.length);
		this._importants = {};

		var dummyRule = CSSOM.parse('#bogus{' + text + '}').cssRules[0].style;
		var length = dummyRule.length;
		for (i = 0; i < length; ++i) {
			name = dummyRule[i];
			this.setProperty(dummyRule[i], dummyRule.getPropertyValue(name), dummyRule.getPropertyPriority(name));
		}
	}
};


//.CommonJS
exports.CSSStyleDeclaration = CSSOM.CSSStyleDeclaration;
CSSOM.parse = require('./parse').parse; // Cannot be included sooner due to the mutual dependency between parse.js and CSSStyleDeclaration.js
///CommonJS

},{"./parse":27}],18:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSStyleDeclaration: require("./CSSStyleDeclaration").CSSStyleDeclaration,
	CSSRule: require("./CSSRule").CSSRule
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssstylerule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleRule
 */
CSSOM.CSSStyleRule = function CSSStyleRule() {
	CSSOM.CSSRule.call(this);
	this.selectorText = "";
	this.style = new CSSOM.CSSStyleDeclaration();
	this.style.parentRule = this;
};

CSSOM.CSSStyleRule.prototype = new CSSOM.CSSRule();
CSSOM.CSSStyleRule.prototype.constructor = CSSOM.CSSStyleRule;
CSSOM.CSSStyleRule.prototype.type = 1;

Object.defineProperty(CSSOM.CSSStyleRule.prototype, "cssText", {
	get: function() {
		var text;
		if (this.selectorText) {
			text = this.selectorText + " {" + this.style.cssText + "}";
		} else {
			text = "";
		}
		return text;
	},
	set: function(cssText) {
		var rule = CSSOM.CSSStyleRule.parse(cssText);
		this.style = rule.style;
		this.selectorText = rule.selectorText;
	}
});


/**
 * NON-STANDARD
 * lightweight version of parse.js.
 * @param {string} ruleText
 * @return CSSStyleRule
 */
CSSOM.CSSStyleRule.parse = function(ruleText) {
	var i = 0;
	var state = "selector";
	var index;
	var j = i;
	var buffer = "";

	var SIGNIFICANT_WHITESPACE = {
		"selector": true,
		"value": true
	};

	var styleRule = new CSSOM.CSSStyleRule();
	var name, priority="";

	for (var character; (character = ruleText.charAt(i)); i++) {

		switch (character) {

		case " ":
		case "\t":
		case "\r":
		case "\n":
		case "\f":
			if (SIGNIFICANT_WHITESPACE[state]) {
				// Squash 2 or more white-spaces in the row into 1
				switch (ruleText.charAt(i - 1)) {
					case " ":
					case "\t":
					case "\r":
					case "\n":
					case "\f":
						break;
					default:
						buffer += " ";
						break;
				}
			}
			break;

		// String
		case '"':
			j = i + 1;
			index = ruleText.indexOf('"', j) + 1;
			if (!index) {
				throw '" is missing';
			}
			buffer += ruleText.slice(i, index);
			i = index - 1;
			break;

		case "'":
			j = i + 1;
			index = ruleText.indexOf("'", j) + 1;
			if (!index) {
				throw "' is missing";
			}
			buffer += ruleText.slice(i, index);
			i = index - 1;
			break;

		// Comment
		case "/":
			if (ruleText.charAt(i + 1) === "*") {
				i += 2;
				index = ruleText.indexOf("*/", i);
				if (index === -1) {
					throw new SyntaxError("Missing */");
				} else {
					i = index + 1;
				}
			} else {
				buffer += character;
			}
			break;

		case "{":
			if (state === "selector") {
				styleRule.selectorText = buffer.trim();
				buffer = "";
				state = "name";
			}
			break;

		case ":":
			if (state === "name") {
				name = buffer.trim();
				buffer = "";
				state = "value";
			} else {
				buffer += character;
			}
			break;

		case "!":
			if (state === "value" && ruleText.indexOf("!important", i) === i) {
				priority = "important";
				i += "important".length;
			} else {
				buffer += character;
			}
			break;

		case ";":
			if (state === "value") {
				styleRule.style.setProperty(name, buffer.trim(), priority);
				priority = "";
				buffer = "";
				state = "name";
			} else {
				buffer += character;
			}
			break;

		case "}":
			if (state === "value") {
				styleRule.style.setProperty(name, buffer.trim(), priority);
				priority = "";
				buffer = "";
			} else if (state === "name") {
				break;
			} else {
				buffer += character;
			}
			state = "selector";
			break;

		default:
			buffer += character;
			break;

		}
	}

	return styleRule;

};


//.CommonJS
exports.CSSStyleRule = CSSOM.CSSStyleRule;
///CommonJS

},{"./CSSRule":16,"./CSSStyleDeclaration":17}],19:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	StyleSheet: require("./StyleSheet").StyleSheet,
	CSSStyleRule: require("./CSSStyleRule").CSSStyleRule
};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
 */
CSSOM.CSSStyleSheet = function CSSStyleSheet() {
	CSSOM.StyleSheet.call(this);
	this.cssRules = [];
};


CSSOM.CSSStyleSheet.prototype = new CSSOM.StyleSheet();
CSSOM.CSSStyleSheet.prototype.constructor = CSSOM.CSSStyleSheet;


/**
 * Used to insert a new rule into the style sheet. The new rule now becomes part of the cascade.
 *
 *   sheet = new Sheet("body {margin: 0}")
 *   sheet.toString()
 *   -> "body{margin:0;}"
 *   sheet.insertRule("img {border: none}", 0)
 *   -> 0
 *   sheet.toString()
 *   -> "img{border:none;}body{margin:0;}"
 *
 * @param {string} rule
 * @param {number} index
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet-insertRule
 * @return {number} The index within the style sheet's rule collection of the newly inserted rule.
 */
CSSOM.CSSStyleSheet.prototype.insertRule = function(rule, index) {
	if (index < 0 || index > this.cssRules.length) {
		throw new RangeError("INDEX_SIZE_ERR");
	}
	var cssRule = CSSOM.parse(rule).cssRules[0];
	cssRule.parentStyleSheet = this;
	this.cssRules.splice(index, 0, cssRule);
	return index;
};


/**
 * Used to delete a rule from the style sheet.
 *
 *   sheet = new Sheet("img{border:none} body{margin:0}")
 *   sheet.toString()
 *   -> "img{border:none;}body{margin:0;}"
 *   sheet.deleteRule(0)
 *   sheet.toString()
 *   -> "body{margin:0;}"
 *
 * @param {number} index within the style sheet's rule list of the rule to remove.
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet-deleteRule
 */
CSSOM.CSSStyleSheet.prototype.deleteRule = function(index) {
	if (index < 0 || index >= this.cssRules.length) {
		throw new RangeError("INDEX_SIZE_ERR");
	}
	this.cssRules.splice(index, 1);
};


/**
 * NON-STANDARD
 * @return {string} serialize stylesheet
 */
CSSOM.CSSStyleSheet.prototype.toString = function() {
	var result = "";
	var rules = this.cssRules;
	for (var i=0; i<rules.length; i++) {
		result += rules[i].cssText + "\n";
	}
	return result;
};


//.CommonJS
exports.CSSStyleSheet = CSSOM.CSSStyleSheet;
CSSOM.parse = require('./parse').parse; // Cannot be included sooner due to the mutual dependency between parse.js and CSSStyleSheet.js
///CommonJS

},{"./CSSStyleRule":18,"./StyleSheet":24,"./parse":27}],20:[function(require,module,exports){
//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSValue
 *
 * TODO: add if needed
 */
CSSOM.CSSValue = function CSSValue() {
};

CSSOM.CSSValue.prototype = {
	constructor: CSSOM.CSSValue,

	// @see: http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSValue
	set cssText(text) {
		var name = this._getConstructorName();

		throw new Error('DOMException: property "cssText" of "' + name + '" is readonly and can not be replaced with "' + text + '"!');
	},

	get cssText() {
		var name = this._getConstructorName();

		throw new Error('getter "cssText" of "' + name + '" is not implemented!');
	},

	_getConstructorName: function() {
		var s = this.constructor.toString(),
				c = s.match(/function\s([^\(]+)/),
				name = c[1];

		return name;
	}
};


//.CommonJS
exports.CSSValue = CSSOM.CSSValue;
///CommonJS

},{}],21:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSValue: require('./CSSValue').CSSValue
};
///CommonJS


/**
 * @constructor
 * @see http://msdn.microsoft.com/en-us/library/ms537634(v=vs.85).aspx
 *
 */
CSSOM.CSSValueExpression = function CSSValueExpression(token, idx) {
	this._token = token;
	this._idx = idx;
};

CSSOM.CSSValueExpression.prototype = new CSSOM.CSSValue();
CSSOM.CSSValueExpression.prototype.constructor = CSSOM.CSSValueExpression;

/**
 * parse css expression() value
 *
 * @return {Object}
 *         - error:
 *         or
 *         - idx:
 *         - expression:
 *
 * Example:
 *
 * .selector {
 *		zoom: expression(documentElement.clientWidth > 1000 ? '1000px' : 'auto');
 * }
 */
CSSOM.CSSValueExpression.prototype.parse = function() {
	var token = this._token,
			idx = this._idx;

	var character = '',
			expression = '',
			error = '',
			info,
			paren = [];


	for (; ; ++idx) {
		character = token.charAt(idx);

		// end of token
		if (character === '') {
			error = 'css expression error: unfinished expression!';
			break;
		}

		switch(character) {
			case '(':
				paren.push(character);
				expression += character;
				break;

			case ')':
				paren.pop(character);
				expression += character;
				break;

			case '/':
				if ((info = this._parseJSComment(token, idx))) { // comment?
					if (info.error) {
						error = 'css expression error: unfinished comment in expression!';
					} else {
						idx = info.idx;
						// ignore the comment
					}
				} else if ((info = this._parseJSRexExp(token, idx))) { // regexp
					idx = info.idx;
					expression += info.text;
				} else { // other
					expression += character;
				}
				break;

			case "'":
			case '"':
				info = this._parseJSString(token, idx, character);
				if (info) { // string
					idx = info.idx;
					expression += info.text;
				} else {
					expression += character;
				}
				break;

			default:
				expression += character;
				break;
		}

		if (error) {
			break;
		}

		// end of expression
		if (paren.length === 0) {
			break;
		}
	}

	var ret;
	if (error) {
		ret = {
			error: error
		};
	} else {
		ret = {
			idx: idx,
			expression: expression
		};
	}

	return ret;
};


/**
 *
 * @return {Object|false}
 *          - idx:
 *          - text:
 *          or
 *          - error:
 *          or
 *          false
 *
 */
CSSOM.CSSValueExpression.prototype._parseJSComment = function(token, idx) {
	var nextChar = token.charAt(idx + 1),
			text;

	if (nextChar === '/' || nextChar === '*') {
		var startIdx = idx,
				endIdx,
				commentEndChar;

		if (nextChar === '/') { // line comment
			commentEndChar = '\n';
		} else if (nextChar === '*') { // block comment
			commentEndChar = '*/';
		}

		endIdx = token.indexOf(commentEndChar, startIdx + 1 + 1);
		if (endIdx !== -1) {
			endIdx = endIdx + commentEndChar.length - 1;
			text = token.substring(idx, endIdx + 1);
			return {
				idx: endIdx,
				text: text
			};
		} else {
			var error = 'css expression error: unfinished comment in expression!';
			return {
				error: error
			};
		}
	} else {
		return false;
	}
};


/**
 *
 * @return {Object|false}
 *					- idx:
 *					- text:
 *					or 
 *					false
 *
 */
CSSOM.CSSValueExpression.prototype._parseJSString = function(token, idx, sep) {
	var endIdx = this._findMatchedIdx(token, idx, sep),
			text;

	if (endIdx === -1) {
		return false;
	} else {
		text = token.substring(idx, endIdx + sep.length);

		return {
			idx: endIdx,
			text: text
		};
	}
};


/**
 * parse regexp in css expression
 *
 * @return {Object|false}
 *				- idx:
 *				- regExp:
 *				or 
 *				false
 */

/*

all legal RegExp
 
/a/
(/a/)
[/a/]
[12, /a/]

!/a/

+/a/
-/a/
* /a/
/ /a/
%/a/

===/a/
!==/a/
==/a/
!=/a/
>/a/
>=/a/
</a/
<=/a/

&/a/
|/a/
^/a/
~/a/
<</a/
>>/a/
>>>/a/

&&/a/
||/a/
?/a/
=/a/
,/a/

		delete /a/
				in /a/
instanceof /a/
				new /a/
		typeof /a/
			void /a/

*/
CSSOM.CSSValueExpression.prototype._parseJSRexExp = function(token, idx) {
	var before = token.substring(0, idx).replace(/\s+$/, ""),
			legalRegx = [
				/^$/,
				/\($/,
				/\[$/,
				/\!$/,
				/\+$/,
				/\-$/,
				/\*$/,
				/\/\s+/,
				/\%$/,
				/\=$/,
				/\>$/,
				/<$/,
				/\&$/,
				/\|$/,
				/\^$/,
				/\~$/,
				/\?$/,
				/\,$/,
				/delete$/,
				/in$/,
				/instanceof$/,
				/new$/,
				/typeof$/,
				/void$/
			];

	var isLegal = legalRegx.some(function(reg) {
		return reg.test(before);
	});

	if (!isLegal) {
		return false;
	} else {
		var sep = '/';

		// same logic as string
		return this._parseJSString(token, idx, sep);
	}
};


/**
 *
 * find next sep(same line) index in `token`
 *
 * @return {Number}
 *
 */
CSSOM.CSSValueExpression.prototype._findMatchedIdx = function(token, idx, sep) {
	var startIdx = idx,
			endIdx;

	var NOT_FOUND = -1;

	while(true) {
		endIdx = token.indexOf(sep, startIdx + 1);

		if (endIdx === -1) { // not found
			endIdx = NOT_FOUND;
			break;
		} else {
			var text = token.substring(idx + 1, endIdx),
					matched = text.match(/\\+$/);
			if (!matched || matched[0] % 2 === 0) { // not escaped
				break;
			} else {
				startIdx = endIdx;
			}
		}
	}

	// boundary must be in the same line(js sting or regexp)
	var nextNewLineIdx = token.indexOf('\n', idx + 1);
	if (nextNewLineIdx < endIdx) {
		endIdx = NOT_FOUND;
	}


	return endIdx;
};




//.CommonJS
exports.CSSValueExpression = CSSOM.CSSValueExpression;
///CommonJS

},{"./CSSValue":20}],22:[function(require,module,exports){
//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see https://developer.mozilla.org/en/CSS/@-moz-document
 */
CSSOM.MatcherList = function MatcherList(){
    this.length = 0;
};

CSSOM.MatcherList.prototype = {

    constructor: CSSOM.MatcherList,

    /**
     * @return {string}
     */
    get matcherText() {
        return Array.prototype.join.call(this, ", ");
    },

    /**
     * @param {string} value
     */
    set matcherText(value) {
        // just a temporary solution, actually it may be wrong by just split the value with ',', because a url can include ','.
        var values = value.split(",");
        var length = this.length = values.length;
        for (var i=0; i<length; i++) {
            this[i] = values[i].trim();
        }
    },

    /**
     * @param {string} matcher
     */
    appendMatcher: function(matcher) {
        if (Array.prototype.indexOf.call(this, matcher) === -1) {
            this[this.length] = matcher;
            this.length++;
        }
    },

    /**
     * @param {string} matcher
     */
    deleteMatcher: function(matcher) {
        var index = Array.prototype.indexOf.call(this, matcher);
        if (index !== -1) {
            Array.prototype.splice.call(this, index, 1);
        }
    }

};


//.CommonJS
exports.MatcherList = CSSOM.MatcherList;
///CommonJS

},{}],23:[function(require,module,exports){
//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#the-medialist-interface
 */
CSSOM.MediaList = function MediaList(){
	this.length = 0;
};

CSSOM.MediaList.prototype = {

	constructor: CSSOM.MediaList,

	/**
	 * @return {string}
	 */
	get mediaText() {
		return Array.prototype.join.call(this, ", ");
	},

	/**
	 * @param {string} value
	 */
	set mediaText(value) {
		var values = value.split(",");
		var length = this.length = values.length;
		for (var i=0; i<length; i++) {
			this[i] = values[i].trim();
		}
	},

	/**
	 * @param {string} medium
	 */
	appendMedium: function(medium) {
		if (Array.prototype.indexOf.call(this, medium) === -1) {
			this[this.length] = medium;
			this.length++;
		}
	},

	/**
	 * @param {string} medium
	 */
	deleteMedium: function(medium) {
		var index = Array.prototype.indexOf.call(this, medium);
		if (index !== -1) {
			Array.prototype.splice.call(this, index, 1);
		}
	}

};


//.CommonJS
exports.MediaList = CSSOM.MediaList;
///CommonJS

},{}],24:[function(require,module,exports){
//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#the-stylesheet-interface
 */
CSSOM.StyleSheet = function StyleSheet() {
	this.parentStyleSheet = null;
};


//.CommonJS
exports.StyleSheet = CSSOM.StyleSheet;
///CommonJS

},{}],25:[function(require,module,exports){
//.CommonJS
var CSSOM = {
	CSSStyleSheet: require("./CSSStyleSheet").CSSStyleSheet,
	CSSStyleRule: require("./CSSStyleRule").CSSStyleRule,
	CSSMediaRule: require("./CSSMediaRule").CSSMediaRule,
	CSSStyleDeclaration: require("./CSSStyleDeclaration").CSSStyleDeclaration,
	CSSKeyframeRule: require('./CSSKeyframeRule').CSSKeyframeRule,
	CSSKeyframesRule: require('./CSSKeyframesRule').CSSKeyframesRule
};
///CommonJS


/**
 * Produces a deep copy of stylesheet — the instance variables of stylesheet are copied recursively.
 * @param {CSSStyleSheet|CSSOM.CSSStyleSheet} stylesheet
 * @nosideeffects
 * @return {CSSOM.CSSStyleSheet}
 */
CSSOM.clone = function clone(stylesheet) {

	var cloned = new CSSOM.CSSStyleSheet();

	var rules = stylesheet.cssRules;
	if (!rules) {
		return cloned;
	}

	var RULE_TYPES = {
		1: CSSOM.CSSStyleRule,
		4: CSSOM.CSSMediaRule,
		//3: CSSOM.CSSImportRule,
		//5: CSSOM.CSSFontFaceRule,
		//6: CSSOM.CSSPageRule,
		8: CSSOM.CSSKeyframesRule,
		9: CSSOM.CSSKeyframeRule
	};

	for (var i=0, rulesLength=rules.length; i < rulesLength; i++) {
		var rule = rules[i];
		var ruleClone = cloned.cssRules[i] = new RULE_TYPES[rule.type]();

		var style = rule.style;
		if (style) {
			var styleClone = ruleClone.style = new CSSOM.CSSStyleDeclaration();
			for (var j=0, styleLength=style.length; j < styleLength; j++) {
				var name = styleClone[j] = style[j];
				styleClone[name] = style[name];
				styleClone._importants[name] = style.getPropertyPriority(name);
			}
			styleClone.length = style.length;
		}

		if (rule.hasOwnProperty('keyText')) {
			ruleClone.keyText = rule.keyText;
		}

		if (rule.hasOwnProperty('selectorText')) {
			ruleClone.selectorText = rule.selectorText;
		}

		if (rule.hasOwnProperty('mediaText')) {
			ruleClone.mediaText = rule.mediaText;
		}

		if (rule.hasOwnProperty('cssRules')) {
			ruleClone.cssRules = clone(rule).cssRules;
		}
	}

	return cloned;

};

//.CommonJS
exports.clone = CSSOM.clone;
///CommonJS

},{"./CSSKeyframeRule":13,"./CSSKeyframesRule":14,"./CSSMediaRule":15,"./CSSStyleDeclaration":17,"./CSSStyleRule":18,"./CSSStyleSheet":19}],26:[function(require,module,exports){
'use strict';

exports.CSSStyleDeclaration = require('./CSSStyleDeclaration').CSSStyleDeclaration;
exports.CSSRule = require('./CSSRule').CSSRule;
exports.CSSStyleRule = require('./CSSStyleRule').CSSStyleRule;
exports.MediaList = require('./MediaList').MediaList;
exports.CSSMediaRule = require('./CSSMediaRule').CSSMediaRule;
exports.CSSImportRule = require('./CSSImportRule').CSSImportRule;
exports.CSSFontFaceRule = require('./CSSFontFaceRule').CSSFontFaceRule;
exports.CSSHostRule = require('./CSSHostRule').CSSHostRule;
exports.StyleSheet = require('./StyleSheet').StyleSheet;
exports.CSSStyleSheet = require('./CSSStyleSheet').CSSStyleSheet;
exports.CSSKeyframesRule = require('./CSSKeyframesRule').CSSKeyframesRule;
exports.CSSKeyframeRule = require('./CSSKeyframeRule').CSSKeyframeRule;
exports.MatcherList = require('./MatcherList').MatcherList;
exports.CSSDocumentRule = require('./CSSDocumentRule').CSSDocumentRule;
exports.CSSValue = require('./CSSValue').CSSValue;
exports.CSSValueExpression = require('./CSSValueExpression').CSSValueExpression;
exports.parse = require('./parse').parse;
exports.clone = require('./clone').clone;

},{"./CSSDocumentRule":9,"./CSSFontFaceRule":10,"./CSSHostRule":11,"./CSSImportRule":12,"./CSSKeyframeRule":13,"./CSSKeyframesRule":14,"./CSSMediaRule":15,"./CSSRule":16,"./CSSStyleDeclaration":17,"./CSSStyleRule":18,"./CSSStyleSheet":19,"./CSSValue":20,"./CSSValueExpression":21,"./MatcherList":22,"./MediaList":23,"./StyleSheet":24,"./clone":25,"./parse":27}],27:[function(require,module,exports){
//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @param {string} token
 */
CSSOM.parse = function parse(token) {

	var i = 0;

	/**
		"before-selector" or
		"selector" or
		"atRule" or
		"atBlock" or
		"before-name" or
		"name" or
		"before-value" or
		"value"
	*/
	var state = "before-selector";

	var index;
	var buffer = "";
	var valueParenthesisDepth = 0;

	var SIGNIFICANT_WHITESPACE = {
		"selector": true,
		"value": true,
		"value-parenthesis": true,
		"atRule": true,
		"importRule-begin": true,
		"importRule": true,
		"atBlock": true,
		'documentRule-begin': true
	};

	var styleSheet = new CSSOM.CSSStyleSheet();

	// @type CSSStyleSheet|CSSMediaRule|CSSFontFaceRule|CSSKeyframesRule|CSSDocumentRule
	var currentScope = styleSheet;

	// @type CSSMediaRule|CSSKeyframesRule|CSSDocumentRule
	var parentRule;

	var name, priority="", styleRule, mediaRule, importRule, fontFaceRule, keyframesRule, documentRule, hostRule;

	var atKeyframesRegExp = /@(-(?:\w+-)+)?keyframes/g;

	var parseError = function(message) {
		var lines = token.substring(0, i).split('\n');
		var lineCount = lines.length;
		var charCount = lines.pop().length + 1;
		var error = new Error(message + ' (line ' + lineCount + ', char ' + charCount + ')');
		error.line = lineCount;
		/* jshint sub : true */
		error['char'] = charCount;
		error.styleSheet = styleSheet;
		throw error;
	};

	for (var character; (character = token.charAt(i)); i++) {

		switch (character) {

		case " ":
		case "\t":
		case "\r":
		case "\n":
		case "\f":
			if (SIGNIFICANT_WHITESPACE[state]) {
				buffer += character;
			}
			break;

		// String
		case '"':
			index = i + 1;
			do {
				index = token.indexOf('"', index) + 1;
				if (!index) {
					parseError('Unmatched "');
				}
			} while (token[index - 2] === '\\');
			buffer += token.slice(i, index);
			i = index - 1;
			switch (state) {
				case 'before-value':
					state = 'value';
					break;
				case 'importRule-begin':
					state = 'importRule';
					break;
			}
			break;

		case "'":
			index = i + 1;
			do {
				index = token.indexOf("'", index) + 1;
				if (!index) {
					parseError("Unmatched '");
				}
			} while (token[index - 2] === '\\');
			buffer += token.slice(i, index);
			i = index - 1;
			switch (state) {
				case 'before-value':
					state = 'value';
					break;
				case 'importRule-begin':
					state = 'importRule';
					break;
			}
			break;

		// Comment
		case "/":
			if (token.charAt(i + 1) === "*") {
				i += 2;
				index = token.indexOf("*/", i);
				if (index === -1) {
					parseError("Missing */");
				} else {
					i = index + 1;
				}
			} else {
				buffer += character;
			}
			if (state === "importRule-begin") {
				buffer += " ";
				state = "importRule";
			}
			break;

		// At-rule
		case "@":
			if (token.indexOf("@-moz-document", i) === i) {
				state = "documentRule-begin";
				documentRule = new CSSOM.CSSDocumentRule();
				documentRule.__starts = i;
				i += "-moz-document".length;
				buffer = "";
				break;
			} else if (token.indexOf("@media", i) === i) {
				state = "atBlock";
				mediaRule = new CSSOM.CSSMediaRule();
				mediaRule.__starts = i;
				i += "media".length;
				buffer = "";
				break;
			} else if (token.indexOf("@host", i) === i) {
				state = "hostRule-begin";
				i += "host".length;
				hostRule = new CSSOM.CSSHostRule();
				hostRule.__starts = i;
				buffer = "";
				break;
			} else if (token.indexOf("@import", i) === i) {
				state = "importRule-begin";
				i += "import".length;
				buffer += "@import";
				break;
			} else if (token.indexOf("@font-face", i) === i) {
				state = "fontFaceRule-begin";
				i += "font-face".length;
				fontFaceRule = new CSSOM.CSSFontFaceRule();
				fontFaceRule.__starts = i;
				buffer = "";
				break;
			} else {
				atKeyframesRegExp.lastIndex = i;
				var matchKeyframes = atKeyframesRegExp.exec(token);
				if (matchKeyframes && matchKeyframes.index === i) {
					state = "keyframesRule-begin";
					keyframesRule = new CSSOM.CSSKeyframesRule();
					keyframesRule.__starts = i;
					keyframesRule._vendorPrefix = matchKeyframes[1]; // Will come out as undefined if no prefix was found
					i += matchKeyframes[0].length - 1;
					buffer = "";
					break;
				} else if (state === "selector") {
					state = "atRule";
				}
			}
			buffer += character;
			break;

		case "{":
			if (state === "selector" || state === "atRule") {
				styleRule.selectorText = buffer.trim();
				styleRule.style.__starts = i;
				buffer = "";
				state = "before-name";
			} else if (state === "atBlock") {
				mediaRule.media.mediaText = buffer.trim();
				currentScope = parentRule = mediaRule;
				mediaRule.parentStyleSheet = styleSheet;
				buffer = "";
				state = "before-selector";
			} else if (state === "hostRule-begin") {
				currentScope = parentRule = hostRule;
				hostRule.parentStyleSheet = styleSheet;
				buffer = "";
				state = "before-selector";
			} else if (state === "fontFaceRule-begin") {
				if (parentRule) {
					fontFaceRule.parentRule = parentRule;
				}
				fontFaceRule.parentStyleSheet = styleSheet;
				styleRule = fontFaceRule;
				buffer = "";
				state = "before-name";
			} else if (state === "keyframesRule-begin") {
				keyframesRule.name = buffer.trim();
				if (parentRule) {
					keyframesRule.parentRule = parentRule;
				}
				keyframesRule.parentStyleSheet = styleSheet;
				currentScope = parentRule = keyframesRule;
				buffer = "";
				state = "keyframeRule-begin";
			} else if (state === "keyframeRule-begin") {
				styleRule = new CSSOM.CSSKeyframeRule();
				styleRule.keyText = buffer.trim();
				styleRule.__starts = i;
				buffer = "";
				state = "before-name";
			} else if (state === "documentRule-begin") {
				// FIXME: what if this '{' is in the url text of the match function?
				documentRule.matcher.matcherText = buffer.trim();
				if (parentRule) {
					documentRule.parentRule = parentRule;
				}
				currentScope = parentRule = documentRule;
				documentRule.parentStyleSheet = styleSheet;
				buffer = "";
				state = "before-selector";
			}
			break;

		case ":":
			if (state === "name") {
				name = buffer.trim();
				buffer = "";
				state = "before-value";
			} else {
				buffer += character;
			}
			break;

		case "(":
			if (state === 'value') {
				// ie css expression mode
				if (buffer.trim() === 'expression') {
					var info = (new CSSOM.CSSValueExpression(token, i)).parse();

					if (info.error) {
						parseError(info.error);
					} else {
						buffer += info.expression;
						i = info.idx;
					}
				} else {
					state = 'value-parenthesis';
					//always ensure this is reset to 1 on transition
					//from value to value-parenthesis
					valueParenthesisDepth = 1;
					buffer += character;
				}
			} else if (state === 'value-parenthesis') {
				valueParenthesisDepth++;
				buffer += character;
			} else {
				buffer += character;
			}
			break;

		case ")":
			if (state === 'value-parenthesis') {
				valueParenthesisDepth--;
				if (valueParenthesisDepth === 0) state = 'value';
			}
			buffer += character;
			break;

		case "!":
			if (state === "value" && token.indexOf("!important", i) === i) {
				priority = "important";
				i += "important".length;
			} else {
				buffer += character;
			}
			break;

		case ";":
			switch (state) {
				case "value":
					styleRule.style.setProperty(name, buffer.trim(), priority);
					priority = "";
					buffer = "";
					state = "before-name";
					break;
				case "atRule":
					buffer = "";
					state = "before-selector";
					break;
				case "importRule":
					importRule = new CSSOM.CSSImportRule();
					importRule.parentStyleSheet = importRule.styleSheet.parentStyleSheet = styleSheet;
					importRule.cssText = buffer + character;
					styleSheet.cssRules.push(importRule);
					buffer = "";
					state = "before-selector";
					break;
				default:
					buffer += character;
					break;
			}
			break;

		case "}":
			switch (state) {
				case "value":
					styleRule.style.setProperty(name, buffer.trim(), priority);
					priority = "";
					/* falls through */
				case "before-name":
				case "name":
					styleRule.__ends = i + 1;
					if (parentRule) {
						styleRule.parentRule = parentRule;
					}
					styleRule.parentStyleSheet = styleSheet;
					currentScope.cssRules.push(styleRule);
					buffer = "";
					if (currentScope.constructor === CSSOM.CSSKeyframesRule) {
						state = "keyframeRule-begin";
					} else {
						state = "before-selector";
					}
					break;
				case "keyframeRule-begin":
				case "before-selector":
				case "selector":
					// End of media/document rule.
					if (!parentRule) {
						parseError("Unexpected }");
					}
					currentScope.__ends = i + 1;
					// Nesting rules aren't supported yet
					styleSheet.cssRules.push(currentScope);
					currentScope = styleSheet;
					parentRule = null;
					buffer = "";
					state = "before-selector";
					break;
			}
			break;

		default:
			switch (state) {
				case "before-selector":
					state = "selector";
					styleRule = new CSSOM.CSSStyleRule();
					styleRule.__starts = i;
					break;
				case "before-name":
					state = "name";
					break;
				case "before-value":
					state = "value";
					break;
				case "importRule-begin":
					state = "importRule";
					break;
			}
			buffer += character;
			break;
		}
	}

	return styleSheet;
};


//.CommonJS
exports.parse = CSSOM.parse;
// The following modules cannot be included sooner due to the mutual dependency with parse.js
CSSOM.CSSStyleSheet = require("./CSSStyleSheet").CSSStyleSheet;
CSSOM.CSSStyleRule = require("./CSSStyleRule").CSSStyleRule;
CSSOM.CSSImportRule = require("./CSSImportRule").CSSImportRule;
CSSOM.CSSMediaRule = require("./CSSMediaRule").CSSMediaRule;
CSSOM.CSSFontFaceRule = require("./CSSFontFaceRule").CSSFontFaceRule;
CSSOM.CSSHostRule = require("./CSSHostRule").CSSHostRule;
CSSOM.CSSStyleDeclaration = require('./CSSStyleDeclaration').CSSStyleDeclaration;
CSSOM.CSSKeyframeRule = require('./CSSKeyframeRule').CSSKeyframeRule;
CSSOM.CSSKeyframesRule = require('./CSSKeyframesRule').CSSKeyframesRule;
CSSOM.CSSValueExpression = require('./CSSValueExpression').CSSValueExpression;
CSSOM.CSSDocumentRule = require('./CSSDocumentRule').CSSDocumentRule;
///CommonJS

},{"./CSSDocumentRule":9,"./CSSFontFaceRule":10,"./CSSHostRule":11,"./CSSImportRule":12,"./CSSKeyframeRule":13,"./CSSKeyframesRule":14,"./CSSMediaRule":15,"./CSSStyleDeclaration":17,"./CSSStyleRule":18,"./CSSStyleSheet":19,"./CSSValueExpression":21}],28:[function(require,module,exports){
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
    window.CSSOM = require('./lib/index')

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
},{"./collection/component":1,"./collection/rows":2,"./collection/section":3,"./dialog/component":4,"./dialog/section":5,"./dialog/sectionSettings":6,"./javascript/dropdown":7,"./javascript/previewForm":8,"./lib/index":26,"./model/builder":29,"./model/component":30,"./model/rows":31,"./model/section":32,"./tooltip/component":33,"./tooltip/row":34,"./tooltip/section":35,"./view/builder":36,"./view/component":37,"./view/dialog":38,"./view/live":39,"./view/rows":40,"./view/section":41,"./view/theme":42,"./view/tooltip":43,"./view/tooltipmodal":44}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = panels.view.tooltip.extend( {
	sectionSettingsTemplate: _.template( $( '#section-options-tooltip' ).html().panelsProcessTemplate() ),

	render: function () {
		this.renderTooltip( this.sectionSettingsTemplate() )
	},
} );

},{}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
var panels = window.panels, $ = jQuery;

module.exports = Backbone.View.extend( {
	options: {},

	builder: false,

	events: {
		'click [cmd="component-setting"]': 'onSettingClick'
	},

	parentView: null,

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
		if(this.parentView.$el.find('[modules="'+this.model.get('code')+'"]').is(':empty')){
			this.builder.iframe.callPartial('onLoadModuleSetting', this.model.toJSON(), 'callbackPartial', this)
		}else{
			this.$el = null
			this.setElement(this.parentView.$el.find('[modules="'+this.model.get('code')+'"]'))
			this.$el.data('view', this)
			this.$el.addClass('loaded')
		}
	},

	callbackPartial: function(data){
		var container = this.parentView.$el.find('[modules="'+this.model.get('code')+'"]').parent()

		// this.remove()
		if(this.$el.hasClass('loaded')){
			this.builder.iframe.html(this.$el, data.result)
		}else{
			this.builder.iframe.appendTo(container, data.result)
			this.setElement(this.parentView.$el.find('[modules="'+this.model.get('code')+'"]'))
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
			this.dialog.view = this;
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
		
		this.builder.iframe.callPartial('onLoadModuleSetting', data, 'callbackPartial', this)
	}
} );

},{}],38:[function(require,module,exports){
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
            	builder: dialogOriginal.builder,
            	view : dialogOriginal.view
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

},{}],39:[function(require,module,exports){
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
				action: themeOptions.page_url_preview+'?preview_editing_theme=1&preview=1'
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
},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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
			this.dialog.view = this;
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
		componentView.parentView = this
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

},{}],42:[function(require,module,exports){
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
},{}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
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

},{}]},{},[28]);
