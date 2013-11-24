YUI().use(
    'io-base',
    'json-parse',
    'cb-cookbook',
function (Y) {
    Y.io('/wallets', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        on: {
            success: function (tx, response) {
                console.log(cookbookJson);
                // var cookbookJson = Y.JSON.parse(response.responseText);
                // new Y.CB.Cookbook(cookbookJson);
            },

            failure: function (tx, response) {
                alert('Crap! Something went wrong in retrieving the data! :(');
            }
        }
    });
});
