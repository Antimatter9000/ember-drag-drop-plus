import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  sortableObjects: Ember.A([
    {id: 1, name:'one'},
    {id: 2, name:'two'},
    {id: 3, name:'three'},
    {id: 4, name:'four'},
    // {id: 5, name:'five'}
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

  actions: {
    keyPressed(cpnt, event) {
      event.stopImmediatePropagation();
    }
  }
});
