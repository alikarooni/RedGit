const redmine = require('../redmine')
const gitlab = require('../gitlab')
const url = require('url');

function querySpliter(query) {
    result = {}
    var list = query.split('&');
    list.forEach(item => result[item.split('=')[0].toLowerCase()] = item.split('=')[1])
    return result;
}

async function get(req, res) {
    var requrl = url.parse(req.url)

    switch (requrl.pathname) {
        case "/api/redmine/getprojects":  //Redmine Projects
            res.writeHead(200, { 'content-type': 'application/json' })
            res.write(await redmine.getProjects());
            res.end();
            break;

        case "/api/redmine/getversions":  //Redmine Versions
            res.writeHead(200, { 'content-type': 'application/json' })
            const query = querySpliter(requrl.query)
            res.write(await redmine.getVersions(query.projectid));
            res.end();
            break;

        case "/api/gitlab/getProjects":  //Gitlab Projects
            res.writeHead(200, { 'content-type': 'application/json' })
            res.write(await gitlab.getProjects());
            res.end();
            break;

        case "/api/gitlab/getVersions":  //Gitlab Versions
            const query1 = querySpliter(requrl.query)
            res.writeHead(200, { 'content-type': 'application/json' })
            res.write(await gitlab.getVersions(query1.projectid));
            res.end();
            break;

        case "/api/gitlab/getTags":  //Gitlab Tags
            const query2 = querySpliter(requrl.query)
            res.writeHead(200, { 'content-type': 'application/json' })
            res.write(await gitlab.getTags(query2.projectid));
            res.end();
            break;
    }
}

module.exports.get = get;