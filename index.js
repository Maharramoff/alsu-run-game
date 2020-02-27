class Helper
{
    static getRandomInt(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static mouseLeftClick(evt)
    {
        let flag = false;

        evt = evt || window.event;

        if ('buttons' in evt)
        {
            flag = evt.buttons === 1;
        }

        if (!flag)
        {
            let button = evt.which || evt.button;

            flag = button === 1;
        }

        return flag;
    }
}

class Canvas
{
    constructor(width, height)
    {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        document.getElementById('game-wrapper').appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
    }
}

class Background
{
    constructor(canvas, src)
    {
        this.ctx = canvas.context;
        this.img = new Image();
        this.scrollX = 0;
        this.scrollSpeed = 2;
        this.img.src = src;
    }

    draw()
    {
        // Resetting the images when the first image exits the screen
        if (this.scrollX >= this.ctx.canvas.width)
        {
            this.scrollX = 0;
        }

        // Update background X position
        this.scrollX += this.scrollSpeed;

        this.ctx.drawImage(this.img, -this.scrollX, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.img, this.ctx.canvas.width - this.scrollX, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

class Balloon
{
    constructor(x, y, dx, dy, color, context)
    {
        this.y = y;
        this.x = x;
        this.dx = dx;
        this.dy = dy;
        this.h = 50;
        this.w = 50;
        this.ctx = context;
        this.img = new Image();
        this.img.src = 'img/balloon-' + color + '.png';
    }

    update()
    {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw()
    {
        this.ctx.drawImage(
          this.img, //The image file
          this.x, this.y, //The destination x and y position
          this.w, this.h //The destination height and width
        );

    }

    outOfScreen()
    {
        return this.x + this.w < 0 || this.x > this.ctx.canvas.width || this.y > this.ctx.canvas.height;
    }
}

class Player
{
    constructor(x, groundY, speed, context)
    {
        this.runSprites = [
            { x: 0, y: 140, w: 68, h: 100 },
            { x: 75, y: 140, w: 68, h: 100 },
            { x: 149, y: 140, w: 71, h: 100 },
            { x: 228, y: 140, w: 69, h: 100 },
            { x: 306, y: 140, w: 68, h: 101 },
            { x: 382, y: 141, w: 68, h: 99 },
        ];

        this.jumpSprites = [
            { x: 23, y: 265, w: 65, h: 105 },
            { x: 97, y: 264, w: 78, h: 106 },
            { x: 184, y: 272, w: 78, h: 97 },
        ];

        this.groundY = groundY;
        this.ctx = context;
        this.h = 100;
        this.x = x;
        this.y = this.ctx.canvas.height - this.groundY - this.h;
        this.dy = 0;

        this.img = new Image();
        this.img.src = 'img/alsu.png';

        this.timer = 0;
        this.nextFrame = 0;
        this.frameInterval = 5;

        this.jumpHeight = 15;
        this.grounded = true;
        this.gravity = 1;
    }

    update()
    {
        this.y += this.dy;

        // Gravity
        if (this.y + this.h < this.ctx.canvas.height - this.groundY)
        {
            this.dy += this.gravity;
            this.grounded = false;
        }
        else
        {
            this.dy = 0;
            this.grounded = true;
            this.y = this.ctx.canvas.height - this.groundY - this.h;
        }
    }

    draw()
    {
        if (this.grounded)
        {
            if (this.nextFrame >= this.runSprites.length)
            {
                this.nextFrame = 0;
            }

            this.ctx.drawImage(
              this.img,
              this.runSprites[this.nextFrame].x, this.runSprites[this.nextFrame].y,
              this.runSprites[this.nextFrame].w, this.runSprites[this.nextFrame].h,
              this.x, this.y,
              this.runSprites[this.nextFrame].w, this.runSprites[this.nextFrame].h
            );

            if (this.timer > this.frameInterval)
            {
                this.timer = 0;
                this.nextFrame++;
            }

            this.timer++;
        }
        else
        {
            this.ctx.drawImage(
              this.img,
              this.jumpSprites[0].x, this.jumpSprites[0].y,
              this.jumpSprites[0].w, this.jumpSprites[0].h,
              this.x, this.y,
              this.jumpSprites[0].w, this.jumpSprites[0].h
            );
        }
    }

    jump()
    {
        if (this.grounded)
        {
            this.dy = -this.jumpHeight;
            this.grounded = false;
        }
    }
}

class Game
{
    constructor(canvas)
    {
        this.gameRunning = false;
        this.gamePaused = false;
        this.fps = 60;
        this.timer = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.delay = 1000; // 1 second

        this.ctx = canvas.context;
        this.background = new Background(canvas, 'img/bg.png');
        this.groundY = 124;
        this.balloonTimer = 0;
        this.balloonColors = ['aqua', 'blue', 'green', 'pink', 'red'];
        this.balloonColorsCopy = [...this.balloonColors];
        this.balloons = [];
        this.balloonSpawnInterval = 200;

        this.player = new Player(50, this.groundY, 10, this.ctx);
    }

    start()
    {
        if (this.gameRunning)
        {
            return false;
        }

        document.getElementById('game-starter').style.display = 'none';
        this.gameRunning = true;
        this._mouseLeftClickListener();
        this._animate();
    }

    _animate(time = 0)
    {
        if (this.gamePaused)
        {
            return;
        }

        this._create();
        this._update(time);
        this._draw();

        setTimeout(() =>
        {
            requestAnimationFrame((time) => this._animate(time));
        }, 1000 / this.fps);
    }

    _create()
    {
        if (this.balloonTimer % this.balloonSpawnInterval === 0)
        {

            // Clone balloons again if its empty
            if (this.balloonColorsCopy.length === 0)
            {
                this.balloonColorsCopy = [...this.balloonColors];
            }

            // Get unique balloon randomly
            let randomBalloonColorIdx = Math.floor(Math.random() * this.balloonColorsCopy.length);
            let randomBalloonColor = this.balloonColorsCopy[randomBalloonColorIdx];

            // Remove current generated balloon from copy
            this.balloonColorsCopy.splice(randomBalloonColorIdx, 1);

            this.balloons.push(new Balloon(
              700,
              Helper.getRandomInt(50, 170),
              -1,
              0,
              randomBalloonColor,
              this.ctx
            ));

            this.balloonSpawnInterval = Helper.getRandomInt(200, 350);
            this.balloonTimer = 0;
        }
    }

    _update(time)
    {
        this.deltaTime = Math.floor(time - this.lastTime);
        this.lastTime = time;
        this.timer += this.deltaTime;

        if (this.timer > this.delay)
        {
            this.timer = 0;
            this.elapsedTime++;
        }

        this.balloonTimer++;

        // Update Balloons
        for (let i in this.balloons)
        {
            // Update balloon position
            this.balloons[i].update();

            // Remove the balloon if out of screen.
            if (this.balloons[i].outOfScreen())
            {
                this.balloons.splice(i, 1);
            }
        }

        // Update player position
        this.player.update();
    }

    _draw()
    {
        this.background.draw();

        this.player.draw();

        // Draw balloons
        for (let i in this.balloons)
        {
            this.balloons[i].draw();
        }
    }

    _mouseLeftClick(event)
    {
        if (Helper.mouseLeftClick(event))
        {
            this.player.jump();
        }
    }

    _mouseLeftClickListener()
    {
        let self = this;
        this.ctx.canvas.addEventListener('mousedown', function (event)
        {
            self._mouseLeftClick(event);
        });
    }
}

let canvas = new Canvas(700, 400);
let game = new Game(canvas);