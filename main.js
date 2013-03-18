"use strict";
var clusterView = require('./clusterView')
  , Slideways = require('slideways')
  , PushButt = require('pushbutt')

var socket = io.connect('http://localhost')


var cmd = {}
cmd.name = 'pactree'
cmd.args = '-g'
cmd.pkg = 'nodejs'
var data
var view
var options = setDisplay( {} )

socket.emit('command', cmd)

socket.on('command-data', function (cmddata) {
  data = cmddata

  if (view) {
    view.updateData(data)
    return
  }
  else
    view = clusterView(options, data)

  addInputControl( { title: 'butts' } )

  addSlider({
    name : "Tension"
  , min : 1
  , max : 100
  , snap: 1
  , init: 85
  }, view.setTension)

  addSlider({
    name: "Rotation"
  , min : 0
  , max : 360
  , snap: 1
  , init: 0
  }, view.setRotation)


})

function setDisplay(options) {
  var dp = document.getElementById('dataPanel')
    , dh = dp.offsetHeight
    , dw = dp.offsetWidth
  options.width = dw
  options.height = dh

  return options
}

function addInputControl(options) {
  var cp = document.getElementById('controlPanel')
    , form = document.createElement('form')
    , div = document.createElement('div')
    , input = document.createElement('input')

  div.style['display'] = 'inline-block'

  input.setAttribute('type', 'text')
  input.setAttribute('size', 3)

  cp.appendChild(form)
  form.appendChild(input)
  form.appendChild(div)

  var butt = PushButt( options )
  butt.appendTo(div)

  butt.on(butt.event, function (id) {
    if (input.value) {
      socket.emit('command', {
        name : 'pactree'
      , args : '-g'
      , pkg : input.value
      })
    }
  })
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

  var slider = Slideways(opts)
  slider.appendTo(div)

  slider.input = input
  slider.heading = h4

  /*
   * Note, need to bind slider.set to slider since slider.set employs 'this' which
   * gets rebound to `onEnter` unless we explicitly bind it here.
   */
  input.onkeypress = onEnter( slider.set.bind(slider), input )

  if(typeof(callback) == "function") {
    slider.on('value', function (value) {
      input.value = value;
      callback(value)
    })
  }

  return slider
}


function onEnter (method, input) {

  return function (event) {
    if (!event) event = window.event
    var keyCode = event.keyCode || event.which
    if (keyCode == '13' ) {
      if (!parseInt(input.value)) return false
      method(input.value)
      return false
    }
    return true
  }
}
