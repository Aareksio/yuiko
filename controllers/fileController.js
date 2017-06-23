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

const config = require('config');
const path = require('path');

const Models = require('../models/DB').Models;
const File = require('../models/File');

const fileController = {};

fileController.serveFile = (req, res, next) => {
    const name = path.basename(req.params.filename, path.extname(req.params.filename));
    
    File.findByName(name)
        .then(file => {
            res.sendFile(path.join(config.get('files.uploadFolder'), file.filename), {
                root: './',
                headers: { 'Content-disposition': 'inline; filename=' + (file.original ? file.original : req.params.filename) }
            });
        })
        .catch(err => next());
};

module.exports = fileController;
