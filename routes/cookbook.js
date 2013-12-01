var mongo     = require('mongodb'),
    Utilities = require('../utilities/route-utilities').Utilities,
    Server    = mongo.Server,
    Db        = mongo.Db,
    BSON      = mongo.BSONPure,
    server,
    db;

console.log(Utilities);

server = new Server('localhost', 27017, {
    auto_reconnect: true
});

db = new Db('cookbookdb', server);

db.open(function (err, db) {
    if (!err) {
        console.log('Connected to "cookbookdb" database');

        db.collection('wallets', {
            strict: true
        }, function (err, collection) {
            if (err) {
                Utilities.populateWalletsDB(db);
            }
        });
        db.collection('cards', {
            strict: true
        }, function (err, collection) {
            if (err) {
                Utilities.populateCardsDB(db);
            }
        });
    }
});

exports.findAllWalletsAndCards = function (request, response) {
    var result = {};

    db.collection('wallets', function (err, walletCollection) {
        walletCollection.find().toArray(function (err, wallets) {
            result.wallets = wallets;

            db.collection('cards', function (err, cardCollection) {
                cardCollection.find().toArray(function (err, cards) {
                    result.cards = cards;

                    response.send(result);
                });
            });
        });
    });
};

// Wallets

exports.findAllWallets = function (request, response) {
    Utilities.findAll({ db: db, name: 'wallets', request: request, response: response });
};

exports.findWalletById = function (request, response) {
    Utilities.findById({ db: db, name: 'wallets', request: request, response: response });
};

exports.addWallet = function (request, response) {
    Utilities.addObject({ db: db, name: 'wallets', request: request, response: response });
};

exports.updateWallet = function (request, response) {
    Utilities.updateById({ db: db, name: 'wallets', request: request, response: response });
};

exports.deleteWallet = function(request, response) {
    Utilities.deleteById({ db: db, name: 'wallets', request: request, response: response });
};

// Cards

exports.findAllCards = function (request, response) {
    Utilities.findAll({ db: db, name: 'cards', request: request, response: response });
};

exports.findCardById = function (request, response) {
    Utilities.findById({ db: db, name: 'cards', request: request, response: response });
};

exports.addCard = function (request, response) {
    Utilities.addObject({ db: db, name: 'cards', request: request, response: response });
};

exports.updateCard = function (request, response) {
    Utilities.updateById({ db: db, name: 'cards', request: request, response: response });
};

exports.deleteCard = function(request, response) {
    Utilities.deleteById({ db: db, name: 'cards', request: request, response: response });
};
