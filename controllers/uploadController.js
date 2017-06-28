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

const urlJoin = require('url-join');
const config = require('config');
const async = require('async');

const File = require('../models/File');
const Uploader = require('../models/Uploader');

function processUploadedFiles(req, res, next) {
    if (!req.files.length) return res.status(400).json({ success: false, error: 'No files' });
    
    for (let file of req.files) {
        file.user = req.user;
    }
    
    async.map(req.files, File.processUpload, (err, uploadedFiles) => {
        if (err) {
            console.warn(err);
            return res.status(500).json({ success: false, error: 'Unexpected server error' });
        }
    
        return res.json({
            success: true,
            files: uploadedFiles.map(file => {
                return {
                    name: file.name,
                    extension: file.extension,
                    size: parseInt(file.size, 10),
                    url: urlJoin(config.get('site.url'), config.get('files.accessPath'), file.name + file.extension)
                };
            })
        });
    });
}

const uploadController = {};

uploadController.upload = processUploadedFiles;

module.exports = uploadController;
