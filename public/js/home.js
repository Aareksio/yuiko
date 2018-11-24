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

const uploadLimit = document.querySelector('meta[name="upload-limit"]').getAttribute('content');
const uploadHost = document.querySelector('meta[name="upload-host"]').getAttribute('content');
const bigUploadLimit = document.querySelector('meta[name="big-upload-limit"]').getAttribute('content');
const bigUploadHost = document.querySelector('meta[name="big-upload-host"]').getAttribute('content');

const uploadsElement = document.querySelector('.uploads');
const previewTemplateElement = document.querySelector('#previewTemplate');

const previewTemplate = previewTemplateElement.innerHTML;
previewTemplateElement.parentNode.removeChild(previewTemplateElement);

const dropzone = new Dropzone(document.body, {
    url: '/api/upload',
    paramName: 'files[]',
    maxFilesize: uploadLimit,
    parallelUploads: 2,
    thumbnailHeight: 50,
    thumbnailWidth: 50,
    uploadMultiple: false,
    maxFiles: 100,
    autoQueue: true,
    previewsContainer: '.uploads',
    previewTemplate: previewTemplate,
    clickable: '#upload',
    dictFileTooBig: 'File is too big! ({{filesize}}MB > {{maxFilesize}}MB)',
    dictResponseError: 'Something went wrong! ({{statusCode}})'
});

dropzone.on('addedfile', file => {
    uploadsElement.classList.remove('hidden');
});

dropzone.on('uploadprogress', (file, progress, byteSent) => {
    file.previewElement.querySelector('.file-progress .progress-inner').style.width = progress + '%';
});

dropzone.on('complete', file => {
    file.previewElement.querySelector('.upload-progress').classList.add('hidden');
    
    if (!file.xhr || !file.xhr.response) return;
    const data = JSON.parse(file.xhr.response);
    if (!data.files || !data.files.length) return;
    
    file.previewElement.querySelector('.upload-done').classList.remove('hidden');
    file.previewElement.querySelector('.link a').innerText = data.files[0].url;
    file.previewElement.querySelector('.link a').setAttribute('href', data.files[0].url);
});


if (window.location.host === bigUploadHost.replace(/https?:\/\//, '')) {
    document.querySelector('.upload-limit').textContent = bigUploadLimit;
  document.querySelector('.upload-caption').textContent += `. Visit ${uploadHost} for uploads up to ${uploadLimit} MB`
} else {
    document.querySelector('.upload-caption').textContent += `. Visit ${bigUploadHost} for uploads up to ${bigUploadLimit} MB`
}
