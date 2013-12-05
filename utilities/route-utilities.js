var mongo = require('mongodb')
    BSON  = mongo.BSONPure;

exports.Utilities = {

    findAll: function (config) {
        var db       = config.db,
            name     = config.name,
            response = config.response;

        db.collection(name, function (err, collection) {
            collection.find().toArray(function (err, items) {
                response.send(items);
            });
        });
    },

    findById: function (config) {
        var db       = config.db,
            id       = config.request.params.id,
            response = config.response,
            name     = config.name;

        console.log('Retrieving ' + name + ': ' + id);

        db.collection(name, function (err, collection) {
            collection.findOne({
                '_id': new BSON.ObjectID(id)
            }, function (err, item) {
                response.send(item);
            });
        });
    },

    addObject: function (config) {
        var db       = config.db,
            name     = config.name,
            body     = config.request.body,
            response = config.response;

        console.log('Adding to ' + name + ': ' + JSON.stringify(body));

        db.collection(name, function (err, collection) {
            collection.insert(body, {
                safe: true
            }, function (err, result) {
                if (err) {
                    console.log('Error adding to ' + name + ': ' + err);
                    response.send({
                        'error': 'An error has occurred adding to ' + name
                    });
                } else {
                    console.log('Success: ' + JSON.stringify(result[0]));
                    response.send(result[0]);
                }
            });
        });
    },

    updateById: function (config) {
        var db       = config.db,
            name     = config.name,
            request  = config.request,
            response = config.response,
            id       = request.params.id,
            body     = request.body;

        // We cannot modify _id, so deleting it from the update object.
        delete body._id;

        console.log('Updating ' + name + ': ' + id);
        console.log('With: ' + JSON.stringify(body));

        db.collection(name, function(err, collection) {
            collection.update({
                '_id': new BSON.ObjectID(id)
            }, body, {
                safe: true
            }, function(err, result) {
                if (err) {
                    console.log('Error updating ' + name + ': ' + err);
                    response.send({
                        'error': 'An error has occurred updating ' + name
                    });
                } else {
                    console.log('Success: ' + result + ' document(s) updated in ' + name);
                    response.send(body);
                }
            });
        });
    },

    deleteById: function (config) {
        var db       = config.db,
            request  = config.request,
            response = config.response,
            id       = request.params.id,
            name     = config.name;

        console.log('Deleting from ' + name + ': ' + id);

        db.collection(name, function(err, collection) {
            collection.remove({
                '_id': new BSON.ObjectID(id)
            }, {
                safe: true
            }, function(err, result) {
                if (err) {
                    console.log('Error deleting from ' + name + ': ' + err);
                    response.send({
                        'error': 'An error has occurred deleting from ' + name
                    });
                } else {
                    console.log('Success: ' + result + ' document(s) deleted from ' + name);
                    response.send(request.body);
                }
            });
        });
    },

    populateWalletsDB: function (db) {
        var wallets = [{
            id: 'my-first-wallet',
            date: new Date().toString(),
            cards: ['my-first-card']
        }];

        console.log('The "wallets" collection doesn\'t exist. Creating it with sample data...');

        db.collection('wallets', function(err, collection) {
            collection.insert(wallets, {
                safe: true
            }, function (err, result) {});
        });
    },

    populateCardsDB: function (db) {
        var now = new Date().toString(),
            cards = [{
                id: 'my-first-card',
                content: 'Welcome to Cookbook! Hope you enjoy this awesome application!',
                dateLastEdited: now,
                dateCreated: now,
                wallet: 'my-first-wallet'
            }];

        console.log('The "cards" collection doesn\'t exist. Creating it with sample data...');

        db.collection('cards', function(err, collection) {
            collection.insert(cards, {
                safe: true
            }, function (err, result) {});
        });
    }
};
