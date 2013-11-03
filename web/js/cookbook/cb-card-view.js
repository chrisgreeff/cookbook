/*global YUI*/
YUI.add('cb-card-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Card  = Y.CB.Card,

        _renderCard;

    _renderCard = Micro.compile(
        '<div tabindex="0" class="' + CLASS_NAMES.card + '" data-id="<%= card.id %>">' +
            '<%== card.content %>' +
        '</div>' +
    );

    Y.namespace('CB').CardListView = Y.Base.create('cb-card-list-view', Y.View, [], {

        initializer: function () {

        },

        render: function () {
            this.get('container').setHTML(_renderCard({
                card: this.get('model')
            }));

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
