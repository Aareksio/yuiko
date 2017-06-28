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

const validUrl = require('valid-url');
const Random = require('random-js');
const crypto = require('crypto');
const config = require('config');

const Models = require('./DB').Models;

const random = new Random(Random.engines.browserCrypto);

const Redirect = {};

Redirect.find = Redirect.findByName = function(name) {
    return new Promise((resolve, reject) => {
        Models.Redirect
            .where({ name })
            .fetch({ require: true })
            .then(url => resolve(url.get('url')))
            .catch(err => reject(err));
    });
};

Redirect.shorten = function(url) {
    return new Promise((resolve, reject) => {
        if (!validUrl.isUri(url)) return reject('Not an URL');

        const name = random.string(config.get('redirects.nameLength'));
        return new Models.Redirect({ name, url })
            .save()
            .then(() => resolve(name))
            .catch(() => Redirect.shorten(url));
    });
};

module.exports = Redirect;
