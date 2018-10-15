import Service from '@ember/service';
import $ from 'jquery';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Service.extend({
    draggedObjects: A([]),

    dropTarget: null,
    sortableObjectList: computed('dropTarget', function() {
        if (!this.get('dropTarget')) return;
        return this.get('dropTarget').get('contentType') === 'data'
            ? this.get('dropTarget').get('sortableObjectList')
            : this.get('dropTarget').$().children().toArray();
    }),

    sortableChildViews: A([]),
    scopedDropTargets: A([]),
    visitedDropTargets: A([]),

    multiSelect: false,
    previousClickedObject: null,

    dropSuccessful: false,

    attemptGrab(draggableObject, event) {
        this._setMultiSelect(event);
        if (this._otherObjectsSelected(draggableObject).length && !this.get('multiSelect')) {
            this.clearDraggedObjects();
            this.grabObject(draggableObject);
        } else {
            this._toggleGrab(draggableObject);
        }
    },

    _setMultiSelect(event) {
        if (event.shiftKey) {
            this.set('multiSelect', 'list');
        } else if (event.ctrlKey) {
            this.set('multiSelect', true);
        } else {
            this.set('multiSelect', false);
        }
    },

    _otherObjectsSelected(draggableObject) {
        if (this.get('draggedObjects')) {
            return this.get('draggedObjects').filter(item => {
                return item !== draggableObject;
            });
        }
        return false;
    },

    clearDraggedObjects() {
        if (this.get('draggedObjects').length > 0) {
            this.get('draggedObjects').forEach(draggable => {
                if (this._objectExists(draggable)) {
                    draggable.set('grabbed', false);
                }
            });
        }
        this.set('draggedObjects', A([]));
    },

    grabObject(draggableObject, moving = false) {
        this.setDropTarget(draggableObject.get('parentView'));
        const itemsToGrab = moving // this is needed otherwise _grabObject will grab the wrong objects when shift-select shifting
            ? [draggableObject]
            : this._getItemsToGrab(draggableObject);
        this._updateDraggedObjects(itemsToGrab);
        draggableObject.$().focus(); // if the updated draggedObject loses focus, keyboard control stops working
        this.set('previousClickedObject', draggableObject);
    },

    _getItemsToGrab(currentClickedObject) {
        if (this._shiftSelecting()) {
            const start = this.get('previousClickedObject').get('indexInList');
            const end = currentClickedObject.get('indexInList');
            return this._getItemsBetween(start, end);
        }
        return [currentClickedObject];
    },

    _shiftSelecting() {
        return this.get('multiSelect') === 'list'
            && this.get('previousClickedObject');
    },

    _getItemsBetween(start, end) {
        const first = start < end ? start : end;
        const last = start > end ? start : end;
        return this.get('dropTarget')
            .get('childViews')
            .filter(child => {
                return child.get('isDraggable')
                    && child.get('indexInList') >= first
                    && child.get('indexInList') <= last;
            });
    },

    _updateDraggedObjects(draggableObjects) {
        draggableObjects.forEach(draggableObject => {
            draggableObject.setProperties({
                grabbed: true,
                list: this.get('sortableObjectList'),
                indexInList: this._getIndexInList(draggableObject)
            });
            this._addOrUpdate(draggableObject);
        });
    },

    _getIndexInList(draggableObject) {
        if (!this.get('dropTarget')) return;
        const list = this.get('sortableObjectList');
        return this.get('dropTarget').get('contentType') === 'data'
            ? list.indexOf(draggableObject.get('content'))
            : list.indexOf(draggableObject.$()[0]);
    },

    // check if draggedObjects includes the draggableObject
    // if it does, replace the object as the new object will have new properties
    // either way, push the new object to the array
    _addOrUpdate(draggableObject) {
        if (this._isGrabbed(draggableObject)) {
            this.get('draggedObjects').removeObject(draggableObject);
        }
        this.get('draggedObjects').pushObject(draggableObject);
    },

    _isGrabbed(draggableObject) {
        return this.get('draggedObjects').includes(draggableObject);
    },

    ungrabObject(draggableObject) {
        draggableObject.set('grabbed', false);
        this.get('draggedObjects').removeObject(draggableObject);
    },

    _toggleGrab(draggableObject) {
        if (this._isGrabbed(draggableObject)) {
            this.ungrabObject(draggableObject);
        } else {
            this.grabObject(draggableObject);
        }
    },

    // used for setting the dropTarget at the start of drag events,
    // but can also set it to null at the end of drag events
    setDropTarget(dropTarget) {
        if (this._objectExists(this.get('dropTarget'))) {
            this.get('dropTarget').set('isCurrentDropTarget', false);
        }
        if (dropTarget) {
            this._activateDropTarget(dropTarget);
        }
        this.set('dropTarget', dropTarget);
    },

    _objectExists(emberObject) {
        return typeof emberObject !== 'undefined'
            && emberObject !== null
            && !emberObject.isDestroying
            && !emberObject.isDestroyed;
    },

    _activateDropTarget(dropTarget) {
        dropTarget.set('isCurrentDropTarget', true);
        this._showActiveObjects(dropTarget);
        this.set('sortableChildViews', this._getSortableChildViews(dropTarget));
        this._updateVisited(dropTarget);
    },

    // unhides any copy of the draggedObject content currently hidden in the dropTarget
    // (hidden content may have been placed there by the sort() function)
    _showActiveObjects(dropTarget) {
        if (!this.get('draggedObjects')) return;
        this.get('draggedObjects').forEach(draggedObject => {
            const draggedContent = draggedObject.get('content');
            const currentEntry = this._findEntry(dropTarget, draggedContent);
            if (currentEntry) {
                currentEntry.$().removeClass('hidden');
            }
        });
    },

    // find the emberObject with the requested content in the requested sortable component
    _findEntry(dropTarget, content) {
        return dropTarget.get('childViews').find(child => {
            return child.get('content') === content;
        });
    },

    _getSortableChildViews(dropTarget) {
        return dropTarget.get('childViews').filter(child => {
            return child.get('isSortable');
        });
    },

    // update the array of visited droppable components
    _updateVisited(emberObject) {
        if (!this.get('visitedDropTargets').includes(emberObject)) {
            this.get('visitedDropTargets').push(emberObject);
        }
    },

    // copy content to a specified index in the list
    copyToIndex(entryIndex, content) {
        this._insertCopy(entryIndex, content);
        this._hideInactiveCopies(content);
    },

    // inserts a copy of the draggedObject content into the sortable component
    // these copies get deleted on drop
    _insertCopy(entryIndex, content) {
        const list = this.get('sortableObjectList');

        if (this.get('dropTarget').get('contentType') === 'data') {
            this._insertDataCopy(entryIndex, list, content);
        } else {
            this._insertHTMLCopy(entryIndex, list, content);
        }
    },

    _insertDataCopy(entryIndex, list, content) {
        list.removeObject(content);
        list.insertAt(entryIndex, content);
    },

    _insertHTMLCopy(entryIndex, list, content) {
        const $dropTarget = this.get('dropTarget').$();
        list.removeObject(content[0]);

        const predecessor = list[entryIndex - 1];
        if (predecessor) {
            $(content).insertAfter(predecessor);
        } else {
            $dropTarget.prepend(content);
        }
    },

    // hides copies of draggedObject content that appear in sortable objects
    // that are not currently being dragged over
    _hideInactiveCopies(content) {
        this.get('visitedDropTargets').forEach(dropTarget => {
            const inactiveCopy = this._getInactiveCopy(dropTarget, content);
            if (inactiveCopy && !inactiveCopy.$().hasClass('hidden')) {
                inactiveCopy.$().addClass('hidden');
            }
        });
    },

    _getInactiveCopy(dropTarget, content) {
        if (dropTarget !== this.get('dropTarget')) {
            return this._findEntry(dropTarget, content);
        }
        return false;
    },

    navigate(currentItem, direction) {
        let targetInfo;
        if (direction === 'up' || direction === 'down') {
            targetInfo = this._getTargetInSameList(currentItem, direction);
        } else if (direction === 'left' || direction === 'right') {
            const currentSortable = this.get('dropTarget');
            targetInfo = this._getTargetInOtherList(currentSortable, direction);
        }
        const itemToFocus = this._getItemToFocus(targetInfo);
        itemToFocus.$().focus();
    },

    _getTargetInSameList(currentItem, direction) {
        const list = this.get('dropTarget');
        const index = this._getTargetItemIndex(currentItem, direction);
        const content = currentItem.get('sortableObjectList')[index];
        return { list, content };
    },

    _getTargetItemIndex(currentItem, direction) {
        const list = currentItem.get('list');
        const currentIndex = currentItem.get('indexInList');
        const lastListIndex = list.length - 1;

        const index = direction === 'up'
            ? this._getShiftUpIndex(currentIndex, lastListIndex)
            : this._getShiftDownIndex(currentIndex, lastListIndex);

        return this._fixTargetItemIndex(index, list, currentItem.get('content'));
    },

    _getShiftUpIndex(currentIndex, lastListIndex) {
        return currentIndex - 1 >= 0
            ? currentIndex - 1
            : lastListIndex;
    },

    _getShiftDownIndex(currentIndex, lastListIndex) {
        return currentIndex + 1 <= lastListIndex
            ? currentIndex + 1
            : 0;
    },

    // TODO: This method shouldn't have to exist.
    // The correct targetItemIndex should be returned by the getShiftIndex() methods
    _fixTargetItemIndex(index, list, content) {
        if (this._contentExists(content, list)) {
            if (index < 0) return 0;
            if (index >= list.length) return list.length - 1;
            return index;
        }
    },

    _contentExists(content, list) {
        return this.get('dropTarget').get('contentType') === 'data'
            ? this.get('dropTarget').get('sortableObjectList').includes(content)
            : this.get('dropTarget').$().find(content);
    },

    _getTargetInOtherList(currentSortable, direction) {
        const targetList = this._getTargetList(currentSortable, direction);
        return {
            targetList,
            list: targetList.get('sortableObjectList'),
            index: 0
        };
    },

    _getTargetList(currentSortable, direction) {
        const sortables = this.get('scopedDropTargets');
        const currentSortableIndex = sortables.indexOf(currentSortable);
        const index = this._getTargetListIndex(sortables, currentSortableIndex, direction);
        return sortables[index];
    },

    _getTargetListIndex(sortables, currentSortableIndex, direction) {
        let index;
        const lastSortableIndex = sortables.length - 1;

        if (direction === 'left') {
            index = currentSortableIndex - 1 >= 0
                ? currentSortableIndex - 1
                : lastSortableIndex;
        } else if (direction === 'right') {
            index = currentSortableIndex + 1 <= lastSortableIndex
                ? currentSortableIndex + 1
                : 0;
        }
        return index;
    },

    _getItemToFocus(target) {
        return this._findEntry(target.list, target.content);
    },

    // move up or down one in the list. triggered by keydown event in draggable
    shift(direction) {
        const draggedObjects = this._orderDraggedObjects(direction);
        draggedObjects.forEach(draggedObject => {
            this._shiftObject(draggedObject, direction);
        });
    },

    _orderDraggedObjects(direction) {
        return this.get('draggedObjects').sort((a, b) => {
            return direction === 'up'
                ? a.get('indexInList') - b.get('indexInList')
                : b.get('indexInList') - a.get('indexInList');
        });
    },

    _shiftObject(draggedObject, direction) {
        const content = draggedObject.get('content');
        const itemIndex = draggedObject.get('indexInList');
        const list = draggedObject.get('list');
        const targetIndex = this._getTargetItemIndex(draggedObject, direction);

        if (this._canShift(list, itemIndex)) {
            this.copyToIndex(targetIndex, content);
            this.drop(draggedObject, true);
        }
    },

    // determine if the item currently occupying the index into which the draggedObject
    // will be shifted can be moved out the way
    _canShift(list, index) {
        return this.get('dropTarget').get('contentType') === 'data'
            ? this._findEntry(this.get('dropTarget'), list[index]).get('isDraggable')
            : $(list[index]).attr('draggable');
    },

    transfer(emberObject, direction) {
        const currentSortable = emberObject.get('parentView');
        const target = this._getTargetList(currentSortable, direction);

        if (this._canTransfer(target)) {
            const content = emberObject.get('content');
            this._performTransfer(content, target);
        }
    },

    _canTransfer(target) {
        const dropTargetWillChange = !(target === this.get('dropTarget'));
        return dropTargetWillChange;
    },

    _performTransfer(content, target) {
        const targetListEnd = target.get('sortableObjectList').length;
        this.setDropTarget(target);
        this.copyToIndex(targetListEnd, content);
        this.drop(true);
    },

    // moves content up and down depending on position of draggedObject
    sort(event) {
        const currentHoveredItem = this._getCurrentHoveredItem(event);
        const content = this.get('draggedObjects').get('content');
        if (this._isNotHoveringOverSelf(content, currentHoveredItem)) {
            const entryIndex = this._getEntryIndex(event, currentHoveredItem);
            this.copyToIndex(entryIndex, content);
        }
    },

    // find the item with the same position as the draggedObject
    _getCurrentHoveredItem(event) {
        return this.get('sortableChildViews').find(child => {
            return this.isOverElement(event, child);
        });
    },

    isOverElement(event, emberObject) {
        const scrollTop = $(window).scrollTop();
        const offset = emberObject.$().offset();
        const screenOffsetTop = offset.top - scrollTop;

        return event.clientY > screenOffsetTop
            && event.clientY < screenOffsetTop + emberObject.$().height()
            && event.clientX > offset.left
            && event.clientX < offset.left + emberObject.$().width();
    },

    // check the draggedObject isn't hovering over a copy of itself so it
    // doesn't go into a crazy loop
    _isNotHoveringOverSelf(content, currentHoveredItem) {
        if (!currentHoveredItem) return true;
        return content !== currentHoveredItem.get('content');
    },

    _dropTargetIsEmpty() {
        return this.get('sortableChildViews').length === 0;
    },

    // figure out where to put the draggedObject in the sortableObjectList
    _getEntryIndex(event, currentHoveredItem) {
        if (this._dropTargetIsEmpty()) return 0;
        if (!currentHoveredItem) return this.get('sortableChildViews').length;

        if (this._draggingBelowCentre(event, currentHoveredItem)) {
            return currentHoveredItem.get('indexInList') + 1;
        }
        return currentHoveredItem.get('indexInList');
    },

    _draggingBelowCentre(event, currentHoveredItem) {
        // TODO: Make this work for horizontal lists as well
        const $item = currentHoveredItem.$();
        const halfwayFromTop = $item.offset().top + ($item.height() / 2);
        return event.clientY >= halfwayFromTop;
    },

    // finish the drag and delete redundant copies of the draggedObject content
    drop(draggedObject, selectCopy = false) {
        if (this.get('dropTarget') && draggedObject) {
            const content = draggedObject.get('content');
            this._dropDraggedObjects(content);
            if (this._draggedObjectHasMovedViews(draggedObject)) {
                this._removeOriginalDraggedObject(content);
            }
            this._completeAction(selectCopy, content);
        }
    },

    _dropDraggedObjects(content) {
        const replaceContent = this.get('dropTarget').get('replaceContent');
        const dropTarget = this.get('dropTarget');
        content = dropTarget.get('contentType') === 'html' ? content[0] : content;
        if (replaceContent) {
            dropTarget.set('content', content);
        }
    },

    _draggedObjectHasMovedViews(draggedObject) {
        const draggedObjectParent = draggedObject.get('parentView');
        return draggedObjectParent !== this.get('dropTarget');
    },

    _removeOriginalDraggedObject(content) {
        const contentType = this.get('dropTarget').get('contentType');
        if (contentType === 'data') {
            this._removeOriginalDraggedObjectData(content);
        } else if (contentType === 'html') {
            this._removeOriginalDraggedObjectHTML();
        }
    },

    _removeOriginalDraggedObjectData(content) {
        this.get('visitedDropTargets').forEach(dropTarget => {
            if (dropTarget !== this.get('dropTarget')) {
                dropTarget.get('sortableObjectList').removeObject(content);
            }
        });
    },

    _removeOriginalDraggedObjectHTML() {
        const draggedObject = this.get('draggedObjects');
        draggedObject.$().remove();
        draggedObject.destroy();
        this.set('draggedObjects', A([]));
    },

    _completeAction(selectCopy, content) {
        if (selectCopy) {
            run.next(() => {
                this._selectCopy(content);
            });
        } else {
            this.get('dropTarget').set('isCurrentDropTarget', false);
        }
    },

    _selectCopy(content) {
        const dropTarget = this.get('dropTarget');
        const copy = this._findEntry(dropTarget, content);
        this.grabObject(copy, true);
    },

    reset() {
        this.set('draggedObjects', A([]));
        this.set('dropTarget', null);
        this.set('sortableChildViews', A([]));
        this.set('scopedDropTargets', A([]));
        this.set('visitedDropTargets', A([]));
        this.set('dropSuccessful', false);
    }
});
