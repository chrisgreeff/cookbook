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

        initializer: function () {
            this.get('model').after('activeChange', this._switchMode, this);
        },

        render: function () {
            var card = this.get('model'),
                cardJSON = card.toJSON(),
                container = this.get('container');

            if (card.get('type')) {
                container.setHTML(_renderNewCard(cardJSON));
            } else {
                container.setHTML(_renderCard(cardJSON));
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

            cardNode.after('clickoutside', this._switchToViewMode, this);
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

            cardNode.detach('clickoutside');
            cardNode.detach('keydown', this._keydownStrokeListener);
            cardNode.detach('paste');
        },

        /**
         * Converts the passed card node into an edit field.
         *
         * @private
         * @method _activateCardNode
         * @param  {Node} cardNode The card to switch to edit mode
         */
        _activateCardNode: function () {
            var cardNode = this.get('container').one('.' + CLASS_NAMES.card);

            this._attachActiveCardEventHandlers();

            // Enhance the card node for editing
            cardNode.addClass(CLASS_NAMES.cardActive);
            $(cardNode.getDOMNode()).wysiwyg();
            cardNode.focus();
        },

        // ----------------------------------------------------------
        // ===================== Event Handlers =====================
        // ----------------------------------------------------------

        _switchMode: function (event) {
            if (event.newVal) {
                this._activateCardNode();
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
