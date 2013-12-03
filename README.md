Cookbook
========

This is just a place for me to hack together a little recipe web app.

## Commands

### Installation Commands

These commands install any dependencies you need to run cookbook locally.

- Install Everything (Mongodb and NPM dependencies)
```bash
$ make install
```

All you really need is the one above. But the seperate install commands are:

- Install Mongodb
```bash
$ make install-mongo
```

- Install NPM Dependencies
```bash
$ npm install
```

### Server Commands

Be sure to run these commands (IN ORDER) in separate terminals to start the application.

1. Start Database Server
```bash
$ make db
```

2. Start Web Server
```bash
$ make cb
```

Once both of these are running, open this page: http://localhost:3000/cookbook.html
