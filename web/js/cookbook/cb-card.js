/*global YUI*/
YUI.add('cb-card', function (Y) {
    'use strict';

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
            dateLastEdited: {},

            /**
             * The date the card was created.
             *
             * @attribute dateCreated
             * @type {Date}
             */
            dateCreated: {
                writeOnce: 'initOnly'
            }

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model'
    ]
});
