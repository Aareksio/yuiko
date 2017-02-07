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

const Models = require('../lib/DB').Models;

const filesController = {};

filesController.serveFile = (req, res, next) => {
    const name = path.basename(req.params.filename, path.extname(req.params.filename));
    
    Models.Upload.where({ name }).fetch({ withRelated: ['file'], require: true })
        .then(upload => {
            if (!upload) return next();
            
            const file = upload.related('file').get('file') + upload.related('file').get('extension');
            
            res.sendFile(path.join(config.get('files.uploadFolder'), file), {
                root: './',
                headers: { 'Content-disposition': 'inline; filename=' + (upload.has('original') ? upload.get('original') : req.params.filename) }
            });
        })
        .catch(() => { return next() });
};

module.exports = filesController;
