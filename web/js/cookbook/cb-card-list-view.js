/*global YUI*/
YUI.add('cb-card-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Card  = Y.CB.Card,

        _renderCardList,
        _renderNoteListItem,
        _renderTodoListItem,

        CLASS_NAMES = {
            card: 'cb-card',
            cardContainer: 'cb-card-container',
            cardEditing: 'cb-card-editing',
            cardCheckbox: 'cb-card-checkbox',
            cardNote: 'cb-card-note',
            cardTodo: 'cb-card-todo',
            newCard: 'cb-new-card',
            iconUnchecked: 'icon-checkbox-unchecked',
            iconChecked: 'icon-checkbox-checked'
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

    _renderCardList = Micro.compile(
        '<li class="' + CLASS_NAMES.cardContainer + '">' +
            '<div class="' + CLASS_NAMES.card + ' ' + CLASS_NAMES.newCard + '">' +
                'New Card' +
            '</div>' +
        '</li>' +
        '<% Y.Array.each(this.cards, function(card) { %>' +
            '<li class="' + CLASS_NAMES.cardContainer + '">' +
                '<div tabindex="0" class="' + CLASS_NAMES.card + '" data-id="<%= card.id %>">' +
                    '<%== card.content %>' +
                '</div>' +
            '</li>' +
        '<% }); %>'
    );

    _renderNoteListItem = Micro.compile(
        '<ul class="' + CLASS_NAMES.cardNote + '">' +
            '<li></li>' +
        '</ul>'
    );

    _renderTodoListItem = Micro.compile(
        '<ol class="' + CLASS_NAMES.cardTodo + '">' +
            '<li>' +
                '<span class="' + CLASS_NAMES.cardCheckbox + ' ' + CLASS_NAMES.iconUnchecked + '">&nbsp;</span>' +
            '</li>' +
        '</ol>'
    );

    Y.namespace('CB').CardListView = Y.Base.create('cb-card-list-view', Y.View, [], {

        initializer: function () {
            var cardList = this.get('modelList'),
                container = this.get('container');

            cardList.after(['add', 'remove', 'reset'], this.render, this);

            container.delegate('click', this._getCardForEditMode, '.' + CLASS_NAMES.card, this);
            container.delegate('click', this._toggleCheckbox, '.' + CLASS_NAMES.cardCheckbox, this);
            container.delegate('paste', this._pasteAsPlainText, '.' + CLASS_NAMES.card, this);
            Y.one(window).on('keydown', this._createNewNote, this);
        },

        render: function () {
            this.get('container').setHTML(_renderCardList({
                cards: this.get('modelList').toJSON(),
                CLASS_NAMES: CLASS_NAMES
            }));

            return this;
        },

        // ================ PRIVATE FUNCTIONS ===============

        _switchToEditMode: function (cardNode) {
            var cardList = this.get('modelList');

            this.get('modelList').set('mode', 'edit');
            this.set('activeCardNode', cardNode);
            this.get('container').detach('click');

            if (!cardNode.getData('id')) {
                cardNode.empty();
            }
            cardNode.addClass(CLASS_NAMES.cardEditing);
            cardNode.after('clickoutside', this._switchToViewMode, this);
            cardNode.after('keydown', this._keydownStrokeListener, this);
            cardNode.after('keyup', this._keyupStrokeListener, this);

            // Turn into wysiwyg edit field.
            $(cardNode.getDOMNode()).wysiwyg();

            this.set('mode', 'edit');
            Y.one(window).detach('keydown', this._createNewNote);

            cardNode.focus();
        },

        _switchToViewMode: function () {
            var container             = this.get('container'),
                activeCardNode        = this.get('activeCardNode'),
                cardList              = this.get('modelList'),
                activeCardNodeContent = activeCardNode.getHTML(),
                cardId                = activeCardNode.getData('id'),
                card;

            if (!cardId && activeCardNodeContent) {
                this._createAndSaveCard(activeCardNodeContent);
            } else if (cardId) {
                card = cardList.getById(cardId);

                if (activeCardNodeContent !== card.get('content')) {
                    cardList.updateCardContent(card, activeCardNodeContent);
                }
            }

            activeCardNode.removeClass(CLASS_NAMES.cardEditing);
            activeCardNode.detach('clickoutside');

            container.delegate('click', this._getCardForEditMode, '.' + CLASS_NAMES.card, this);
            container.delegate('click', this._toggleCheckbox, '.' + CLASS_NAMES.cardCheckbox, this);
            Y.one(window).on('keydown', this._createNewNote, this);

            this.set('mode', 'view');
            this.set('activeCardNode', null);

            this._sortCardList();
        },

        _createAndSaveCard: function (cardContent) {
            var modelList = this.get('modelList'),
                now       = Date.now();

            modelList.add(new Card({
                id: Y.guid(),
                content: cardContent,
                dateLastEdited: now,
                dateCreated: now
            }), {
                silent: true
            });
        },

        // Ensuring the last edited card is first in the list when rendered
        _sortCardList: function () {
            this.get('modelList').sort({
                decending: true
            });
        },

        // ================= EVENT HANDLERS =================

        _createNewNote: function (event) {
            if (event.keyCode === KEY_CODES.n && event.shiftKey) {
                event.preventDefault();
                this._switchToEditMode(Y.one('.' + CLASS_NAMES.newCard));
            }
        },

        _getCardForEditMode: function (event) {
            var targetNode = event.target,
                cardClass = CLASS_NAMES.card,
                cardNode = targetNode.hasClass(cardClass) ? targetNode : targetNode.ancestor('.' + cardClass);

            this._switchToEditMode(cardNode);
        },

        _toggleCheckbox: function (event) {
            var checkboxNode = event.target;

            if (checkboxNode.hasClass(CLASS_NAMES.iconUnchecked)) {
                checkboxNode.removeClass(CLASS_NAMES.iconUnchecked);
                checkboxNode.addClass(CLASS_NAMES.iconChecked);
            } else {
                checkboxNode.removeClass(CLASS_NAMES.iconChecked);
                checkboxNode.addClass(CLASS_NAMES.iconUnchecked);
            }

            this._switchToViewMode();
        },

        _pasteAsPlainText: function (event) {
            event.preventDefault();
            document.execCommand('insertHTML', false, event._event.clipboardData.getData('text/plain'));
        },

        _keydownStrokeListener: function (event) {
            var keyCode = event.keyCode,
                textCursorPosition = window.getSelection().extentOffset,
                textAnchorParentNode = Y.one(window.getSelection().anchorNode).get('parentNode'),
                firstChar = this.get('firstChar'),
                oldContent,
                cardId,
                activeCardNode;

            if (keyCode === KEY_CODES.backspace) {
                if (textCursorPosition === 1 && textAnchorParentNode.hasClass(CLASS_NAMES.cardCheckbox)) {
                    document.execCommand('delete');
                    document.execCommand('delete');
                }

            } else if (keyCode === KEY_CODES.escape) {
                activeCardNode = this.get('activeCardNode');
                cardId         = activeCardNode.getData('id');

                if (cardId) {
                    oldContent = this.get('modelList').getById(cardId).get('content');
                } else {
                    oldContent = '';
                }

                activeCardNode.setHTML(oldContent);
                this._switchToViewMode();

            } else if (keyCode === KEY_CODES.enter) {
                if (event.shiftKey) {
                    event.preventDefault();
                    this._switchToViewMode();
                } else if (textAnchorParentNode.hasClass(CLASS_NAMES.cardCheckbox)) {
                    document.execCommand('insertHTML', false, '&nbsp;');
                }

            } else if (textCursorPosition === 0) {
                this.set('firstChar', keyCode);

            } else if (keyCode === KEY_CODES.space && textCursorPosition === 1) {
                if (firstChar === KEY_CODES.dash) {
                    event.preventDefault();
                    document.execCommand('delete');
                    document.execCommand('insertHTML', false, _renderNoteListItem());

                } else if (firstChar === KEY_CODES.equals) {
                    event.preventDefault();
                    document.execCommand('delete');
                    document.execCommand('insertHTML', false, _renderTodoListItem());
                }
            }
        },

        _keyupStrokeListener: function (event) {
            var keyCode = event.keyCode,
                textAnchorNode = Y.one(window.getSelection().anchorNode);

            if (keyCode === KEY_CODES.enter && textAnchorNode.hasClass(CLASS_NAMES.cardCheckbox)) {
                document.execCommand('insertHTML', false, '&nbsp;');
            }
        }

    }, {

        ATTRS: {
            mode: {
                value: 'view'
            },

            activeCardNode: {
                value: null
            },

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
        'template',
        'cb-card-list'
    ]
});
