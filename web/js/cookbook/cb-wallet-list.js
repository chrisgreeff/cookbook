/*global YUI*/
YUI.add('cb-wallet-list', function (Y) {
    'use strict';

    Y.namespace('CB').WalletList = Y.Base.create('cb-wallet-list', Y.ModelList, [], {
        model: Y.CB.Wallet,

        /**
         * Returns the wallet with the specified date.
         *
         * @method getWalletByDate
         * @param  {Date | String} date The date to get the wallet by.
         * @return {Wallet} The wallet that matches the date.
         */
        getWalletByDate: function (date) {
            var dateValue = (typeof date === 'string') ? date : date.toString(),
                result    = null;

            this.some(function (wallet) {
                if (wallet.get('date').toString() === dateValue) {
                    result = wallet;
                    return true;
                }
            });

            return result;
        },

        /**
         * Returns the wallet with the specified date.
         *
         * @method getWalletBySimpleDate
         * @param  {Date | String} date The date to get the wallet by.
         * @return {Wallet} The wallet that matches the date.
         */
        getWalletBySimpleDate: function (date) {
            var simpleDate = this._getSimpleDate(date),
                result;

            this.some(function (wallet) {
                if (this._getSimpleDate(wallet.get('date')) === simpleDate) {
                    result = wallet;
                    return true;
                }
            }, this);

            return result;
        },

        // Sorting by dateLastEdited when modelList.sort() is called.
        comparator: function (model) {
            return model.get('date');
        },

        _compare: function (a, b) {
            return a < b ? 1 : (a > b ? -1 : 0);
        },

        _getSimpleDate: function (date) {
            var day   = date.getDate(),
                month = date.getMonth() + 1,
                year  = date.getFullYear();

            return day + '/' + month + '/' + year;
        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model-list',
        'cb-wallet'
    ]
});
