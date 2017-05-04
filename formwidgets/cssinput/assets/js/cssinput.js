+function ($) { "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype

    var CssInput = function (element, options) {
        this.$el = $(element)
        this.options = options || {}

        $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }

    CssInput.prototype = Object.create(BaseProto)
    CssInput.prototype.constructor = CssInput

    CssInput.prototype.init = function() {
        this.bindEvent()

        this.onInit()
    }

    CssInput.prototype.bindEvent = function() {
        this.$el.on('blur', '.element > input', this.proxy(this.onBlurText))
    }

    CssInput.prototype.onInit = function(){
        this.$el.find('.element > input').each(function(i, ele){
            var val = $(ele).val()
            if(val == '0'){
                $(ele).val('')
            }
        })
    }

    CssInput.prototype.onBlurText = function(e){
        var val = $(e.currentTarget).val()
        var matches = val.match(/^(\d+(?:\.\d+)?)(.*)$/);

        if(matches){
            var value = matches[1]
            var unit = matches[2]
            if($.inArray(unit, this.options.allowedUnit) < 0){
                $(e.currentTarget).val(value+'px')
            }
        }else{
            $(e.currentTarget).val('')
        }

        this.refreshValue()
    }

    CssInput.prototype.refreshValue = function() {
        var inp = []
        this.$el.find('.element > input').each(function(i, ele){
            var val = $(ele).val()
            inp.push(val?val:0)
        })

        this.$el.find('[data-value]').val(inp.join(' '))
        this.$el.find('[data-value]').trigger('change')
    }    

    CssInput.prototype.dispose = function() {
        

        this.$findValue = null
        this.$el = null

        // In some cases options could contain callbacks, 
        // so it's better to clean them up too.
        this.options = null

        BaseProto.dispose.call(this)
    }

    CssInput.DEFAULTS = {
        allowedUnit: ['px']
    }

    // PLUGIN DEFINITION
    // ============================

    var old = $.fn.cssInput

    $.fn.cssInput = function (option) {
        var args = arguments;

        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('oc.cssInput')
            var options = $.extend({}, CssInput.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.cssInput', (data = new CssInput(this, options)))
            if (typeof option == 'string') data[option].apply(data, args)
        })
      }

    $.fn.cssInput.Constructor = CssInput

    $.fn.cssInput.noConflict = function () {
        $.fn.cssInput = old
        return this
    }

    $(document).render(function (){
        $('[data-control="cssinput"]').cssInput()
    })

}(window.jQuery);
