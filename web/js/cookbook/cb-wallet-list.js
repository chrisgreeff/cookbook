/*global YUI*/
YUI.add('cb-wallet-list', function (Y) {
    'use strict';

    Y.namespace('CB').WalletList = Y.Base.create('cb-wallet-list', Y.ModelList, [], {
        model: Y.CB.Wallet,

        // Sorting by dateLastEdited when modelList.sort() is called.
        comparator: function (model) {
            return model.get('date');
        },

        _compare: function (a, b) {
            return a < b ? 1 : (a > b ? -1 : 0);
        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model-list',
        'cb-wallet'
    ]
});
