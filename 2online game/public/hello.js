var socket = io.connect("http://192.168.0.114:2000");

var canvas = document.querySelector('canvas');
canvas.height=600;
canvas.width=600;
var c = canvas.getContext('2d');


// BACKGROUND
var background = {
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height,
    color: "rgb(15, 30, 83)",
    drawBG: function () {
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.w, this.h);
    },
};


// LISTENERS

document.onkeydown =function(event){
        if (event.keyCode === 68) {
        socket.emit("keypressed", {

            keyID: "right",
            state: true,
        });
        }
        if (event.keyCode === 83) {
        socket.emit("keypressed", {
            keyID: "down",
            state: true,
        });
        }
        if (event.keyCode === 65) {
        socket.emit("keypressed", {
            keyID: "left",
            state: true,
        });
        }
        if (event.keyCode === 87) {
        socket.emit("keypressed", {
            keyID: "up",
            state: true,
        });
    }
}
document.onkeyup = function (event) {
    if (event.keyCode === 68) {
    socket.emit("keypressed", {
        keyID: "right",
        state: false,
    });
    }
    if (event.keyCode === 83) {
    socket.emit("keypressed", {
        keyID: "down",
        state: false,
    });
    }
    if (event.keyCode === 65) {
    socket.emit("keypressed", {
        keyID: "left",
        state: false,
    });
    }
    if (event.keyCode === 87) {
    socket.emit("keypressed", {
        keyID: "up",
        state: false,
    });
    }
};

document.onclick = function(event){
    var x = event.clientX;
    var y = event.clientY;
    socket.emit('mouseClick',{
        x:x,
        y:y
    })
}

// UPDATE
socket.on("move", (data) => {
    background.drawBG();
    for (var i = 0; i < data.length; i++) {
        c.fillStyle = data[i].color;
        c.fillRect(data[i].x, data[i].y, data[i].w, data[i].h);
    }
});
socket.on("shot", (data) => {
    for (var i = 0; i < data.length; i++) {
        c.fillStyle = data[i].color;
        c.fillRect(data[i].x, data[i].y, data[i].w, data[i].h);
    }
});




















































