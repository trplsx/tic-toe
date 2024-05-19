(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
    window.requestAnimationFrame = requestAnimationFrame;
})();

// Terrain stuff.
var background = document.getElementById("bgCanvas"),
    bgCtx = background.getContext("2d"),
    width = window.innerWidth,
    height = document.body.offsetHeight;

(height < 400) ? height = 400: height;

background.width = width;
background.height = height;

function Terrain(options) {
    options = options || {};
    this.terrain = document.createElement("canvas");
    this.terCtx = this.terrain.getContext("2d");
    this.scrollDelay = options.scrollDelay || 90;
    this.lastScroll = new Date().getTime();

    this.terrain.width = width;
    this.terrain.height = height;
    this.fillStyle = options.fillStyle || "#191D4C";
    this.mHeight = options.mHeight || height;

    // generate
    this.points = [];

    var displacement = options.displacement || 140,
        power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));

    // set the start height and end height for the terrain
    this.points[0] = this.mHeight; //(this.mHeight - (Math.random() * this.mHeight / 2)) - displacement;
    this.points[power] = this.points[0];

    // create the rest of the points
    for (var i = 1; i < power; i *= 2) {
        for (var j = (power / i) / 2; j < power; j += power / i) {
            this.points[j] = ((this.points[j - (power / i) / 2] + this.points[j + (power / i) / 2]) / 2) + Math.floor(Math.random() * -displacement + displacement);
        }
        displacement *= 0.6;
    }

    document.body.appendChild(this.terrain);
}

Terrain.prototype.update = function() {
    // draw the terrain
    this.terCtx.clearRect(0, 0, width, height);
    this.terCtx.fillStyle = this.fillStyle;

    if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
        this.lastScroll = new Date().getTime();
        this.points.push(this.points.shift());
    }

    this.terCtx.beginPath();
    for (var i = 0; i <= width; i++) {
        if (i === 0) {
            this.terCtx.moveTo(0, this.points[0]);
        } else if (this.points[i] !== undefined) {
            this.terCtx.lineTo(i, this.points[i]);
        }
    }

    this.terCtx.lineTo(width, this.terrain.height);
    this.terCtx.lineTo(0, this.terrain.height);
    this.terCtx.lineTo(0, this.points[0]);
    this.terCtx.fill();
}


// Second canvas used for the stars
bgCtx.fillStyle = '#05004c';
bgCtx.fillRect(0, 0, width, height);

// stars
function Star(options) {
    this.size = Math.random() * 2;
    this.speed = Math.random() * .05;
    this.x = options.x;
    this.y = options.y;
}

Star.prototype.reset = function() {
    this.size = Math.random() * 2;
    this.speed = Math.random() * .05;
    this.x = width;
    this.y = Math.random() * height;
}

Star.prototype.update = function() {
    this.x -= this.speed;
    if (this.x < 0) {
        this.reset();
    } else {
        bgCtx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function ShootingStar() {
    this.reset();
}

ShootingStar.prototype.reset = function() {
    this.x = Math.random() * width;
    this.y = 0;
    this.len = (Math.random() * 80) + 10;
    this.speed = (Math.random() * 10) + 6;
    this.size = (Math.random() * 1) + 0.1;
    // this is used so the shooting stars arent constant
    this.waitTime = new Date().getTime() + (Math.random() * 3000) + 500;
    this.active = false;
}

ShootingStar.prototype.update = function() {
    if (this.active) {
        this.x -= this.speed;
        this.y += this.speed;
        if (this.x < 0 || this.y >= height) {
            this.reset();
        } else {
            bgCtx.lineWidth = this.size;
            bgCtx.beginPath();
            bgCtx.moveTo(this.x, this.y);
            bgCtx.lineTo(this.x + this.len, this.y - this.len);
            bgCtx.stroke();
        }
    } else {
        if (this.waitTime < new Date().getTime()) {
            this.active = true;
        }
    }
}

var entities = [];

// init the stars
for (var i = 0; i < height; i++) {
    entities.push(new Star({
        x: Math.random() * width,
        y: Math.random() * height
    }));
}

// Add 2 shooting stars that just cycle.
entities.push(new ShootingStar());
entities.push(new ShootingStar());
entities.push(new Terrain({ mHeight: (height / 2) - 120 }));
entities.push(new Terrain({ displacement: 120, scrollDelay: 50, fillStyle: "rgb(17,20,40)", mHeight: (height / 2) - 60 }));
entities.push(new Terrain({ displacement: 100, scrollDelay: 20, fillStyle: "rgb(10,10,5)", mHeight: height / 2 }));

//animate background
function animate() {
    bgCtx.fillStyle = '#110E19';
    bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = '#ffffff';
    bgCtx.strokeStyle = '#ffffff';

    var entLen = entities.length;

    while (entLen--) {
        entities[entLen].update();
    }
    requestAnimationFrame(animate);
}
animate();

var monkey = document.getElementById('monkey');
var dog = document.getElementById('dog');
var table = document.getElementById('table');
var start = document.getElementById('start');

var counter = 0;
var cells = document.querySelectorAll('#table button');
var header = document.getElementById('header');

var restart = document.getElementById('restart');

var hero = "";

restart.addEventListener("click", function() {
    restart.classList.toggle("visually-hidden");
    start.classList.toggle("visually-hidden");
    table.classList.toggle("visually-hidden");
    header.innerText = 'Выберете персонажа';
});

monkey.addEventListener("click", function() {
    start.classList.toggle("visually-hidden");
    table.classList.toggle("visually-hidden");
    header.innerText = 'Вы играете за обезьяну!';
    hero = "обезьяна";

});
dog.addEventListener("click", function() {
    start.classList.toggle("visually-hidden");
    table.classList.toggle("visually-hidden");
    header.innerText = 'Вы играете за собаку!';
    hero = "собака";

});

function Victory() {
    var combos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (var combo of combos) {
        if (cells[combo[0]].innerHTML == cells[combo[1]].innerHTML && cells[combo[1]].innerHTML == cells[combo[2]].innerHTML && cells[combo[0]].innerHTML != '') {
            return true;

        }
    }
    return false;
}

function tap(event) {

    if (hero == "обезьяна") {
        if (counter % 2 == 0) {
            event.target.innerHTML = '<img src="banana-svgrepo-com.svg" alt="">';
        } else {
            event.target.innerHTML = '<img src="bone-svgrepo-com.svg" alt="">';
        }
        counter++;
        event.target.removeEventListener('click', tap);
    } else {
        if (counter % 2 == 0) {
            event.target.innerHTML = '<img src="bone-svgrepo-com.svg" alt="">';
        } else {
            event.target.innerHTML = '<img src="banana-svgrepo-com.svg" alt="">';
        }
        counter++;
        event.target.removeEventListener('click', tap);
    }

    if (Victory()) {
        for (var cell of cells) {
            cell.removeEventListener('click', tap);
        }
        // if (counter % 2 == 0 && hero == "обезьяна") {
        //     console.log(hero);
        //     header.innerText = `Победила обезьяна!`;
        // } else {
        //     console.log(hero);
        //     header.innerText = `Победила собака!`;
        // }
        // if (counter % 2 == 0 && hero == "собака") {
        //     console.log(hero);
        //     header.innerText = `Победила собака!`;

        // } else {
        //     console.log(hero);
        //     header.innerText = `Победила обезьяна!`;
        // }

        if (counter % 2 != 0) {
            if (hero == "обезьяна") {
                header.innerText = `Победила обезьяна!`;
            } else {
                header.innerText = `Победила собака!`;
            }
            if (hero == "собака") {
                header.innerText = `Победила собака!`;
            } else {
                header.innerText = `Победила обезьяна!`;
            }
        } else {
            if (hero == "обезьяна") {
                header.innerText = `Победила собака!`;
            } else {
                header.innerText = `Победила обезьяна!`;
            }
            if (hero == "собака") {
                header.innerText = `Победила обезьяна!`;
            } else {
                header.innerText = `Победила собака!`;
            }
        }
        restart.classList.toggle("visually-hidden");
    } else if (counter == 9) {
        header.innerText = 'Ничья';
    }
}

function startGame() {
    counter = 0;
    for (var cell of cells) {
        cell.innerHTML = '';
        cell.addEventListener('click', tap)
    }
}

console.log(cells);

startGame();