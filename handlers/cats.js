const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const formidable = require('formidable');
const breeds = require('../data/breeds');
const cats = require('../data/cats');

module.exports = async (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/cats/add-cat') {
        if (req.method === 'GET') {
            let filePath = path.normalize(
                path.join(__dirname, '../views/addCat.html')
            );

            await fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.log(err);
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('Not Found');
                    res.end();
                    return;
                }

                let catBreedPlaceholder = breeds.map((breed) => `<option value="${breed}">${breed}</option>`);
                let modifiedData = data.toString().replace('{{catBreeds}}', catBreedPlaceholder);

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });

                res.write(modifiedData);
                res.end();
            });
        } else if (req.method === 'POST') {
            let form = new formidable.IncomingForm();
            form.uploadDir = path.normalize(
                path.join(__dirname, '../content/images')
            );

            form.on('fileBegin', function (name, file) {
                file.path = form.uploadDir + "/" + file.name;
            });

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    throw err;
                }
                const currentCatId = cats.length === 0 ? 0 : cats[cats.length - 1].id + 1;
                cats.push({
                    id: currentCatId,
                    name: fields.name,
                    description: fields.description,
                    breed: fields.breed,
                    image: files.upload.name
                });


                await fs.writeFile(path.normalize(path.join(__dirname, '../data/cats.json')), JSON.stringify(cats), 'utf8', function (err) { });

                res.writeHead(301, { 'Location': '/' });
                res.end();
            })
        }
    } else if (pathname === '/cats/add-breed') {
        if (req.method === 'GET') {
            let filePath = path.normalize(
                path.join(__dirname, '../views/addBreed.html')
            );

            await fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.log(err);
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('Not Found');
                    res.end();
                    return;
                }

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });

                res.write(data);
                res.end();
            });
        } else if (req.method === 'POST') {
            let formData = '';

            req.on('data', (data) => {
                formData += data;
                if (formData.length > 1e6)
                    req.connection.destroy();
            });


            req.on('end', async function () {
                let body = qs.parse(formData);

                if (body.breed.length < 3 || breeds.includes(body.breed)) {
                    res.writeHead(301, {
                        'Location': '/cats/add-breed'
                    });

                    res.end();
                    return;
                }

                let breedsFilePath = path.normalize(
                    path.join(__dirname, '../data/breeds.json')
                );

                breeds.push(body.breed);
                let json = JSON.stringify(breeds);

                await fs.writeFile(breedsFilePath, json, 'utf-8', () => console.log('Added'));

                res.writeHead(301, {
                    'Location': '/'
                });

                res.end();
            });
        }
    } else if (pathname.includes('/cats-edit')) {
        if (req.method === 'GET') {
            let filePath = path.normalize(
                path.join(__dirname, '../views/editCat.html')
            );

            await fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.log(err);
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('Not Found');
                    res.end();
                    return;
                }

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });

                currentCatId = getCatId(pathname);

                let currentCat = cats.filter((cat) => {
                    return cat.id == currentCatId
                })[0];

                const html =
                    `<label for="name">Name</label>
                    <input type="text" id="name" name="name" value="${currentCat.name}">
                    <label for="description">Description</label>
                    <textarea id="description" name="description">${currentCat.description}</textarea>
                    <label for="image">Image</label>
                    <input name="upload" type="file" id="image">
                    <label name="breed" for="group">Breed</label>
                <select name="breed" selected="${currentCat.breed}" id="group">
                    {{catBreeds}}
                </select>`

                let catBreedPlaceholder = breeds.map((breed) => {
                    let selected = '';
                    if (breed === currentCat.breed) {
                        selected = 'selected';
                    }
                    return `<option value="${breed}" ${selected}>${breed}</option>`
                });
                let modifiedHTML = html.toString().replace('{{catBreeds}}', catBreedPlaceholder);

                let modifiedData = data.toString().replace('{{catInfo}}', modifiedHTML);

                res.write(modifiedData);
                res.end();
            });
        } else if (req.method === 'POST') {
            let form = new formidable.IncomingForm();
            form.uploadDir = path.normalize(
                path.join(__dirname, '../content/images')
            );

            form.on('fileBegin', function (name, file) {
                if (file.name !== '') {
                    file.path = form.uploadDir + "/" + file.name;
                }
            });

            currentCatId = getCatId(pathname);

            const currentCat = cats.filter((cat) => {
                return cat.id == currentCatId
            })[0];

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error(err);
                }

                currentCat.name = fields.name;
                currentCat.description = fields.description;

                if (files.upload.name !== '') {
                    currentCat.image = files.upload.name;
                }

                currentCat.breed = fields.breed;
                await fs.writeFile(path.normalize(path.join(__dirname, '../data/cats.json')), JSON.stringify(cats), 'utf8', function (err) { });
            })

            res.writeHead(301, {
                'Location': '/'
            });
            res.end();
        }
    } else if (pathname.includes('/cats-find-new-home')) {
        if (req.method === 'GET') {
            let filePath = path.normalize(
                path.join(__dirname, '../views/catShelter.html')
            );

            await fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.log(err);
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('Not Found');
                    res.end();
                    return;
                }

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });

                currentCatId = getCatId(pathname);

                let currentCat = cats.filter((cat) => {
                    return cat.id == currentCatId
                })[0];

                let html = `
                            <img src="${path.join('../content/images/', currentCat.image)}" alt="${currentCat.name}">
                                <label for="name">Name</label>
                                    <input type="text" id="name" value="${currentCat.name}" disabled>
                                    <label for="description">Description</label>
                                    <textarea id="description" disabled>${currentCat.description}</textarea>
                                    <label for="group">Breed</label>
                                    <select id="group" disabled>
                                <option value="${currentCat.breed}">${currentCat.breed}</option>
                            </select>`;

                const modifiedData = data.toString().replace('{{catToShelterInfo}}', html);

                res.write(modifiedData);
                res.end();
            });
        } else if (req.method === 'POST') {
            currentCatId = getCatId(pathname);
            const currentCat = cats.filter((cat) => {
                return cat.id == currentCatId
            })[0];

            const index = cats.indexOf(currentCat);
            cats.splice(index, 1);

            await fs.writeFile(path.normalize(path.join(__dirname, '../data/cats.json')), JSON.stringify(cats), 'utf8', function (err) { console.log(err) });

            res.writeHead(301, {
                'Location': '/'
            })
            res.end();
        }
    } else {
        return true;
    }
}

function getCatId(pathname) {
    const arr = pathname.split('/');
    return arr[arr.length - 1];
}