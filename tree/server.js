var http = require('http')
  , st = require('st')
//  , shoe = require('shoe')
  , spawn = require('child_process').spawn
  , fs = require('fs')


var PORT = 8082
var mount = st(
  { path: './public/'
  , url: '/'
  , index: 'index.html'
  })

var server = http.createServer( mount ).listen(PORT)

var filename = 'pactree.json'
var stream = fs.createWriteStream('public/' + filename )

var pkg = "mesa"
  , pacman = spawn('pactree', ['-gr', pkg])

// Eventually just pipe through a transform stream
var dict = {}
var sdict = {}

stream.on('open', function () {

  pacman.stdout.on('data', function (data) {
    var lines = data.toString().split('\n')

    lines.forEach( function (line) {
      var myRegexp = /"(.+)"\s+->\s+"(.+)"/g;
      var matches = myRegexp.exec(line);

      if (matches) {
        var sname = matches[1]
          , name = matches[2]
          , node = dict[name]
          , parent = dict[sname]

        if (!node) {
          /*
           * If target node not yet created, do it
           */
          node = dict[name] =  {"name": name, "children": []}
        }
        if (!parent) {
          /*
           * If parent node not yet created, do it.
           */
          parent = dict[sname] =  {"name": sname, "children": []}
        }

        if (sdict[name]) {
          /*
           * If node has been a source already create a new node
           * to avoid duplicating dependency histories.
           */
//          node = {"name": name, "children": []}
        }

        parent.children.push(node)
        /*
         * Add parent to the source dictionary so we don't duplicate
         * it as a child later on.
         */
        sdict[sname] = parent
      }
    })
  })

  pacman.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  })

  pacman.on('close', function (code) {

    var root = dict[pkg]
    stream.write(JSON.stringify(root, null, 2) )
    stream.end()
    console.log('wrote to ' + filename)
  })
})


// var sock = shoe(pacstream)
// sock.install(server, '/pactree');
