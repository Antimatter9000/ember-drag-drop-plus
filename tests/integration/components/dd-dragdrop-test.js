import Ember from 'ember';
import jQuery from 'jquery'; 
import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
// import a11yAudit from 'ember-a11y-testing/test-support/audit';
import startApp from '../../helpers/start-app';

let App;
moduleForComponent('dd-dragdrop', 'Integration | Component | ddDragdrop', {
    integration: true,
    beforeEach() {
        App = startApp();
    },
    afterEach() {
        Ember.run(App, 'destroy');
    }
});

test('it renders', function(assert) {
    this.render(hbs`{{dd-dragdrop}}`);

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(hbs`
      {{#dd-dragdrop}}
        template block text
      {{/dd-dragdrop}}
    `);

    assert.equal(this.$().text().trim(), 'template block text');
    assert.equal(this.$('.dd-draggable:first-of-type').hasClass('hidden'), false, 'it does not add the hidden class to the active draggable object');
});

test('multiselect - selecting', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const ctrlClick = jQuery.Event('mousedown', { ctrlKey: true });
    const shiftClick = jQuery.Event('mousedown', { shiftKey: true });

    // basic rendering
    assert.equal(this.$('.dd-sortable').length, 1, 'it renders a sortable item');
    assert.equal(this.$('.dd-draggable').length, 4, 'it renders 4 draggable items');
    assert.equal(this.$('.dd-draggable:first-of-type').text().trim(), 'item 1', 'it renders the content of the first draggable correctly');
    assert.equal(this.$('.dd-draggable:last-of-type').text().trim(), 'item 4', 'it renders the content of the last draggable correctly');

    // initial click
    this.$('.dd-draggable:last-of-type').trigger('mousedown');
    assert.notOk(this.$('.dd-draggable:first-of-type').hasClass('dd-dragging'), 'first item is not selected after clicking last item');
    assert.ok(this.$('.dd-draggable:last-of-type').hasClass('dd-dragging'), 'last item is selected after clicking last item');

    // clicking another item without multiselect
    this.$('.dd-draggable:first-of-type').trigger('mousedown');
    assert.ok(this.$('.dd-draggable:first-of-type').hasClass('dd-dragging'), 'first item is selected after clicking first item');
    assert.notOk(this.$('.dd-draggable:last-of-type').hasClass('dd-dragging'), 'last item is not selected after clicking first item');

    // control clicking another item to activate basic multiselect
    this.$('.dd-draggable:last-of-type').trigger(ctrlClick);
    assert.ok(this.$('.dd-draggable:first-of-type').hasClass('dd-dragging'), 'first item is still selected after ctrl clicking last item');
    assert.ok(this.$('.dd-draggable:last-of-type').hasClass('dd-dragging'), 'last item is also selected after ctrl clicking last item');
    assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), '2nd item not selected after ctrl clicking');

    // click to reset after multiselecting
    this.$('.dd-draggable:first-of-type').trigger('mousedown');
    assert.ok(this.$('.dd-draggable:first-of-type').hasClass('dd-dragging'), 'first item is selected after clicking first item');
    assert.notOk(this.$('.dd-draggable:last-of-type').hasClass('dd-dragging'), 'last item is deselected after clicking first item');

    // shift clicking to activate list multiselect
    this.$('.dd-draggable:last-of-type').trigger(shiftClick);
    assert.ok(this.$('.dd-draggable:first-of-type').hasClass('dd-dragging'), 'first item is still selected after shift clicking last item');
    assert.ok(this.$('.dd-draggable:last-of-type').hasClass('dd-dragging'), 'last item is also selected after shift clicking last item');
    assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), '2nd item is selected after shift clicking');

    // clicking to deselect all but one item, using up key to move that item up one position
    assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is the 3rd item');
    this.$('.dd-draggable:nth-of-type(3)').trigger('mousedown');
    const upKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowUp' },
        preventDefault: () => true
    });
    this.$('.dd-draggable:nth-of-type(3)').trigger(upKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 is now the 2nd item');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is still selected');
    });

    andThen(() => {
        // shift clicking to list multiselect after rearranging items
        this.$('.dd-draggable:last-of-type').trigger(shiftClick);
    });

    andThen(() => {
        assert.notOk(this.$('.dd-draggable:first-of-type').hasClass('dd-dragging'), 'the first item (item 1) is not selected');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'the second item (item 3) is selected');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'the third item (item 2) is selected');
        assert.ok(this.$('.dd-draggable:last-of-type').hasClass('dd-dragging'), 'the last item (item 4) is selected');
    });
});

test('multiselect - ctrlClick shifting up - ascending index order of clicks', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const ctrlClick = jQuery.Event('mousedown', { ctrlKey: true });
    const upKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowUp' },
        preventDefault: () => false
    });

    this.$('.dd-draggable:nth-of-type(3)').trigger('mousedown');
    this.$('.dd-draggable:nth-of-type(5)').trigger(ctrlClick);
    this.$('.dd-draggable:nth-of-type(5)').trigger(upKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 (first item clicked) moves up one position when shifted as part of multiselect');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', 'item 2 moves down one position when item 3 is shifted up');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 2 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 5', 'item 5 (second item clicked) moves up one position when shifted as part of multiselect');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 5 is still grabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 4', 'item 4 moves down one position when item 5 is shifted up');
        assert.notOk(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
    });

    andThen(() => {
        this.$('.dd-draggable:nth-of-type(4)').trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 3', 'item 3 (first item clicked) moves up one position when shifted a second time');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving a second time');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 1', 'item 1 moves down one position when item 3 is shifted up');
        assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 1 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 5', 'item 5 (second item clicked) moves up one position when shifted a second time');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 5 is still grabbed after moving a second time');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 2', 'item 2 moves down one position when item 5 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 2 is still ungrabbed after moving a second time');

        this.$('.dd-draggable:nth-of-type(3)').trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 3', 'item 3 (first item clicked) moves to end of list when shifted beyond top of list');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving to end of list');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 3 appears after item 4 when moving to end of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 5', 'item 5 (second item clicked) moves up one position when shifted a third time');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 5 is still grabbed after moving a third time');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', 'item 2 moves down one position when item 5 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 2 is still ungrabbed after moving a third time');

        this.$('.dd-draggable:nth-of-type(2)').trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 3', 'item 3 (first item clicked) moves to end of list when shifted beyond top of list');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving to end of list');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 4', 'item 4 moves down when item 3 overtakes it from end of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 5', 'item 5 (second item clicked) moves up one position when shifted a third time');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 5 is still grabbed after moving a fourth time');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 1', 'item 1 moves down one position when item 5 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 1 is still ungrabbed after moving a third time');

        this.$('.dd-draggable:nth-of-type(1)').trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 1', 'item 1 is back in its original position after 3 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is back in its original position after 3 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is back in its original position after 3 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 4 is back in its original position after 3 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 5', 'item 5 is back in its original position after 3 and 5 complete journey');
    });
});

test('multiselect - ctrlClick shifting up - descending order of clicks', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const ctrlClick = jQuery.Event('mousedown', { ctrlKey: true });
    const upKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowUp' },
        preventDefault: () => false
    });

    this.$('.dd-draggable:nth-of-type(5)').trigger('mousedown');
    this.$('.dd-draggable:nth-of-type(3)').trigger(ctrlClick);
    this.$('.dd-draggable:nth-of-type(3)').trigger(upKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 (second item clicked) moves up one position when shifted as part of multiselect');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', 'item 2 moves down one position when item 3 is shifted up');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 2 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 5', 'item 5 (first item clicked) moves up one position when shifted as part of multiselect');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 5 is still grabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 4', 'item 4 moves down one position when item 5 is shifted up');
        assert.notOk(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
    });

    andThen(() => {
        this.$('.dd-draggable:nth-of-type(4)').trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 3', 'item 3 (second item clicked) moves up one position when shifted a second time');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving a second time');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 1', 'item 1 moves down one position when item 3 is shifted up');
        assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 1 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 5', 'item 5 (first item clicked) moves up one position when shifted a second time');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 5 is still grabbed after moving a second time');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 2', 'item 2 moves down one position when item 5 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 2 is still ungrabbed after moving a second time');

        this.$('.dd-draggable:nth-of-type(1)').trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 3', 'item 3 (second item clicked) moves to end of list when shifted beyond top of list');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving to end of list');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 3 appears after item 4 when moving to end of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 5', 'item 5 (first item clicked) moves up one position when shifted a third time');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 5 is still grabbed after moving a third time');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', 'item 2 moves down one position when item 5 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 2 is still ungrabbed after moving a third time');

        this.$('.dd-draggable:nth-of-type(5)').trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 3', 'item 3 (second item clicked) moves to end of list when shifted beyond top of list');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving to end of list');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 4', 'item 4 moves down when item 3 overtakes it from end of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 5', 'item 5 (frst item clicked) moves up one position when shifted a third time');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 5 is still grabbed after moving a fourth time');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 1', 'item 1 moves down one position when item 5 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 1 is still ungrabbed after moving a third time');

        this.$('.dd-draggable:nth-of-type(4)').trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 1', 'item 1 is back in its original position after 3 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is back in its original position after 3 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is back in its original position after 3 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 4 is back in its original position after 3 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 5', 'item 5 is back in its original position after 3 and 5 complete journey');
    });
});

test('multiselect - shiftClick shifting up - ascending index order of clicks', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const shiftClick = jQuery.Event('mousedown', { shiftKey: true });
    const upKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowUp' },
        preventDefault: () => false
    });

    this.$('.dd-draggable:nth-of-type(3)').trigger('mousedown');
    this.$('.dd-draggable:nth-of-type(5)').trigger(shiftClick);
    const $draggable = this.$('.dd-draggable:nth-of-type(5)');
    $draggable.trigger(upKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 has moved to position 2 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 4', 'item 4 has moved to position 3 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 4 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 5', 'item 5 has moved to position 4 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 5 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 2', 'item 2 has moved to position 5 after being moved by items 3, 4 and 5');
        assert.notOk(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 2 is not selected after being moved by items 3, 4 and 5');
    });

    andThen(() => {
        $draggable.trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 3', 'item 3 has moved to position 1 after second upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 3 is selected after second upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 4', 'item 4 has moved to position 2 after second upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 4 is selected after second upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 5', 'item 5 has moved to position 3 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 5 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 1', 'item 1 has moved to position 4 after being moved by items 3, 4 and 5');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 1 is not selected after being moved by items 3, 4 and 5');

        $draggable.trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 3', 'item 3 has moved to position 5 after third upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 3 is selected after third upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 4', 'item 4 has moved to position 1 after third upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 4 is selected after third upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 5', 'item 5 has moved to position 2 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 5 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 2', 'item 2 is above item 3 after item 3 moves to end of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 2 is not selected after item 3 moves to end of list');

        $draggable.trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 3', 'item 3 has moved to position 4 after fourth upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 3 is selected after fourth upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 4', 'item 4 has moved to position 5 after fourth upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 4 is selected after fourth upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 5', 'item 5 has moved to position 1 after fourth upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 5 is selected after fourth upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', 'item 2 is above item 3 after item 4 moves to end of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 2 is not selected after item 4 moves to end of list');

        $draggable.trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 1', 'item 1 is back in its original position after 3, 4 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is back in its original position after 3, 4 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is back in its original position after 3, 4 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 4 is back in its original position after 3, 4 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 5', 'item 5 is back in its original position after 3, 4 and 5 complete journey');
    });
});

test('multiselect - shiftClick shifting up - descending index order of clicks', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const shiftClick = jQuery.Event('mousedown', { shiftKey: true });
    const upKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowUp' },
        preventDefault: () => false
    });

    this.$('.dd-draggable:nth-of-type(5)').trigger('mousedown');
    this.$('.dd-draggable:nth-of-type(3)').trigger(shiftClick);
    const $draggable = this.$('.dd-draggable:nth-of-type(3)');
    $draggable.trigger(upKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 has moved to position 2 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 4', 'item 4 has moved to position 3 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 4 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 5', 'item 5 has moved to position 4 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 5 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 2', 'item 2 has moved to position 5 after being moved by items 3, 4 and 5');
        assert.notOk(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 2 is not selected after being moved by items 3, 4 and 5');
    });

    andThen(() => {
        $draggable.trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 3', 'item 3 has moved to position 1 after second upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 3 is selected after second upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 4', 'item 4 has moved to position 2 after second upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 4 is selected after second upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 5', 'item 5 has moved to position 3 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 5 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 1', 'item 1 has moved to position 4 after being moved by items 3, 4 and 5');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 1 is not selected after being moved by items 3, 4 and 5');

        $draggable.trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 3', 'item 3 has moved to position 5 after third upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 3 is selected after third upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 4', 'item 4 has moved to position 1 after third upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 4 is selected after third upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 5', 'item 5 has moved to position 2 after upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 5 is selected after upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 2', 'item 2 is above item 3 after item 3 moves to end of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 2 is not selected after item 3 moves to end of list');

        $draggable.trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 3', 'item 3 has moved to position 4 after fourth upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 3 is selected after fourth upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 4', 'item 4 has moved to position 5 after fourth upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 4 is selected after fourth upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 5', 'item 5 has moved to position 1 after fourth upward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 5 is selected after fourth upward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', 'item 2 is above item 3 after item 4 moves to end of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 2 is not selected after item 4 moves to end of list');

        $draggable.trigger(upKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 1', 'item 1 is back in its original position after 3, 4 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is back in its original position after 3, 4 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is back in its original position after 3, 4 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 4 is back in its original position after 3, 4 and 5 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 5', 'item 5 is back in its original position after 3, 4 and 5 complete journey');
    });
});

test('multiselect - ctrlClick shifting down - ascending index order of clicks', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const ctrlClick = jQuery.Event('mousedown', { ctrlKey: true });
    const downKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowDown' },
        preventDefault: () => false
    });

    this.$('.dd-draggable:nth-of-type(1)').trigger('mousedown');
    this.$('.dd-draggable:nth-of-type(3)').trigger(ctrlClick);
    const $draggable = this.$('.dd-draggable:nth-of-type(3)');
    $draggable.trigger(downKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 1', 'item 1 (first item clicked) moves down one position when shifted as part of multiselect');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 1 is still grabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 2', 'item 2 moves up one position when item 1 is shifted down');
        assert.notOk(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 2 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 3', 'item 3 (second item clicked) moves down one position when shifted as part of multiselect');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 4', 'item 4 moves up one position when item 3 is shifted down');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
    });

    andThen(() => {
        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 1', 'item 1 (first item clicked) moves down one position when shifted a second time');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 1 is still grabbed after moving a second time');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 4', 'item 4 moves up one position when item 1 is shifted down');
        assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 3', 'item 3 (second item clicked) moves down one position when shifted a second time');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving a second time');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 5', 'item 5 moves up one position when item 3 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 5 is still ungrabbed after moving a second time');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 1', 'item 1 (first item clicked) moves down one position when shifted a third time');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 1 is still grabbed after shifting down a third time');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 3', 'item 3 (second item clicked) moves to the start of the list when it reaches the end of the list');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving to the start of te list');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is below item 3 when item 3 moves to the start of the list');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 1', 'item 1 (first item clicked) moves to end of list');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 1 is still grabbed after moving to end of list');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 5', 'item 5 stays above item 1 when item 1 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 5 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 (second item clicked) moves down one position when shifted a fourth time');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving a fourth time');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 1', 'item 1 is back in its original position after 1 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is back in its original position after 1 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is back in its original position after 1 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 4 is back in its original position after 1 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 5', 'item 5 is back in its original position after 1 and 3 complete journey');
    });
});

test('multiselect - ctrlClick shifting down - descending index order of clicks', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const ctrlClick = jQuery.Event('mousedown', { ctrlKey: true });
    const downKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowDown' },
        preventDefault: () => false
    });

    this.$('.dd-draggable:nth-of-type(3)').trigger('mousedown');
    this.$('.dd-draggable:nth-of-type(1)').trigger(ctrlClick);
    const $draggable = this.$('.dd-draggable:nth-of-type(1)')
    $draggable.trigger(downKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 1', 'item 1 (first item clicked) moves down one position when shifted as part of multiselect');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 1 is still grabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 2', 'item 2 moves up one position when item 1 is shifted down');
        assert.notOk(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 2 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 3', 'item 3 (second item clicked) moves down one position when shifted as part of multiselect');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 4', 'item 4 moves up one position when item 3 is shifted down');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
    });

    andThen(() => {
        $draggable.trigger(downKey);;
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 1', 'item 1 (first item clicked) moves down one position when shifted a second time');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 1 is still grabbed after moving a second time');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 4', 'item 4 moves up one position when item 1 is shifted down');
        assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 4 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 3', 'item 3 (second item clicked) moves down one position when shifted a second time');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving a second time');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 5', 'item 5 moves up one position when item 3 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 5 is still ungrabbed after moving a second time');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 1', 'item 1 (first item clicked) moves down one position when shifted a third time');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 1 is still grabbed after shifting down a third time');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 3', 'item 3 (second item clicked) moves to the start of the list when it reaches the end of the list');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving to the start of te list');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is below item 3 when item 3 moves to the start of the list');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 1', 'item 1 (first item clicked) moves to end of list');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 1 is still grabbed after moving to end of list');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 5', 'item 5 stays above item 1 when item 1 overtakes it');
        assert.notOk(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 5 is still ungrabbed after moving');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 (second item clicked) moves down one position when shifted a fourth time');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is still grabbed after moving a fourth time');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 1', 'item 1 is back in its original position after 1 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is back in its original position after 1 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is back in its original position after 1 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 4 is back in its original position after 1 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 5', 'item 5 is back in its original position after 1 and 3 complete journey');
    });
});

test('multiselect - shiftClick shifting down - ascending index order of clicks', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const shiftClick = jQuery.Event('mousedown', { shiftKey: true });
    const downKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowDown' },
        preventDefault: () => false
    });

    this.$('.dd-draggable:nth-of-type(1)').trigger('mousedown');
    this.$('.dd-draggable:nth-of-type(3)').trigger(shiftClick);
    const $draggable = this.$('.dd-draggable:nth-of-type(3)');
    $draggable.trigger(downKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 1', 'item 1 has moved to position 2 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 1 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', 'item 2 has moved to position 3 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 2 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 3', 'item 3 has moved to position 4 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 3 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 4', 'item 4 has moved to position 1 after being moved by items 1, 2 and 3');
        assert.notOk(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 4 is not selected after being moved by items 1, 2 and 3');
    });

    andThen(() => {
        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 1', 'item 1 has moved to position 3 after second downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 1 is selected after second downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 2', 'item 2 has moved to position 4 after second downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 2 is selected after second downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 3', 'item 3 has moved to position 3 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 3 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 4', 'item 4 has moved to position 1 after being moved by items 1, 2 and 3');
        assert.notOk(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 4 is not selected after being moved by items 1, 2 and 3');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 1', 'item 1 has moved to position 4 after third downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 1 is selected after third downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 2', 'item 2 has moved to position 5 after third downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 2 is selected after third downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 3', 'item 3 has moved to position 1 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 3 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 4', 'item 4 is below item 3 after item 3 moves to start of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 4 is not selected after item 3 moves to start of list');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 1', 'item 1 has moved to position 5 after fourth downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 1 is selected after fourth downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 2', 'item 2 has moved to position 1 after fourth downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 2 is selected after fourth downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 has moved to position 2 after fourth downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is selected after fourth downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 4', 'item 4 is below item 3 after item 2 moves to start of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 4 is not selected after item 2 moves to start of list');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 1', 'item 1 is back in its original position after 1, 2 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is back in its original position after 1, 2 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is back in its original position after 1, 2 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 4 is back in its original position after 1, 2 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 5', 'item 5 is back in its original position after 1, 2 and 3 complete journey');
    });
});

test('multiselect - shiftClick shifting down - descending index order of clicks', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const shiftClick = jQuery.Event('mousedown', { shiftKey: true });
    const downKey = jQuery.Event('keydown', {
        originalEvent: { code: 'ArrowDown' },
        preventDefault: () => false
    });

    this.$('.dd-draggable:nth-of-type(3)').trigger('mousedown');
    this.$('.dd-draggable:nth-of-type(1)').trigger(shiftClick);
    const $draggable = this.$('.dd-draggable:nth-of-type(1)');
    $draggable.trigger(downKey);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 1', 'item 1 has moved to position 2 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 1 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', 'item 2 has moved to position 3 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 2 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 3', 'item 3 has moved to position 4 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 3 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 4', 'item 4 has moved to position 1 after being moved by items 1, 2 and 3');
        assert.notOk(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 4 is not selected after being moved by items 1, 2 and 3');
    });

    andThen(() => {
        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 1', 'item 1 has moved to position 3 after second downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 1 is selected after second downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 2', 'item 2 has moved to position 4 after second downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 2 is selected after second downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 3', 'item 3 has moved to position 3 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 3 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 4', 'item 4 has moved to position 1 after being moved by items 1, 2 and 3');
        assert.notOk(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 4 is not selected after being moved by items 1, 2 and 3');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 1', 'item 1 has moved to position 4 after third downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(4)').hasClass('dd-dragging'), 'item 1 is selected after third downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 2', 'item 2 has moved to position 5 after third downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 2 is selected after third downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 3', 'item 3 has moved to position 1 after downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 3 is selected after downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 4', 'item 4 is below item 3 after item 3 moves to start of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 4 is not selected after item 3 moves to start of list');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 1', 'item 1 has moved to position 5 after fourth downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(5)').hasClass('dd-dragging'), 'item 1 is selected after fourth downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 2', 'item 2 has moved to position 1 after fourth downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(1)').hasClass('dd-dragging'), 'item 2 is selected after fourth downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 3', 'item 3 has moved to position 2 after fourth downward shiftclick shift');
        assert.ok(this.$('.dd-draggable:nth-of-type(2)').hasClass('dd-dragging'), 'item 3 is selected after fourth downward shiftclick shift');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 4', 'item 4 is below item 3 after item 2 moves to start of list');
        assert.notOk(this.$('.dd-draggable:nth-of-type(3)').hasClass('dd-dragging'), 'item 4 is not selected after item 2 moves to start of list');

        $draggable.trigger(downKey);
    });

    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(1)').text().trim(), 'item 1', 'item 1 is back in its original position after 1, 2 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 2', 'item 2 is back in its original position after 1, 2 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 3', 'item 3 is back in its original position after 1, 2 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(4)').text().trim(), 'item 4', 'item 4 is back in its original position after 1, 2 and 3 complete journey');
        assert.equal(this.$('.dd-draggable:nth-of-type(5)').text().trim(), 'item 5', 'item 5 is back in its original position after 1, 2 and 3 complete journey');
    });
});

test('sorting', function(assert) {
    const list = Ember.A([
        {
            id: 0,
            value: 'item 1'
        }, {
            id: 1,
            value: 'item 2'
        }, {
            id: 2,
            value: 'item 3'
        }, {
            id: 3,
            value: 'item 4'
        }, {
            id: 4,
            value: 'item 5'
        }
    ]);
    this.set('sortableObjectList', list);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList
              contentType="data"}}
                {{#each sortableObjectList as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    // start drag on last item
    const $draggedObject = $('.dd-draggable:last-of-type');
    const $sortableObject = $('.dd-sortable');

    const dragStartEvent = $.Event('dragstart', { dataTransfer: { setData: () => true } });
    $draggedObject.trigger(dragStartEvent);

    const dragEnter = $.Event('dragenter');
    dragEnter.originalEvent = dragStartEvent;
    $sortableObject.trigger(dragEnter);

    // drag it so it's lower than the centre of the second last item
    const $thirdItem = this.$('.dd-draggable:nth-of-type(3)');
    const dragBeyondThirdEvent = $.Event('dragover', {
        clientX: $thirdItem.offset().left + 1,
        clientY: $thirdItem.offset().top + ($thirdItem.height()/2) + 1,
        originalEvent: dragStartEvent
    });
    $sortableObject.trigger(dragBeyondThirdEvent);
    assert.equal(this.$('.dd-draggable:last-of-type').text().trim(), 'item 4', 'last item remains in place when hovering below middle of second last item');

    // drag it so it's higher than the centre of the second last item
    const dragOverThirdEvent = $.Event('dragover', {
        clientX: $thirdItem.offset().left + 1,
        clientY: $thirdItem.offset().top + 1,
        originalEvent: dragStartEvent
    });
    $sortableObject.trigger(dragOverThirdEvent);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:last-of-type').text().trim(), 'item 3', 'last item replaced by 2nd last when hovering above its centre');
    });

    // drag it so it's above the centre of the second item
    const $secondItem = this.$('.dd-draggable:nth-of-type(2)');
    const dragOverSecondEvent = $.Event('dragover', {
        clientX: $secondItem.offset().left + 1,
        clientY: $secondItem.offset().top + 1,
        originalEvent: dragStartEvent
    });
    $sortableObject.trigger(dragOverSecondEvent);
    andThen(() => {
        assert.equal(this.$('.dd-draggable:nth-of-type(2)').text().trim(), 'item 4', '2nd item replaced dragged item when hovering above its centre');
        assert.equal(this.$('.dd-draggable:nth-of-type(3)').text().trim(), 'item 2', '3rd item replaced by 2nd when hovering above 2nd');
    });
});

test('sorting between lists', function(assert) {
    this.set('sortableObjectList1', [{
        id: 0,
        value: 'item 1'
    }, {
        id: 1,
        value: 'item 2'
    }, {
        id: 2,
        value: 'item 3'
    }, {
        id: 3,
        value: 'item 4'
    }]);

    this.set('sortableObjectList2', [{
        id: 4,
        value: 'item 5'
    }, {
        id: 5,
        value: 'item 6'
    }, {
        id: 6,
        value: 'item 7'
    }, {
        id: 7,
        value: 'item 8'
    }]);

    this.render(hbs`
        {{#dd-dragdrop as |dd|}}
            {{#dd.sortable
              sortableObjectList=sortableObjectList1
              contentType="data"}}
                {{#each sortableObjectList1 as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}

            {{#dd.sortable
              sortableObjectList=sortableObjectList2
              contentType="data"}}
                {{#each sortableObjectList2 as |item|}}
                    {{#dd.draggable
                      contentType="data"
                      content=item}}
                        {{item.value}}
                    {{/dd.draggable}}
                {{/each}}
            {{/dd.sortable}}
        {{/dd-dragdrop}}
    `);

    const $originalDraggedObject = this.$('.dd-sortable:first-of-type .dd-draggable:first-of-type');
    assert.equal($originalDraggedObject.hasClass('hidden'), false, 'original dragged object is visible');

    const $fifthItem = this.$('.dd-sortable:last-of-type .dd-draggable:first-of-type');
    assert.equal($fifthItem.text().trim(), 'item 5', 'fifthItem is fifth item');

    // drag over the first item in the second list in order to replace it
    const dragStartEvent = $.Event('dragstart', { dataTransfer: { setData: () => true } });
    $originalDraggedObject.trigger(dragStartEvent);

    // we need to drag over the first sortable list as otherwise the service won't know to delete the original element at the end
    const dragOverFirstListEvent = $.Event('dragover', {
        originalEvent: dragStartEvent
    });
    this.$('.dd-sortable:first-of-type').trigger(dragOverFirstListEvent);

    const dragOverSecondListEvent = $.Event('dragover', {
        clientX: $fifthItem.offset().left + 1,
        clientY: $fifthItem.offset().top + 1,
        originalEvent: dragStartEvent
    });
    this.$('.dd-sortable:nth-of-type(2)').trigger(dragOverSecondListEvent);
    andThen(() => {
        // first item in second list should have now changed
        const $draggedObjectCopy = this.$('.dd-sortable:nth-of-type(2) .dd-draggable:first-of-type');
        assert.equal($draggedObjectCopy.text().trim(), 'item 1', 'original dragged object has been copied to second list');
        assert.equal(this.$('.dd-sortable:nth-of-type(2) .dd-draggable:nth-of-type(2)').text().trim(), 'item 5', 'first item has moved to second place');
        assert.ok($originalDraggedObject.hasClass('hidden'), 'it hides the copy of the draggedObject in the original list');
    });

    this.$('.dd-sortable:nth-of-type(2)').trigger('drop');
    andThen(() => {
        assert.equal(this.$('.dd-sortable:first-of-type .dd-draggable:first-of-type').text().trim(), 'item 2', 'original dragged object has been deleted');
    });
});
