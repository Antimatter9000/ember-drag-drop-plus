import Ember from 'ember';
import layout from '../../templates/components/dd-dragdrop/droppable';

export default Ember.Component.extend({
    layout,
    classNames: ['dd-droppable'],
    classNameBindings: ['isCurrentDropTarget:dd-droptarget'],
    attributeBindings: ['tabindex', 'ariaLive:aria-live', 'ariaDropEffect:aria-dropeffect'],
    tabindex: '0',
    content: 'This content will be replaced',
    contentType: 'html',
    dragDropService: Ember.inject.service('dd-dragdropservice'),

    isCurrentDropTarget: false,
    replaceContent: false,
    title: null,

    ariaLive: 'polite',
    ariaDropEffect: 'move',

    init() {
        this._super();
        this.get('dragDropService')
            .get('scopedDropTargets')
            .push(this);
    },

    focusIn() {
        this._setDropTarget(true);
        if (this.get('tabindex') === '0') {
            this.$('.dd-draggable:first-of-type').focus();
        }
    },

    dragEnter(event) {
        this._setDropTarget(true);
        event.preventDefault();
    },

    dragOver(event) {
        this._setDropTarget(true);
        event.preventDefault();
    },

    dragLeave(event) {
        // dragLeave is also triggered when dragging over child elements.
        // We don't want the event triggered then so we check for outOfElement.
        const outOfElement = !this.get('dragDropService').isOverElement(event, this);
        if (outOfElement) {
            this._setDropTarget(false);
        }
        event.preventDefault();
    },

    drop(event) {
        this.get('dragDropService').drop();
        this._setDropTarget(false);
        event.preventDefault();
    },

    _setDropTarget(bool) {
        const dropTarget = bool ? this : null;
        this.get('dragDropService').setDropTarget(dropTarget);
    },

    focusOut() {
        this._toggleTabindex();
    },

    _toggleTabindex() {
        Ember.run.next(() => {
            const i = this.get('tabindex') === '0' ? '-1' : '0';
            this.set('tabindex', i);
        });
    },

    actions: {
        draggableFocussed() {
            Ember.run.next(() => {
                if (this.get('tabindex') !== '-1') {
                    this.set('tabindex', '-1');
                }
                this._setDropTarget(true);
            });
        }
    }
});
