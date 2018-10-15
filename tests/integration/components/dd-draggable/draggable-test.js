import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import startApp from '../../../helpers/start-app';

let App;
moduleForComponent('hc-dragdrop/draggable', 'Integration | Component | hc dragdrop/draggable', {
    integration: true,
    beforeEach() {
        App = startApp();
    },
    afterEach() {
        Ember.run(App, 'destroy');
    }
});

test('it renders', function(assert) {
    this.render(hbs`{{hc-dragdrop/draggable}}`);

    assert.equal(this.$().text().trim(), '', 'renders the content');
    assert.equal(this.$('.hc-draggable').length, 1, 'renders a draggable element');
    assert.equal(this.$('.hc-draggable').attr('draggable'), 'true', 'draggable object is draggable');

    // Template block usage:
    this.render(hbs`
        {{#hc-dragdrop/draggable}}
            template block text
        {{/hc-dragdrop/draggable}}
    `);

    assert.equal(this.$().text().trim(), 'template block text', 'block renders the block content');
    assert.equal(this.$('.hc-draggable').length, 1, 'block renders a draggable element');
    assert.equal(this.$('.hc-draggable').attr('draggable'), 'true', 'draggable object in block is draggable');

    a11yAudit();
    andThen(() => assert.ok(true, 'no accessibility errors found'));
});

test('clicking', function(assert) {
    this.render(hbs`
        {{#hc-dragdrop/draggable}}
            template block text
        {{/hc-dragdrop/draggable}}
    `);

    const $this = this.$('.hc-draggable');

    $this.trigger('mousedown');
    andThen(() => {
        assert.equal($this.attr('aria-grabbed'), 'true', 'it sets the aria-grabbed property on mousedown');
    });

    $this.trigger('mousedown');
    andThen(() => {
        assert.equal($this.attr('aria-grabbed'), 'false', 'aria-grabbed property cancelled on second mousedown');
    });
});

test('spacebar', function(assert) {
    this.render(hbs`
        {{#hc-dragdrop/draggable}}
            Template block text
        {{/hc-dragdrop/draggable}}
    `);

    const $this = this.$('.hc-draggable');
    const e = jQuery.Event('keydown');

    e.originalEvent = jQuery.Event();
    e.originalEvent.keyCode = 32;

    $this.trigger(e);
    andThen(() => {
        assert.equal($this.attr('aria-grabbed'), 'true', 'aria-grabbed property set as true when spacebar pressed');
    });

    $this.trigger(e);
    andThen(() => {
        assert.equal($this.attr('aria-grabbed'), 'false', 'aria-grabbed property cancelled when spacebar pressed again');
    });
});
