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

lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            let trimmedFileNames = [];
            fileNames.forEach(fileName => trimmedFileNames.push(fileName.replace('.json', '')));
            callback(false, trimmedFileNames);
        } else {
            callback('Error reading directory')
        }
    })
};

module.exports = lib;