/*global YUI*/
YUI.add('cb-cookbook', function (Y) {
    'use strict';

    var Lang = Y.Lang,
        CardList = Y.CB.CardList;

    Y.namespace('CB').Cookbook = Y.Base.create('cb-cookbook', Y.Model, [], {
        initializer: function () {
            var cardList,
                cardListView;

            // Create Model List
            cardList = new Y.CB.CardList();

            cardListView = new Y.CB.CardListView({
                modelList: cardList,
                container: Y.one('#body')
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

                    if (value instanceof CardList) {
                        if (cards) {
                            cards.destroy();
                        }
                        return value;
                    }

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

}, '1.0.0', { requires: ['base', 'model', 'node-base', 'cb-card', 'cb-card-list', 'cb-card-list-view'] });
