/*global YUI*/
YUI.add('cb-cookbook-view', function (Y) {
    'use strict';

    var Handlebars = Y.Handlebars,

        _renderCookbook,

        CLASS_NAMES = {
            walletList: 'cb-wallet-list'
        };

    _renderCookbook = Handlebars.compile(
        '<ul class="' + CLASS_NAMES.walletList + '">' +
            '{{#each wallets}}' +
                '<li>{{date}}</li>' +
            '{{/each}}' +
        '</ul>'
    );

    Y.namespace('CB').CookbookView = Y.Base.create('cb-cookbook-view', Y.View, [], {

        initializer: function () {

        },

        render: function () {
            this.get('container').setHTML(_renderCookbook({
                wallets: this.get('model').get('wallets').toJSON()
            }));
        }

    }, {
        ATTRS: {}
    });

}, '1.0.0', {
    requires: [
        'base', 'handlebars'
    ]
});
