import { A } from '@ember/array';
import { computed } from '@ember/object';

export default {
    draggedObjects: A([]),

    dropTarget: null,
    targetList: computed('dropTarget', function() {
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

    // used by _getInactiveCopy(), selectCopy(), _getItemtoFocus(), _showActiveObjects() and _canShift()
    // to find the emberObject with the requested content in the requested sortable component
    _findEntry(dropTarget, content) {
        return dropTarget.get('childViews').find(child => {
            return child.get('content') === content;
        });
    },

    moveToIndex(draggedObject, targetIndex) {
        console.log('moving ', draggedObject.get('content.name'), 'to', targetIndex);
        this.copyToIndex(targetIndex, draggedObject.get('content'));
        console.log('it seems to do this fine');
        this.drop(draggedObject, true);
    },

    // used by navigate() and transfer() to determine which list to move to
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

    // used by drop() to decide when to 
    // delete the original copy of the draggedObject
    _draggedObjectHasMovedViews(draggedObject) {
        const draggedObjectParent = draggedObject.get('parentView');
        return draggedObjectParent !== this.get('dropTarget');
    },

    reset() {
        this.set('draggedObjects', A([]));
        this.set('dropTarget', null);
        this.set('sortableChildViews', A([]));
        this.set('scopedDropTargets', A([]));
        this.set('visitedDropTargets', A([]));
        this.set('dropSuccessful', false);
    }
};