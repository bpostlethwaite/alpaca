var http = require('http')
  , st = require('st')
  , spawn = require('child_process').spawn
  , fs = require('fs')
  , io = require('socket.io')


/*
 * Setup Static Server
 */
var PORT = 8082
  , STATIC = 'static'
  , mount = st(
    { path: './' + STATIC
    , url: '/'
    , index: 'index.html'
    })
  , server = http.createServer( mount ).listen(PORT)

/*
 * Setup Socket.IO
 */
io = io.listen(server)
io.set('log level', 0)


io.sockets.on('connection', function (socket) {

  socket.on('command', function (cmd) {
    var pactree = spawn(cmd.name, [cmd.args, cmd.pkg])
      , dict = {}
      , sdict = {}

    /*
     * The idea here is that dict and sdict will persist between
     * callbacks, therefore build up a single node structure between
     * 'data' events. ---- need to test if this works ------
     */
    pactree.stdout.on('data', parsePactree(dict, sdict))

    pactree.stderr.on('data', function (data) {
      console.log('stderr: ' + data)
    })

    pactree.on('close', function (code) {
      /*
       * Extract the root node before handing off.
       */
      var root =
      socket.emit('command-data', dict[cmd.pkg])
      //console.log(cmd);
    })
  })
})


function parsePactree(dict, sdict) {

  return function(data) {

    console.log('data length == ' + data.length)

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
          node = {"name": name, "children": []}
        }

        parent.children.push(node)
        /*
         * Add parent to the source dictionary so we don't duplicate
         * it as a child later on.
         */
        sdict[sname] = parent
      }
    })
  }
}
