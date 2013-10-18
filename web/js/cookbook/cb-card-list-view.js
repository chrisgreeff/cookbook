/*global YUI*/
YUI.add('cb-card-list-view', function (Y) {

    var Micro = new Y.Template(),

        _renderCardList,

        CLASS_NAMES = {};

    _renderCardList = Micro.compile(
        '<ul>' +
            '<li class="{{CLASS_NAME.card}}">New Note</li>' +
            '<% Y.Array.each(this.cards, function(card) { %>' +
                '<li class="{{CLASS_NAME.card}}">' +
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
                cards: this.get('modelList').toJSON()
            }));

            return this;
        }
    }, {
        ATTRS: {}
    });

}, '1.0.0', { requires: ['base', 'view', 'template', 'cb-card-list'] });
