/*global YUI*/
YUI().use(
    'io-base',
    'json-parse',
    'cb-cookbook-controller',
    'cb-cookbook',
    'cb-cookbook-view',
    'cb-header-view',
function (Y) {
    'use strict';

    var CB = Y.CB,
        Controller = CB.Controller,
        getCookbookSuccessHandler;

    getCookbookSuccessHandler = function (tx, response) {
        var cookbookJson = Y.JSON.parse(response.responseText),
            cookbook     = new CB.Cookbook(cookbookJson);

        new CB.CookbookView({
            model: cookbook,
            container: Y.one('#main')
        }).render();
    };

    new CB.HeaderView({
        container: Y.one('#header')
    }).render();

    Controller.getCookbook({
        successHandler: getCookbookSuccessHandler
    });

});
