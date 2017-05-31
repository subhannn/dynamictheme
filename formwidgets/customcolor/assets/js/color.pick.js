+ function($, undef) {
    "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype
    var ColorPicker = function(element, options) {
        this.$el = $(element)
        this.options = options || {}
        this.$style = null
        $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }
    ColorPicker.prototype = Object.create(BaseProto)
    ColorPicker.prototype.constructor = ColorPicker
    var _before = '<a tabindex="0" class="color-result" />',
        _after = '<div class="picker-holder" />',
        _wrap = '<div class="picker-container" />',
        _button = '<input type="button" class="button button-small hidden" />';
    // jQuery UI Widget constructor
    ColorPicker.prototype._createHueOnly = function() {
        var self = this,
            color;
        // hide input
        this.$el.hide();
        // max saturated color for hue to be obvious
        color = 'hsl(' + this.$el.val() + ', 100, 50)';
        this.$el.iris({
            mode: 'hsl',
            type: 'hue',
            hide: false,
            color: color,
            change: function(event, ui) {
                if ($.isFunction(self.options.change)) {
                    self.options.change.call(this, event, ui);
                }
            },
            width: self.options.width,
            slider: self.options.slider
        });
    }
    ColorPicker.prototype.init = function() {
        // bail early for unsupported Iris.
        if (!$.support.iris) {
            return;
        }
        var self = this;
        $.extend(self.options, this.$el.data());
        // hue-only gets created differently
        if (self.options.type === 'hue') {
            return self._createHueOnly();
        }
        // keep close bound so it can be attached to a body listener
        self.close = $.proxy(self.close, self);
        self.initialValue = this.$el.val();
        // Set up HTML structure, hide things
        this.$el.addClass('color-picker').hide().wrap(_wrap);
        self.wrap = this.$el.parent();
        self.toggler = $(_before).insertBefore(this.$el).css({
            backgroundColor: self.initialValue
        }).attr('title', self.options.text.pick).attr('data-current', self.options.text.current);
        self.pickerContainer = $(_after).insertAfter(this.$el);
        self.button = $(_button);
        if (self.options.defaultColor) {
            self.button.addClass('picker-default').val(self.options.text.defaultString);
        } else {
            self.button.addClass('picker-clear').val(self.options.text.clear);
        }
        this.$el.wrap('<span class="picker-input-wrap" />').after(self.button);
        this.$el.iris({
            target: self.pickerContainer,
            hide: self.options.hide,
            width: self.options.width,
            mode: self.options.mode,
            palettes: self.options.palettes,
            change: function(event, ui) {
                self.toggler.css({
                    backgroundColor: ui.color.toString()
                });
                // check for a custom cb
                if ($.isFunction(self.options.change)) {
                    self.options.change.call(this, event, ui);
                }
            }
        });
        this.$el.val(self.initialValue);
        self._addListeners();
        if (!self.options.hide) {
            self.toggler.click();
        }
        if ($.isFunction(self.options.create)) {
            self.options.create.call(this);
        }
    }
    ColorPicker.prototype._addListeners = function() {
        var self = this;
        // prevent any clicks inside this widget from leaking to the top and closing it
        self.wrap.on('click.colorpicker', function(event) {
            event.stopPropagation();
        });
        self.toggler.click(function() {
            if (self.toggler.hasClass('picker-open')) {
                self.close();
            } else {
                self.open();
            }
        });
        this.$el.change(function(event) {
            var me = $(this),
                val = me.val();
            // Empty = clear
            if (val === '' || val === '#') {
                self.toggler.css('backgroundColor', '');
                // fire clear callback if we have one
                if ($.isFunction(self.options.clear)) {
                    self.options.clear.call(this, event);
                }
            }
        });
        // open a keyboard-focused closed picker with space or enter
        self.toggler.on('keyup', function(event) {
            if (event.keyCode === 13 || event.keyCode === 32) {
                event.preventDefault();
                self.toggler.trigger('click').next().focus();
            }
        });
        self.button.click(function(event) {
            var me = $(this);
            if (me.hasClass('picker-clear')) {
                self.$el.val('');
                self.toggler.css('backgroundColor', '');
                if ($.isFunction(self.options.clear)) {
                    self.options.clear.call(this, event);
                }
            } else if (me.hasClass('picker-default')) {
                self.$el.val(self.options.defaultColor).change();
            }
        });
    }
    ColorPicker.prototype.open = function() {
        this.$el.css('display', 'inline-block').iris('toggle').focus();
        this.button.removeClass('hidden');
        this.wrap.addClass('picker-active');
        this.toggler.addClass('picker-open');
        $('body').trigger('click.colorpicker').on('click.colorpicker', this.close);
    }
    ColorPicker.prototype.close = function() {
        console.log(this.$el)
        this.$el.css('display', 'none').iris('toggle');
        this.button.addClass('hidden');
        this.wrap.removeClass('picker-active');
        this.toggler.removeClass('picker-open');
        $('body').off('click.colorpicker', this.close);
    }
    ColorPicker.prototype.color = function(newColor) {
        if (typeof(newColor) == 'undefined') {
            return this.$el.iris('option', 'color');
        }
        this.$el.iris('option', 'color', newColor);
    }
    ColorPicker.prototype.defaultColor = function(newDefaultColor) {
        if (typeof(newDefaultColor) == 'undefined') {
            return this.options.defaultColor;
        }
        this.options.defaultColor = newDefaultColor;
    }
    ColorPicker.prototype.dispose = function() {
        BaseProto.dispose.call(this)
    }
    ColorPicker.DEFAULTS = {
        defaultColor: false,
        change: false,
        clear: false,
        create: false,
        hide: true,
        palettes: true,
        width: 255,
        mode: 'hsv',
        type: 'full',
        slider: 'horizontal',
        text: {
            clear: 'Clear',
            current: 'Current Color',
            defaultString: 'Default',
            pick: 'Select Color'
        }
    }
    // FORM WIDGET PLUGIN DEFINITION
    // ============================
    var old = $.fn.colorPicker
    $.fn.colorPicker = function(option) {
        var args = Array.prototype.slice.call(arguments, 1), 
            result
        this.each(function() {
            var $this = $(this)
            var data = $this.data('oc.formwidget')
            var options = $.extend({}, ColorPicker.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.formwidget', (data = new ColorPicker(this, options)))
            if (typeof option == 'string' && typeof data[option] != 'undefined') result = data[option].apply(data, args)
            if (typeof result != 'undefined') return false
        })
        return result ? result : this
    }
    $.fn.colorPicker.Constructor = ColorPicker
    // FORM WIDGET NO CONFLICT
    // =================
    $.fn.colorPicker.noConflict = function() {
        $.fn.colorPicker = old
        return this
    }

    // $(document).render(function() {
    //     $('[data-control="colorpicker"]').colorPicker()
    // })
}(window.jQuery);