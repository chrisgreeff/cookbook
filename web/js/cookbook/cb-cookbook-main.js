/*global YUI*/
YUI().use('io-base', 'json-parse', 'cb-cookbook-controller', 'cb-cookbook', 'cb-cookbook-view', 'cb-header-view', function (Y) {
    'use strict';

    var Controller = Y.CB.Controller,
        getCookbookSuccessHandler;

    getCookbookSuccessHandler = function (tx, response) {
        var cookbookJson = Y.JSON.parse(response.responseText),
            cookbook     = new Y.CB.Cookbook(cookbookJson);

        new Y.CB.CookbookView({
            model: cookbook,
            container: Y.one('.cb-wallet-list-container')
        }).render();
    };

    new Y.CB.HeaderView({
        container: Y.one('#header')
    }).render();

    Controller.getCookbook({
        successHandler: getCookbookSuccessHandler
    });

});
