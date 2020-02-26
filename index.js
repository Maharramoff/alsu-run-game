class Helper
{
    static getRandomInt(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

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

class Game
{
    constructor(canvas)
    {
        this.gameRunning = false;
        this.gamePaused = false;
        this.timer = 0;
        this.frames = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.delay = 1000; // 1 second

        this.ctx = canvas.context;
        this.background = new Background(canvas, 'img/bg.png');
        this.balloonColors = ['aqua', 'blue', 'green', 'pink', 'red'];
        this.balloons = [];
        this.balloonSpawnInterval = 100;
    }

    start()
    {
        if (this.gameRunning)
        {
            return false;
        }

        this.gameRunning = true;
        this._animate();
    }

    _animate(time = 0)
    {
        if (this.gamePaused)
        {
            return;
        }

        this._update(time);
        this._draw();
        requestAnimationFrame((time) => this._animate(time));
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

        if (this.frames % this.balloonSpawnInterval === 0)
        {
            let randomBalloonColor = this.balloonColors[Math.floor(Math.random() * this.balloonColors.length)];

            this.balloons.push(new Balloon(
              700,
              Math.random() * 100,
              -1,
              0,
              randomBalloonColor,
              this.ctx
            ));
        }

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

        this.frames++;
    }

    _draw()
    {
        this.background.draw();

        // Draw balloons
        for (let i in this.balloons)
        {
            this.balloons[i].draw();
        }
    }
}

let canvas = new Canvas(700, 400);
new Game(canvas).start();