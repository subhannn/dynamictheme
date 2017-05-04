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
