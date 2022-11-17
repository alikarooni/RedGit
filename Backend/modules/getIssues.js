const redmine = require('../redmine')
const gitlab = require('../gitlab')
const url = require('url');


async function getCommits(query) {
    const result = []
    const any = (arr, tag) => {
        let result = false;
        arr.forEach(x => {
            if (x.name === tag) { result = true; }
        });
        return result;
    };

    let pageNumber = 0;
    let brk = false
    while (true) {
        pageNumber += 1;
        var com = await gitlab.getCommits(query.gitlabprojectid, query.gitlabstartpoint, query.since, query.until, pageNumber)
        let commitsJson = JSON.parse(com);

        const tagsPromises = []
        commitsJson.forEach((commit) => {
            tagsPromises.push(gitlab.getCommitTags(query.gitlabprojectid, commit.id))
        })
        const tagsPromisesResult = await Promise.all(tagsPromises)

        for (var i = 0; i < tagsPromisesResult.length; i++) {
            const tags = JSON.parse(tagsPromisesResult[i])

            if (any(tags, query.gitlabendpoint)) {               
                console.log('startTag has been founded:', query.gitlabendpoint, tags, commitsJson[i].id)
                brk = true;
            }
            else {
                result.push(commitsJson[i])
            }

            if (brk) break;
        }

        if (brk || pageNumber > 5) {
            if (!brk) console.log('pageNumber break');
            break;
        }
    }

    return JSON.stringify(result);
}

function querySpliter(query) {
    result = {}
    var list = query.split('&');
    list.forEach(item => result[item.split('=')[0].toLowerCase()] = item.split('=')[1])
    return result;
}

async function getIssues(req, res) {
    var requrl = url.parse(req.url)
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
            endIndex = i + 1;
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

    var com = await getCommits(query)

    let commitsJson = JSON.parse(com);
    var commits = commitsJson.map((x) => {
        var id = getIssueId(x.title)
        if (id === 0) {
            id = getIssueId(x.message)
        }
        return { 'id': id, 'commit': x, 'redmineVersion': '' }
    });

    var result = redmines.map((r, i) => {
        r.commit = commits.filter(g => g.id.toString() === r.id.toString())
        return r
    })

    const commitIdSet = new Set();
    var untrackedCommits = [];
    for (var i = 0; i < commits.length; i++) {
        const any = redmines.filter(r => r.id.toString() === commits[i].id.toString()).length
        if (any === 0) {
            if (commits[i].id !== 0) {
                const issue = JSON.parse(await redmine.getIssue(commits[i].id))
                if (issue !== undefined && issue.issues !== undefined && issue.issues.length > 0)
                    commits[i].redmineVersion = issue.issues[0].fixed_version
            }

            if (commitIdSet.has(commits[i].id)) {
                for (var j = 0; j < untrackedCommits.length; j++) {
                    if (untrackedCommits[j].id === commits[i].id) {
                        untrackedCommits[j].commits.push(commits[i].commit)
                        break;
                    }
                }
            }
            else {
                commitIdSet.add(commits[i].id)
                untrackedCommits.push({
                    'id': commits[i].id, 'redmineVersion': commits[i].redmineVersion, 'commits': [commits[i].commit]
                })
            }
        }
    }

    res.writeHead(200, { 'content-type': 'application/json' })
    res.write(JSON.stringify({ 'trackedCommits': result, 'untrackedCommits': untrackedCommits }));
    res.end();
}

module.exports.getIssues = getIssues;