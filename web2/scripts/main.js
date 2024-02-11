document.onload = load()

var urlParams;

function load() {
    urlParams = new URLSearchParams(window.location.hash);
    let token = urlParams.get("access_token");
    let token_type = urlParams.get("#token_type");
    if (token && token_type) {
        console.log(`token: ${token}`);
        fetch(`http://localhost:3000/load/server-list/${token_type}/${token}`)
            .then(res => res.json())
            .then(out => {
                console.log('Downloaded JSON: ', out)
                login(out)
            })
            .catch(err => { throw err }
            );
    } else {
        console.log("token not found")
    }
}

function login(serverList) {
    console.log("logged in")
    console.log("serverlist: ", serverList)
}