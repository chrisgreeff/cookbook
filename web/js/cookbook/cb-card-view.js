/*global YUI*/
YUI.add('cb-card-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Card  = Y.CB.Card,

        _renderCard,
        _renderNewCard,
        _renderNoteListItem,
        _renderTodoListItem,

        CLASS_NAMES = {
            card: 'cb-card',
            cardActive: 'cb-card-active',
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
            equals: 187,
            dash: 189
        };

    // @todo better way to do this.
    _renderCard = Micro.compile(
        '<div tabindex="0" class="' + CLASS_NAMES.card + '">' +
            '<%== this.content %>' +
        '</div>'
    );

    _renderNewCard = Micro.compile(
        '<div tabindex="0" class="' + CLASS_NAMES.card + ' ' + CLASS_NAMES.newCard + '">' +
            '<%== this.content %>' +
        '</div>'
    );

    _renderNoteListItem = Micro.compile(
        '<ul class="' + CLASS_NAMES.cardNote + '">' +
            '<li></li>' +
        '</ul>'
    );

    _renderTodoListItem = Micro.compile(
        '<ol class="' + CLASS_NAMES.cardTodo + '">' +
            '<li class="' + CLASS_NAMES.iconUnchecked + ' ' + CLASS_NAMES.cardTodoCheckbox + '">&nbsp;</li>' +
        '</ol>'
    );

    Y.namespace('CB').CardView = Y.Base.create('cb-card-view', Y.View, [], {

        initializer: function () {},

        render: function () {
            var card = this.get('model'),
                cardJSON = card.toJSON(),
                container = this.get('container');

            console.log('rendering card: ' + card.get('id'));

            if (card.get('type') === 'new') {
                container.setHTML(_renderNewCard(cardJSON));
            } else {
                container.setHTML(_renderCard(cardJSON));
            }

            if (!card.getEvent('activeChange')) {
                console.log('attaching activeChange on card: ' + card.get('id'));
                card.after('activeChange', this._checkIfSilent, this);
            }

            return this;
        },

        // ----------------------------------------------------------
        // ==================== Private Functions ===================
        // ----------------------------------------------------------

        /**
         * Attaches all event handlers necessary for edit mode to be active
         *
         * @private
         * @method _attachActiveCardEventHandlers
         */
        _attachActiveCardEventHandlers: function () {
            var cardNode = this.get('container').one('.' + CLASS_NAMES.card);
            console.log('attaching card event handlers on card node: ' + this.get('container').getData('id'));

            cardNode.after('clickoutside', this._saveCardChanges, this);
            cardNode.after('keydown', this._keydownStrokeListener, this);
            cardNode.after('paste', this._pasteAsPlainText, this);
        },

        /**
         * Detaches all custom event handlers for edit mode
         *
         * @private
         * @method _detachActiveCardEventHandlers
         */
        _detachActiveCardEventHandlers: function () {
            var cardNode = this.get('container').one('.' + CLASS_NAMES.card);
            console.log('detaching card event handlers from card node: ' + this.get('container').getData('id'));

            cardNode.detach('clickoutside');
            cardNode.detach('keydown', this._keydownStrokeListener);
            cardNode.detach('paste', this._pasteAsPlainText);
        },

        /**
         * Converts the passed card node into an edit field.
         *
         * @private
         * @method _enhanceCardNodeToEditable
         * @param  {Node} cardNode The card to switch to edit mode
         */
        _enhanceCardNodeToEditable: function () {
            var cardNode = this.get('container').one('.' + CLASS_NAMES.card);

            console.log('enhancing card node so it is editable: ' + this.get('container').getData('id'));
            this._attachActiveCardEventHandlers();

            if (this.get('model').get('type') === 'new') {
                cardNode.setHTML('');
            }

            // Enhance the card node for editing
            cardNode.addClass(CLASS_NAMES.cardActive);
            $(cardNode.getDOMNode()).wysiwyg();
            cardNode.focus();
        },

        /**
         * Handles any tasks needed to be done before setting the app back to view mode.
         *
         * @private
         * @method _saveCardChanges
         */
        _saveCardChanges: function (event) {
            var card = this.get('model'),
                cardList = card.get('lists'),
                cardNode = this.get('container').one('.' + CLASS_NAMES.card),
                cardNodeHtml = cardNode.getHTML(),
                cardNodeText = cardNode.get('text'),
                cardId = card.get('id'),
                now = new Date();

            console.log('Saving card changes for: ' + card.get('id'));
            this._detachActiveCardEventHandlers();

            if (cardNodeText) {
                card.set('content', cardNodeHtml);
                card.set('dateLastEdited', now);
                card.set('active', false, {
                    fromCardView: true
                });
            }

            // var cardList = this.get('modelList'),
            //     activeCardNode = this.get('activeCardNode'),
            //     activeCardNodeContent = activeCardNode.getHTML(),
            //     activeCardNodeText = activeCardNode.get('text'),
            //     cardId = activeCardNode.getData('id'),
            //     addition = false,
            //     card;

            // // New card with non-html content. Create and save model.
            // if (!cardId) {
            //     if (activeCardNodeText) {
            //         this._createAndSaveCard(activeCardNodeContent);
            //         addition = true;
            //     } else {
            //         // @todo destroy wysiwyg node, and re-create new card node.
            //     }

            // // Existing card.
            // } else if (cardId) {
            //     card = cardList.getById(cardId);

            //     // Update card only if the content has changed.
            //     if (activeCardNodeContent !== card.get('content')) {
            //         // If there is no text for an existing card, confirm before deletion.
            //         if (activeCardNodeText || confirm('Bro are you sure...?')) {
            //             cardList.updateCardContent(card, activeCardNodeContent);
            //             addition = true;
            //         }
            //     }
            // }

            // this._detachEditModeEventHandlers();
            // this._attachViewModeEventHandlers();

            // activeCardNode.removeClass(CLASS_NAMES.cardActive);

            // Sort list on addition of new card
            // if (addition) {
            //     this._sortCardList();
            // }
        },

        // ----------------------------------------------------------
        // ===================== Event Handlers =====================
        // ----------------------------------------------------------

        _checkIfSilent: function (event) {
            if (!event.fromCardView) {
                this._enhanceCardNodeToEditable();
            }
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
                activeCardNode,
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
                this._saveCardChanges();
            }

            // Shift + Enter saves the note if there are changes.
            if (keyCode === KEY_CODES.enter && event.shiftKey) {
                event.preventDefault();
                this._saveCardChanges();
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
        'template'
    ]
});
