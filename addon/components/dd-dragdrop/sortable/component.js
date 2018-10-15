import Ember from 'ember';
import Droppable from './droppable';
import layout from '../../templates/components/dd-dragdrop/sortable';

export default Droppable.extend({
    layout,
    classNames: ['dd-sortable'],
    sortableObjectList: Ember.A([]),
    contentType: 'data',
    replaceContent: false,
    isSortable: true,

    dragOver(event) {
        this._super(event);
        this.get('dragDropService').sort(event);
    }
});
