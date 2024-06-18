// const fastapi = (operation, url, params, success_callback, failure_callback) => {
//     let method = operation
//     let content_type = 'application/json'
//     let body = JSON.stringify(params)

//     let url = 'http://127.0.0.1:8000'+url
//     if(method === 'get') {
//         _url += "?" + new URLSearchParams(params)
//     }

//     let options = {
//         method: method,
//         headers: {
//             "Content-Type": content_type
//         }
//     }

//     if(method !== "get") {
//         options['body'] = body
//     }

//     fetch(_url, options).then(response => {
//         response.json().them(json => {
//             if(response.status >= 200 && response.status < 300) {
//                 if(success_callback) {
//                     success_callback(json)
//                 }
//             }
//             else {
//                 if(failure_callback) {
//                     failure_callback(json)
//                 }
//                 else{
//                     alert(JSON.stringify(json))
//                 }
//             }
//         })
//         .catch(error => {
//             alert(JSON.stringify(error))
//         })
//     })
// }

// export default fastapi