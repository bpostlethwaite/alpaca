var http = require('http')
var st = require('st')

var PORT = 8082

var mount = st({
  path: '.',
//  url: 'static/', // defaults to path option


  // indexing options
  index: 'index.html' // use 'index.html' file as the index
//  dot: true, // allow dot-files to be fetched normally

//  passthrough: true, // calls next instead of returning a 404 error
//  passthrough: false, // returns a 404 when a file or an index is not found
})

// with bare node.js
http.createServer(function (req, res) {
  mount(req, res)
  return // serving a static file
  // if (mount(req, res)) return // serving a static file
  // myCustomLogic(req, res)
}).listen(PORT)