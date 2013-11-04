/*global YUI*/
YUI.add('cb-wallet', function (Y) {
    'use strict';

    var Lang = Y.Lang,
        CardList = Y.CB.CardList,
        CardListView = Y.CB.CardListView;

    Y.namespace('CB').Wallet = Y.Base.create('cb-wallet', Y.Model, [], {

        initializer: function () {
            var cardList,
                cardListView;

            // Create Model List
            // @todo this will need to be retrieved and build from a database (local storage).
            cardList = new CardList();

            // Build the view with the card list restrieved.
            cardListView = new CardListView({
                modelList: cardList,
                container: Y.one('.cb-card-list')
            });

            cardListView.render();
        }

    }, {

        ATTRS: {

            /**
             * The list of cards that belong to in the wallet.
             *
             * @attribute cards
             * @type {CardList}
             */
            cards: {
                setter: function (value) {
                    var cards,
                        result;

                    cards = this.get('cards');

                    // If the value passed is already an instance of CardList, destroy the existing and use the
                    // one passed.
                    if (value instanceof CardList) {
                        if (cards) {
                            cards.destroy();
                        }
                        return value;
                    }

                    // Otherwise reset the CardList with the values passed.
                    if (Lang.isObject(value)) {
                        if (cards) {
                            return cards.reset({
                                items: value
                            });
                        } else {
                            return new CardList({
                                items: value
                            });
                        }
                    }

                    return Y.Attribute.INVALID_VALUE;
                },

                valueFn: function () {
                    return new CardList();
                }
            },

            /**
             * The date of the wallet
             *
             * @attribute date
             * @type {Date | String}
             */
            date: {
                setter: function (value) {
                    if (typeof value === 'object') {
                        return value;
                    } else if (typeof value === 'string') {
                        return new Date(value);
                    } else {
                        return Y.Attribute.INVALID_VALUE;
                    }
                },

                valueFn: function() {
                    return new Date();
                }
            }

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model',
        'cb-card-list',
        'cb-card-list-view'
    ]
});
