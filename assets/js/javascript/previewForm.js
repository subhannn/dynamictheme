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
