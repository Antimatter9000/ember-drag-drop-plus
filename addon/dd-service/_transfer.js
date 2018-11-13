export default {
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
}