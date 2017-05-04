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
