/*global YUI*/
YUI.add('cb-card', function (Y) {
    'use strict';

    Y.namespace('CB').Card = Y.Base.create('cb-card', Y.Model, [], {}, {
        ATTRS: {
            mode: {}
        }
    });

}, '1.0.0', { requires: ['base', 'model'] });
