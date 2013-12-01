/*global YUI*/
YUI.add('cb-card', function (Y) {
    'use strict';

    var Lang = Y.Lang;

    Y.namespace('CB').Card = Y.Base.create('cb-card', Y.Model, [], {}, {

        ATTRS: {

            /**
             * The content of the card.
             *
             * @attribute content
             * @type {HTML | String}
             */
            content: {},

            /**
             * The last edited date of the card.
             *
             * @attribute dateLastEdited
             * @type {Date}
             */
            dateLastEdited: {
                setter: function (value) {
                    return Lang.isDate(value) ? value :  new Date(value);
                }
            },

            /**
             * The date the card was created.
             *
             * @attribute dateCreated
             * @type {Date}
             */
            dateCreated: {
                setter: function (value) {
                    return Lang.isDate(value) ? value :  new Date(value);
                },
                writeOnce: 'initOnly'
            },

            /**
             * The wallet id this card belongs to.
             *
             * @attribute wallet
             * @type {String}
             */
            wallet: {}

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model'
    ]
});
