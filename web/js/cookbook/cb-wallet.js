/*global YUI*/
YUI.add('cb-wallet', function (Y) {
    'use strict';

    Y.namespace('CB').Wallet = Y.Base.create('cb-wallet', Y.Model, [], {}, {

        ATTRS: {

            /**
             * The list of cards that belong to in the wallet.
             *
             * @attribute cards
             * @type {Array}
             */
            cards: {},

            /**
             * The date of the wallet
             *
             * @attribute date
             * @type {Date | String}
             */
            date: {}

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model'
    ]
});
