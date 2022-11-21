const pageContect = require('./modules/pageContent')
const pageload = require('./modules/pageLoad')
const getIssues = require('./modules/getIssues')
const http = require('http');
const url = require('url');

const server = http.createServer(async (req, res) => {
    var requrl = url.parse(req.url)
    
    switch (requrl.pathname) {
        case '/':
        case '/style.css':
        case '/components/topHeader.js':
        case '/components/textbox.js':
        case '/components/tableTemplate.js':
        case '/components/datetimeTextbox.js':
            await pageContect.get(req, res)
            break;

        case "/api/redmine/getprojects":
        case "/api/redmine/getversions":
        case "/api/gitlab/getProjects":
        case "/api/gitlab/getVersions":
        case "/api/gitlab/getTags":
            await pageload.get(req, res)
            break;

        case "/api/getissues":
            await getIssues.getIssues(req, res)
    }
});

server.listen(59001);
