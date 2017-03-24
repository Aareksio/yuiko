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

const DB = require('../../models/DB').DB;
const Enum = require('../../resources/Enum');

module.exports.up = () => {
    DB.schema
        .createTableIfNotExists('files', table => {
            table.string('hash');
            table.string('size');
            table.string('extension');
            
            table.primary(['hash', 'size']);
        })
        .createTableIfNotExists('uploads', table => {
            table.string('name').primary();
            table.string('original');
            table.string('user');
            table.string('hash');
            table.timestamp('timestamp').defaultTo(DB.fn.now());
            
            table.foreign('hash').references('files.hash');
            table.foreign('user').references('users.username');
        })
        .createTableIfNotExists('users', table => {
            table.string('username').primary();
            table.integer('access').unsigned().defaultTo(Enum.UserAccess.User);
            table.string('password');
            table.string('salt');
            table.timestamp('created').defaultTo(DB.fn.now());
        })
        .then();
};

module.exports.down = () => {
    DB.schema
        .dropTable('files')
        .dropTable('users')
        .dropTable('uploads')
        .then();
};
