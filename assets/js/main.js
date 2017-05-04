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