canvas = document.getElementById("myCanvas");
l = canvas.getContext("2d");

canvas.width = 1080;
canvas.height = 720;

var x = 480, radius = 15;
var score = 0;
var brokenBrick = [
  [0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0],
];
var brickTouched = 0;
var e = window.event;
var speed = 2;
var velocity = {x:speed, y:-speed};
var position = {x:530, y:620};

function setLevel(){
  var level = prompt("Select Level (Easy, Normal, Hard)", "Hard");
  if (level == "Easy") {
    speed = 1;
  }
  if (level == "Normal") {
    speed = 2;
  }
  if (level == "Hard") {
    speed = 3;
  }
  if (level == "Devil") {
    speed = 4;
  }
}
function getScore(){
  score = 0;
  for (var p = 0; p <= 3; p++){
    for (var q = 0; q <= 8; q++){
      score += brokenBrick[p][q];
    }
  }
}
function playerCollisionLogic(){
  if (position.x + radius >= x - 10 && position.x + radius <= x + 100 + 10){
    if (position.y + radius >= 640 && position.y <= 640 + 10){
      velocity.y *= -1;
      velocity.x += Math.random()*0.2 - 0.1;
     }
    }
}
function wallCollisionLogic(){
  if (position.x + radius >= canvas.width) {
    velocity.x *= -1;
    velocity.y += Math.random()*0.1 - 0.05;
  }
  if (position.x - radius <= 0) {
    velocity.x *= -1;
    velocity.y += Math.random()*0.1 - 0.05;
  }
  if (position.y + radius >= canvas.height) {
    velocity.y *= -1;
    velocity.x += Math.random()*0.1 - 0.05;
  }
  if (position.y - radius <= 0) {
    velocity.y *= -1;
    velocity.x += Math.random()*0.1 - 0.05;
  }

  position.x += velocity.x;
  position.y += velocity.y;
}

function brickCollisionLogic(brickX, brickY, sizeX, sizeY){
  if (position.x + radius >= brickX && position.x - radius <= brickX + sizeX) {
    if (position.y + radius >= brickY && position.y - radius <= brickY + sizeY){
      brickTouched = 1;
      if (position.x < brickX || position.x > brickX + sizeX) {
        velocity.x *= -1;
      }
      else if (position.y < brickY || position.y > brickY + sizeY) {
        velocity.y *= -1;
      }
    }
  }
}

function update() {
//Playing Area
l.fillStyle = "#120052";
l.beginPath();
l.rect(0,0,canvas.width,canvas.height);
l.fill();
l.closePath();

l.fillStyle = "#ff2281";
l.beginPath();
l.rect(0, canvas.height - 10, canvas.width, canvas.height);
l.fill();
l.closePath();
//Player
l.fillStyle = "#ffffff";
l.beginPath();
l.rect(x,640,100,20);
l.fill();
l.closePath();
//Bricks
for (var j = 0;j <= 3; j++){
  j == 0 ? l.fillStyle = "#b537f2" : console.log();
  j == 1 ? l.fillStyle = "#3cb9f2" : console.log();
  j == 2 ? l.fillStyle = "#09fbd3" : console.log();
  j == 3 ? l.fillStyle = "#f5d300" : console.log();

  for (var i = 0; i <= 8; i++){
    if (brokenBrick[j][i] == 0){
      brickTouched = 0;
      brickCollisionLogic(200 + 82*i,150 + 42*j,80,40);
      l.beginPath();
      l.rect(200 + 82*i,150 + 42*j,80,40);
      l.fill();
      l.stroke();
      l.closePath();
    }
    if (brickTouched == 1){
      brokenBrick[j][i] = 1;
    }
  }
  l.font = "30px Arial";
  l.fillText(score, 1000, 50);
}
//Ball
playerCollisionLogic();
wallCollisionLogic();
l.fillStyle = "#ffffff";
l.beginPath();
l.arc(position.x, position.y, radius, 0, Math.PI*2, false);
l.fill();
l.closePath();
};

var alert_only_once = 0;
function gameOverCheck() {
  if (position.y + radius >= canvas.height) {
      alert("Game Over!");
      position.x = -100;
      position.y = -100;
    }
    if (score >= 36 && alert_only_once == 0 )
    {
        alert("You Win!");
        alert_only_once = 1;
    }
  }

var tempVelocityX  = 0, tempVelocityY = 0;

onmousemove = function(e){
  x = e.clientX - 60;
};
var mymod = 1;
onkeydown = function(e){
  if (e.key == 'p'){
    if (mymod > 0){
      tempVelocityX = velocity.x;
      tempVelocityY = velocity.y;
      velocity.x = velocity.y = 0;
    }
    else{
      velocity.x = tempVelocityX;
      velocity.y = tempVelocityY;
    }
    mymod *= -1
  }
};

setLevel();
velocity.x = speed;
velocity.y = speed;
setInterval(gameOverCheck, 1);
setInterval(getScore, 1);
setInterval(update, 1);
gameOverCheck();
getScore();
update(e);
