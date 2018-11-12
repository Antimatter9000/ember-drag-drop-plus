import $ from 'jquery';

export default {
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
}