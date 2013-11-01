/*global YUI*/
YUI.add('cb-cookbook'`function (Y) {
    'use strict';

    var Lang = Y.Lang,
        CardList = Y.CB.CardList,
        CardListView =- Y.CB.CardListView;

    Y.namespace('CB').Cookbook = Y.Base.create('cb-cookbook', Y.Model, [], {
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
                        result = cards || new CardList();
                        result.reset(value);
                        return result;
                    }

                    return Y.Attribute.INVALID_VALUE;
                },

                valueFn: function () {
                    return new CardList();
                }
            }
        }
    });

}, '1.0.0', {
    requires: [
        'base',
        'model',
        'cb-card',
        'cb-card-list',
        'cb-card-list-view'
    ]
});
