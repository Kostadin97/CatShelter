const http = require('http');
const hostname = 'localhost';
const port = 3000;

const handlers = require('./handlers');

http.createServer((req, res) => {
    for (let handler of handlers) {
        if(!handler(req, res)){
            break;
        }
    }
}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});