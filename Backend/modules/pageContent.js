const fs = require('fs');
const url = require('url');

async function get(req, res) {
    var requrl = url.parse(req.url)

    switch (requrl.pathname) { 
    case '/' :
        res.writeHead(200, { 'content-type': 'text/html' })
        res.write(await fs.readFileSync('../index.html', { encoding: 'utf8' }));
        res.end();
            break;
        case '/style.css':
            res.writeHead(200, { 'content-type': 'text/css' })
            res.write(await fs.readFileSync(`../${req.url}`, { encoding: 'utf8' }));
            res.end();
            break;

        case '/components/topHeader.js':
        case '/components/textbox.js':
        case '/components/tableTemplate.js':
        case '/components/datetimeTextbox.js':
            res.writeHead(200, { 'content-type': 'text/javascript' })
            res.write(await fs.readFileSync(`..${req.url}`, { encoding: 'utf8' }));
            res.end();
            break;
    }
}

module.exports.get = get;