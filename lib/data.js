const fs = require('fs');
const path = require('path');
const lib = {};
lib.basedir = path.join(__dirname, '/../.data/');




lib.create = (dir, file, data, callback) => {

    fs.open(lib.basedir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {

        const stringData = JSON.stringify(data);

        if (!err && fileDescriptor) {

            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false)
                        } else {
                            callback('Error closing file')
                        }
                    })
                } else {
                    callback('Error writing new file')
                }
            })
        } else {
            callback(err)
        };
    })
};

lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (err, data) => {
        callback(err, data);
    })
};

lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            fs.ftruncate(fileDescriptor, (err) => {

                const stringData = JSON.stringify(data);
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false)
                                } else {
                                    callback(err)
                                }
                            })
                        } else {
                            callback(err)
                        }
                    })
                } else {
                    callback(err)
                }
            });
        } else {
            callback(err)
        }
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false)
        } else {
            callback(err)
        }
    });
};

module.exports = lib;