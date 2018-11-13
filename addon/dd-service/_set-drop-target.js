export default {
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
}