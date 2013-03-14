/*
 * ALPACA
 * Arch Linux Package Analyzer
 *
 * Package Visualization with D3.js
 *
 * Ben Postlethwaite
 * 2013
 * License MIT
 */
var spawn = require('child_process').spawn
  , fs = require('fs')
  , JSONstream = require('JSONStream')

//    ls    = spawn('ls', ['-lh', '/usr']);


var stream = fs.createReadStream('flare-imports.json', {encoding: 'utf8'})
  , parser = JSONstream.parse()
  , pkgarray = []




stream.pipe(parser);

parser.on('root', function (obj) {
  var i = 0
  obj.forEach( function (thing) {
    pkgarray[i] = thing
    i += 1
  })



  var packages = buildNodes()

  var root = packages.root(pkgarray)
  console.log(root)
//  console.log(root.children[0].children)
})


function buildNodes() {
  return {

    // Lazily construct the package hierarchy from class names.
    root: function(classes) {
      var map = {};

      function find(name, data) {
        var node = map[name], i;
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }

      classes.forEach(function(d) {
        find(d.name, d);
      });

      return map[""];
    },

    // Return a list of imports for the given array of nodes.
    imports: function(nodes) {
      var map = {},
          imports = [];

      // Compute a map from name to node.
      nodes.forEach(function(d) {
        map[d.name] = d;
      });

      // For each import, construct a link from the source to target node.
      nodes.forEach(function(d) {
        if (d.imports) d.imports.forEach(function(i) {
          imports.push({source: map[d.name], target: map[i]});
        });
      });

      return imports;
    }

  }

}
