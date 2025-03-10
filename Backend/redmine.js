const configloader = require('./configloader')
const request = require('request');
let redminetoken = '';

async function redmineFetch(url, parameters="") {
    if (redminetoken === '') {
        redminetoken = await configloader.redmineToken();
    }

    async function get() {
        return new Promise((resolve, reject) => {
            const options = {
                url: `https://redmine.jotron.com/${url}?key=${redminetoken}${parameters}`,
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

async function getProjects() {
    return await redmineFetch('/projects.json', '&offset=1&limit=100');    
}
async function getVersions(projectId) {
    return await redmineFetch(`/projects/${projectId}/versions.json`)
}

async function getIssues(projectId, versionid, offset=0, limit=100) {
    return await redmineFetch(`/issues.json`, `&projectsId=${projectId}&fixed_version_id=${versionid}&offset=${offset}&limit=${limit}&status_id=*`)
}

async function getIssue(issueId) {
    return await redmineFetch(`/issues.json`, `&issue_id=${issueId}&status_id=*`)
}

module.exports.getProjects = getProjects;
module.exports.getVersions = getVersions;
module.exports.getIssues = getIssues;
module.exports.getIssue = getIssue;