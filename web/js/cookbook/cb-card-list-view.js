/*global YUI*/
YUI.add('cb-card-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),
        Card  = Y.CB.Card,
        CardView = Y.CB.CardView,

        _renderCardList,

        CLASS_NAMES = {
            card: 'cb-card',
            cardList: 'cb-card-list',
            cardContainer: 'cb-card-container',
            cardActive: 'cb-card-active',
            cardTodoCheckbox: 'cb-card-todo--checkbox',
            cardNote: 'cb-card-note',
            cardTodo: 'cb-card-todo',
            newCard: 'cb-card-new',
            iconUnchecked: 'cb-card-todo--icon-checkbox-unchecked',
            iconChecked: 'cb-card-todo--icon-checkbox-checked'
        };

    _renderCardList = Micro.compile(
        '<ul class="' + CLASS_NAMES.cardList + '">' +
            '<% Y.Array.each(this.cards, function(card) { %>' +
                '<li class="' + CLASS_NAMES.cardContainer + '" data-id="<%= card.id %>"></li>' +
            '<% }); %>' +
        '</ul>'
    );

    Y.namespace('CB').CardListView = Y.Base.create('cb-card-list-view', Y.View, [], {

        initializer: function () {
            this.get('modelList').after(['add', 'remove', 'reset'], this.render, this);
        },

        render: function () {
            var container = this.get('container'),
                cardList = this.get('modelList');

            container.setHTML(_renderCardList({
                cards: cardList.toJSON()
            }));

            cardList.each(function (card) {
                var cardContainer = container.one('li[data-id="' + card.get('id') + '"]'),
                    cardView;

                cardView = new CardView({
                    model: card,
                    container: cardContainer
                });

                cardView.render();
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
            var container = this.get('container');

            container.delegate('mousedown', this._toggleCheckbox, '.' + CLASS_NAMES.cardTodoCheckbox, this);
            container.delegate('click', this._activateCardForEditing, '.' + CLASS_NAMES.card, this);
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
            card = this.get('modelList').getById(cardId);
            card.set('active', true);
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
        'template',
        'cb-card-list',
        'cb-card-view'
    ]
});
