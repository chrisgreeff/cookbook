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
            this.get('newCardModel').after('contentChange', this._saveNewCard, this);
            this._attachViewModeEventHandlers();
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
                model: this.get('newCardModel'),
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
            var container = this.get('container');

            container.detach('click');
            container.detach('mousedown');
        },

        /**
         * Creates and saves the new card to the model list.
         *
         * @private
         * @method _createAndSaveCard
         * @param  {String} cardContent The content to save to the card model
         */
        _createAndSaveCard: function (cardContent) {
            var modelList = this.get('modelList'),
                now       = new Date();

            modelList.add(new Card({
                id: Y.guid(),
                content: cardContent,
                dateLastEdited: now,
                dateCreated: now
            }), {
                // Re-render is done as a part of sorting the model list.
                silent: true
            });
        },

        /**
         * Activates new card for new card edit and creation.
         *
         * @private
         * @method _activateNewCardNode
         */
        _activateNewCardNode: function () {
            this.get('newCardModel').set('active', true, {
                silent: true
            });
        },

        _resetNewCardModel: function () {
            this.get('newCardModel').destroy();
            this.set('newCardModel', new Card({
                content: 'New Card',
                type: 'new'
            }));
        },

        /**
         * Ensures todays wallet is at the top of the list when rendered.
         *
         * @private
         * @method _sortWalletList
         */
        _sortWalletList: function () {
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
                cardContainerNode,
                cardId,
                card;

            this._detachViewModeEventHandlers();

            if (!targetNode.hasClass(CLASS_NAMES.cardTodoCheckbox)) {
                cardContainerNode = targetNode.hasClass(cardContainerClass) ? targetNode : targetNode.ancestor('.' + cardContainerClass);
            }

            cardId = cardContainerNode.getData('id');
            if (!cardId) {
                this._activateNewCardNode();
            }
            // card = this.get('modelList').getById(cardId);
            // card.set('active', true);
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
                this._activateNewCardNode();
            }
        },

        _saveNewCard: function (/*event*/) {
            var newCard = this.get('newCardModel'),
                walletList = this.get('modelList'),
                latestWallet = walletList.item(0),
                now = new Date(),
                newCardList;

            // Latest wallet is not todays wallet, so create one for today, and add new card to that.
            if (this._formatDate(latestWallet.get('date')) !== this._formatDate(now)) {
                newCardList = new CardList({
                    items: [
                        new Card({
                            id: Y.guid(),
                            content: newCard.get('content'),
                            dateCreated: now,
                            dateLastEdited: now
                        })
                    ]
                });

                walletList.add(new Wallet({
                    cards: newCardList,
                    date: now
                }));
            } else {
                latestWallet.get('cards').add(newCard);
            }

            this._resetNewCardModel();
            this._sortWalletList();
            this._attachViewModeEventHandlers();
        }

    }, {

        ATTRS: {
            newCardModel: {
                valueFn: function () {
                    return new Card({
                        content: 'New Card',
                        type: 'new'
                    });
                }
            }
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
