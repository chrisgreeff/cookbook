/*global YUI*/
YUI.add('cb-wallet', function (Y) {
    'use strict';

    var Lang = Y.Lang,
        CardList = Y.CB.CardList,
        CardListView = Y.CB.CardListView;

    Y.namespace('CB').Wallet = Y.Base.create('cb-wallet', Y.Model, [], {}, {

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
                    var result;

                    if (typeof value === 'object') {
                        result = value;
                    } else if (typeof value === 'string') {
                        result = new Date(value);
                    } else {
                        result = Y.Attribute.INVALID_VALUE;
                    }

                    return result;
                },

                valueFn: function() {
                    return new Date();
                }
            },

            _cardListView: {}

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model',
        'cb-card-list'
    ]
});
