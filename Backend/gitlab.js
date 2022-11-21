const configloader = require('./configLoader')
const request = require('request');
let gitlabtoken = '';

async function gitlabFetch(url) {
    if (gitlabtoken === '') {
        gitlabtoken = await configloader.gitlabToken()
    }
    
    async function get() {
        return new Promise((resolve, reject) => {
            const options = {
                url: `https://gitlab.jotron.com/api/v4${url}`,
                headers: {
                    Authorization: `Bearer ${gitlabtoken}`
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

async function getProjects(page = 1, perPage = 100) {
    return await gitlabFetch(`/projects?page=${page}&per_page=${perPage}`);
}

async function getVersions(projectId) {
    return await gitlabFetch(`/projects/${projectId}/repository/branches?page=1&per_page=100`)
}

async function getTags(projectId) {
    return await gitlabFetch(`/projects/263/repository/tags`)
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



// below function have no use at the moment.
async function getMergeRequestsCommits(projectId, mergeRequestId) {
    return await gitlabFetch(`/projects/${projectId}/merge_requests/${mergeRequestId}/commits`)
}
async function getMergeRequests(projectId, targetBranch, page = 0, perPage = 100) {
    return await gitlabFetch(`/projects/${projectId}/merge_requests?target_branch=${targetBranch}&page=${page}&per_page=${perPage}`)
}
async function getMembers(projectId) {
    return await gitlabFetch(`/projects/${projectId}/members`)
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
        JSON.parse(x).forEach((com) => { commits.push(com) })
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


module.exports.getProjects = getProjects;
module.exports.getVersions = getVersions;
module.exports.getTags = getTags;
module.exports.getCommits = getCommits;
module.exports.getCommitTags = getCommitTags;

module.exports.getMergeRequestsCommits = getMergeRequestsCommits;
module.exports.getMergeRequests = getMergeRequests;
module.exports.getMembers = getMembers;
module.exports.getCommitsByIssueId = getCommitsByIssueId;
module.exports.getCommitsByIssueIds = getCommitsByIssueIds;