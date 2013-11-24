var express  = require('express'),
    url      = require('url'),
    path     = require('path'),
    fs       = require('fs'),
    cookbook = require('./routes/cookbook'),
    app;

app = express();

app.configure(function () {
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.use(express.static(__dirname + '/web'));

// Wallets
app.get('/wallets', cookbook.findAllWallets);
app.get('/wallets/:id', cookbook.findWalletById);
app.post('/wallets', cookbook.addWallet);
app.put('/wallets/:id', cookbook.updateWallet);
app.delete('/wallets/:id', cookbook.deleteWallet);

// Cards
app.get('/cards', cookbook.findAllCards);
app.get('/cards/:id', cookbook.findCardById);
app.post('/cards', cookbook.addCard);
app.put('/cards/:id', cookbook.updateCard);
app.delete('/cards/:id', cookbook.deleteCard);

app.listen(3000);
console.log('Listening on port 3000...');
