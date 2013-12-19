/*global YUI*/
YUI.add('cb-header-view', function (Y) {
    'use strict';

    var Handlebars = Y.Handlebars,

        _renderHeader,

        CLASS_NAMES = {
            appTitle: 'app-title',
            button: 'cb-button',
            isVisible: 'is-visible',
            mainHeader: 'cb-main-header',
            shortcutTable: 'cb-shortcut-table'
        },

        SHORTCUT_BANNER_HEIGHT = 400;

    _renderHeader = Handlebars.compile(
        '<h1 class="' + CLASS_NAMES.mainHeader + '">' +
            '<a href="/cookbook.html" class="' + CLASS_NAMES.appTitle + '">cookbook</a>' +
        '</h1>' +
        '<a href="#">' +
            '<div id="cb-shortcut-logo"></div>' +
        '</a>' +
        '<div id="cb-shortcut-banner">' +
            '<table>' +
                '<tr class="' + CLASS_NAMES.shortcutTable + '">' +
                    '<td><span class="' + CLASS_NAMES.button + '">Shift + N </span>Create new card</td>' +
                    '<td><span class="' + CLASS_NAMES.button + '">Shift + ⏎ </span>Save card</td>' +
                    '<td><span class="' + CLASS_NAMES.button + '">= ␣</span>Create list</td>' +
                    '<td><span class="' + CLASS_NAMES.button + '">- ␣</span>Create bullet</td>' +
                '</tr>' +
            '</table>' +
        '</div>'
    );

    Y.namespace('CB').HeaderView = Y.Base.create('cb-header-view', Y.View, [], {

        render: function () {
            this.get('container').setHTML(_renderHeader());

            this._initializeLogoHandler();
        },

        // ================================================================================
        // ============================== PRIVATE FUNCTIONS ===============================
        // ================================================================================

        _initializeLogoHandler: function () {
            var container        = this.get('container'),
                shortcutLogoNode = container.one('#cb-shortcut-logo');

            shortcutLogoNode.on('click', this._toggleShortcutBanner, this);
        },

        // ================================================================================
        // =============================== EVENT HANDLERS =================================
        // ================================================================================

        _toggleShortcutBanner: function (event) {
            var container          = this.get('container'),
                shortcutLogoNode   = container.one('#cb-shortcut-logo'),
                shortcutBannerNode = $(container.one('#cb-shortcut-banner').getDOMNode()),
                isVisible          = shortcutLogoNode.hasClass(CLASS_NAMES.isVisible);

            event.preventDefault();
            event.stopPropagation();

            shortcutBannerNode[isVisible ? 'slideUp' : 'slideDown'](SHORTCUT_BANNER_HEIGHT);
            shortcutLogoNode.toggleClass(CLASS_NAMES.isVisible);
        }
    });

}, '1.0.0', {
    requires: [
        'base',
        'event-outside',
        'handlebars',
        'view'
    ]
});
