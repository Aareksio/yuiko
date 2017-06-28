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

const Redirect = require('../models/Redirect');

const redirectController = {};

redirectController.redirect = (req, res, next) => {
    const name = req.params.name;

    Redirect.find(name)
        .then(url => res.redirect(url))
        .catch(err => next());
};

redirectController.shorten = (req, res, next) => {
    Redirect.shorten(req.body.url)
        .then(name => {
            res.json({
                success: true,
                name: name,
                url: urlJoin(config.get('site.url'), config.get('redirects.accessPath'), name)
            })
        })
        .catch(err => {
            switch(err) {
                case 'Not an URL':
                    return res.status(400).json({ success: false, error: err });
                default:
                    console.warn(err);
                    return res.status(500).json({ success: false, error: 'Unexpected server error' });
            }
        });
};

module.exports = redirectController;
