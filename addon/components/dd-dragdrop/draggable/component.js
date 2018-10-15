import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import JPMABaseMixin from '../../mixins/jpma-base';
import layout from '../../templates/components/dd-dragdrop/draggable';

export default Component.extend(JPMABaseMixin, {
    layout,
    classNames: ['dd-draggable'],
    classNameBindings: ['grabbed:dd-dragging'],
    attributeBindings: ['tabindex', 'isDraggable:draggable', 'ariaGrabbed:aria-grabbed', 'ariaDropEffect:aria-dropeffect', 'role'],
    tabindex: '-1',
    isDraggable: true,
    ariaDropEffect: 'move',
    isSortable: 'true',

    dragDropService: inject('dd-dragdropservice'),

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
        switch (event.originalEvent.keyCode) {
        case this.get('keyNamesToCodes')['SPACE']:
            this.attemptGrab(event);
            event.preventDefault();
            break;
        }
    },

    _keyEventsToPerfromWhenGrabbed(event) {
        switch (event.originalEvent.keyCode) {
        case 'KeyM':
            this.doDrop();
            break;
        case this.get('keyNamesToCodes')['ESC']:
            this.cancelDrag();
            break;
        case this.get('keyNamesToCodes')['UP_ARROW']:
            this.get('dragDropService').shift('up');
            break;
        case this.get('keyNamesToCodes')['DOWN_ARROW']:
            this.get('dragDropService').shift('down');
            break;
        case this.get('keyNamesToCodes')['LEFT_ARROW']:
            this.get('dragDropService').transfer(this, 'left');
            break;
        case this.get('keyNamesToCodes')['RIGHT_ARROW']:
            this.get('dragDropService').transfer(this, 'right');
            break;
        case this.get('keyNamesToCodes')['TAB']:
            this.set('grabbed', false);
            break;
        }
    },

    _keyEventsToPerformWhenNotGrabbed(event) {
        switch (event.originalEvent.keyCode) {
        case this.get('keyNamesToCodes')['UP_ARROW']:
            this.get('dragDropService').navigate(this, 'up');
            break;
        case this.get('keyNamesToCodes')['DOWN_ARROW']:
            this.get('dragDropService').navigate(this, 'down');
            break;
        case this.get('keyNamesToCodes')['LEFT_ARROW']:
            this.get('dragDropService').navigate(this, 'left');
            break;
        case this.get('keyNamesToCodes')['RIGHT_ARROW']:
            this.get('dragDropService').navigate(this, 'right');
            break;
        }
    },

    _preventDefaultUnlessTab(event) {
        const tab = event.originalEvent.keyCode === this.get('keyNamesToCodes')['TAB'];
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

    doDrop(event) {
        this.set('grabbed', false);
        this.get('dragDropService').drop();
    },

    cancelDrag() {
        this.set('grabbed', false);
        this.get('dragDropService').set('draggedObject', null);
    }
});
