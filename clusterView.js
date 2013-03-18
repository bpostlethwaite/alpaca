"use strict";
var d3 = require('d3')

module.exports = function (options, data) {

  var that = {}

  if (!options)
    options = {}

  /////////////////////////////////////////
  /*
   * Set Parameters
   */
  var w = options.width || 900
    , h = options.height || 600
    , rx = w / 2
    , ry = h / 2
    , m0
    , rotate = 0
    , line, path, cluster, bundle, nodes, links, splines
  /////////////////////////////////////////
  /*
   * Fit svg into container
   */
  var div = d3.select("#dataPanel")
    , svg = div.append("svg:svg")
            .attr("width", w)
            .attr("height", w)
            .append("svg:g")
            .attr("transform", "translate(" + rx + "," + ry + ")")

  var view = updateData(data)

  function updateData(data) {
  /////////////////////////////////////////
  /*
   * Set Layouts and format data
   */
  cluster = d3.layout.cluster()
                .size([360, ry - 120])
                .sort(function(a, b) {
                  return d3.ascending(a.name, b.name) })

  bundle = d3.layout.bundle();

  // Flattening removes child parent linkage so save first
  var deps = buildDeps(data)

  // Get flattened nodes
  nodes = cluster.nodes(flatten(data))
  links = buildLinks(nodes, deps)

  // Need to set .key from the example
  // depending on the repo [base, community, etc] where the
  // package came from, or other metadata
  splines = bundle(links);

  /////////////////////////////////////////


  /*
   * Set Geometry and Linkages
   */
    line = d3.svg.line.radial()
           .interpolate("bundle")
           .tension(.85)
           .radius(function(d) { return d.y; })
           .angle(function(d) { return d.x / 180 * Math.PI; })

    if (view) {
      console.log('removing stuff')
      svg.selectAll("path.link").remove()
      svg.selectAll("g.node").remove()
    }

    path = svg.selectAll("path.link")
           .data(links)
           .enter().append("svg:path")
           .attr("class", function(d) {
             return "link source-" + d.source.name + " target-" + d.target.name
           })
           .attr("d", function(d, i) { return line(splines[i]) })

    /////////////////////////////////////////
    /*
     * Populate nodes
     */

    svg.selectAll("g.node")
    .data(nodes)
    .enter().append("svg:g")
    .attr("class", "node")
    .attr("id", function(d) {
      return "node-" + d.name
    })
    .attr("transform", function(d) {
      return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"})
    .append("svg:text")
    .attr("dx", function(d) {
      return d.x < 180 ? 8 : -8
    })
    .attr("dy", ".31em")
    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end" })
    .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)" })
    .text(function(d) {
      return d.name;
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)

    return true

  }


  function flatten(nodes) {
    /*
     * Takes a nested object and returns a flattened
     * object of depth 1. Child relations are not
     * preserved. Because of this, it would be best
     * to extract these relationships before flattening.
     */
    var seen = {}
      , mrflat = {"name":"", "children": []}

    function recurse(node) {
      node.children.forEach( function (n) {
        if (!seen[n.name]) {
          mrflat.children.push(n)
          seen[n.name] = true
        }
        recurse(n)
      })
    }

    recurse(nodes)

    mrflat.children.forEach( function (n) {
      n.children = []
    })
    return mrflat
  }



  function buildLinks(nodes, deps) {

    var map = {}
      , linkarray = []
    // Compute a map from name to node.
    nodes.forEach(function(d) {
      d.deps = deps[d.name]
      map[d.name] = d
    })

    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
      if (d.deps) {
        d.deps.forEach(function(depname) {
          linkarray.push({source: map[d.name], target: map[depname]})
        })
      }
    })

    return linkarray
  }

  function buildDeps(nodes) {
    var map = {}

    function recurse(node) {
      if (!map[node.name]) {
        map[node.name] = []
      }
      node.children.forEach( function (n) {
        /*
         * Ensure we don't add duplicates to array
         */
        if (map[node.name].indexOf(n.name) < 0)
          map[node.name].push(n.name)
        recurse(n)
      })
    }
    recurse(nodes)

    return map
  }

  function mouse(e) {
    return [e.pageX - rx, e.pageY - ry];
  }


  function mouseover(d) {
    svg.selectAll("path.link.target-" + d.name)
    .classed("target", true)
    .each(updateNodes("source", true))

    svg.selectAll("path.link.source-" + d.name)
    .classed("source", true)
    .each(updateNodes("target", true))
  }

  function mouseout(d) {
    svg.selectAll("path.link.source-" + d.name)
    .classed("source", false)
    .each(updateNodes("target", false))

    svg.selectAll("path.link.target-" + d.name)
    .classed("target", false)
    .each(updateNodes("source", false))
  }

  function updateNodes(name, value) {
    return function(d) {
      if (value) this.parentNode.appendChild(this)
      svg.select("#node-" + d[name].name).classed(name, value)
    }
  }

  function setTension(value) {
    line.tension(value / 100);
    path.attr("d", function(d, i) { return line(splines[i]) })
  }

  function setRotation (rotate) {

    if (rotate > 360) rotate -= 360
    else if (rotate < 0) rotate += 360

    div.style("-webkit-transform", "rotate3d(0,0,0,0deg)")
    svg.attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
    .selectAll("g.node text")
    .attr("dx", function(d) {
      return (d.x + rotate) % 360 < 180 ? 8 : -8 })
    .attr("text-anchor", function(d) {
      return (d.x + rotate) % 360 < 180 ? "start" : "end" })
    .attr("transform", function(d) {
      return (d.x + rotate) % 360 < 180 ? null : "rotate(180)" })
  }



  that.setTension = setTension
  that.setRotation = setRotation
  that.updateData = updateData

  return that

}