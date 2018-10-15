import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import startApp from '../../../helpers/start-app';

let App;
moduleForComponent('hc-dragdrop/droppable', 'Integration | Component | hc dragdrop/droppable', {
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

    this.render(hbs`{{hc-dragdrop/droppable}}`);

    assert.equal(this.$().text().trim(), 'This content will be replaced');

    // Template block usage:
    this.render(hbs`
        {{#hc-dragdrop/droppable}}
          template block text
        {{/hc-dragdrop/droppable}}
    `);

    const $droppable = this.$('.hc-droppable');
    assert.equal($droppable.length, 1, 'it renders an element with an .hc-droppable class');
    assert.equal($droppable.attr('aria-live'), 'polite', 'it renders the correct aria-live attribute');
    assert.equal($droppable.attr('aria-dropeffect'), 'move', 'it renders the correct aria-dropeffect');
    assert.equal($droppable.hasClass('hc-droptarget'), false, 'it does not have the hc-droptarget class on initial render');

    a11yAudit();
    andThen(() => assert.ok(true, 'no accessibility errors found'));

    $droppable.trigger('dragenter');
    andThen(() => {
        assert.equal($droppable.hasClass('hc-droptarget'), true, 'it has the hc-droptarget class on dragenter');
        $droppable.trigger('dragover');
    });

    andThen(() => {
        assert.equal($droppable.hasClass('hc-droptarget'), true, 'it has the hc-droptarget class on dragover');
        $droppable.trigger('dragleave');
    });

    andThen(() => {
        assert.equal($droppable.hasClass('hc-droptarget'), false, 'it loses the hc-droptarget class on dragleave');
        $droppable.trigger('dragenter');
    });

    andThen(() => {
        assert.equal($droppable.hasClass('hc-droptarget'), true, 'it has the hc-droptarget class on dragenter again');
        $droppable.trigger('drop');
    });

    andThen(() => {
        assert.equal($droppable.hasClass('hc-droptarget'), false, 'it loses the hc-droptarget class on drop');
    });
});

test('it includes the title', function(assert) {
    this.render(hbs`
        {{hc-dragdrop/droppable title="This is the title"}}
    `);

    assert.equal(this.$('h3').text().trim(), 'This is the title', 'it renders the title');
});

// test('receiving focus', function(assert) {
//     this.render(hbs`
//         {{#hc-dragdrop/droppable}}
//             {{hc-dragdrop/draggable
//                 content="draggable content"
//                 draggableFocussed="draggableFocussed"}}
//         {{/hc-dragdrop/droppable}}
//     `);

//     this.$('.hc-draggable').trigger('focusin');
//     this.on('draggableFocussed', () => {
//         assert.ok($('.hc-draggable').parent().hasClass('hc-droptarget'), 'focusin on child draggable makes parent droppable droptarget');
//     });
// });
