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
const knex = require('knex');
const Bookshelf = require('bookshelf');

const DB = knex(config.get('database'), {debug: true});
const bookshelf = Bookshelf(DB);

const Models = {};

Models.File = bookshelf.Model.extend({
    tableName: 'files',
    columnNames: ['file'],
    uploads: function() {
        return this.hasMany(Models.Upload, 'hash', 'hash');
    }
});

Models.Upload = bookshelf.Model.extend({
    tableName: 'uploads',
    file: function() {
        return this.hasOne(Models.File, 'hash', 'hash');
    },
    owner: function() {
        return this.hasOne(Models.User, 'user', 'username');
    }
});

Models.User = bookshelf.Model.extend({
    tableName: 'users',
    uploads: function() {
        return this.hasMany(Models.Upload);
    }
});

module.exports = { DB, Models };
