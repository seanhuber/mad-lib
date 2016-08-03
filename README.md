mad-lib
==============

A live demo can be found at: http://seanhuber.com/demos/mad-lib/demo.html

![Screenshot](https://cdn.rawgit.com/seanhuber/mad-lib/master/screenshot.png)

mad-lib is a jQuery widget that displays a MadLib-style form containing text, text fields, select dropdowns, and multi-select dropdowns.

Requirements and Dependencies
----------------------------------

Bootstrap version >= 3.1.0 (it has not yet been tested on Bootstrap 4).

jQuery version 1.9.0 or newer.
jQuery-ui version 1.11.4 or newer.

Bootstrap Multiselect (tested on version 0.9.13): http://davidstutz.github.io/bootstrap-multiselect/

Installation
----------------------------------

With Bower:

```
bower install mad-lib
```

Or grab the scripts and styles and manually insert them in `<head>`:

```html
<script src='mad-lib.js' type='text/javascript' charset='utf-8'></script>
<link rel='stylesheet' href='mad-lib' type='text/css' media='screen' />
```

Or if you are using Ruby on Rails, this widget has been packaged into a ruby gem (thanks to the folks at https://rails-assets.org).  Add to your `Gemfile`:

```ruby
gem 'rails-assets-mad-lib', source: 'https://rails-assets.org'
```

Run `bundle install` and then update your asset pipeline.

Add to `app/assets/javascripts/application.js`:

```javascript
//= require mad-lib
```

Add to `app/assets/stylesheets/application.css`:

```css
/*
 *= require mad-lib
 */
```

Usage
----------------------------------

```html
<div id='example'></div>

<script>
  $('#example').madlib({
    /*
     * template (required, string)
     * - A string to serve as a template of the madlib. Form fields will be injected where "#{field_id}" field tags are found.
     */
    template: "Text field: #{my_text_field}. Single select dropdown: #{a_radio_select}. Multiselect dropdown: #{multi_select_field}",

    /*
     * fields (required, object)
     * - An object whose keys are the field identifiers used in the template.
     * - Values are an object with with field options.
     */
    fields: {
      /*
       * Valid options for a 'text_field' field include:
       * - type (required, string), set to 'text_field'
       * - prompt (optional, string), placeholder text for the input field
       * - preset (optional, string), prepopulates the value of the input field
       */
      my_text_field: {
        type: 'text_field',
        prompt: 'Type something here',
        preset: 'Example'
      },
      /*
       * Valid options for a 'radio_select' (a single select dropdown) field include:
       * - type (required, string), set to 'radio_select'
       * - values (required, array of strings), each element of the array represents a value option for the select dropdown
       * - prompt (optional, string), sets the none-selected prompt (defaults to "None selected")
       * - include_other (optional, boolean), set to true to add an "Other" option that when selected, will add a text field for custom entry
       * - preset (optional, string), preselects a value from the dropdown. To preselect "Other", set it to "madlib_other"
       * - preset_other (optional, string), prepopulates the "Other" text field that is displayed when a user selects "Other" from the dropdown
       */
      a_radio_select: {
        type: 'radio_select',
        values: ['one', 'two', 'three'],
        prompt: 'Pick a number',
        include_other: true,
        preset: 'madlib_other',
        preset_other: 'Prepopulated text'
      },
      /*
       * Valid options for a 'multi_select' field include:
       * - type (required, string), set to 'multi_select'
       * - values (required, array of strings), each element of the array represents a value option for the select dropdown
       * - prompt (optional, string), sets the none-selected prompt (defaults to "None selected")
       * - include_other (optional, boolean), set to true to add an "Other" option that when selected, will add a text field for custom entry
       * - preset (optional, string or array of strings), preselects one or more values from the dropdown. To preselect "Other", set it to "madlib_other"
       * - preset_other (optional, string), prepopulates the "Other" text field that is displayed when a user selects "Other" from the dropdown
       */
      multi_select_field: {
        type: 'multi_select',
        values: ['one', 'two', 'three', 'four', 'five'],
        prompt: 'Pick number(s)',
        include_other: true,
        preset: ['two', 'four', 'madlib_other'],
        preset_other: 'forty'
      }
    },
    /*
     * The change callback is a function that will get called everytime the user changes a dropdown option or the value of a text field.
     */
    change: function( event, data ) {
      console.log('The mad-lib has been updated!');
    }
  });
</script>
```

The `change` callback is also triggered as an event (madlibchange) and can be listend to:

```javascript
$('#example').on('madlibchange', function() {
  console.log('The mad-lib has been updated!');
});
```

Methods
----------------------------------

##### getMadLib

Returns the generated MadLib as a string.

```javascript
$('#example').madlib('getMadLib');

=> "Text field: Example. Single select dropdown: Prepopulated text. Multiselect dropdown: two, four, and forty"
```

##### getFieldValues

Returns a javscript object whose keys are field identifiers (or field_id+'_madlib_other') and whose values are either a string or an array (depending on field type).

```javascript
$('#example').madlib('getFieldValues');

=> {
  my_text_field: 'Example',
  a_radio_select: '',
  a_radio_select_madlib_other: 'Prepopulated text',
  multi_select_field: ['two', 'four'],
  multi_select_field_madlib_other: 'forty'
}
```

License
----------------------------------

MIT-LICENSE.
