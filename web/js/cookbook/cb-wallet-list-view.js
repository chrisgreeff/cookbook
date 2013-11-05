/*global YUI*/
YUI.add('cb-wallet-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        CB = Y.CB,
        Card = CB.Card,
        CardView = CB.CardView,
        CardList = CB.CardList,
        CardListView = CB.CardListView,
        Wallet  = CB.Wallet,

        _renderWalletList,

        CLASS_NAMES = {
            card: 'cb-card',
            cardContainer: 'cb-card-container',
            newCard: 'cb-card-new',
            wallet: 'cb-wallet',
            walletList: 'cb-wallet-list'
        },

        KEY_CODES = {
            n: 78
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
        },

        render: function () {
            console.log('Rendering wallet list');
            var container = this.get('container'),
                walletList = this.get('modelList'),
                newCardModel = this.get('newCardModel'),
                newCardView;

            container.setHTML(_renderWalletList({
                wallets: walletList.toJSON()
            }));

            if (newCardModel) {
                newCardModel.destroy();
            }

            newCardModel = new Card({
                content: 'New Card',
                type: 'new'
            });

            this.set('newCardModel', newCardModel);

            // Create and render the new card view.
            newCardView = new CardView({
                model: newCardModel,
                container: container.one('.' + CLASS_NAMES.cardContainer)
            });
            newCardView.render();

            // Create and render the card list view for each wallet
            walletList.each(function (wallet) {
                var walletNode = container.one('li[data-date="' + wallet.get('date') + '"]'),
                    cardListView;

                cardListView = new CardListView({
                    modelList: wallet.get('cards'),
                    container: walletNode
                });

                cardListView.render();
            });

            this._attachViewModeEventHandlers();

            return this;
        },

        // ----------------------------------------------------------
        // ==================== Private Functions ===================
        // ----------------------------------------------------------

        /**
         * Attaches all event handlers necessary for view mode to be active
         *
         * @private
         * @method _attachViewModeEventHandlers
         */
        _attachViewModeEventHandlers: function () {
            console.log('attaching view mode event handlers on the wallet list container');
            var container = this.get('container');

            container.delegate('mousedown', this._toggleCheckbox, '.' + CLASS_NAMES.cardTodoCheckbox, this);
            container.delegate('click', this._activateCardForEditing, '.' + CLASS_NAMES.card, this);
            Y.one(Y.config.win).on('keydown', this._checkKeydownForNewCardActivation, this);
        },

        /**
         * Detaches all custom event handlers for view mode
         *
         * @private
         * @method _detachViewModeEventHandlers
         */
        _detachViewModeEventHandlers: function () {
            console.log('detaching view mode event handlers on the wallet list container');
            var container = this.get('container');

            container.detach('click');
            container.detach('mousedown');
        },

        /**
         * Updates the card model, and re-organizes the model structure so the newly added card belongs to the
         * correct wallet.
         *
         * @method _saveCard
         * @param  {Card} card Card to update
         */
        _saveCard: function (card) {
            console.log('Saving card into latest wallet: ' + card.get('id'));
            var walletList = this.get('modelList'),
                latestWallet = walletList.item(0),
                now = new Date(),
                todaysWallet,
                todaysCardList;

            // Latest wallet is not todays wallet, so create one for today.
            if (this._formatDate(latestWallet.get('date')) !== this._formatDate(now)) {
                todaysCardList = new CardList();
                todaysWallet = new Wallet({
                    cards: todaysCardList,
                    date: now
                });

                walletList.add(todaysWallet, {
                    silent: true
                });
            } else {
                todaysWallet = latestWallet;
                todaysCardList = latestWallet.get('cards');
            }

            if (card.get('type') === 'new') {
                todaysCardList.add(new Card({
                    id: Y.guid(),
                    content: card.get('content'),
                    dateCreated: now,
                    dateLastEdited: now
                }));
            } else {
                card.lists[0].remove(card, {
                    silent: true
                });
                todaysCardList.add(card, {
                    silent: true
                });
            }

            console.log('detaching activeChange on card: ' + card.get('id'));
            card.detach('activeChange');

            this._sortWalletList();
        },

        /**
         * Ensures todays wallet is at the top of the list when rendered.
         *
         * @private
         * @method _sortWalletList
         */
        _sortWalletList: function () {
            console.log('Sorting wallet list');
            this.get('modelList').sort({
                decending: true
            });
        },

        /**
         * Returns formatted date string.
         *
         * @private
         * @method _formatDate
         * @param {Date} date object
         * @returns {String} formatted date
         */
        _formatDate: function (date) {
            var year = date.getUTCFullYear(),
                month = date.getUTCMonth(),
                day = date.getUTCDay();

            return day + '/' + month + '/' + year;
        },

        // ----------------------------------------------------------
        // ===================== Event Handlers =====================
        // ----------------------------------------------------------

        /**
         * Determines which card node was clicked for edit
         *
         * @eventHandler
         * @method _activateCardForEditing
         * @param  {Event} click event
         */
        _activateCardForEditing: function (event) {
            var targetNode = event.target,
                cardContainerClass = CLASS_NAMES.cardContainer,
                walletDate,
                cardContainerNode,
                cardId,
                card;

            this._detachViewModeEventHandlers();

            if (!targetNode.hasClass(CLASS_NAMES.cardTodoCheckbox)) {
                cardContainerNode = targetNode.hasClass(cardContainerClass) ? targetNode : targetNode.ancestor('.' + cardContainerClass);
            }

            cardId = cardContainerNode.getData('id');

            // If there is no card id, the New Card node was clicked. Therefore active the new card model instance.
            if (!cardId) {
                card = this.get('newCardModel');
            } else {
                walletDate = targetNode.ancestor('.' + CLASS_NAMES.wallet).getData('date');
                card = this.get('modelList').getWalletByDate(walletDate).get('cards').getById(cardId);
            }

            console.log('attaching activeChange on card: ' + card.get('id'));
            card.after('activeChange', this._checkActiveChangeSource, this);
            console.log('Activating card from wallet list for edit: ' + card.get('id'));
            card.set('active', true, {
                fromWalletListView: true
            });
        },

        /**
         * Toggles the state of the checkbox
         *
         * @eventHandler
         * @method _toggleCheckbox
         * @param  {Event} click event
         */
        _toggleCheckbox: function (event) {
            var checkboxNode = event.target;

            checkboxNode.toggleClass(CLASS_NAMES.iconUnchecked);
            checkboxNode.toggleClass(CLASS_NAMES.iconChecked);

            // This is to prevent the checkbox from toggling twice, as the event bubbles from the card container,
            // and fires twice.
            event.stopImmediatePropagation();
        },

        /**
         * Checked the keydown event for new card activation.
         *
         * @private
         * @method _checkKeydownForNewCardActivation
         * @param  {Event} keydown event
         */
        _checkKeydownForNewCardActivation: function (event) {
            if (event.keyCode === KEY_CODES.n && event.shiftKey) {
                event.preventDefault();
                this.get('newCardModel').set('active', true);
            }
        },

        _checkActiveChangeSource: function (event) {
            if (!event.fromWalletListView) {
                this._saveCard(event.currentTarget);
            }
        }

    }, {

        ATTRS: {
            newCardModel: {}
        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'view',
        'template',
        'cb-card',
        'cb-card-view',
        'cb-card-list',
        'cb-card-list-view',
        'cb-wallet'
    ]
});
