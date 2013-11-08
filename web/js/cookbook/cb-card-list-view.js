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

        render: function () {
            var container = this.get('container'),
                cardList = this.get('modelList'),
                cardViewList = this.get('cardViewList');

            container.setHTML(_renderCardList({
                cards: cardList.toJSON()
            }));

            if (cardViewList) {
                cardViewList.each(function (cardView) {
                    cardView.destroy();
                });
            }

            cardViewList = [];

            cardList.each(function (card) {
                // var newCardView = this.get('newCardView'),
                //     newCardModel;

                // if (newCardView) {
                //     newCardView.destroy();
                //     this.get('newCardModel').destroy();
                // }

                // newCardModel = new Card({
                //     content: 'New Card',
                //     type: 'new'
                // });
                // this.set('newCardModel', newCardModel);

                // // Create and render the new card view.
                // newCardView = new CardView({
                //     model: newCardModel,
                //     container: this.get('container').one('.' + CLASS_NAMES.cardContainer)
                // });
                // this.set('newCardView', newCardView);
                // newCardView.render();

                var cardContainer = container.one('li[data-id="' + card.get('id') + '"]'),
                    cardView;

                cardView = new CardView({
                    model: card,
                    container: cardContainer
                });

                cardViewList.push(cardView);

                cardView.render();
            });

            this.set('cardViewList', cardViewList);

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

    }, {
        ATTRS: {
            cardViewList: {}
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
