jQuery.fn.putCursorAtEnd = function() {
    return this.each(function() {
        $(this).focus()
        if (this.setSelectionRange) {
            var len = $(this).val().length * 2;
            this.setSelectionRange(len, len);
        } else {
            // ... otherwise replace the contents with itself
            // (Doesn't work in Google Chrome)
            $(this).val($(this).val());
        }
        this.scrollTop = 999999;
    });
}; + function($) {
    "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype
    var RangeSlider = function(element, options) {
        this.$el = $(element)
        this.$form = this.$el.closest('form')
        this.$parent = null
        this.$slider = null
        this.$input = null
        this.options = options || {}
        this.parent = this.$el.parent()
        this.$el.hide()
        $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }
    var _wrap = '<div class="flat-slider"></div>';
    var _input = '<input type="text" class="slider-input" />';
    RangeSlider.prototype = Object.create(BaseProto)
    RangeSlider.prototype.constructor = RangeSlider
    RangeSlider.prototype.init = function() {
        var self = this
        this.$input = $(_input)
        this.$el.wrap(_wrap)
        this.$slider = this.$el.parent()
        this.parent.append(this.$input)
        this.bindInput()
        this.$slider.slider({
            orientation: 'horizontal',
            range: this.options.range,
            min: this.options.min,
            max: this.options.max,
            value: this.$el.val().replace(/[\D]/g, ''),
            slide: function(event, ui) {
                self.$el.val(self.fromValue(ui.value)).trigger('change')

                if ($.isFunction(self.options.slide)) {
                    self.options.slide.call(this, event, ui);
                }
            },
            change: function(event, ui) {
                self.$el.val(self.fromValue(ui.value)).trigger('change')

                if ($.isFunction(self.options.change)) {
                    self.options.change.call(this, event, ui);
                }
            }
        })
    }

    RangeSlider.prototype.bindInput = function() {
        var self = this
        var time = null,
            temp = null

        this.$input.val(this.$el.val())
        
        this.$input.bind('keydown', function() {
            temp = $(this).val()
            clearTimeout(time);
        })

        this.$input.bind('keyup', function() {
            var val = $(this).val()
            if(temp == val) return

            time = setTimeout(function() {
                self.fixValue(val)
            }, 1000);
        })

        this.$input.bind('change', function(){
            self.$el.val($(this).val())
        })

        this.$el.bind('change', function(){
            self.$input.val($(this).val())
        })
    }

    RangeSlider.prototype.fromValue = function(value) {
        var curVal = this.$input.val()
        var matches = curVal.match(/^(\d+(?:\.\d+)?)(.*)$/);
        var valPoint = '0px';
        
        if (matches) {
            var unit = matches[2]
            if ($.inArray(unit, this.options.cssStypePoint) < 0) {
                valPoint = value+'px'
            }else{
                valPoint = value+unit
            }
        }

        return valPoint
    }

    RangeSlider.prototype.fixValue = function(value) {
        var matches = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
        var valInt = 0;
        if (matches) {
            var value = valInt = matches[1]
            var unit = matches[2]
            if ($.inArray(unit, this.options.cssStypePoint) < 0) {
                this.$input.val(value+'px').trigger('change')
            }
        } else {
            this.$input.val('0px').trigger('change')
        }

        this.$input.putCursorAtEnd()

        this.$slider.slider('value', valInt)

        return valInt
    }

    RangeSlider.prototype.bindsas = function() {}
    RangeSlider.prototype.dispose = function() {
        BaseProto.dispose.call(this)
    }
    RangeSlider.DEFAULTS = {
        slide: null,
        change: null,
        min: 0,
        max: 100,
        range: 'min',
        cssStypePoint: ['em', 'px', '%']
    }
    // PLUGIN DEFINITION
    // ============================
    var old = $.fn.rangeSlider
    $.fn.rangeSlider = function(option) {
        var args = arguments;
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('oc.rangeSlider')
            var options = $.extend({}, RangeSlider.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.rangeSlider', (data = new RangeSlider(this, options)))
            if (typeof option == 'string') data[option].apply(data, args)
        })
    }
    $.fn.rangeSlider.Constructor = RangeSlider
    $.fn.rangeSlider.noConflict = function() {
        $.fn.rangeSlider = old
        return this
    }
    $(document).render(function() {
        $('[data-control="rangeslider"]').rangeSlider()
    })
}(window.jQuery);