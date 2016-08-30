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

      var subfields = [];
      $.each(field_opts.values, function(idx, val) {
        var data_subfield_str = '';
        var opt_val = val;

        if (val.indexOf('#{') >= 0) {
          var subfield = val.substring(val.indexOf('#{')+2, val.indexOf('}'));
          data_subfield_str = "data-subfield='"+subfield+"'";
          subfields.unshift(subfield);
          opt_val = val.replace('#{'+subfield+'}', '...');
        }

        $('<option '+data_subfield_str+" value='"+val+"'>"+opt_val+'</option>').appendTo($field);
      });

      $.each(subfields, function(idx, subfield) {
        var $subfield = $("<input name='madlib_subfield_"+subfield+"' type='text' class='madlib-subfield form-control' placeholder='"+subfield+"'>");
        $subfield.change(function() {that._trigger('change', null, {});});
        var $subfield_wrapper = $("<span class='subfield-field-wrapper'></span>");
        $wrapper.after($subfield_wrapper);
        $subfield.appendTo($subfield_wrapper);
      });

      var include_other = field_opts.hasOwnProperty('include_other') && field_opts.include_other;
      if (include_other) $("<option value='madlib_other'>Other</option>").appendTo($field);
      $field.appendTo($wrapper);
      if (include_other) {
        var $other = $("<input name='madlib_other_"+field+"' type='text' class='madlib-other form-control' placeholder='Other'>");
        $other.change(function() {that._trigger('change', null, {});});
        var $other_wrapper = $("<span class='other-field-wrapper'></span>");
        $wrapper.after($other_wrapper);
        $other.appendTo($other_wrapper);
      }

      var multi_opts = {
        onChange: function(option, checked, select) {
          $.each(subfields, function(idx, subfield) {
            var show_subfield = that.element.find("select[name='"+field+"'] > option[data-subfield='"+subfield+"']").is(':selected');
            var $subfield = that.element.find("input[name='madlib_subfield_"+subfield+"']");
            $subfield.toggle(show_subfield);
          });

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

      if (field_opts.hasOwnProperty('preset_subfields')) {
        $.each(field_opts.preset_subfields, function(subfield, val) {
          that.element.find("input[name='madlib_subfield_"+subfield+"']").val(val);
        });
      }
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

    getFieldValues: function() {
      var that = this;
      var ret_h = {};
      $.each(that.options.fields, function(field, field_opts) {
        switch( field_opts.type ) {
          case 'radio_select':
          case 'multi_select':
            ret_h[field] = that.element.find("select[name='"+field+"'] > option:selected").map(function(){
              var subfield = $(this).data('subfield');
              if (subfield != null) {
                if (!ret_h.hasOwnProperty(field+'_madlib_subfields')) ret_h[field+'_madlib_subfields'] = {};
                ret_h[field+'_madlib_subfields'][subfield] = that.element.find("input[name='madlib_subfield_"+subfield+"']").val();
              }

              return this.value;
            }).get();
            if (field_opts.hasOwnProperty('include_other') && field_opts.include_other && ret_h[field].indexOf('madlib_other') >= 0) {
              ret_h[field+'_madlib_other'] = that.element.find("input[name='madlib_other_"+field+"']").val();
              ret_h[field].splice(-1,1); // removes the last element of the array (which is 'madlib_other')
            }
            if (field_opts.type == 'radio_select') {
              ret_h[field] = ret_h[field].length > 0 ? ret_h[field][0] : ''
            }
            break;
          case 'text_field':
            ret_h[field] = that.element.find("input[name='"+field+"']").val();
            break;
          default:
            throw 'Unrecognized madlib field type: ' + field_opts.type;
        }
      });
      return ret_h;
    },

    getMadLib: function() {
      var that = this;
      var sentence = that.options.template;
      var field_vals = that.getFieldValues();
      $.each(that.options.fields, function(field, field_opts) {
        if (field_vals.hasOwnProperty(field) && typeof(field_vals[field]) !== 'undefined' ) {
          var field_val = field_vals[field];
          if ($.type(field_val) !== 'array') {
            field_val = $.trim(field_val) == '' ? [] : [$.trim(field_val)];
          }
          if (field_vals.hasOwnProperty(field+'_madlib_other') && $.trim(field_vals[field+'_madlib_other']) != '')
            field_val.push($.trim(field_vals[field+'_madlib_other']));
          if (field_val.length > 0 ) {
            var vals_with_subfields_replaced = $.map(field_val, function(val){
              var ret_str = val;
              if (val.indexOf('#{') >= 0) {
                var subfield = val.substring(val.indexOf('#{')+2, val.indexOf('}'));
                var subfield_val = that.element.find("input[name='madlib_subfield_"+subfield+"']").val();
                ret_str = ret_str.replace('#{'+subfield+'}', subfield_val);
              }
              return ret_str;
            });
            sentence = sentence.replace('#{'+field+'}', that._phrasify(vals_with_subfields_replaced));
          }
        }
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
