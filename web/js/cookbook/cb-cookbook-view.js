/*global YUI*/
YUI.add('cb-cookbook-view', function (Y) {
    'use strict';

    var Handlebars = Y.Handlebars,
        CB = Y.CB,
        Card = CB.Card,
        Wallet = CB.Wallet,

        _renderWalletList,
        _renderCardList,
        _renderNoteListItem,
        _renderTodoListItem,

        CLASS_NAMES = {
            card: 'cb-card',
            cardEditing: 'cb-card-editing',
            cardContainer: 'cb-card-container',
            cardList: 'cb-card-list',
            cardNew: 'cb-card-new',
            wallet: 'cb-wallet',
            walletList: 'cb-wallet-list'
        };

    _renderWalletList = Handlebars.compile(
        '<div class="' + CLASS_NAMES.cardContainer + '">' +
            '<div class="' + CLASS_NAMES.card + ' ' + CLASS_NAMES.cardNew + '">' +
                'New Card' +
            '</div>' +
        '</div>' +
        '<ul class="' + CLASS_NAMES.walletList + '">' +
            '{{#each wallets}}' +
                '<li class="' + CLASS_NAMES.wallet + '" data-date="{{date}}"></li>' +
            '{{/each}}' +
        '</ul>'
    );

    _renderCardList = Handlebars.compile(
        '<ul class="' + CLASS_NAMES.cardList + '">' +
            '{{#each cards}}' +
                '<li class="' + CLASS_NAMES.cardContainer + '">' +
                    '<div tabindex="0" class="' + CLASS_NAMES.card + '" data-id="{{id}}">' +
                        '{{{content}}}' +
                    '</div>' +
                '</li>' +
            '{{/each}}' +
        '</ul>'
    );

    _renderNoteListItem = Handlebars.compile(
        '<ul class="' + CLASS_NAMES.cardNote + '">' +
            '<li></li>' +
        '</ul>'
    );

    _renderTodoListItem = Handlebars.compile(
        '<ol class="' + CLASS_NAMES.cardTodo + '">' +
            '<li class="' + CLASS_NAMES.iconUnchecked + ' ' + CLASS_NAMES.cardTodoCheckbox + '">&nbsp;</li>' +
        '</ol>'
    );

    Y.namespace('CB').CookbookView = Y.Base.create('cb-cookbook-view', Y.View, [], {

        initializer: function () {
            var cookbook = this.get('model'),
                cards = cookbook.get('cards');

            cards.after(['add', 'remove', 'reset'], this.render, this);
            this._attachViewModeEventHandlers();
        },

        render: function () {
            var container = this.get('container'),
                cookbook = this.get('model'),
                wallets = cookbook.get('wallets'),
                cards = cookbook.get('cards');

            container.setHTML(_renderWalletList({
                wallets: wallets.toJSON()
            }));

            wallets.each(function (wallet) {
                var date = wallet.get('date'),
                    walletNode = container.one('.' + CLASS_NAMES.wallet + '[data-date="' + date + '"]'),
                    currentWalletCards;

                // Filter out cards that belong to this wallet.
                currentWalletCards = cards.getByWalletId(wallet.get('id'));
                walletNode.setHTML(_renderCardList({
                    cards: currentWalletCards
                }));
            });
        },

        // ================================================================================
        // ============================== PRIVATE FUNCTIONS ===============================
        // ================================================================================

        /**
         * Attaches all event handlers necessary for view mode to be active
         *
         * @private
         * @method _attachViewModeEventHandlers
         */
        _attachViewModeEventHandlers: function () {
            var container = this.get('container');

            // container.delegate('mousedown', this._toggleCheckbox, '.' + CLASS_NAMES.cardTodoCheckbox, this);
            container.delegate('click', this._getCardForEditMode, '.' + CLASS_NAMES.card, this);
            // Y.one(window).on('keydown', this._switchNewNoteCardToEditMode, this);
        },

        /**
         * Detaches all custom event handlers for view mode
         *
         * @private
         * @method _detachViewModeEventHandlers
         */
        _detachViewModeEventHandlers: function () {
            this.get('container').detach('click');
            // Y.one(window).detach('keydown', this._switchNewNoteCardToEditMode);
        },

        /**
         * Attaches all event handlers necessary for edit mode to be active
         *
         * @private
         * @method _attachEditModeEventHandlers
         */
        _attachEditModeEventHandlers: function () {
            var activeCardNode = this.get('activeCardNode');

            activeCardNode.after('clickoutside', this._switchToViewMode, this);
            // activeCardNode.after('keydown', this._keydownStrokeListener, this);
            // activeCardNode.after('paste', this._pasteAsPlainText, this);
        },

        /**
         * Detaches all custom event handlers for edit mode
         *
         * @private
         * @method _detachEditModeEventHandlers
         */
        _detachEditModeEventHandlers: function () {
            var activeCardNode = this.get('activeCardNode');

            activeCardNode.detach('clickoutside');
            // activeCardNode.detach('keydown', this._keydownStrokeListener);
            // activeCardNode.detach('paste');
        },

        /**
         * Converts the passed card node into an edit field.
         *
         * @private
         * @method _switchToEditMode
         * @param  {Node} cardNode The card to switch to edit mode
         */
        _switchToEditMode: function (cardNode) {
            this.set('activeCardNode', cardNode);

            // If there is no id set on the card node, clear the placeholder text.
            if (!cardNode.getData('id')) {
                cardNode.empty();
            }

            this._detachViewModeEventHandlers();
            this._attachEditModeEventHandlers();

            // Enhance the card node for editing
            cardNode.addClass(CLASS_NAMES.cardEditing);
            $(cardNode.getDOMNode()).wysiwyg();
            cardNode.focus();
        },

        /**
         * Handles any tasks needed to be done before setting the app back to view mode.
         *
         * @private
         * @method _switchToViewMode
         */
        _switchToViewMode: function () {
            var container = this.get('container'),
                cardList = this.get('modelList'),
                activeCardNode = this.get('activeCardNode'),
                activeCardNodeContent = activeCardNode.getHTML(),
                activeCardNodeText = activeCardNode.get('text'),
                cardId = activeCardNode.getData('id'),
                sortCards = false,
                card;

            // // New card with non-html content. Create and save model.
            if (!cardId) {
                if (activeCardNodeText) {
                    this._createAndSaveNewCard(activeCardNodeContent);
                    sortCards = true;
                } else {
                    // @todo destroy wysiwyg node, and re-create new card node.
                }
            }
            // // Existing card.
            // } else if (cardId) {
            //     card = cardList.getById(cardId);

            //     // Update card only if the content has changed.
            //     if (activeCardNodeContent !== card.get('content')) {
            //         // If there is no text for an existing card, confirm before deletion.
            //         if (activeCardNodeText || confirm('Bro are you sure...?')) {
            //             cardList.updateCardContent(card, activeCardNodeContent);
            //             sortCards = true;
            //         }
            //     }
            // }

            this._detachEditModeEventHandlers();
            this._attachViewModeEventHandlers();

            activeCardNode.removeClass(CLASS_NAMES.cardEditing);

            this.set('activeCardNode', null);

            // Sort list on addition of new card
            // if (sortCards) {
            //     this._sortCardList();
            // }
        },

        /**
         * Creates and saves the new card to the model list.
         *
         * @private
         * @method _createAndSaveNewCard
         * @param  {String} cardContent The content to save to the card model
         */
        _createAndSaveNewCard: function (cardContent) {
            var cookbook = this.get('model'),
                cards    = cookbook.get('cards'),
                wallets  = cookbook.get('wallets'),
                now      = new Date(),
                wallet   = wallets.getWalletBySimpleDate(now),
                cardId   = 'card-' + Y.guid(),
                walletId;

            if (!wallet) {
                walletId = 'wallet-' + Y.guid();

                wallet = new Wallet({
                    date: now,
                    id: walletId,
                    cards: [cardId]
                });

                wallets.add(wallet);
            } else {
                walletId = wallet.get('id');
            }

            cards.add(new Card({
                id: cardId,
                content: cardContent,
                dateLastEdited: now,
                dateCreated: now,
                wallet: walletId
            }));
        },


        // ================================================================================
        // ================================ EVENT HANDLERS ================================
        // ================================================================================

        /**
         * Switches the new note card to edit mode.
         *
         * @private
         * @method _switchNewNoteCardToEditMode
         * @param  {Event} click or keyboard event
         */
        _switchNewNoteCardToEditMode: function (event) {
            if (event.keyCode === KEY_CODES.n && event.shiftKey) {
                event.preventDefault();
                this._switchToEditMode(Y.one('.' + CLASS_NAMES.newCard));
            }
        },

        /**
         * Determines which card node was clicked for edit
         *
         * @eventHandler
         * @method _getCardForEditMode
         * @param  {Event} click event
         */
        _getCardForEditMode: function (event) {
            var targetNode = event.target,
                cardClass = CLASS_NAMES.card,
                cardNode = null;

            if (!targetNode.hasClass(CLASS_NAMES.cardTodoCheckbox)) {
                cardNode = targetNode.hasClass(cardClass) ? targetNode : targetNode.ancestor('.' + cardClass);
            }

            this._switchToEditMode(cardNode);
        }

    }, {
        ATTRS: {
            /**
             * The card node of the card being edited.
             *
             * @attribute activeCardNode
             * @type {Node}
             */
            activeCardNode: {
                value: null
            },

            /**
             * The first character of the line being edited
             *
             * @attribute firstChar
             * @type {String}
             */
            firstChar: {
                value: null
            }
        }
    });

}, '1.0.0', {
    requires: [
        'base',
        'event-outside',
        'handlebars',
        'view'
    ]
});
