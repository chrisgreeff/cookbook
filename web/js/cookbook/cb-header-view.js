/*global YUI*/
YUI.add('cb-header-view', function (Y) {
    'use strict';

    var Handlebars = Y.Handlebars,

        _renderHeader,

        CLASS_NAMES = {
            mainHeader: 'cb-main-header',
            headingIconFile: 'cb-heading-icon-file',
            cardSearch: 'cb-card-search'
        };

    _renderHeader = Handlebars.compile(
        '<h2 class="' + CLASS_NAMES.mainHeader + '">' +
            '<span class="' + CLASS_NAMES.headingIconFile + '"></span>' +
            'Cookbook' +
        '</h2>' +
        '<input class="' + CLASS_NAMES.cardSearch + '" placeholder="Search"/>'
    );

    Y.namespace('CB').HeaderView = Y.Base.create('cb-header-view', Y.View, [], {

        initializer: function () {},

        render: function () {
            this.get('container').setHTML(_renderHeader());

            this._initializeCardSearch();
        },

        _initializeCardSearch: function () {
            this.get('container').one('.' + CLASS_NAMES.cardSearch).plug(Y.Plugin.AutoComplete, {
                resultHighlighter: 'phraseMatch',
                resultTextLocator: 'content',
                source: 'http://localhost:3000/cards'
            });
        }

    }, {
        ATTRS: {}
    });

}, '1.0.0', {
    requires: [
        'autocomplete',
        'autocomplete-highlighters',
        'base',
        'view'
    ]
});
