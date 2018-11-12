import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
// import a11yAudit from 'ember-a11y-testing/test-support/audit';
import startApp from '../../../helpers/start-app';

let App;
moduleForComponent('hc-dragdrop/sortable', 'Integration | Component | hc dragdrop/sortable', {
    integration: true,
    beforeEach() {
        App = startApp();
    },
    afterEach() {
        Ember.run(App, 'destroy');
    }
});

test('it renders', function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(hbs`{{hc-dragdrop/sortable}}`);

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(hbs`
        {{#hc-dragdrop/sortable}}
            template block text
        {{/hc-dragdrop/sortable}}
    `);

    assert.equal(this.$().text().trim(), 'template block text', 'it renders the block content');
    assert.equal(this.$('.hc-sortable').length, 1, 'it renders an element with .hc-sortable class')
});

// test('navigating', function(assert) {
//     this.render(hbs`
//         {{#hc-dragdrop/sortable}}
//             {{#hc-dragdrop/draggable draggableFocussed="draggableFocussed" class="draggable-1"}}One{{/hc-dragdrop/draggable}}
//             {{#hc-dragdrop/draggable draggableFocussed="draggableFocussed" class="draggable-2"}}Two{{/hc-dragdrop/draggable}}
//             {{#hc-dragdrop/draggable draggableFocussed="draggableFocussed" class="draggable-3"}}Three{{/hc-dragdrop/draggable}}
//         {{/hc-dragdrop/sortable}}
//     `);

//     assert.notOk(this.$('.hc-sortable').hasClass('hc-droptarget'), 'the sortable object is not the droptarget to begin with');

//     this.$('.draggable-1').focusin();
//     andThen(() => {
//         assert.equal(this.$('.draggable-1:focus').length, 1, 'the draggable item is focussed');
//         assert.ok(this.$('.hc-sortable').hasClass('hc-droptarget'), 'the sortable object becomes the dropTarget when a child is focussed');

//         const $this = this.$('.hc-sortable');
//         const e = jQuery.Event('keydown');

//         e.originalEvent = jQuery.Event();
//         e.originalEvent.keyCode = 40; // down arrow

//         $this.trigger(e);
//         andThen(() => {
//             assert.equal(this.$('draggable-1:focus').length, 0, 'the first draggable item is no longer in focus');
//             assert.equal(this.$('draggable-2:focus').length, 1, 'the second draggable item is now in focus');
//         });
//     });
// });
