/*global YUI*/
YUI.add('cb-wallet-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Wallet  = Y.CB.Wallet,
        CardListView = Y.CB.CardListView,

        _renderWalletList,

        CLASS_NAMES = {
            card: 'cb-card',
            cardContainer: 'cb-card-container',
            newCard: 'cb-new-card',
            wallet: 'cb-wallet',
            walletList: 'cb-wallet-list'
        };

    _renderWalletList = Micro.compile(
        '<ul class="' + CLASS_NAMES.walletList + '">' +
            '<li class="' + CLASS_NAMES.cardContainer + '">' +
                '<div class="' + CLASS_NAMES.card + ' ' + CLASS_NAMES.newCard + '">' +
                    'New Card' +
                '</div>' +
            '</li>' +
            '<% Y.Array.each(this.wallets, function(wallet) { %>' +
                '<li class="' + CLASS_NAMES.wallet + '" data-date="<%= wallet.date %>"></li>' +
            '<% }); %>' +
        '</ul>'
    );


    Y.namespace('CB').WalletListView = Y.Base.create('cb-wallet-list-view', Y.View, [], {

        initializer: function () {
            this.get('modelList').after(['add', 'remove', 'reset'], this.render, this);
        },

        render: function () {
            var container = this.get('container'),
                walletList = this.get('modelList'),
                walletListNode;

            container.setHTML(_renderWalletList({
                wallets: walletList.toJSON()
            }));

            walletList.each(function (wallet) {
                var cardContainer = container.one('li[data-date="' + wallet.get('date') + '"]'),
                    cardListView;

                cardListView = new CardListView({
                    modelList: wallet.get('cards'),
                    container: cardContainer
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

    }, {

        ATTRS: {

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'view',
        'template',
        'cb-wallet'
    ]
});
