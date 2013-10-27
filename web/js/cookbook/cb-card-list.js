/*global YUI*/
YUI.add('cb-card-list', function (Y) {
    'use strict';

    Y.namespace('CB').CardList = Y.Base.create('cb-card-list', Y.ModelList, [], {

        model: Y.CB.Card,

        updateCardContent: function (card, content) {
            var index = this.indexOf(card);

            this.remove(card, {
                silent: true
            });

            card.set('content', content);
            card.set('dateLastEdited', Date.now());

            this.add(card, {
                index: index,
                silent: true
            });
        },

        comparator: function (model) {
            return model.get('dateCreated');
        },

        _compare: function (a, b) {
            return a < b ? 1 : (a > b ? -1 : 0);
        }

    }, {

        ATTRS: {
            mode: {}
        }

    });

}, '1.0.0', { requires: ['base', 'model-list', 'cb-card'] });
