const url = require('url');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const cats = require('../data/cats');

module.exports = async (req, res) => {
    const parsedUrl = url.parse(req.url)
    const pathname = parsedUrl.pathname;

    if (pathname.endsWith('/search') && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__dirname, '../views/home/index.html')
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

            let searchParams = qs.parse(parsedUrl.query);
            
            let modifiedCats = cats.filter((cat)=> cat.name.includes(searchParams.name)).map((cat) =>
                `<li>
                    <img src="${path.join('./content/images/' + cat.image)}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                        <p><span>Breed: </span>${cat.breed}</p>
                        <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                         <li class="btn edit"><a href="/cats-edit/${cat.id}">Edit</a></li>
                         <li class="btn delete"><a href="/cats-find-new-home/${cat.id}">New Home</a></li>
                    </ul>
                </li>`
            );
            let modifiedData = data.toString().replace('{{cats}}', modifiedCats);

            res.write(modifiedData);
            res.end();
        });
    } else {
        return true;
    }
}