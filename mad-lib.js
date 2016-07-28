/*
  jQuery widget for a Mad Libs style sentence (https://github.com/seanhuber/mad-lib)
*/
(function($) {
  $.widget( 'sh.madlib' , {
    options: {
      template: '',
      fields: {}
    },

    _addField: function( field, field_opts ) {
      var $wrapper = this.element.find(".madlib > span.field-wrapper[data-field='"+field+"']");
      switch( field_opts.type ) {
        case 'radio_select':
        case 'multi_select':
          this._addSelectField(field, field_opts, $wrapper, field_opts.type == 'multi_select');
          break;
        case 'text_field':
          this._addTextField(field, field_opts, $wrapper);
          break;
        default:
          throw 'Unrecognized madlib field type: ' + field_opts.type;
      }
    },

    _addSelectField: function( field, field_opts, $wrapper, is_multiple ) {
      var that = this;
      var $field = $("<select name='"+field+"' size='2'></select>");
      if (is_multiple) $field.prop('multiple', 'multiple');
      $.each(field_opts.values, function(idx, val) {
        $("<option value='"+val+"'>"+val+'</option>').appendTo($field);
      });
      var include_other = field_opts.hasOwnProperty('include_other') && field_opts.include_other;
      if (include_other) $("<option value='madlib_other'>Other</option>").appendTo($field);
      $field.appendTo($wrapper);
      if (include_other) {
        var $other = $("<input name='madlib_other_"+field+"' type='text' class='madlib-other form-control' placeholder='Other'>");
        $other.change(function() {that._trigger('change', null, {});});
        $other.appendTo($wrapper);
      }

      var multi_opts = {
        onChange: function(option, checked, select) {
          if (include_other) {
            var show_other = that.element.find("select[name='"+field+"'] > option[value='madlib_other']:selected").length > 0;
            var $other = that.element.find("input[name='madlib_other_"+field+"']");
            $other.toggle(show_other);
            if (show_other) $other.focus();
          }
          that._trigger('change', null, {});
        }
      };
      if (field_opts.hasOwnProperty('prompt')) multi_opts.nonSelectedText = field_opts.prompt;
      $field.multiselect(multi_opts);

      if (field_opts.hasOwnProperty('preset_other')) that.element.find("input[name='madlib_other_"+field+"']").val(field_opts.preset_other);
      if (field_opts.hasOwnProperty('preset')) $field.multiselect('select', field_opts.preset, true);
    },

    _addTextField: function( field, field_opts, $wrapper ) {
      var that = this;
      var $field = $("<input name='"+field+"' type='text' class='form-control'>");
      if (field_opts.hasOwnProperty('prompt')) $field.prop('placeholder', field_opts.prompt);
      if (field_opts.hasOwnProperty('preset')) $field.val(field_opts.preset);
      $field.change(function() {that._trigger('change', null, {});});
      $field.appendTo($wrapper);
    },

    _assemble: function() {
      var that = this;
      var sentence = that.options.template;
      $.each(that.options.fields, function(field, field_opts) {
        var f_pattern = '#{'+field+'}';
        if ( sentence.indexOf(f_pattern) >= 0 ) {
          sentence = sentence.replace(f_pattern, "<span class='field-wrapper' data-field='"+field+"'></span>");
        } else {
          throw 'madlib field missing from template: ' + f_pattern;
        }
      });
      return $("<div class='madlib'>"+sentence+'</div>');
    },

    _create: function() {
      var that = this;
      that._assemble().appendTo(that.element);
      $.each(that.options.fields, function(k,v){that._addField(k,v)});
    },

    _fieldVal: function( field ) {
      var field_opts = this.options.fields[field];
      var ret_v = null;
      switch( field_opts.type ) {
        case 'radio_select':
        case 'multi_select':
          var values = this.element.find("select[name='"+field+"'] > option:selected").map(function(){return this.value;}).get();
          var other_idx = values.indexOf('madlib_other');
          if (field_opts.hasOwnProperty('include_other') && field_opts.include_other && other_idx >= 0)
            values[other_idx] = this.element.find("input[name='madlib_other_"+field+"']").val();
          ret_v = values.length > 0 ? this._phrasify(values) : '';
          break;
        case 'text_field':
          ret_v = this.element.find("input[name='"+field+"']").val();
          break;
        default:
          throw 'Unrecognized madlib field type: ' + field_opts.type;
      }
      return ret_v;
    },

    getMadLib: function() {
      var that = this;
      var sentence = that.options.template;
      $.each(that.options.fields, function(field, field_opts) {
        sentence = sentence.replace('#{'+field+'}', that._fieldVal(field));
      });
      return sentence;
    },

    _phrasify: function( arr ) {
      if ( arr.length == 0 ) throw '_phrasify called but arr is empty'
      var phrase = ''
      if ( arr.length == 1 ) {
        phrase = arr[0];
      } else if ( arr.length == 2 ) {
        phrase = arr[0] + ' and ' + arr[1];
      } else {
        for (var i=0; i<arr.length-1; i++) phrase += arr[i] + ', ';
        phrase += 'and ' + arr[arr.length-1];
      }
      return phrase;
    },
  });
})(jQuery);
