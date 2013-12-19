(function () {
    var shortcutBannerNode = $('#cb-shortcut-banner'),
        shortcutLogoNode   = $('#cb-shortcut-logo'),

        SHORTCUT_BANNER_HEIGHT = 400,
        IS_VISIBLE_CLASS_NAME = 'is-visible';


    shortcutLogoNode.on('click', function (event) {
        var isVisible = shortcutLogoNode.hasClass(IS_VISIBLE_CLASS_NAME);

        event.preventDefault();
        event.stopPropagation();

        shortcutBannerNode[isVisible ? 'slideUp' : 'slideDown'](SHORTCUT_BANNER_HEIGHT);
        shortcutLogoNode.toggleClass(IS_VISIBLE_CLASS_NAME);
    });
}());
