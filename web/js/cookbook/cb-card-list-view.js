/*global YUI*/
YUI.add('cb-card-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Card  = Y.CB.Card,
        CardView = Y.CB.CardView,

        _renderCardList,

        CLASS_NAMES = {
            cardList: 'cb-card-list',
            cardContainer: 'cb-card-container'
        };

    _renderCardList = Micro.compile(
        '<ul class="' + CLASS_NAMES.cardList + '">' +
            '<% Y.Array.each(this.cards, function(card) { %>' +
                '<li class="' + CLASS_NAMES.cardContainer + '" data-id="<%= card.id %>"></li>' +
            '<% }); %>' +
        '</ul>'
    );

    Y.namespace('CB').CardListView = Y.Base.create('cb-card-list-view', Y.View, [], {

        initializer: function () {
            this.get('modelList').after(['add', 'remove', 'reset'], this.render, this);
        },

        render: function () {
            var container = this.get('container'),
                cardList = this.get('modelList');

            container.setHTML(_renderCardList({
                cards: cardList.toJSON()
            }));

            cardList.each(function (card) {
                var cardContainer = container.one('li[data-id="' + card.get('id') + '"]'),
                    cardView;

                cardView = new CardView({
                    model: card,
                    container: cardContainer
                });

                cardView.render();
            });

            return this;
        },

        // ----------------------------------------------------------
        // ==================== Private Functions ===================
        // ----------------------------------------------------------

        /**
         * Ensures the last edited card is at the top of the list when rendered.
         *
         * @private
         * @method _sortCardList
         */
        _sortCardList: function () {
            this.get('modelList').sort({
                decending: true
            });
        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'event-outside',
        'node-event-simulate',
        'view',
        'yui-later',
        'template',
        'cb-card-list',
        'cb-card-view'
    ]
});
