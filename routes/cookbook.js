var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure,
    server,
    db,
    populateDb;

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
                console.log('The "wallets" collection doesn\'t exist. Creating it with sample data...');
                populateWalletsDB();
            }
        });
        db.collection('cards', {
            strict: true
        }, function (err, collection) {
            if (err) {
                console.log('The "cards" collection doesn\'t exist. Creating it with sample data...');
                populateCardsDB();
            }
        });
    }
});

// Wallets

exports.findWalletById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving wallet: ' + id);
    db.collection('wallets', function (err, collection) {
        collection.findOne({
            '_id': new BSON.ObjectID(id)
        }, function (err, item) {
            res.send(item);
        });
    });
};

exports.findAllWallets = function (req, res) {
    db.collection('wallets', function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.send(items);
        });
    });
};

exports.addWallet = function (req, res) {
    var wallet = req.body;
    console.log('Adding wallet: ' + JSON.stringify(wallet));
    db.collection('wallets', function (err, collection) {
        collection.insert(wallet, {
            safe: true
        }, function (err, result) {
            if (err) {
                res.send({
                    'error': 'An error has occurred'
                });
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateWallet = function (req, res) {
    var id = req.params.id;
    var wallet = req.body;
    console.log('Updating wallet: ' + id);
    console.log(JSON.stringify(wallet));
    db.collection('wallets', function(err, collection) {
        collection.update({
            '_id': new BSON.ObjectID(id)
        }, wallet, {
            safe: true
        }, function(err, result) {
            if (err) {
                console.log('Error updating wallet: ' + err);
                res.send({
                    'error': 'An error has occurred'
                });
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(wallet);
            }
        });
    });
}

exports.deleteWallet = function(req, res) {
    var id = req.params.id;
    console.log('Deleting wallet: ' + id);
    db.collection('wallets', function(err, collection) {
        collection.remove({
            '_id': new BSON.ObjectID(id)
        }, {
            safe: true
        }, function(err, result) {
            if (err) {
                res.send({
                    'error': 'An error has occurred - ' + err
                });
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

// Cards

exports.findCardById = function (req, res) {
    var id = req.params.id;
    console.log('Retrieving card: ' + id);
    db.collection('cards', function (err, collection) {
        collection.findOne({
            '_id': new BSON.ObjectID(id)
        }, function (err, item) {
            res.send(item);
        });
    });
};

exports.findAllCards = function (req, res) {
    db.collection('cards', function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.send(items);
        });
    });
};

exports.addCard = function (req, res) {
    var card = req.body;
    console.log('Adding card: ' + JSON.stringify(card));
    db.collection('cards', function (err, collection) {
        collection.insert(card, {
            safe: true
        }, function (err, result) {
            if (err) {
                res.send({
                    'error': 'An error has occurred'
                });
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateCard = function (req, res) {
    var id = req.params.id;
    var card = req.body;
    console.log('Updating card: ' + id);
    console.log(JSON.stringify(card));
    db.collection('cards', function(err, collection) {
        collection.update({
            '_id': new BSON.ObjectID(id)
        }, card, {
            safe: true
        }, function(err, result) {
            if (err) {
                console.log('Error updating card: ' + err);
                res.send({
                    'error': 'An error has occurred'
                });
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(card);
            }
        });
    });
}

exports.deleteCard = function(req, res) {
    var id = req.params.id;
    console.log('Deleting card: ' + id);
    db.collection('cards', function(err, collection) {
        collection.remove({
            '_id': new BSON.ObjectID(id)
        }, {
            safe: true
        }, function(err, result) {
            if (err) {
                res.send({
                    'error': 'An error has occurred - ' + err
                });
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
populateWalletsDB = function() {
    var wallets = [{
        id: 'wallet-1',
        date: 'today',
        cards: ['card-1']
    }, {
        id: 'wallet-2',
        date: 'yesterday',
        cards: ['card-2', 'card-3']
    }];

    db.collection('wallets', function(err, collection) {
        collection.insert(wallets, {
            safe: true
        }, function (err, result) {});
    });
};

populateCardsDB = function() {
    var cards = [{
            id: 'card-1',
            content: 'Test card 1',
            dateLastEdited: 'Sun Nov 03 2013 15:12:05 GMT+1300 (NZDT)',
            dateCreated: 'Sun Nov 03 2013 15:12:05 GMT+1300 (NZDT)',
            wallet: 'wallet-1'
        }, {
            id: 'card-2',
            content: 'Testing card 2',
            dateLastEdited: 'Sun Nov 03 2013 17:12:05 GMT+1300 (NZDT)',
            dateCreated: 'Sun Nov 03 2013 17:12:05 GMT+1300 (NZDT)',
            wallet: 'wallet-1'
        }, {
            id: 'card-3',
            content: 'Testing card 3',
            dateLastEdited: 'Wed Nov 06 2013 22:44:04 GMT+1300 (NZDT)',
            dateCreated: 'Wed Nov 06 2013 22:44:04 GMT+1300 (NZDT)',
            wallet: 'wallet-2'
        }];

    db.collection('cards', function(err, collection) {
        collection.insert(cards, {
            safe: true
        }, function (err, result) {});
    });
};
