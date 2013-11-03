/*global YUI*/
YUI.add('cb-card-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Card  = Y.CB.Card,

        _renderCard,

        CLASS_NAMES = {
            card: 'cb-card'
        };

    _renderCard = Micro.compile(
        '<div tabindex="0" class="' + CLASS_NAMES.card + '">' +
            '<%== this.content %>' +
        '</div>'
    );

    Y.namespace('CB').CardView = Y.Base.create('cb-card-view', Y.View, [], {

        initializer: function () {

        },

        render: function () {
            this.get('container').setHTML(_renderCard(this.get('model').toJSON()));

            return this;
        }

        // ----------------------------------------------------------
        // ==================== Private Functions ===================
        // ----------------------------------------------------------


        // ----------------------------------------------------------
        // ===================== Event Handlers =====================
        // ----------------------------------------------------------


    }, {

        ATTRS: {
            /**
             * The first character of the line being edited
             *
             * @attribute firstChar
             * @type {String}
             */
            firstChar: {
                value: null
            }
        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'event-outside',
        'node-event-simulate',
        'view',
        'yui-later',
        'template'
    ]
});
