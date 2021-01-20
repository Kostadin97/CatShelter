const fs = require('fs');
const path = require('path');
const url = require('url');

function getContentType(url) {
    if (url.endsWith('css')) {
        return 'text/css';
    } else if (url.endsWith('html')) {
        return 'text/html';
    } else if (url.endsWith('png')) {
        return 'image/png';
    } else if (url.endsWith('js')) {
        return 'text/jscript';
    } else if (url.endsWith('ico')) {
        return 'image/x-icon';
    }
}

module.exports = async (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname.startsWith('/content') && req.method === 'GET') {

        if (pathname.endsWith('png') || pathname.endsWith('jpg') || pathname.endsWith('jpeg') || pathname.endsWith('ico') && req.method === 'GET') {
            await fs.readFile(path.join(`./${pathname}`), (err, data) => {
                if (err) {
                    console.error(err);
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });

                    res.write('File not found!');
                    res.end();

                    return;
                }
                
                res.write(data);
                res.end();
            });
        } else {
            await fs.readFile(`./${pathname}`, 'utf-8', (err, data) => {
                if (err) {
                    console.error(err);
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });

                    res.write('File not found!');
                    res.end();

                    return;
                }

                let contentType = getContentType(pathname);

                res.writeHead(200, {
                    'Content-Type': contentType
                });

                res.write(data);
                res.end();
            });
        }
    } else {
        return true;
    }
}