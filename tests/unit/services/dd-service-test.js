import Ember from 'ember';
import { moduleFor, test, only } from 'ember-qunit';

moduleFor('service:hc-dragdropservice', 'Unit | Service | hc dragdropservice', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
    beforeEach() {
        this.sortableObjectList = [{
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
        }];

        const newContent = {
            id: 4,
            value:'new item'
        };

        this.myDraggable = Ember.Object.create({
            content: newContent,
            isDraggable: true,
            grabbed: false,
            $: () => ({
                focus: () => true,
                removeClass: () => true
            }),
            parentView: this.mySortable
        });

        this.myOtherDraggable = Ember.Object.create({
            content: newContent,
            isDraggable: true,
            grabbed: false,
            $: () => ({
                focus: () => true,
                removeClass: () => true
            }),
            parentView: this.mySortable
        });

        this.mySortable = Ember.Object.create({
            sortableObjectList: this.sortableObjectList,
            isSortable: true,
            isCurrentDropTarget: false,
            contentType: 'data',
            childViews: Ember.A([
                Ember.Object.create(Object.assign(
                    {},
                    this.myDraggable,
                    {content: this.sortableObjectList[0]},
                )),
                Ember.Object.create(Object.assign(
                    {},
                    this.myDraggable,
                    {content: this.sortableObjectList[1]},
                )),
                Ember.Object.create(Object.assign(
                    {},
                    this.myDraggable,
                    {content: this.sortableObjectList[2]},
                )),
                Ember.Object.create(Object.assign(
                    {},
                    this.myDraggable,
                    {content: this.sortableObjectList[3]},
                )),
                this.myDraggable
            ])
        });

        this.myDraggable.set('parentView', this.mySortable);
    }
});

// Replace this with your real tests.
test('it exists', function(assert) {
    let service = this.subject();
    assert.ok(service);
});

test('attemptGrab', function(assert) {
    const service = this.subject();

    service.attemptGrab(this.myDraggable, {});
    assert.equal(service.get('draggedObjects')[0], this.myDraggable, 'it updates the draggedObjects property');
    assert.ok(this.myDraggable.get('grabbed'), 'it sets the grabbed property in the draggable object');
    assert.equal(service.get('dropTarget'), this.mySortable, 'it sets the dragged object\'s parent view if the parent view is sortable');

    service.attemptGrab(this.myOtherDraggable, {});
    assert.equal(service.get('draggedObjects')[0], this.myOtherDraggable, 'it replaces the old object with the new object');
    assert.notOk(service.get('draggedObjects')[1], 'draggedObjects does not get updated when multiSelecting is not set');

    service.attemptGrab(this.myOtherDraggable, {});
    assert.notOk(service.get('draggedObjects')[0], 'it deselects the selected object on second click');
    assert.notOk(service.get('draggedObjects')[1], 'draggedObjects does not contain duplicate content');

    service.attemptGrab(this.myOtherDraggable, { ctrlKey: true });
    assert.equal(service.get('draggedObjects')[0], this.myOtherDraggable, 'it selects the object when multiselect is on');

    service.attemptGrab(this.myDraggable, { ctrlKey: true });
    assert.equal(service.get('draggedObjects')[1], this.myDraggable, 'it appends new content to the draggedObjects list when multiselect is on');
    // TODO: We need to figure out what happens if the draggable is not contained in a sortable object
});

test('setDropTarget', function(assert) {
    const service = this.subject();
    const dropTargetExists = service._objectExists(service.get('dropTarget'));

    assert.equal(dropTargetExists, false, 'objectExists confirms that we do not yet have a dropTarget');

    service.setDropTarget(this.mySortable);
    // TODO: Figure out what happens if setDropTarget isn't given a valid sortable object
    assert.equal(service.get('dropTarget'), this.mySortable, 'it updates the dropTarget property');
    assert.equal(service._objectExists(service.get('dropTarget')), true, 'objectExists confirms that we now have a dropTarget');
    assert.equal(this.mySortable.get('isCurrentDropTarget'), true, 'it tells the sortable object that it is the current drop target');

    service.setDropTarget(null);
    assert.equal(this.mySortable.get('isCurrentDropTarget'), false, 'previous dropTarget no longer has isCurrentDropTarget property');
    assert.notOk(service.get('dropTarget'), 'service no longer has dropTarget property set');
});

test('copyToIndex - data', function(assert) {
    const service = this.subject();
    const myDraggable = this.myDraggable;
    const originalSortable = Ember.Object.create(Object.assign({}, this.mySortable));
    const targetSortable = Ember.Object.create(Object.assign({}, this.mySortable));
    const content = { id:4, value:'new item' };

    myDraggable.set('parentView', originalSortable);
    targetSortable.set('contentType', 'data');

    service.set('dropTarget', targetSortable);
    service.set('draggedObject', myDraggable);

    service.copyToIndex(0, content);
    assert.equal(service.get('dropTarget').get('sortableObjectList')[0], content, 'it appends to the start of the list when entryIndex is 0');
    assert.ok(service._draggedObjectHasMovedViews(), 'draggedObjectHasMovedViews returns true');

    service.copyToIndex(1, content);
    assert.equal(service.get('dropTarget').get('sortableObjectList')[1], content, 'it inserts at the requested entryIndex');

    service.copyToIndex(4, content);
    assert.equal(service.get('dropTarget').get('sortableObjectList')[4], content, 'it inserts at the end of the list when the last index is selected');

    service.copyToIndex(5, content);
    assert.equal(service.get('dropTarget').get('sortableObjectList')[4], content, 'it inserts at the end of the list when the entryIndex requested is higher than the list length');

    service.copyToIndex(-1, content);
    assert.equal(service.get('dropTarget').get('sortableObjectList')[0], content, 'it inserts at the start of the list when the entryIndex requested is lower than 0');
});

test('navigate', function(assert) {
    const service = this.subject();
    const mySortable = this.mySortable;
    const myDraggable = this.myDraggable;

    mySortable.set('contentType', 'data');
    mySortable.get('sortableObjectList').push(myDraggable.get('content'));
    service.set('draggedObject', myDraggable);
    service.set('dropTarget', mySortable);

    const itemInfo = service._getItemInfo(myDraggable);
    assert.equal(itemInfo.list, this.sortableObjectList, 'itemInfo returns the sortableObjectList');
    assert.equal(itemInfo.index, 4, 'itemInfo returns the correct index for the draggableObject');

    let itemToFocusIndex = service._getTargetItemIndex(itemInfo, 'up');
    assert.equal(itemToFocusIndex, 3, 'target index = original item index - 1');

    itemToFocusIndex = service._getTargetItemIndex(itemInfo, 'down');
    assert.equal(itemToFocusIndex, 0, 'target index = 0 when moving from the end of the list');

    // tests for next steps in navigate appear in hc-dragdrop/sortable-test
});

test('shift - data', function(assert) {
    const service = this.subject();
    const mySortable = this.mySortable;
    const myDraggable = this.myDraggable;

    mySortable.set('contentType', 'data');
    mySortable.get('sortableObjectList').push(myDraggable.get('content'));
    service.set('draggedObject', myDraggable);
    service.set('dropTarget', mySortable);

    const indexToShiftTo = service._getTargetItemIndex(myDraggable, 'up');
    assert.equal(indexToShiftTo, 3, 'it returns 0 as the index to shift to when the starting index is 0');

    const entryToShiftPast = service._findEntry(
        service.get('dropTarget'),
        myDraggable.list[indexToShiftTo]
    );
    assert.equal(entryToShiftPast.get('isDraggable'), true, 'it finds that the item to be shifted is a draggable object');

    service.shift(myDraggable, 'up'); // 2
    service.shift(myDraggable, 'up'); // 1
    service.shift(myDraggable, 'up'); // 0
    service.shift(myDraggable, 'up'); // -1
    assert.equal(service.get('dropTarget').get('sortableObjectList')[0], myDraggable.get('content'), 'content stays at index 0 when shifting up from 0');

    service.shift(myDraggable, 'down');
    assert.equal(service.get('dropTarget').get('sortableObjectList')[1], myDraggable.get('content'), 'content moves to index 1 when shifting down from 0');
});

// test('transfer - data', function(assert) {
//     const service = this.subject();
//     const myDraggable = this.myDraggable;
//     const originalSortable = Ember.Object.create(Object.assign({}, this.mySortable, { contentType: 'data' }));
//     const targetSortable = Ember.Object.create(Object.assign({}, this.mySortable, { contentType: 'data' }));

//     const containerComponent = Ember.Object.create({
//         childViews: [
//             originalSortable,
//             targetSortable
//         ]
//     });

//     originalSortable.set('parentView', containerComponent);
//     targetSortable.set('parentView', containerComponent);
//     service.set('dropTarget', targetSortable);

//     const sortables = service._getAllSortablesInScope();
//     // assert.equal(sortables, [originalSortable, targetSortable], 'it returns all the sortables in scope');

//     const target = service._getTarget(this.myDraggable.get('parentView'), this.myDraggable.get('content'));
//     // assert.equal(target, this.mySortable);

// });

test('drop', function(assert) {
    const service = this.subject();
    const myDraggable = this.myDraggable;
    const originalSortable = Ember.Object.create(Object.assign({}, this.mySortable, { contentType: 'data' }));
    const targetSortable = Ember.Object.create(Object.assign({}, this.mySortable), { contentType: 'data' });

    const content = {
        id: 3,
        value: 'item 4'
    };
    myDraggable.set('content', content);
    myDraggable.set('parentView', originalSortable);

    service.set('visitedDropTargets', [originalSortable, targetSortable]);
    service.set('dropTarget', targetSortable);
    service.set('draggedObject', myDraggable);

    service.drop();
    // const sortableObjectListWithoutContent = [{
    //     id: 0,
    //     value: 'item 1'
    // }, {
    //     id: 1,
    //     value: 'item 2'
    // }, {
    //     id: 2,
    //     value: 'item 3'
    // }];
    assert.equal(service._draggedObjectHasMovedViews(), true, 'draggedObjectHasMovedViews returns true');
    // assert.equal(originalSortable.get('sortableObjectList'), sortableObjectListWithoutContent, 'removeOriginalDraggedObjectData removes the content from the originalSortable');
    // assert.equal(targetSortable.get('sortableObjectList'), this.sortableObjectList, 'removeOriginalDraggedObjectData keeps the content in the targetSortable');
    assert.equal(service.get('dropTarget').get('isCurrentDropTarget'), false, 'dropTarget is no longer the current dropTarget');
});
