/*global YUI*/
YUI.add('cb-card-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Card = Y.CB.Card,

        _renderCardList,

        CLASS_NAMES = {
            card: 'cb-card'
        };

    _renderCardList = Micro.compile(
        '<li class="' + CLASS_NAMES.card + '">New Note</li>' +
        '<% Y.Array.each(this.cards, function(card) { %>' +
            '<li class="' + CLASS_NAMES.card + '" data-id="<%= card.id %>">' +
                '<%== card.content %>' +
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

            container.delegate('click', this._switchToEditMode, '.' + CLASS_NAMES.card, this);

            return this;
        },

        // ================ PRIVATE FUNCTIONS ===============
        _createAndSaveCard: function (cardContent) {
            var modelList = this.get('modelList'),
                now = Date.now();

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
        _switchToEditMode: function (event) {
            var cardNode = event.target,
                cardList = this.get('modelList');

            this.get('modelList').set('mode', 'edit');
            this.set('activeCardNode', cardNode);
            this.get('container').detach('click');

            if (!cardNode.getData('id')) {
                cardNode.empty();
            }

            cardNode.on('clickoutside', this._switchToViewMode, this);

            // Turn into wysiwyg edit field.
            $(event.target.getDOMNode()).wysiwyg();

            cardNode.focus();
        },

        _switchToViewMode: function (event) {
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
            this.set('activeCardNode', null);

            this._sortCardList();
        }

    }, {
        ATTRS: {
            activeCardNode: {
                value: null
            }
        }
    });

}, '1.0.0', { requires: ['base', 'event-outside', 'view', 'template', 'cb-card-list'] });
