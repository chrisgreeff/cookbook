/*global YUI*/
YUI.add('cb-card-list', function (Y) {
    'use strict';

    Y.namespace('CB').CardList = Y.Base.create('cb-card-list', Y.ModelList, [], {
        model: Y.CB.Card
    }, {
        ATTRS: {
            mode: {}
        }
    });

}, '1.0.0', { requires: ['base', 'model-list', 'cb-card'] });
