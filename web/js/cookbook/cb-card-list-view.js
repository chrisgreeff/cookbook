/*global YUI*/
YUI.add('cb-card-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Card  = Y.CB.Card,

        _renderCardList,

        CLASS_NAMES = {
            card: 'cb-card',
            cardContainer: 'cb-card-container',
            newCard: 'cb-new-card'
        };

    _renderCardList = Micro.compile(
        '<li class="' + CLASS_NAMES.cardContainer + '">' +
            '<div class="' + CLASS_NAMES.card + ' ' + CLASS_NAMES.newCard + '">' +
                'New Card' +
            '</div>' +
        '</li>' +
        '<% Y.Array.each(this.cards, function(card) { %>' +
            '<li class="' + CLASS_NAMES.cardContainer + '">' +
                '<div class="' + CLASS_NAMES.card + '" data-id="<%= card.id %>">' +
                    '<%== card.content %>' +
                '</div>' +
            '</li>' +
        '<% }); %>'
    );

    Y.namespace('CB').CardListView = Y.Base.create('cb-card-list-view', Y.View, [], {

        initializer: function () {
            var cardList = this.get('modelList');

            cardList.after(['add', 'remove', 'reset'], this.render, this);
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(_renderCardList({
                cards: this.get('modelList').toJSON(),
                CLASS_NAMES: CLASS_NAMES
            }));

            container.delegate('click', function (event) {
                this._switchToEditMode(event.target);
            }, '.' + CLASS_NAMES.card, this);

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

            cardNode.after('clickoutside', this._switchToViewMode, this);
            cardNode.after('keydown', this._keyStrokeListener, this);

            // Turn into wysiwyg edit field.
            $(cardNode.getDOMNode()).wysiwyg();

            cardNode.focus();
        },

        _switchToViewMode: function () {
            var activeCardNode        = this.get('activeCardNode'),
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

            activeCardNode.detach('clickoutside');
            activeCardNode.detach('clickoutside');
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

        _keyStrokeListener: function (event) {
            var keyCode = event.keyCode,
                textCursorPosition = window.getSelection().extentOffset,
                firstChar = this.get('firstChar');

            if (keyCode === 13 && event.shiftKey) {
                event.preventDefault();
                this._switchToViewMode();

            } else if (textCursorPosition === 0) {
                this.set('firstChar', keyCode);

            } else if (keyCode === 32 && textCursorPosition === 1) {
                if (firstChar === 189) {
                    event.preventDefault();
                    document.execCommand('insertUnorderedList');
                    document.execCommand('delete');
                } else if (firstChar === 187) {
                    event.preventDefault();
                    document.execCommand('insertOrderedList');
                    document.execCommand('delete');
                    document.execCommand('insertHTML', false, '<input type="checkbox"/>');
                }
            }
        }

    }, {

        ATTRS: {
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
