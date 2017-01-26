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

module.exports = DB => {
    DB.schema.createTableIfNotExists('files', table => {
        table.string('name', config.get('files.nameLength')).primary();
        table.string('original', 255);
        table.string('file', 32);
        table.string('extension', 32);
        table.string('size', 32);
        table.string('hash', 32);
        table.string('ip', 15);
        table.timestamp('timestamp').defaultTo(DB.fn.now());
    }).then(); // Knex won't execute the query unless we call "then"
};
