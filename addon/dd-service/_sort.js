import $ from 'jquery';

export default {
    // moves content up and down depending on position of draggedObject
    sort(event) {
        const currentHoveredItem = this._getCurrentHoveredItem(event);
        console.log(currentHoveredItem);
        if (this._isNotHoveringOverSelf(currentHoveredItem)) {
            const entryIndex = this._getEntryIndex(event, currentHoveredItem);
            this.get('draggedObjects').forEach(draggedObject => {
                this.copyToIndex(entryIndex, draggedObject.get('content'));
            });
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
    _isNotHoveringOverSelf(currentHoveredItem) {
        if (!currentHoveredItem) return true;
        let notHoveringOverSelf = true;
        this.get('draggedObjects').forEach(draggedObject => {
            if (draggedObject.get('content') === currentHoveredItem.get('content')) {
                notHoveringOverSelf = false;
            }
        })
        return notHoveringOverSelf;
    },

    _dropTargetIsEmpty() {
        return this.get('sortableChildViews').length === 0;
    },

    // figure out where to put the draggedObject in the targetList
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
}