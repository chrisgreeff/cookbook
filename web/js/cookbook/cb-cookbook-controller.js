/*global YUI*/
YUI.add('cb-cookbook-controller', function (Y) {
    'use strict';

    var JSON = Y.JSON,

        DEFAULT_HEADERS,
        DEFAULT_SUCCESS_HANDLER,
        DEFAULT_ERROR_HANDLER;

    DEFAULT_HEADERS = {
        'Content-Type': 'application/json'
    };

    DEFAULT_SUCCESS_HANDLER = function (tx, response) {
        console.log(tx);
        console.log(response);
    };

    DEFAULT_ERROR_HANDLER = function (tx, response) {
        alert('Crap! Something went wrong in retrieving the data! :(');
        console.log(tx);
        console.log(response);
    };

    Y.namespace('CB').Controller = {

        getCookbook: function (config) {
            Y.io('/cookbook', {
                method: 'GET',
                headers: DEFAULT_HEADERS,
                on: {
                    success: config.successHandler || DEFAULT_SUCCESS_HANDLER,
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        },

        addWallet: function (config) {
            var wallet = config.wallet;

            Y.io('/wallets', {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                data: JSON.stringify(wallet.toJSON()),
                on: {
                    success: config.successHandler || DEFAULT_SUCCESS_HANDLER,
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        },

        updateWallet: function (config) {
            var wallet = config.wallet;

            Y.io('/wallets/' + wallet.get('_id'), {
                method: 'PUT',
                headers: DEFAULT_HEADERS,
                data: JSON.stringify(wallet.toJSON()),
                on: {
                    success: config.successHandler || DEFAULT_SUCCESS_HANDLER,
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        },

        deleteWallet: function (config) {
            var wallet = config.wallet;

            Y.io('/wallets/' + wallet.get('_id'), {
                method: 'DELETE',
                headers: DEFAULT_HEADERS,
                on: {
                    success: config.successHandler || DEFAULT_SUCCESS_HANDLER,
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        },

        addCard: function (config) {
            var card = config.card;

            Y.io('/cards', {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                data: JSON.stringify(card.toJSON()),
                on: {
                    success: function (tx, response) {
                        config.successHandler({
                            card: card,
                            response: response
                        });
                    },
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        },

        updateCard: function (config) {
            var card = config.card;

            Y.io('/cards/' + card.get('_id'), {
                method: 'PUT',
                headers: DEFAULT_HEADERS,
                data: JSON.stringify(card.toJSON()),
                on: {
                    success: config.successHandler || DEFAULT_SUCCESS_HANDLER,
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        },

        deleteCard: function (config) {
            var card = config.card;

            Y.io('/cards/' + card.get('_id'), {
                method: 'DELETE',
                headers: DEFAULT_HEADERS,
                on: {
                    success: config.successHandler || DEFAULT_SUCCESS_HANDLER,
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        }

    };


}, '1.0.0', {
    requires: [
        'base',
        'io',
        'json-stringify'
    ]
});
