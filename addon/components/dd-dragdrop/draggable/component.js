import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import layout from './template';

export default Component.extend({
    layout,
    classNames: ['dd-draggable'],
    classNameBindings: ['grabbed:dd-dragging'],
    attributeBindings: ['tabindex', 'isDraggable:draggable', 'ariaGrabbed:aria-grabbed', 'ariaDropEffect:aria-dropeffect', 'role'],
    tabindex: '-1',
    isDraggable: true,
    ariaDropEffect: 'move',
    isSortable: 'true',

    dragDropService: inject('dd-service'),

    grabbed: false,

    ariaGrabbed: computed('grabbed', function() {
        return this.get('grabbed') ? 'true' : 'false';
    }),

    contentType: 'data',
    content: computed('contentType', function() {
        if (this.get('contentType') === 'html') {
            return this.$();
        }
        if (this.get('contentType') === 'data') {
            return null; // this should be set in the parent
        }
        return null;
    }),

    indexInList: computed('parentView.sortableObjectList', function() {
        const parent = this.get('parentView');
        const list = parent.get('sortableObjectList');
        return parent.get('contentType') === 'data'
            ? list.indexOf(this.get('content'))
            : list.indexOf(this.$()[0]);
    }),

    mouseDown(event) {
        this.attemptGrab(event);
    },

    dragStart(event) {
        // the dataTransfer object isn't actually used but firefox won't
        // recognise the drag event if this has not been set
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/javascript', this.get('content'));
    },

    dragEnd(event) {
        event.preventDefault();
    },

    focusIn(event) {
        if (!this.$('.dd-draggable:focus')) {
            this.$().trigger('focus');
        }
        this.sendAction('draggableFocussed');

        // prevent a stack overflow
        event.stopImmediatePropagation();
    },

    // focusOut(event) {
    //     // this.set('grabbed', false);
    // },

    keyDown(event) {
        this._keyEventsToPerformRegardless(event);
        if (this.get('grabbed')) {
            this._keyEventsToPerfromWhenGrabbed(event);
        } else {
            this._keyEventsToPerformWhenNotGrabbed(event);
        }
        this._preventDefaultUnlessTab(event);
        this.sendAction('keyPressed', this, event);
    },

    _keyEventsToPerformRegardless(event) {
        switch (event.originalEvent.code) {
        case 'Space':
            this.attemptGrab(event);
            event.preventDefault();
            break;
        }
    },

    _keyEventsToPerfromWhenGrabbed(event) {
        switch (event.originalEvent.code) {
        case 'KeyM':
            this.doDrop();
            break;
        case 'Escape':
            this.cancelDrag();
            break;
        case 'ArrowUp':
            this.get('dragDropService').shift('up');
            break;
        case 'ArrowDown':
            this.get('dragDropService').shift('down');
            break;
        case 'ArrowLeft':
            this.get('dragDropService').transfer(this, 'left');
            break;
        case 'ArrowRight':
            this.get('dragDropService').transfer(this, 'right');
            break;
        case 'Tab':
            this.set('grabbed', false);
            break;
        }
    },

    _keyEventsToPerformWhenNotGrabbed(event) {
        switch (event.originalEvent.code) {
        case 'ArrowUp':
            this.get('dragDropService').navigate(this, 'up');
            break;
        case 'ArrowDown':
            this.get('dragDropService').navigate(this, 'down');
            break;
        case 'ArrowLeft':
            this.get('dragDropService').navigate(this, 'left');
            break;
        case 'ArrowRight':
            this.get('dragDropService').navigate(this, 'right');
            break;
        }
    },

    _preventDefaultUnlessTab(event) {
        const tab = event.originalEvent.code === 'Tab';
        if (!(event.shiftKey || tab)) {
            event.preventDefault();
        }
    },

    attemptGrab(event) {
        // if (this.get('grabbed')) {
        //     this.doDrop();
        // } else {
        //     this.get('dragDropService').grabObject(this);
        // }
        this.get('dragDropService').attemptGrab(this, event);
    },

    doDrop() {
        this.set('grabbed', false);
        this.get('dragDropService').drop();
    },

    cancelDrag() {
        this.set('grabbed', false);
        this.get('dragDropService').set('draggedObject', null);
    }
});
