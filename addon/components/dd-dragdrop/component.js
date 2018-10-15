import Ember from 'ember';
import layout from '../templates/components/dd-dragdrop';

export default Ember.Component.extend({
    layout,
    classNames: ['dd-dragdrop'],
    sortableObjectList: Ember.A([]),

    enableSort: true,
    useSwap: true,
    inPlace: false,
    sortingScope: 'sortingGroup'
});
