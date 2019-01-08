const dev = 'http://112.74.159.234:8083/api/v1'
const url = `${dev}/video/user/openId`

// import conf from '../src/config/index.js'
// const url = `${conf.userPath}/video/user/openId`

function redirectAPI(url) {
    return fetch(url, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .catch(error => {
        alert(error)
    })
}

(async function redirect(url) {
    const res = await redirectAPI(url)
    if (res.result.code === '0') {
        debugger
        window.location.href = res.data.serverUrl
    } else {
        alert(res.result.message)
    }
})(url)
