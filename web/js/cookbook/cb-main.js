YUI().use(
    'io-base',
    'json-parse',
    'cb-cookbook',
    'cb-cookbook-view',
function (Y) {
    'use strict';

    var getCookbookSuccessHandler;

    getCookbookSuccessHandler = function (tx, response) {
        var cookbookJson = Y.JSON.parse(response.responseText),
            cookbook = new Y.CB.Cookbook(cookbookJson);

        new Y.CB.CookbookView({
            model: cookbook,
            container: Y.one('.cb-wallet-list-container')
        }).render();
    };

    Y.io('/cookbook', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        on: {
            success: getCookbookSuccessHandler,

            failure: function (tx, response) {
                alert('Crap! Something went wrong in retrieving the data! :(');
            }
        }
    });
});
