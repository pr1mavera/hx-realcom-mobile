export default () => {
  const u = navigator.userAgent
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
    // Android
    sessionStorage.setItem('device', 'Android')
  } else if (u.indexOf('iPhone') > -1) {
    // iPhone
    sessionStorage.setItem('device', 'iPhone')
  }
}
