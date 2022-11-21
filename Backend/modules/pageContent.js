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
        case '/Content/style.css':
            res.writeHead(200, { 'content-type': 'text/css' })
            res.write(await fs.readFileSync(`../${req.url}`, { encoding: 'utf8' }));
            res.end();
            break;

        case '/uicomponents/topHeader.js':
        case '/uicomponents/textbox.js':
        case '/uicomponents/tableTemplate.js':
        case '/uicomponents/datetimeTextbox.js':
            res.writeHead(200, { 'content-type': 'text/javascript' })
            res.write(await fs.readFileSync(`..${req.url}`, { encoding: 'utf8' }));
            res.end();
            break;
    }
}

module.exports.get = get;