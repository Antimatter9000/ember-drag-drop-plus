import { A } from '@ember/array';
import { computed } from '@ember/object';

export default {
    draggedObjects: A([]),

    dropTarget: null,
    sortableObjectList: computed('dropTarget', function() {
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

    reset() {
        this.set('draggedObjects', A([]));
        this.set('dropTarget', null);
        this.set('sortableChildViews', A([]));
        this.set('scopedDropTargets', A([]));
        this.set('visitedDropTargets', A([]));
        this.set('dropSuccessful', false);
    }
};