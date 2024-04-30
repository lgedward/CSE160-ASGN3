// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 'attribute vec4 a_Position; uniform mat4 u_ModelMatrix; uniform mat4 u_GlobalRotateMatrix; void main() {gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;}'

// Fragment shader program
var FSHADER_SOURCE = 'precision mediump float; uniform vec4 u_FragColor; void main() {gl_FragColor = u_FragColor;}'

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
     console.log('Failed to get the rendering context for WebGL');
     return;
   }
   gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


function convertCoordinatesEventToGL(ev){
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
let g_yellowAngle=0;
let g_magentaAngle=0;
let g_yellowAnimation=false;
let g_magentaAnimation=false;

let g_headAngle = 0;
let g_headAnimation = false;

let g_animationType = 'default';

let g_yellowTranslateAnimation = false;
let g_yellowTranslateValue = 0;

function renderAllShapes(){
  var startTime = performance.now();

  var globalRotMat=new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var body = new Cube();
  body.color = [1.0, 0.5, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.75, 0.0);
  body.matrix.rotate(-0.5,1,0,0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  var yellow = new Cube();
  yellow.color = [1,0.5,0,0.5];
  yellow.matrix.setTranslate(0, -0.5, 0.0);
  yellow.matrix.rotate(-5, 1, 0, 0);
  yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  var yellowCoordinatesMat=new Matrix4(yellow.matrix);
  yellow.matrix.translate(g_yellowTranslateValue, 0, 0);
  yellow.matrix.scale(0.25, 0.7, 0.5);
  yellow.matrix.translate(-0.5,0,0);
  yellow.render();

  var magenta = new Cube();
  magenta.color = [1,0,1,1];
  magenta.matrix =  yellowCoordinatesMat;
  magenta.matrix.translate(0,0.65, 0);
  magenta.matrix.rotate(g_magentaAngle, 0, 0, 1);
  magenta.matrix.scale(0.3, 0.3, 0.3);
  magenta.matrix.translate(-0.5, 0, -0.001);
  magenta.render();

  var head = new Cube();
  head.setColor(0.0, 1.0, 0.0, 1.0);
  head.matrix.set(magenta.matrix);
  head.matrix.translate(0, 0.4, 0);
  head.matrix.rotate(g_headAngle, 0, 1, 0);
  head.matrix.scale(1, 1, 1);
  head.render();

  var tail = new Cube();
  tail.setColor(0.5, 0.35, 0.05, 1.0);
  tail.matrix.set(body.matrix);
  tail.matrix.translate(0.2, -0.5, 0);
  tail.matrix.rotate(g_tailAngle, 0, 1, 0);
  tail.matrix.scale(0.1, 0.1, 0.5);
  tail.render();

  var cylinder = new Cylinder(0.3, 0.15, 24);
  cylinder.setColor(0.3, 0.6, 0.9, 1.0);
  cylinder.matrix.translate(0, -0.4, 0);
  cylinder.matrix.rotate(90, 1, 0, 0);
  cylinder.render();

  var hand = new Cube();
  hand.setColor(0.8, 0.2, 0.2, 1.0);
  hand.matrix.set(yellow.matrix);
  hand.matrix.translate(0, 0.3, 0);
  hand.matrix.rotate(30 * Math.sin(g_seconds), 0, 1, 0);
  hand.matrix.scale(0.5, 0.5, 0.5)
  hand.matrix.translate(0, 0.3, 0);
  hand.render();

  var eyeSize = 0.9;
  var eyePositionOffsetX = 0.85;
  var eyePositionOffsetZ = 0.15;

  var eyeLeft = new Cube();
  var eyeRight = new Cube();
  eyeLeft.setColor(1, 1, 1, 1);
  eyeRight.setColor(1, 1, 1, 1);

  eyeLeft.matrix.set(head.matrix);
  eyeLeft.matrix.translate(-eyePositionOffsetX, 0, eyePositionOffsetZ);
  eyeLeft.matrix.scale(eyeSize, eyeSize, eyeSize);

  eyeRight.matrix.set(head.matrix);
  eyeRight.matrix.translate(eyePositionOffsetX, 0, eyePositionOffsetZ);
  eyeRight.matrix.scale(eyeSize, eyeSize, eyeSize);

  eyeLeft.render();
  eyeRight.render();

  var K=10.0;
  for (var i=1; i<K; i++){
    var c = new Cube();
    c.matrix.translate(-0.8, 1.9*i/K-1.0,0);
    c.matrix.rotate(g_seconds*100,1,1,1);
    c.matrix.scale(0.1,0.5/K,1.0/K);
    c.render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


function addActionsForHtmlUI(){
  document.getElementById('headAnimationOnButton').onclick = function() {g_headAnimation = true;};
  document.getElementById('headAnimationOffButton').onclick = function() {g_headAnimation = false;};

  document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false; };
  document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true; };

  document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false; };
  document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true; };
  
  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });
  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });

  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
}


var lastX = -100;
var lastY = -100;

function convert(x, y) {
  var rect = canvas.getBoundingClientRect();
  var x = ((x - rect.left) - canvas.width / 2) / 10;
  var y = ((canvas.height / 2 - (y - rect.top)) / 10);
  return {
      x, y
  };
}

function updateMouseRot(x, y) {
  if (lastX === -100) {
      lastX = x;
      lastY = y;
      return;
  }

  var newAngles = convert(x, y);
  var oldAngles = convert(lastX, lastY);
  lastX = x;
  lastY = y;
  var dx = newAngles.x - oldAngles.x;
  var dy = newAngles.y - oldAngles.y;

  g_globalAngle += dx;
  g_headAngle += dy;

  renderAllShapes();
}

function setupMouseControls() {
  canvas.addEventListener('mousemove', function(event) {
      updateMouseRot(event.clientX, event.clientY);
  });
}


function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  setupMouseControls();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick(){
  g_seconds=performance.now()/1000.0-g_startTime;
  var now = performance.now();
  console.log(g_seconds);
  updateAnimationAngles();
  renderAllShapes();
  var elapsed = performance.now() - now;
  sendTextToHTML(`Render time: ${elapsed.toFixed(2)}ms`, "performanceIndicator");
  requestAnimationFrame(tick);
}

let g_tailAngle = 0;
let g_tailAnimation = true;

function updateAnimationAngles(){
  if (g_headAnimation) {
    g_headAngle = 30 * Math.sin(g_seconds);
  }
  if (g_tailAnimation) {
    g_tailAngle = 30 * Math.sin(1.5 * g_seconds);
  }
  if(g_yellowAnimation){
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if(g_yellowTranslateAnimation){
    g_yellowTranslateValue = 0.5 * Math.sin(g_seconds);
  }
  if(g_magentaAnimation){
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Shift') {
    g_yellowTranslateAnimation = !g_yellowTranslateAnimation;
    event.preventDefault();
  }
});


var g_shapesList = [];

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if(g_selectedType==POINT){
    point = new Point();
  } else if(g_selectedType==TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}
