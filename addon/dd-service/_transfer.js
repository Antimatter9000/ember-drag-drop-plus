export default {
    transfer(callingObject, direction) {
        const currentSortable = callingObject.get('parentView');
        const target = this._getTargetList(currentSortable, direction);

        if (this._canTransfer(target)) {
            this.setDropTarget(target);
            console.log(this.get('draggedObjects'));
            const draggedObjects = this._orderDraggedObjects('up');
            draggedObjects.forEach(draggedObject => {
                console.log('transferring', draggedObject.get('content.name'), 'to', target);
                this._performTransfer(draggedObject, target);
            });
        }
    },

    _canTransfer(target) {
        const dropTargetWillChange = !(target === this.get('dropTarget'));
        return dropTargetWillChange;
    },

    _performTransfer(draggedObject, target) {
        const targetListEnd = target.get('sortableObjectList').length;
        this.moveToIndex(draggedObject, targetListEnd);
    },
}