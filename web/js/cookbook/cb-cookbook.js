/*global YUI*/
YUI.add('cb-cookbook', function (Y) {
    'use strict';

    var Lang = Y.Lang,
        WalletList = Y.CB.WalletList,
        WalletListView = Y.CB.WalletListView;

    Y.namespace('CB').Cookbook = Y.Base.create('cb-cookbook', Y.Model, [], {

        initializer: function () {
            var walletListView;

            // Build the view with the card list restrieved.
            walletListView = new WalletListView({
                modelList: this.get('wallets'),
                container: Y.one('.cb-wallet-container')
            });

            walletListView.render();
        }

    }, {

        ATTRS: {

            /**
             * The wallets that belong to the cookbook
             *
             * @attribute wallets
             * @type {WalletList}
             */
            wallets: {
                setter: function (value) {
                    var wallets,
                        result;

                    wallets = this.get('wallets');

                    // If the value passed is already an instance of WalletList, destroy the existing and use the
                    // one passed.
                    if (value instanceof WalletList) {
                        if (wallets) {
                            wallets.destroy();
                        }
                        return value;
                    }

                    // Otherwise reset the WalletList with the values passed.
                    if (Lang.isObject(value)) {
                        if (wallets) {
                            return wallets.reset({
                                items: value
                            });
                        } else {
                            return new WalletList({
                                items: value
                            });
                        }
                    }

                    return Y.Attribute.INVALID_VALUE;
                },

                valueFn: function () {
                    return new WalletList();
                }
            }

        }

    });

}, '1.0.0', {
    requires: [
        'base',
        'model',
        'cb-wallet-list',
        'cb-wallet-list-view'
    ]
});
