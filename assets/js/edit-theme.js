/*
 * Form Widget
 *
 * Dependences:
 * - Nil
 */
+function ($) { "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype

    var EditingTheme = function (element, options) {
        this.$el = $(element)
        this.options = options || {}
        this.$form = null

        // $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }

    EditingTheme.prototype = Object.create(BaseProto)
    EditingTheme.prototype.constructor = EditingTheme

    EditingTheme.prototype.init = function() {
        this.$form = this.$el.closest('form')

        $('#sortable').sortable();
    }

    EditingTheme.prototype.dispose = function() {
        BaseProto.dispose.call(this)
    }

    EditingTheme.DEFAULTS = {
    }

    // FORM WIDGET PLUGIN DEFINITION
    // ============================

    var old = $.fn.editingTheme

    $.fn.editingTheme = function (option) {
        var args = arguments,
            result

        this.each(function () {
            var $this   = $(this)
            var data    = $this.data('oc.editingTheme')
            var options = $.extend({}, EditingTheme.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.editingTheme', (data = new EditingTheme(this, options)))
            if (typeof option == 'string') result = data[option].call($this)
            if (typeof result != 'undefined') return false
        })

        return result ? result : this
      }

    $.fn.editingTheme.Constructor = EditingTheme

    // FORM WIDGET NO CONFLICT
    // =================

    $.fn.editingTheme.noConflict = function () {
        $.fn.editingTheme = old
        return this
    }

    // FORM WIDGET DATA-API
    // ==============

    function paramToObj(name, value) {
        if (value === undefined) value = ''
        if (typeof value == 'object') return value

        try {
            return JSON.parse(JSON.stringify(eval("({" + value + "})")))
        }
        catch (e) {
            throw new Error('Error parsing the '+name+' attribute value. '+e)
        }
    }

    $(document).render(function() {
        $('[data-control="editing-theme"]').editingTheme();
    })

}(window.jQuery);
