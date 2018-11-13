import { run } from '@ember/runloop';
import { A } from '@ember/array';

export default {
    // finish the drag and delete redundant copies of the draggedObject content
    drop(draggedObject, selectCopy = false) {
        if (this.get('dropTarget') && draggedObject) {
            const content = draggedObject.get('content');
            this._dropDraggedObjects(content);
            if (this._draggedObjectHasMovedViews(draggedObject)) {
                this._removeOriginalDraggedObject(draggedObject);
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

    _removeOriginalDraggedObject(draggedObject) {
        const contentType = this.get('dropTarget').get('contentType');
        if (contentType === 'data') {
            this._removeOriginalDraggedObjectData(draggedObject.get('content'));
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

    // selects the object after a move to ensure that keyboard controls
    // continue to work
    _selectCopy(content) {
        const dropTarget = this.get('dropTarget');
        const copy = this._findEntry(dropTarget, content);
        this.grabObject(copy, true);
    },
}