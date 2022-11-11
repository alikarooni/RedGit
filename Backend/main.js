const redmine = require('./redmine')
const gitlab = require('./gitlab')
const http = require('http');
const url = require('url');
const fs = require('fs');

const server = http.createServer(async (req, res) => {
    var requrl = url.parse(req.url)

    if (requrl.pathname == '/') {
        res.writeHead(200, { 'content-type': 'text/html' })
        var filecontent = fs.readFileSync('../index.html', { encoding: 'utf8' })
        res.write(filecontent);
        return res.end();
    }
    else if (requrl.pathname == '/style.css') {
        res.writeHead(200, { 'content-type': 'text/css' })
        var filecontent = fs.readFileSync(`../${req.url}`, { encoding: 'utf8' })
        res.write(filecontent);
        return res.end();
    }
    else if (requrl.pathname.indexOf('.js') > 0) {
        res.writeHead(200, { 'content-type': 'text/javascript' })
        console.log('req', req.url)
        var filecontent = fs.readFileSync(`..${req.url}`, { encoding: 'utf8' })
        res.write(filecontent);
        return res.end();
    }

    else if (requrl.pathname == "/api/redmine/getprojects") {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(await redmine.getProjects());
        res.end();
    }  //Redmine Projects
    else if (requrl.pathname == "/api/redmine/getversions") {
        res.writeHead(200, { 'content-type': 'application/json' })
        const query = querySpliter(requrl.query)
        res.write(await redmine.getVersions(query.projectid));
        res.end();
    }  //Redmine Versions

    else if (requrl.pathname == "/api/gitlab/getProjects") {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(await gitlab.getProjects());
        res.end();
    } //Gitlab Projects
    else if (requrl.pathname == "/api/gitlab/getVersions") {
        const query = querySpliter(requrl.query)

        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(await gitlab.getVersions(query.projectid));
        res.end();
    } //Gitlab Versions
    else if (requrl.pathname == "/api/gitlab/getTags") {        
        const query = querySpliter(requrl.query)

        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(await gitlab.getTags(query.projectid));
        res.end();
    } //Gitlab Tags

    else if (requrl.pathname == "/api/getissues") {
        const query = querySpliter(requrl.query)
        console.log('query', query)

        getIssueId = (txt) => {
            let startIndex = txt.indexOf('#')
            if (startIndex === -1) return 0;
            let endIndex = -1;

            startIndex += 1;
            for (var i = startIndex; i <= txt.length; i++) {
                if (!(txt[i] >= '0' && txt[i] <= '9'))
                    break;
                endIndex = i+1;
            }
            const res = parseInt(txt.substring(startIndex, endIndex))
            return isNaN(res) ? 0 : res
        }
        
        var red = await redmine.getIssues(query.redmineprojectid, query.redmineversionid)
        var redmineJson = JSON.parse(red).issues
        var redmines = redmineJson.map((x, i) => {
            return {
                'id': x.id, 'redmine': x, 'commit': []
            }
        });
        
        var com = await gitlab.getCommits(query.gitlabprojectid, query.gitlabversionid, query.since, query.until)
        let commitsJson = JSON.parse(com);
        var commits = commitsJson.map((x) => {
            var id = getIssueId(x.title)
            if (id === 0) {
                id = getIssueId(x.message)
            }
            return { 'id': id, 'commit': x, 'redmineVersion':'' }
        });

        var result = redmines.map((r, i) => {
            r.commit = commits.filter(g => g.id.toString() === r.id.toString())
            return r
        })

        var untrackedCommits = [];
        for (var i = 0; i < commits.length; i++) {
            const any = redmines.filter(r => r.id.toString() === commits[i].id.toString()).length
            if (any === 0) {
                if (commits[i].id !== 0) {
                    const issue = JSON.parse(await redmine.getIssue(commits[i].id))
                    commits[i].redmineVersion = issue.issues[0].fixed_version
                }
                untrackedCommits.push(commits[i])
            }
        } 
          
        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(JSON.stringify({ 'trackedCommits': result, 'untrackedCommits': untrackedCommits }));
        res.end();
    }

    else if (requrl.pathname == "/api/getissuesbytag") {
        const query = querySpliter(requrl.query)
        console.log('query', query)
        const startTag = "4.13.8.8194---R1"
        const endtag = undefined
        const result = []
        const any = (arr, tag) => {
            let result = false;
            arr.forEach(x => {
                if (x.name === tag) { console.log('here'); result = true; }
            });
            return result;
        };

        let pageNumber = 0;
        let brk = false
        while (true) {
            pageNumber += 1;
            var com = await gitlab.getCommits(query.gitlabprojectid, query.gitlabversionid, query.since, query.until, pageNumber)
            let commitsJson = JSON.parse(com);

            const tagsPromises = []
            commitsJson.forEach((commit) => {
                tagsPromises.push(gitlab.getCommitTags(query.gitlabprojectid, commit.id))
            })
            const tagsPromisesResult = await Promise.all(tagsPromises)

            for (var i = 0; i < tagsPromisesResult.length; i++) {
                const tags = JSON.parse(tagsPromisesResult[i])
                //console.log(tags, commitsJson[i].id, commitsJson[i].title)                    
                console.log(`ANY result: ${any(tags, startTag)}, ${startTag}`, tags)

                if (any(tags, startTag)) {
                    console.log('STOP STOP STOP STOP STOP STOP STOP STOP STOP STOP')
                    console.log('startTag has been founded:', startTag, tags, commitsJson[i].id)
                    brk = true;
                }
                else {
                    result.push(commitsJson[i])
                    console.log(commitsJson[i].id, commitsJson[i].title);
                }

                if (brk) break;
            }

            if (brk || pageNumber > 30) {
                if(!brk) console.log('pageNumber break');
                break;
            }
        }

        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(await JSON.stringify(result));
        res.end();
    }

    else if (requrl.pathname == "/api/gitlab/getMergeRequests") {
        const query = querySpliter(requrl.query)
        console.log('query', query)
        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(await gitlab.getMergeRequests(query.projectid, query.target_branch));
        res.end();
    }
    else if (requrl.pathname == "/api/redmine/getissues") {
        const query = querySpliter(requrl.query)
        const issues = JSON.parse(await redmine.getIssues(query.projectid, query.versionid));
        var result = []

        for (var i = 0; i < issues.issues.length; i++) {
            const commits = await gitlab.getCommitsByIssueId(263, issues.issues[i].id)
            result.push(
                {
                    'issueId': issues.issues[i].id,
                    'issue': issues.issues[i],
                    'commits': commits
                });
        }

        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(JSON.stringify(result))
        res.end();
    }
    else if (requrl.pathname == "/api/gitlab/getCommitsByIssueId") {
        const query = querySpliter(requrl.query)

        res.writeHead(200, { 'content-type': 'application/json' })
        res.write(JSON.stringify(await gitlab.getCommitsByIssueId(query.projectid, query.issueid)));
        res.end();
    }
});

function querySpliter(query) {
    result = {}
    var list = query.split('&');
    list.forEach(item => result[item.split('=')[0].toLowerCase()] = item.split('=')[1])
    return result;
}

server.listen(59001);
