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
const urlJoin = require('url-join');
const config = require('config');
const multer = require('multer');
const crypto = require('crypto');
const async = require('async');
const knex = require('knex');
const path = require('path');
const fs = require('fs');

const DB = knex(config.get('database'));
const random = new Random(Random.engines.browserCrypto);

const storage = multer.diskStorage({
    destination: config.get('files.uploadFolder'),
    filename: (req, file, cb) => cb(null, random.string(32) + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: config.get('files.maxUploadSize') + 'MB' } }).array('files[]');

function processUploadedFiles(req, res, err) {
    if (err) {
        console.warn(err); // TODO: Handle errors properly
        return res.status(500).json({ success: false, error: 'Unexpected server error' });
    }
    
    if (!req.files.length) return res.status(400).json({ success: false, error: 'No files' });
    
    async.each(req.files, (file, cb) => {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream('./' + config.get('files.uploadFolder') + '/' + file.filename);
        
        stream.on('data', data => { hash.update(data, 'utf8'); });
        stream.on('end', () => {
            file.hash = hash.digest('hex');
            return cb();
        });
    }, err => {
        if (err) {
            console.warn(err); // TODO: Handle errors properly
            return res.status(500).json({ success: false, error: 'Unexpected server error' });
        }
        return checkUploadedFiles(req, res);
    });
}

function checkUploadedFiles(req, res) {
    const existingFiles = [];
    const newFiles = [];
    
    async.each(req.files, (file, cb) => {
        DB.table('files').where({ hash: file.hash, size: file.size })
            .then(result => {
                if (result.length) { // If the file already exists
                    deleteFile(file);
                    existingFiles.push(result[0]);
                    return cb();
                }
               
                newFiles.push({
                    original: file.originalname,
                    file: path.basename(file.path, path.extname(file.path)),
                    extension: path.extname(file.path),
                    size: file.size,
                    hash: file.hash,
                    ip: req.ip
                });
                
                return cb();
            });
    }, err => {
        if (err) { // TODO: Handle errors properly
            console.warn(err);
            return res.status(500).json({ success: false, error: 'Unexpected server error' });
        }
        
        if (newFiles.length) return saveUploadedFiles(req, res, newFiles, existingFiles);
        return respondWithFiles(req, res, existingFiles);
    });
}

function saveUploadedFiles(req, res, newFiles, existingFiles) {
    const files = [];
    
    async.each(newFiles, (file, cb) => {
        saveFile(file).then(() => cb()).catch(err => cb(err));
    }, err => {
        if (err) { // TODO: Handle errors properly
            console.warn(err);
            return res.status(500).json({ success: false, error: 'Unexpected server error' });
        }
    
        Object.assign(files, newFiles, existingFiles);
        return respondWithFiles(req, res, files);
    });
}

function saveFile(file) {
    return new Promise((resolve, reject) => {
        file.name = random.string(config.get('files.nameLength'));
        
        DB.table('files').insert(file)
            .then(resolve)
            .catch(() => { return resolve(saveFile(file)); });
    });
}

function respondWithFiles(req, res, files) {
    return res.json({
        success: true,
        files: files.map(file => {
            return {
                name: file.name,
                size: file.size,
                url: urlJoin(config.get('site.url'), config.get('files.accessPath'), file.name + file.extension)
            };
        })
    });
}

function deleteFile(file) { fs.unlink(file.path); }

const uploadController = {};

uploadController.upload = (req, res, next) => {
    upload(req, res, err => processUploadedFiles(req, res, err));
};

module.exports = uploadController;
