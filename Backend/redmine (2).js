const redmineAccessKey = 'a613b08fc136d4a77e4726957789f0cdf9a67255'

const ajaxCall = async (url, method, body) => {
    //fetch(url,
    //    {
    //        method:'OPTION'
    //        mode: "no-cors",
    //    })
    //    .then(response => {
    //        console.log(response.text())
    //    })
    //    .catch(error => {
    //        console.log(error)
    //    });

    const response = await fetch(url, {
        method: method,
        //mode: "no-cors",        
        redirect: 'manual',        
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': 'file:///C:/Users/alikar/Documents/Git/Gitlab_Redmine/index.html',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
        }
    });
    console.log(await response.status)
    console.log(await response.text())
    //return await response.;
}


const ajaxGet = (url) => {
    return ajaxCall(url, 'GET', '');
}

const getRedmineIssues = (offset, limit) => {
    let = result = ajaxCall(`https://redmine.jotron.local/issues.json?key=${redmineAccessKey}&project_id=63&offset=${offset}&limit=${limit}`)

    //console.log(result)
}

const getRedmineVersions = (offset, limit) => {
    let = result = ajaxCall(`https://redmine.jotron.local/versions.json?key=${redmineAccessKey}&project_id=63&offset=${offset}&limit=${limit}`)

    //console.log(result)
}