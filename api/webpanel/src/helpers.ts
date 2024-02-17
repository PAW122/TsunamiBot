export function doFetch(url: string, callback: Function) {
    console.debug(`fetching ${url}`)
    fetch(url)
        .then(res => res.json())
        .then(out => {
            console.debug(`Downloaded URL: `, out)
            callback(out)
        })
        .catch(err => { throw err })
}