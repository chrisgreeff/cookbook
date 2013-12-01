/*global YUI*/
YUI.add('cb-cookbook-view', function (Y) {
    'use strict';

    var Handlebars = Y.Handlebars,
        JSON       = Y.JSON,
        CB         = Y.CB,
        Controller = CB.Controller,
        Card       = CB.Card,
        Wallet     = CB.Wallet,

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
            cardTodoCheckbox: 'cb-card-todo--checkbox',
            cardNote: 'cb-card-note',
            cardTodo: 'cb-card-todo',
            iconUnchecked: 'cb-card-todo--icon-checkbox-unchecked',
            iconChecked: 'cb-card-todo--icon-checkbox-checked',
            wallet: 'cb-wallet',
            walletList: 'cb-wallet-list'
        },

        KEY_CODES = {
            backspace: 8,
            enter: 13,
            escape: 27,
            space: 32,
            n: 78,
            equals: 187,
            dash: 189
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
                cards    = cookbook.get('cards');

            cards.after(['add', 'remove', 'reset'], this.render, this);
            this._attachViewModeEventHandlers();
        },

        render: function () {
            var container = this.get('container'),
                cookbook  = this.get('model'),
                wallets   = cookbook.get('wallets'),
                cards     = cookbook.get('cards');

            container.setHTML(_renderWalletList({
                wallets: wallets.toJSON()
            }));

            wallets.each(function (wallet) {
                var date               = wallet.get('date'),
                    walletNode         = container.one('.' + CLASS_NAMES.wallet + '[data-date="' + date + '"]'),
                    currentWalletCards = cards.getByWalletId(wallet.get('id'));;

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

            container.delegate('mousedown', this._toggleCheckbox, '.' + CLASS_NAMES.cardTodoCheckbox, this);
            container.delegate('click', this._getCardForEditMode, '.' + CLASS_NAMES.card, this);
            Y.one(window).on('keydown', this._switchNewNoteCardToEditMode, this);
        },

        /**
         * Detaches all custom event handlers for view mode
         *
         * @private
         * @method _detachViewModeEventHandlers
         */
        _detachViewModeEventHandlers: function () {
            this.get('container').detach('click');
            Y.one(window).detach('keydown', this._switchNewNoteCardToEditMode);
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
            activeCardNode.after('keydown', this._keydownStrokeListener, this);
            activeCardNode.after('paste', this._pasteAsPlainText, this);
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
            activeCardNode.detach('keydown', this._keydownStrokeListener);
            activeCardNode.detach('paste');
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
            cardNode.removeClass(CLASS_NAMES.cardNew);
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
            var container             = this.get('container'),
                cookbook              = this.get('model'),
                activeCardNode        = this.get('activeCardNode'),
                activeCardNodeContent = activeCardNode.getHTML(),
                activeCardNodeText    = activeCardNode.get('text'),
                cardId                = activeCardNode.getData('id'),
                cards                 = cookbook.get('cards'),
                card;

            // // New card with non-html content. Create and save model.
            if (!cardId) {
                if (activeCardNodeText) {
                    this._createAndSaveNewCard(activeCardNodeContent);
                } else {
                    // @todo destroy wysiwyg node, and re-create new card node.
                }
            // Existing card.
            } else if (cardId) {
                card = cards.getById(cardId);

                // Update card only if the content has changed.
                if (activeCardNodeContent !== card.get('content')) {
                    // If there is no text for an existing card, confirm before deletion.
                    if (activeCardNodeText || confirm('Bro are you sure...?')) {
                        this._updateCardContent(card, activeCardNodeContent);
                    }
                }
            }

            this._detachEditModeEventHandlers();
            this._attachViewModeEventHandlers();

            activeCardNode.removeClass(CLASS_NAMES.cardEditing);

            this.set('activeCardNode', null);
        },

        /**
         * Updates the card's content with that passed.
         *
         * @private
         * @method _updateCardContent
         * @param  {Model} card The card to update.
         * @param  {HTML | String} content The content you are updated the card with
         */
        _updateCardContent: function (card, content) {
            var cookbook = this.get('model'),
                cards    = cookbook.get('cards'),
                cardId   = card.get('id'),
                wallets  = cookbook.get('wallets'),
                index    = cards.indexOf(card),
                now      = new Date(),
                newWalletCards,
                newWalletId,
                currentWallet,
                newWallet;

            cards.remove(card, {
                silent: true
            });

            if (content) {
                currentWallet = wallets.getById(card.get('wallet'));

                // If wallet card belongs to changes, we need to update the card and wallet data.
                if (this._getSimpleDate(currentWallet.get('date')) !== this._getSimpleDate(now)) {
                    newWallet = wallets.getWalletBySimpleDate(now);

                    if (!newWallet) {
                        newWalletId = 'wallet-' + Y.guid();

                        newWallet = new Wallet({
                            date: now,
                            id: newWalletId,
                            cards: [cardId]
                        });

                        wallets.add(newWallet);

                        Controller.addWallet({
                            wallet: newWallet,
                            successHandler: this._addModelSuccessHandler
                        });
                    } else {
                        newWalletId = newWallet.get('id');
                        newWallet.get('cards').push(cardId);

                        Controller.updateWallet({
                            wallet: newWallet
                        });
                    }

                    card.set('wallet', newWalletId);

                    currentWalletCards = currentWallet.get('cards');
                    currentWalletCards.splice(currentWalletCards.indexOf(cardId), 1);

                    if (currentWalletCards.length) {
                        currentWallet.set('cards', currentWalletCards);
                        Controller.updateWallet({
                            wallet: currentWallet
                        });
                    }  else {
                        Controller.deleteWallet({
                            wallet: currentWallet
                        });
                        currentWallet.destroy();
                    }
                }

                card.set('content', content);
                card.set('dateLastEdited', now);

                cards.add(card, {
                    index: index
                });

                Controller.updateCard({
                    card: card
                });
            } else {
                Controller.deleteCard({
                    card: card
                });
                card.destroy();
                this.render();
            }
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
                card,
                walletId;

            if (!wallet) {
                walletId = 'wallet-' + Y.guid();

                wallet = new Wallet({
                    date: now,
                    id: walletId,
                    cards: [cardId]
                });

                wallets.add(wallet);

                Controller.addWallet({
                    wallet: wallet,
                    successHandler: this._addModelSuccessHandler
                });
            } else {
                walletId = wallet.get('id');
                wallet.get('cards').push(cardId);

                Controller.updateWallet({
                    wallet: wallet
                });
            }

            card = new Card({
                id: cardId,
                content: cardContent,
                dateLastEdited: now,
                dateCreated: now,
                wallet: walletId
            });

            cards.add(card);

            Controller.addCard({
                card: card,
                successHandler: this._addModelSuccessHandler
            });
        },

        _getSimpleDate: function (date) {
            var day   = date.getDate(),
                month = date.getMonth() + 1,
                year  = date.getFullYear();

            return day + '/' + month + '/' + year;
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
                this._switchToEditMode(Y.one('.' + CLASS_NAMES.cardNew));
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
                cardClass  = CLASS_NAMES.card,
                cardNode   = null;

            if (!targetNode.hasClass(CLASS_NAMES.cardTodoCheckbox)) {
                cardNode = targetNode.hasClass(cardClass) ? targetNode : targetNode.ancestor('.' + cardClass);
            }

            this._switchToEditMode(cardNode);
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
         * Pastes any clipboard selection as plain text to avoid any unintended weirdness in formatting.
         *
         * @eventHandler
         * @method _pasteAsPlainText
         * @param  {Event} paste event
         */
        _pasteAsPlainText: function (event) {
            event.preventDefault();
            document.execCommand('insertHTML', false, event._event.clipboardData.getData('text/plain'));
        },

        /**
         * Manages the keydown strokes during the editing of a card.
         *
         * @eventHandler
         * @method _keydownStrokeListener
         * @param  {Event} keydown event
         */
        _keydownStrokeListener: function (event) {
            var keyCode            = event.keyCode,
                firstChar          = this.get('firstChar'),
                textCursorPosition = window.getSelection().extentOffset,
                oldContent,
                cardId;

            // Escape cancels the edit.
            if (keyCode === KEY_CODES.escape) {
                activeCardNode = this.get('activeCardNode');
                cardId         = activeCardNode.getData('id');

                if (cardId) {
                    oldContent = this.get('modelList').getById(cardId).get('content');
                } else {
                    oldContent = '';
                }

                activeCardNode.setHTML(oldContent);
                this._switchToViewMode();
            }

            // Shift + Enter saves the note if there are changes.
            if (keyCode === KEY_CODES.enter && event.shiftKey) {
                event.preventDefault();
                this._switchToViewMode();
            }

            // Store the first char for todo and note insertion.
            if (textCursorPosition === 0) {
                this.set('firstChar', keyCode);
            }

            // Enhance the character into todo or note list items.
            if (keyCode === KEY_CODES.space && textCursorPosition === 1) {
                if (firstChar === KEY_CODES.dash) {
                    event.preventDefault();
                    document.execCommand('delete');
                    document.execCommand('insertHTML', false, _renderNoteListItem());

                } else if (firstChar === KEY_CODES.equals) {
                    event.preventDefault();
                    document.execCommand('delete');
                    document.execCommand('insertHTML', false, _renderTodoListItem());
                    Y.later(0, this, function () {
                        document.execCommand('delete');
                    });
                }
            }
        },

        // ================================================================================
        // =============================== SUCCESS HANDLERS ===============================
        // ================================================================================

        /**
         * Updates the _id of the passed model, so the client tracks the servers id.
         *
         * @method _addModelSuccessHandler
         * @param {Object} config
         *        @param {Object} model The model to update.
         *        @param {Object} response The response of the add transaction.
         */
        _addModelSuccessHandler: function (config) {
            var model = config.model,
                _id   = JSON.parse(config.response.responseText)._id;

            model.set('_id', _id);
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
        'json-parse',
        'view',
        'cb-cookbook-controller',
        'cb-card',
        'cb-wallet'
    ]
});
