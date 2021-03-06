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

const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const express = require('express');
const config = require('config');
const path = require('path');
const http = require('http');
const fs = require('fs');

const filesRouter = require('./routes/files');
const redirectsRouter = require('./routes/redirects');
const homeRouter = require('./routes/home');
const apiRouter = require('./routes/api');

const errorController = require('./controllers/errorController');
const database = require('./database/migrations/initialize');
database.up();

const yuiko = express();

yuiko.locals.config = config;
yuiko.locals.gitHash = require('child_process').execSync('git rev-parse HEAD').toString().trim();

yuiko.set('trust proxy', 1);
yuiko.set('views', path.join(__dirname, 'views'));
yuiko.set('view engine', 'pug');
yuiko.set('port', config.get('http.port'));

yuiko.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
yuiko.use(bodyParser.json());
yuiko.use(bodyParser.urlencoded({ extended: true }));
yuiko.use(express.static(path.join(__dirname, 'public')));

yuiko.use('/', homeRouter);
yuiko.use('/api', apiRouter);
yuiko.use('/' + config.get('files.accessPath'), filesRouter);
yuiko.use('/' + config.get('redirects.accessPath'), redirectsRouter);
yuiko.use(errorController.error);
yuiko.use(errorController.notFound);

const httpServer = http.createServer(yuiko);
const port = process.env.PORT || config.get('http.port') || 3000;
httpServer.listen(process.env.PORT || config.get('http.port'));
httpServer.on('listening', () => { console.log(`Listening on port ${port}!`); });
