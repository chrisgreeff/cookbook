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
        alert('Crap! Something went wrong :( Give Mr G a call!');
        console.log(tx);
        console.log(response);
    };

    Y.namespace('CB').Controller = {

        /**
         * Retrieves all wallets and cards in the cookbook instance.
         *
         * @method getCookbook
         * @param  {Object} config
         *         @param {Function} successHandler The success handler for the transaction.
         *         @param {Function} errorHandler The error handler for the transaction.
         */
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

        /**
         * Persists the passed wallet.
         *
         * @method addWallet
         * @param  {Object} config
         *         @param {Object} wallet The wallet object to persist.
         *         @param {Function} successHandler The success handler for the transaction.
         *         @param {Function} errorHandler The error handler for the transaction.
         */
        addWallet: function (config) {
            var wallet = config.wallet;

            Y.io('/wallets', {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                data: JSON.stringify(wallet.toJSON()),
                on: {
                    success: function (tx, response) {
                        config.successHandler({
                            model: wallet,
                            response: response
                        });
                    },
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        },

        /**
         * Updates the passed wallet.
         *
         * @method updateWallet
         * @param  {Object} config
         *         @param {Object} wallet The wallet object to update.
         *         @param {Function} successHandler The success handler for the transaction.
         *         @param {Function} errorHandler The error handler for the transaction.
         */
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

        /**
         * Deletes the passed wallet.
         *
         * @method deleteWallet
         * @param  {Object} config
         *         @param {Object} wallet The wallet object to delete.
         *         @param {Function} successHandler The success handler for the transaction.
         *         @param {Function} errorHandler The error handler for the transaction.
         */
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

        /**
         * Persists the passed card.
         *
         * @method addCard
         * @param  {Object} config
         *         @param {Object} card The card object to persist.
         *         @param {Function} successHandler The success handler for the transaction.
         *         @param {Function} errorHandler The error handler for the transaction.
         */
        addCard: function (config) {
            var card = config.card;

            Y.io('/cards', {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                data: JSON.stringify(card.toJSON()),
                on: {
                    success: function (tx, response) {
                        config.successHandler({
                            model: card,
                            response: response
                        });
                    },
                    failure: config.errorHandler || DEFAULT_ERROR_HANDLER
                }
            });
        },

        /**
         * Updates the passed card.
         *
         * @method updateCard
         * @param  {Object} config
         *         @param {Object} card The card object to update.
         *         @param {Function} successHandler The success handler for the transaction.
         *         @param {Function} errorHandler The error handler for the transaction.
         */
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

        /**
         * Deletes the passed card.
         *
         * @method addCard
         * @param  {Object} config
         *         @param {Object} card The card object to delete.
         *         @param {Function} successHandler The success handler for the transaction.
         *         @param {Function} errorHandler The error handler for the transaction.
         */
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
