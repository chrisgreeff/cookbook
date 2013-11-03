/*global YUI*/
YUI.add('cb-wallet-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        CB = Y.CB,
        Card = CB.Card,
        CardView = CB.CardView,
        CardListView = CB.CardListView,
        Wallet  = CB.Wallet,

        _renderWalletList,

        CLASS_NAMES = {
            card: 'cb-card',
            cardContainer: 'cb-card-container',
            newCard: 'cb-card-new',
            wallet: 'cb-wallet',
            walletList: 'cb-wallet-list'
        };

    _renderWalletList = Micro.compile(
        '<ul class="' + CLASS_NAMES.walletList + '">' +
            '<li class="' + CLASS_NAMES.cardContainer + '"></li>' +
            '<% Y.Array.each(this.wallets, function(wallet) { %>' +
                '<li class="' + CLASS_NAMES.wallet + '" data-date="<%= wallet.date %>"></li>' +
            '<% }); %>' +
        '</ul>'
    );

    Y.namespace('CB').WalletListView = Y.Base.create('cb-wallet-list-view', Y.View, [], {

        initializer: function () {
            this.get('modelList').after(['add', 'remove', 'reset'], this.render, this);

            Y.one(Y.config.win).on('keydown', this._activateNewCardNode, this);
        },

        render: function () {
            var container = this.get('container'),
                walletList = this.get('modelList'),
                newCardView;

            container.setHTML(_renderWalletList({
                wallets: walletList.toJSON()
            }));

            // Create and render the new card view.
            newCardView = new CardView({
                model: new Card({
                    content: 'New Card',
                    type: 'new'
                }),
                container: container.one('.' + CLASS_NAMES.cardContainer)
            });

            newCardView.render();

            // Create and render the card list view for each wallet
            walletList.each(function (wallet) {
                var walletContainer = container.one('li[data-date="' + wallet.get('date') + '"]'),
                    cardListView;

                cardListView = new CardListView({
                    modelList: wallet.get('cards'),
                    container: walletContainer
                });

                cardListView.render();
            });

            return this;
        }

        // ----------------------------------------------------------
        // ==================== Private Functions ===================
        // ----------------------------------------------------------

        // ----------------------------------------------------------
        // ===================== Event Handlers =====================
        // ----------------------------------------------------------

        /**
         * Switches the new note card to edit mode.
         *
         * @private
         * @method _activateNewCardNode
         * @param  {Event} click or keyboard event
         */
        _activateNewCardNode: function (event) {
            if (event.keyCode === KEY_CODES.n && event.shiftKey) {
                event.preventDefault();
                this._switchToEditMode(Y.one('.' + CLASS_NAMES.newCard));
            }
        }

    }, {

        ATTRS: {

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'view',
        'template',
        'cb-card',
        'cb-card-view',
        'cb-card-list-view',
        'cb-wallet'
    ]
});
