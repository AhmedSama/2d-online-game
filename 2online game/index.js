var express = require('express');
var socket = require('socket.io');

var app = express();

var server = app.listen(2000,()=>{
    console.log('[$]SERVER LISTINING AT PORT 2000...');
});
app.use(express.static('public'));
var io = socket(server);


// LISTS
socketList = {};
charList = {};
bulletList = {};

// ENTITIES
function Char(x, y, w, h, spX, spY, color) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
    this.spX = spX;
    this.spY = spY;
    this.color = color;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.move = function () {
        if (this.left) {
        this.x -= this.spX;
        }
        if (this.right) {
        this.x += this.spX;
        }
        if (this.up) {
        this.y -= this.spY;
        }
        if (this.down) {
        this.y += this.spY;
        }
    };
}

function Bullet(x, y, w, h, spX, spY, color,angle) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
    this.color = color;
    this.angle = angle;
    this.spX = spX;
    this.spY = spY;
    this.lifeTime = 0;
    this.moveBull = function () {
        this.x += this.spX;
        this.y += this.spY;
    };
}

// MAIN FUNCTIONS
function collision(someone, anotherone) {
    if (
    someone.x + someone.w >= anotherone.x &&
    someone.x <= anotherone.x + anotherone.w &&
    someone.y + someone.h >= anotherone.y &&
    someone.y <= anotherone.y + anotherone.h
    ) {
    return true;
    } else {
    return false;
    }
}
function random(x) {
  return Math.floor(Math.random() * x);
}

function randomColor(){
    return "rgb(" + random(255) + "," + random(255) + "," + random(255) + ")";
}

function generateCHAR(socket){
    var x = 10 + random(500);
    var y = 10 + random(500);
    var w = 40 ;
    var h = 40;
    var spX = 10;
    var spY = 10;
    var color = randomColor();
    var id = socket.id;
    var char = new Char(x,y,w,h,spX,spY,color);
    char.id = id;
    charList[id]=char;
    return char;
}
function generateBULL(player,data) {
    var x = player.x + player.w/2;
    var y = player.y + player.h/2;
    var w = 7 ;
    var h = 7 ;
    var mouseX = data.x;
    var mouseY = data.y;
    mouseX -=x;
    mouseY -=y
    var ang = Math.atan2(mouseY,mouseX)/180*Math.PI;
    var spX = Math.cos(ang / Math.PI * 180) *40;
    var spY = Math.sin(ang / Math.PI * 180) *40;;
    var color = randomColor();
    var id = Math.random();
    var playerID = player.id;
    var bull = new Bullet(x, y, w, h, spX, spY, color,ang);
    bull.id =id;
    bull.playerID = playerID;
    bulletList[id] = bull;
}
io.on('connection',(socket)=>{
    console.log('[$]Client CONNECTED ',socket.id);
    // socket.emit('id',{id:socket.id});
    var player = generateCHAR(socket);
    socketList[socket.id] = socket;
        socket.on("disconnect", function () {
            delete socketList[socket.id];
            delete charList[socket.id];
        });
        socket.on("keypressed", (data) => {
            if (data.keyID === "left") {
                player.left = data.state;
            }
            if (data.keyID === "right") {
                player.right = data.state;
            }
            if (data.keyID === "up") {
                player.up = data.state;
            }
            if (data.keyID === "down") {
                player.down = data.state;
            }
        });

        socket.on("mouseClick",(data)=>{
            generateBULL(player,data)
        });

})

// MAIN FUNCTIONS

//return packages with x,y,color,w,h data of every CHARACTAR
function packaging(){
    var pack = [];
    for (var key in charList) {
        var char = charList[key];
        pack.push({
            x: char.x,
            y: char.y,
            color: char.color,
            h: char.h,
            w: char.w,
            id: char.id,
        });
    }
    return pack;
}
// emiting move object
function send(pack){
    for (var i in socketList) {
        var sock = socketList[i];
        sock.emit("move", pack);
    }
}
function updatePlayer(){
    for(var i in charList){
        var player = charList[i];
        player.move()
    }
}
function packagingBull() {
    var pack = [];
    for (var key in bulletList) {
    var bull = bulletList[key];
    pack.push({
        x: bull.x,
        y: bull.y,
        color: bull.color,
        h: bull.h,
        w: bull.w,
    });
    }
    return pack;
}
// emiting move object
function sendBull(pack) {
    for (var i in socketList) {
        var sock = socketList[i];
        sock.emit("shot", pack);
    }
}
function updateBullet(){
    for (var i in bulletList){
        var bull = bulletList[i];
        bull.moveBull();
        bull.lifeTime +=1;
        if(bull.lifeTime>100){
            delete bulletList[i];
        }
    }
}

// collision detection
function collisionDetection(){
    for (var i in bulletList){
        for(var j in charList){
            var bull = bulletList[i];
            var char = charList[j];
            if(bull.playerID==char.id){
                continue;
            }
            else{
                if(collision(bull,char)){
                    delete charList[j];
                }
            }
        }
    }
}
//update function
function updateCanvas(){
    updatePlayer();
    var pack = packaging();
    send(pack);
    updateBullet();
    var packBull = packagingBull();
    sendBull(packBull);
    collisionDetection();
}

//MAIN LOOP

setInterval(()=>{
    updateCanvas();
},20)



