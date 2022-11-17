const request = require('request');
const bearerToken = 'glpat-eMXS_-ANQiwiA3nsy7Zw';

async function gitlabFetch(url) {
    async function get() {
        return new Promise((resolve, reject) => {
            const options = {
                url: `https://gitlab.jotron.com/api/v4${url}`,
                headers: {
                    Authorization: `Bearer ${bearerToken}`
                }
            }
            request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    resolve(body);
                }
                else {
                    reject({ error, response });
                }
            });
        });
    }

    return await get().catch(err => console.log('error: ', err.error, err.response.body));
}

async function findMergeRequests(projectId, issueId) {
    return await gitlabFetch(`/projects/${projectId}/merge_requests?search=${issueId}&in=title`)
}

async function getMergeRequestsCommits(projectId, mergeRequestId) {
    return await gitlabFetch(`/projects/${projectId}/merge_requests/${mergeRequestId}/commits`)
}

async function getCommitsByIssueId(projectId, issueId) {    
    var mergeRequests = await findMergeRequests(projectId, issueId);

    if (mergeRequests === undefined) {
        return null
    }

    const mergeRequestsJson = JSON.parse(mergeRequests)
    var promises = [];
    mergeRequestsJson.forEach((item) => {
        promises.push(getMergeRequestsCommits(projectId, item.iid))
    });

    var res = await Promise.all(promises);
    var commits = []
    res.map((x) => {
        JSON.parse(x).forEach((com) => { commits.push(com)})
    });
    return commits;
}

async function getCommitsByIssueIds(projectId, issueIds) {
    const mergeRequestsList = []
    issueIds.forEach((issueId) => {
        mergeRequestsList.push(findMergeRequests(projectId, issueId))
    });
    const mergeRequestsPromises = await Promise.all(mergeRequestsList);

    const mergeRequestsJson = [];
    mergeRequestsPromises.forEach((mergeRequests) => {
        (JSON.parse(mergeRequests)).forEach((item) => {
            mergeRequestsJson.push(item)
        })
    });

    var commitPromises = [];
    mergeRequestsJson.forEach((item) => {
        commitPromises.push(getMergeRequestsCommits(projectId, item.iid))
    });

    var commitsJson = await Promise.all(commitPromises);
    var commits = []
    commitsJson.map((x) => {
        JSON.parse(x).forEach((com) => { commits.push(com) })
    });

    return JSON.stringify(commits);
}

//////////////////// 
async function getProjects(page = 1, perPage = 100) {
    return await gitlabFetch(`/projects?page=${page}&per_page=${perPage}`);
}

async function findProject(projectName) {
    return await gitlabFetch(`/projects?search=${projectName}&in=title&in=description`)
}

async function getProject(projectId) {
    return await gitlabFetch(`/projects/${projectId}`)
}

async function getMergeRequests(projectId, targetBranch, page = 0, perPage = 100) {
    return await gitlabFetch(`/projects/${projectId}/merge_requests?target_branch=${targetBranch}&page=${page}&per_page=${perPage}`)
}

async function getVersions(projectId) {
    return await gitlabFetch(`/projects/${projectId}/repository/branches?page=1&per_page=100`)
}

async function getCommits(projectId, versionId, since, until, page = 1, perPage = 100) {
    if (since === undefined || until === undefined)
        return await gitlabFetch(`/projects/${projectId}/repository/commits?ref_name=${versionId}&page=${page}&per_page=${perPage}`)
    else
        return await gitlabFetch(`/projects/${projectId}/repository/commits?ref_name=${versionId}&page=${page}&per_page=${perPage}&since=${since}&until=${until}`)
}

async function getCommitTags(projectId, commitId) {
    return await gitlabFetch(`/projects/${projectId}/repository/commits/${commitId}/refs?page=1&per_page=100`)
}

async function getTags(projectId) {    
    return await gitlabFetch(`/projects/263/repository/tags`)
}

async function getMembers(commitId) {
    https://gitlab.jotron.com/api/v4/projects/263/repository/commits/e622b73dcb8d6cb2aa13701e91c7a6423c04784e/refs?type=tag
    return await gitlabFetch(`/projects/${projectId}/members`)
}

async function getMembers(projectId) {
    return await gitlabFetch(`/projects/${projectId}/members`)
}

// projects/263/repository/branches?page=1&per_page=100

module.exports.findMergeRequests = findMergeRequests;
module.exports.getMergeRequestsCommits = getMergeRequestsCommits;
module.exports.getCommitsByIssueId = getCommitsByIssueId;
module.exports.getCommitsByIssueIds = getCommitsByIssueIds;
module.exports.getVersions = getVersions;
module.exports.getMergeRequests = getMergeRequests;
module.exports.getProjects = getProjects;
module.exports.getCommits = getCommits;
module.exports.getCommitTags = getCommitTags;
module.exports.getTags = getTags;
