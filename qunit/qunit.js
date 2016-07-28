function addMadLib( id, template, fields ) {
  $("<div id='"+id+"'></div><div id='"+id+"_output'></div>").appendTo('body');
  $('#'+id).madlib({template: template, fields: fields, change: function( event, data ) {
      $('#'+id+'_output').text( $('#'+id).madlib('getMadLib') );
    }
  });
}

function assertMadlib( assert, id, sentence ) {
  assert.ok( $('#'+id+'_output').text() == sentence );
}

function clearMadLib( id ) {
  $('#'+id+', #'+id+'_output').remove();
}

QUnit.test('many options', function( assert ) {
  expect(1);
  addMadLib('complex_ml', 'This is a/an #{my_text_field} Mad-Libs-style paragraph. It is #{a_radio_select}. Multi-Selects are #{multi_select_field}.', {
    my_text_field: {
      type: 'text_field',
      prompt: 'adjective',
      preset: 'simple'
    },
    a_radio_select: {
      type: 'radio_select',
      values: ['simple', 'easy', 'plain'],
      prompt: 'adjective',
      include_other: true,
      preset: 'madlib_other',
      preset_other: 'customizable'
    },
    multi_select_field: {
      type: 'multi_select',
      values: ['interesting', 'really cool', 'great', 'fun'],
      prompt: 'adjective(s)',
      include_other: true,
      preset: ['great', 'fun', 'madlib_other'],
      preset_other: 'blah blah'
    }
  });

  assertMadlib(assert, 'complex_ml', 'This is a/an simple Mad-Libs-style paragraph. It is customizable. Multi-Selects are great, fun, and blah blah.', 'complex sentence');

  clearMadLib('complex_ml');
});

QUnit.test('single text field', function( assert ) {
  expect(2);
  addMadLib('single_text', '---#{asdfasdf}---', {asdfasdf: {type: 'text_field'}});

  $("#single_text input[name='asdfasdf']").val('Setting some text');
  $("#single_text input[name='asdfasdf']").trigger('change');
  assertMadlib(assert, 'single_text', '---Setting some text---', 'single text field');

  $("#single_text input[name='asdfasdf']").val('Changing the text');
  $("#single_text input[name='asdfasdf']").trigger('change');
  assertMadlib(assert, 'single_text', '---Changing the text---', 'changed text field');

  clearMadLib('single_text');
});

QUnit.test('single radio_select field', function( assert ) {
  expect(2);
  addMadLib('single_radio', '---#{asdfasdf}---', {asdfasdf: {type: 'radio_select', values: ['one', 'two', 'three', 'four']}});

  var $dropdown = $("#single_radio select[name='asdfasdf']");
  $dropdown.multiselect('select', 'three', true);
  assertMadlib(assert, 'single_radio', '---three---', 'three selected');

  $dropdown.multiselect('select', 'one', true);
  assertMadlib(assert, 'single_radio', '---one---', 'one selected');

  clearMadLib('single_radio');
});

QUnit.test('single multi_select field', function( assert ) {
  expect(3);
  addMadLib('single_multi', '---#{asdfasdf}---', {asdfasdf: {type: 'multi_select', values: ['one', 'two', 'three', 'four']}});

  var $dropdown = $("#single_multi select[name='asdfasdf']");
  $dropdown.multiselect('select', 'three', true);
  assertMadlib(assert, 'single_multi', '---three---', 'three selected');

  $dropdown.multiselect('select', ['one', 'three'], true);
  assertMadlib(assert, 'single_multi', '---one and three---', 'one and three selected');

  $dropdown.multiselect('select', ['one', 'two', 'three', 'four'], true);
  assertMadlib(assert, 'single_multi', '---one, two, three, and four---', 'all options selected');

  clearMadLib('single_multi');
});

QUnit.test('using other with radio_select field', function( assert ) {
  expect(2);
  addMadLib('radio_other', '---#{asdfasdf}---', {
    asdfasdf: {
      type: 'radio_select',
      values: ['one', 'two', 'three', 'four'],
      include_other: true
    }
  });

  var $dropdown = $("#radio_other select[name='asdfasdf']");
  $dropdown.multiselect('select', 'madlib_other', true);
  var $other = $("#radio_other input[name='madlib_other_asdfasdf']");
  $other.val('Putting some text in the other text field');
  $other.trigger('change');
  assertMadlib(assert, 'radio_other', '---Putting some text in the other text field---', 'other text entered');

  $dropdown.multiselect('select', 'two', true);
  assertMadlib(assert, 'radio_other', '---two---', 'regular option selected');

  clearMadLib('radio_other');
});

QUnit.test('using other with multi_select field', function( assert ) {
  expect(4);
  addMadLib('multi_other', '---#{asdfasdf}---', {
    asdfasdf: {
      type: 'multi_select',
      values: ['one', 'two', 'three', 'four'],
      include_other: true
    }
  });

  var $dropdown = $("#multi_other select[name='asdfasdf']");
  $dropdown.multiselect('select', 'madlib_other', true);
  var $other = $("#multi_other input[name='madlib_other_asdfasdf']");
  $other.val('five');
  $other.trigger('change');
  assertMadlib(assert, 'multi_other', '---five---', 'other text entered');

  $dropdown.multiselect('select', 'two', true);
  assertMadlib(assert, 'multi_other', '---two and five---', 'regular option selected');

  $dropdown.multiselect('select', 'four', true);
  assertMadlib(assert, 'multi_other', '---two, four, and five---', 'another regular option selected');

  $dropdown.multiselect('deselect', 'madlib_other', true);
  assertMadlib(assert, 'multi_other', '---two and four---', 'other option deselected');
  // console.log($('#multi_other_output').text());

  clearMadLib('multi_other');
});
