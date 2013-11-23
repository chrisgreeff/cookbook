/*global YUI*/
YUI.add('cb-wallet-list-view', function (Y) {
    'use strict';

    var Handlebars = Y.Handlebars,
        Card  = Y.CB.Card,

        _renderWalletList,
        _renderNoteListItem,
        _renderTodoListItem,

        CLASS_NAMES = {
            card: 'cb-card',
            cardContainer: 'cb-card-container',
            cardEditing: 'cb-card-editing',
            cardTodoCheckbox: 'cb-card-todo--checkbox',
            cardNote: 'cb-card-note',
            cardTodo: 'cb-card-todo',
            newCard: 'cb-card-new',
            iconUnchecked: 'cb-card-todo--icon-checkbox-unchecked',
            iconChecked: 'cb-card-todo--icon-checkbox-checked'
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
            '<div class="' + CLASS_NAMES.card + ' ' + CLASS_NAMES.newCard + '" tabindex="0">' +
                'New Card' +
            '</div>' +
        '</div>' +
        '<ul class="' + CLASS_NAMES.walletList + '">' +
            '{{#each wallets}}' +
                '<li class="' + CLASS_NAMES.wallet + '" data-date="{{date}}">' +
                    '<ul class="' + CLASS_NAMES.cardList + '">' +
                        '{{#each cards}}' +
                            '<li class="' + CLASS_NAMES.cardContainer + '">' +
                                '<div class="' + CLASS_NAMES.card + '" data-id="{{id}}" tabindex="0">' +
                                    '{{{content}}}' +
                                '</div>' +
                            '</li>' +
                        '{{/each}}' +
                    '</ul>' +
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

    Y.namespace('CB').WalletListView = Y.Base.create('cb-wallet-list-view', Y.View, [], {

        initializer: function () {
            var cardList = this.get('modelList'),
                container = this.get('container');

            cardList.after(['add', 'remove', 'reset'], this.render, this);

            this._attachViewModeEventHandlers();
        },

        render: function () {
            
            // this.get('container').setHTML(_renderWalletList({
            //     wallets: this.get('modelList').toJSON(),
            //     CLASS_NAMES: CLASS_NAMES
            // }));

            return this;
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
            this.get('modelList').set('mode', 'edit');
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
                addition = false,
                card;

            // New card with non-html content. Create and save model.
            if (!cardId) {
                if (activeCardNodeText) {
                    this._createAndSaveCard(activeCardNodeContent);
                    addition = true;
                } else {
                    // @todo destroy wysiwyg node, and re-create new card node.
                }

            // Existing card.
            } else if (cardId) {
                card = cardList.getById(cardId);

                // Update card only if the content has changed.
                if (activeCardNodeContent !== card.get('content')) {
                    // If there is no text for an existing card, confirm before deletion.
                    if (activeCardNodeText || confirm('Bro are you sure...?')) {
                        cardList.updateCardContent(card, activeCardNodeContent);
                        addition = true;
                    }
                }
            }

            this._detachEditModeEventHandlers();
            this._attachViewModeEventHandlers();

            activeCardNode.removeClass(CLASS_NAMES.cardEditing);

            this.set('activeCardNode', null);

            // Sort list on addition of new card
            if (addition) {
                this._sortCardList();
            }
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
                now       = Date.now();

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
         * Ensures the last edited card is at the top of the list when rendered.
         *
         * @private
         * @method _sortCardList
         */
        _sortCardList: function () {
            this.get('modelList').sort({
                decending: true
            });
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
            var keyCode = event.keyCode,
                textCursorPosition = window.getSelection().extentOffset,
                firstChar = this.get('firstChar'),
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
        'node-event-simulate',
        'view',
        'yui-later',
        'handlebars',
        'cb-card-list'
    ]
});
