export default {
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
}