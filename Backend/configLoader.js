const fs = require('fs');

async function configloader() {
    const configfile = JSON.parse(await fs.readFileSync('./redgit-config.json', { encoding: 'utf8' }))
    return configfile;
}

async function redmineToken() {
    return (await configloader()).redminetoken;
}
async function gitlabToken() {
    return (await configloader()).gitlabtoken;
}

async function gitlabPageLimit() {
    return (await configloader()).gitlabpagelimit;
}

module.exports.redmineToken = redmineToken
module.exports.gitlabToken = gitlabToken
module.exports.gitlabPageLimit = gitlabPageLimit
