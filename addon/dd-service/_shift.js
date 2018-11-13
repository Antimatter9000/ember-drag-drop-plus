export default {
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
}