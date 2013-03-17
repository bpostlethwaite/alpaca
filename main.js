"use strict";
var clusterView = require('./clusterView')
  , slideways = require('slideways')

var socket = io.connect('http://localhost')


var cmd = {}
cmd.name = 'pactree'
cmd.args = '-g'
cmd.pkg = 'nodejs'
var data

var options = setDisplay( {} )

socket.emit('command', cmd)

socket.on(cmd.name, function (cmddata) {
  data = cmddata

  var cd = clusterView(options, data)

  addSlider({
    name : "Tension"
  , min: 0
  , max: 100
  , snap: 1
  , init: 85
  }, cd.setTension)

  addSlider({
    name: "Rotation"
  , min: 0
  , max: 360
  , snap: 1
  , init: 0
  }, cd.setRotation)


})


function setDisplay(options) {
  var dp = document.getElementById('dataPanel')
    , dh = dp.offsetHeight
    , dw = dp.offsetWidth
  options.width = dw
  options.height = dh

  return options
}

function addSlider (opts, callback) {

  var cp = document.getElementById('controlPanel')
    , form = document.createElement('form')
  cp.appendChild(form)

  var div = document.createElement('div')
  div.style['display'] = 'inline-block'

  var input = document.createElement('input')
  input.setAttribute('type', 'text')
  input.setAttribute('size', 3)

  var h4 = document.createElement('h4')
  h4.innerHTML = opts.name
  h4.style['font-size'] = '24px'
  h4.style['margin'] = '0 0 0 0'
  h4.style['display'] = 'inline-block';
  h4.style['padding-left'] = '20px';

  form.appendChild(div)
  form.appendChild(input)
  form.appendChild(h4)

  var slider = slideways(opts)
  slider.appendTo(div)

  slider.input = input
  slider.heading = h4

  /*
   * User can hardcode number into input field
   */
  input.onkeypress = function (e) {
    if (!e) e = window.event
    var keyCode = e.keyCode || e.which
    if (keyCode == '13'){
      slider.set(input.value)
      return false
    }
    return true
  }

  if(typeof(callback) == "function") {
    slider.on('value', function (value) {
      input.value = value;
      callback(value)
    })
  }


  return slider
}
