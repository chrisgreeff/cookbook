db:
	/usr/local/mongodb/bin/mongod

cb:
	node server.js

drop-db:
	/usr/local/mongodb/bin/mongo cookbookdb --eval "db.dropDatabase()"

install-npm-modules:
	npm install

install-mongo:
	curl http://downloads.mongodb.org/osx/mongodb-osx-x86_64-2.4.8.tgz > ~/Downloads/mongo.tgz
	tar -zxvf ~/Downloads/mongo.tgz
	sudo mkdir /usr/local/mongodb
	sudo mv -n mongodb-osx-x86_64-2.4.8/* /usr/local/mongodb
	sudo mkdir -p /data/db
	sudo chown `id -u` /data/db

install: install-mongo install-npm-modules
