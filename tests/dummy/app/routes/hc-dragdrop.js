import Ember from 'ember';
import description from '../../data/descriptions/hc-dragdrop';

export default Ember.Route.extend({
    name: 'hc-dragdrop',
    description,
    dragDropService: Ember.inject.service('hc-dragdropservice'),

    model() {
        return Ember.Object.create({
            name: this.get('name'),
            description: this.get('description'),
            sortableObjects: Ember.A([
                {id: 1, name:'one'},
                {id: 2, name:'two'},
                {id: 3, name:'three'},
                {id: 4, name:'four'},
                {id: 5, name:'five'}
            ]),
            sortableObjects2: Ember.A([
                {id: 6, name:'six'},
                {id: 7, name:'seven'},
                {id: 8, name:'eight'},
                {id: 9, name:'nine'},
                {id: 10, name:'ten'}
            ]),
            sortableObjects3: Ember.A([
                {id: 11, name:'eleven'},
                {id: 12, name:'twelve'},
                {id: 13, name: 'thirteen'},
                {id: 14, name: 'fourteen'},
                {id: 15, name: 'fifteen'}
            ]),
            options: [{
                key: 'draggable',
                label: 'The Draggable Component'
            }, {
                key: 'droppable',
                label: 'The Droppable Component'
            }, {
                key: 'sortable',
                label: 'The Sortable Component'
            }, {
                key: 'contextual',
                label: 'As contextual components'
            }, {
                key: 'sortableHTML',
                label: 'Sorting manually entered HTML'
            }, {
                key: 'multiple',
                label: 'Multiple sortable lists'
            }]
        });
    },

    actions: {
        showOption(key) {
            this.get('dragDropService').reset();
            this.set('currentModel.currentOption', key);
        }
    }
});
