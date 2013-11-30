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

        /**
         * Updates the card's content with that passed.
         *
         * @method updateCardContent
         * @param  {Model} card The card to update.
         * @param  {HTML | String} content The content you are updated the card with
         */
        updateCardContent: function (card, content) {
            var index = this.indexOf(card);

            this.remove(card, {
                silent: true
            });

            if (content) {
                card.set('content', content);
                card.set('dateLastEdited', new Date());

                this.add(card, {
                    index: index,
                    silent: true
                });
            }
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
