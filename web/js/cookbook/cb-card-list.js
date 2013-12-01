/*global YUI*/
YUI.add('cb-card-list', function (Y) {
    'use strict';

    Y.namespace('CB').CardList = Y.Base.create('cb-card-list', Y.ModelList, [], {
        model: Y.CB.Card,

        /**
         * Returns all the cards that belong to a specified wallet.
         *
         * @method getByWalletId
         * @param  {String} walletId The id of the specified wallet.
         * @return {Array} The list of cards that belong to the specified wallet.
         */
        getByWalletId: function (walletId) {
            var cards = [];

            this.each(function (card) {
                if (card.get('wallet') === walletId) {
                    cards.push(card.toJSON());
                }
            });

            return cards;
        },

        // Sorting by dateLastEdited when modelList.sort() is called.
        comparator: function (model) {
            return model.get('dateLastEdited');
        },

        _compare: function (a, b) {
            return a < b ? 1 : (a > b ? -1 : 0);
        }

    }, {

        ATTRS: {

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model-list',
        'cb-card'
    ]
});
