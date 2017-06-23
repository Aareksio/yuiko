/*
 * Copyright 2017 Arkadiusz "Mole" Sygulski
 * Contact: arkadiusz@sygulski.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Random = require('random-js');
const config = require('config');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const Models = require('./DB').Models;

const random = new Random(Random.engines.browserCrypto);

const File = {};

File.calculateMd5 = function(file) {
    const hash = crypto.createHash('md5');
    hash.update(file.buffer);
    return hash.digest('hex');
};

File.responseFromDatabaseFile = function(databaseFile) {
    return {
        name: databaseFile.related('uploads').shift().get('name'),
        size: databaseFile.get('size'),
        extension: databaseFile.get('extension')
    };
};

File.responseFromNewUpload = function(file) {
    return {
        name: file.name,
        size: file.size,
        extension: file.extension
    };
};

File.createUpload = function(file) {
    file.name = random.string(config.get('files.nameLength'));
    
    return new Models.Upload({
        name: file.name,
        original: file.user ? file.original : null,
        hash: file.hash,
        user: file.user ? file.user : null
    }).save().catch(() => File.createUpload(file));
};

File.saveUpload = function(file) {
    return new Models.File({
        hash: file.hash,
        size: file.size,
        extension: file.extension
    }).save().then(() => File.createUpload(file));
};

File.saveFileOnDisk = function(file) {
    return fs.writeFileSync(path.join(config.get('files.uploadFolder'), file.hash + path.extname(file.originalname)), file.buffer);
};

File.processFile = function(file) {
    return new Promise((resolve, reject) => {
        Models.File
            .where({ hash: file.hash, size: file.size })
            .fetch({ withRelated: [{ uploads: q => q.where({ user: file.user ? file.user : null }) }] })
            .then(databaseFile => {
                if (databaseFile) {
                    if (databaseFile.related('uploads').first()) {
                        return resolve(File.responseFromDatabaseFile(databaseFile));
                    }
                    
                    return File.createUpload(file)
                        .then(() => resolve(File.responseFromNewUpload(file)))
                        .catch(err => reject(err));
                }
                
                File.saveFileOnDisk(file);
                return File.saveUpload(file)
                    .then(() => resolve(File.responseFromNewUpload(file)))
                    .catch(err => reject(err));
            });
    });
};

File.processUpload = function(file, cb) {
    file.hash = File.calculateMd5(file);
    file.extension = path.extname(file.originalname);
    
    File.processFile(file)
        .then(response => cb(null, response))
        .catch(err => cb(err));
};

File.findByName = function(name, cb) {
    return new Promise((resolve, reject) => {
        Models.Upload
            .where({ name })
            .fetch({ withRelated: ['file'], require: true })
            .then(upload => {
                if (!upload) return reject(new Error('Not found!'));
                
                const file = {
                    filename: upload.related('file').get('hash') + upload.related('file').get('extension'),
                    original: upload.get('original')
                };
                
                return resolve(file);
            })
            .catch(err => reject(err));
    });
};

module.exports = File;
