/*global YUI*/
YUI.add('cb-card-list', function (Y) {
    'use strict';

    Y.namespace('CB').CardList = Y.Base.create('cb-card-list', Y.ModelList, [], {
        model: Y.CB.Card,

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
