import { A } from '@ember/array';

export default {
    attemptGrab(draggableObject, event) {
        console.log('drag started');
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
}