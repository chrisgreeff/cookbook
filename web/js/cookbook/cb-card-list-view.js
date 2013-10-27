/*global YUI*/
YUI.add('cb-card-list-view', function (Y) {
    'use strict';

    var Micro = new Y.Template(),

        _renderCardList,

        CLASS_NAMES = {
            card: 'cb-card'
        };

    _renderCardList = Micro.compile(
        '<ul>' +
            '<li class="' + CLASS_NAMES.card + '">New Note</li>' +
            '<% Y.Array.each(this.cards, function(card) { %>' +
                '<li class="' + CLASS_NAMES.card + '">' +
                    '<%= card.content %>' +
                '</li>' +
            '<% }); %>' +
        '</ul>'
    );

    Y.namespace('CB').CardListView = Y.Base.create('cb-card-list-view', Y.View, [], {

        initializer: function () {
            var list = this.get('modelList');

            list.after(['add', 'remove', 'reset', '*.change'], this.render, this);
        },

        render: function () {
            this.get('container').setHTML(_renderCardList({
                cards: this.get('modelList').toJSON(),
                CLASS_NAMES: CLASS_NAMES
            }));

            return this;
        }
    }, {
        ATTRS: {}
    });

}, '1.0.0', { requires: ['base', 'view', 'template', 'cb-card-list'] });
