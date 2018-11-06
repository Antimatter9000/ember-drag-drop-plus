export default {
    name: 'hc-dragdrop',
    availableSince: '',
    description: 'This is the hc-dragdrop component',

    features: [{
        type: 'code',
        title: 'Using these components',
        items: [{
            title: 'The components',
            type: 'note',
            value: `
hc-dragdrop provides a suite of components that can be used for drag and drop operations. The components are ADA compliant and therefore can be controlled with the keyboard as well as the mouse.

The components include:

<strong>hc-dragdrop/draggable:</strong> A component that can be moved from its original location and dropped in the hc-dragdrop droppable components.
<strong>hc-dragdrop/droppable:</strong> A component that can act as a drop zone for the hc-dragdrop/draggable component
<strong>hc-dragdrop/sortable:</strong> A type of droppable component, the contents of which can be sorted based on the position of the draggable component.

The components can also be contextual, which provides a scope in which components can be moved as well as a shorthand for including the components in your templates.
`
        }, {
            title: 'Using the components separately',
            type: 'hbs',
            value: `
{{#hc-dragdrop/draggable}}
    Draggable Content
{{/hc-dragdrop/draggable}}

{{hc-dragdrop/droppable title="Drop Zone"}}
`
        }, {
            title: 'Using the components as contextual components',
            type: 'hbs',
            value: `
{{#hc-dragdrop as |dd|}}
    {{#dd.sortable
        sortableObjectList=model.sortableObjects}}
            {{#each model.sortableObjects as |item|}}
                {{#dd.draggable
                    content=item}}
                        {{item.name}}
                {{/dd.draggable}}
            {{/each}}
    {{/dd.sortable}}

    {{#dd.sortable
        sortableObjectList=model.sortableObjects2"}}
            {{#each model.sortableObjects2 as |item|}}
                {{#dd.draggable
                    content=item}}
                        {{item.name}}
                {{/dd.draggable}}
            {{/each}}
    {{/dd.sortable}}
{{/hc-dragdrop}}
`
        }]
    }, {
        type: 'code',
        title: 'Component properties',
        items: [{
            title: 'hc-dragdrop/draggable',
            type: 'note',
            value: `
<table class="docs-table">
    <thead>
        <th style="width:15%;">Property</th>
        <th style="width:10%;">Type</th>
        <th style="width:20%;">Default</th>
        <th style="width:55%;">Description</th>
    </thead>
    <tbody>
        <tr>
            <td>contentType</td>
            <td>String</td>
            <td>'html'</td>
            <td>Determines whether the component will be used for transferring html or data.</td>
        </tr>
        <tr>
            <td>content</td>
            <td>Object</td>
            <td>this.$()</td>
            <td>The content stored by the component. This defaults to the jQuery object for the components itself, but can be set as any other content.</td>
        </tr>
    </tbody>
</table>
`
        }, {
            title: 'hc-dragdrop/droppable',
            type: 'note',
            value: `
<table class="docs-table">
    <thead>
        <th style="width:15%;">Property</th>
        <th style="width:10%;">Type</th>
        <th style="width:20%;">Default</th>
        <th style="width:55%;">Description</th>
    </thead>
    <tbody>
        <tr>
            <td>contentType</td>
            <td>String</td>
            <td>'html'</td>
            <td>Determines whether the component will receive html or data.</td>
        </tr>
        <tr>
            <td>content</td>
            <td>String</td>
            <td>'This content will be replaced'</td>
            <td>Placeholder content.</td>
        </tr>
        <tr>
            <td>replaceContent</td>
            <td>Boolean</td>
            <td>false</td>
            <td>Determines whether content currently in the droppable component will be replaced or appended to</td> 
        </tr>
        <tr>
            <td>title</td>
            <td>String</td>
            <td>null</td>
            <td>Provides a title for the component which cannot be overwritten by the draggable components</td>
        </tr>
    </tbody>
</table>
`
        }, {
            title: 'hc-dragdrop/sortable',
            type: 'note',
            value: `
The sortable component is an extension of the droppable component and therefore has all the same properties.

The main differences between the sortable and droppable components is that the sortable component's <strong>contentType</strong> property defaults to 'data' and it triggers the dragdropservice's 'sort' method on dragOver.     
`       }]
    }, {
        type: 'code',
        title: 'Keyboard navigation',
        items: [{
            title: 'Keyboard controls',
            type: 'note',
            value: `
Drag and drop functions can be controlled using the keyboard:

<strong>Tab</strong> will select through the components as normal. If a component has been 'grabbed' then it will cancel the grab and select the next component.
<strong>Spacebar</strong> will 'grab' the draggable component that has focus, or will 'drop' the component if one is already grabbed.
<strong>The 'Up' and 'Down' Arrows</strong> will move the grabbed component up or down one place in the current sortable list.
<strong>The 'Left' and 'Right' Arrows</strong> will move the grabbed component into the next or previous sortable list contained within the dragdrop component.
`
        }]
    }],

    otherNotes: [],

    hashtags: '',

    status: {
        qa: false,
        ada: false,
        deprecated: false
    },

    issues: {
        count: 0,
        list: []
    },

    featurerequests: {
        count: 0,
        list: []
    }
}