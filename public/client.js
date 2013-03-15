

// var diameter = 1200;

// var tree = d3.layout.tree()
//     .size([360, diameter / 2 - 120])
//     .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

// var diagonal = d3.svg.diagonal.radial()
//     .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

// var svg = d3.select("body").append("svg")
//     .attr("width", diameter)
//     .attr("height", diameter - 150)
//   .append("g")
//     .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

// d3.json("pactree.json", function(error, root) {
//   var nodes = tree.nodes(root),
//       links = tree.links(nodes);

//   var link = svg.selectAll(".link")
//       .data(links)
//     .enter().append("path")
//       .attr("class", "link")
//       .attr("d", diagonal);

//   var node = svg.selectAll(".node")
//       .data(nodes)
//     .enter().append("g")
//       .attr("class", "node")
//       .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

//   node.append("circle")
//       .attr("r", 4.5)

//   node.append("text")
//       .attr("dy", ".31em")
//       .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
//       .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
//       .text(function(d) { return d.name; })
// })

// d3.select(self.frameElement).style("height", diameter - 150 + "px")


var w = 1280,
    h = 800,
    rx = w / 2,
    ry = h / 2,
    m0,
    rotate = 0;

var splines = [];

var cluster = d3.layout.cluster()
    .size([360, ry - 120])
    .sort(function(a, b) { return d3.ascending(a.name, b.name); });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

// Chrome 15 bug: <http://code.google.com/p/chromium/issues/detail?id=98951>
var div = d3.select("body").insert("div", "h2")
    .style("top", "-80px")
    .style("left", "-160px")
    .style("width", w + "px")
    .style("height", w + "px")
    .style("position", "absolute");

var svg = div.append("svg:svg")
    .attr("width", w)
    .attr("height", w)
  .append("svg:g")
    .attr("transform", "translate(" + rx + "," + ry + ")");


d3.json("pactree.json", function(root) {
  var nodes = cluster.nodes(root),
      links = cluster.links(nodes)
      splines = bundle(links);

  var path = svg.selectAll("path.link")
             .data(links)
             .enter().append("svg:path")
             .attr("class", function(d) {
               return "link source-" + d.source.name + " target-" + d.target.name
             })
             .attr("d", function(d, i) { return line(splines[i]) })

  svg.selectAll("g.node")
  .data(nodes) //.filter( function(n) {
        //   return n.children  //!n.children
        // })

  .enter().append("svg:g")
  .attr("class", "node")
  .attr("id", function(d) {
    return "node-" + d.name
  })
  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
  .append("svg:text")
  .attr("dx", function(d) {
    return d.x < 180 ? 8 : -8
  })
  .attr("dy", ".31em")
  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
  .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
  .text(function(d) {
    return d.name;
  })
  .on("mouseover", mouseover)
  .on("mouseout", mouseout);

  d3.select("input[type=range]").on("change", function() {
    line.tension(this.value / 100);
    path.attr("d", function(d, i) { return line(splines[i]); });
  });
});


function mouse(e) {
  return [e.pageX - rx, e.pageY - ry];
}

function mouseover(d) {
  svg.selectAll("path.link.target-" + d.name)
      .classed("target", true)
      .each(updateNodes("source", true));

  svg.selectAll("path.link.source-" + d.name)
      .classed("source", true)
      .each(updateNodes("target", true));
}

function mouseout(d) {
  svg.selectAll("path.link.source-" + d.name)
      .classed("source", false)
      .each(updateNodes("target", false));

  svg.selectAll("path.link.target-" + d.name)
      .classed("target", false)
      .each(updateNodes("source", false));
}

function updateNodes(name, value) {
  return function(d) {
    if (value) this.parentNode.appendChild(this);
    svg.select("#node-" + d[name].name).classed(name, value);
  }
}

function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
