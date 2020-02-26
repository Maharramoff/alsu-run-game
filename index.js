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

class Game
{
    constructor(canvas)
    {
        this.gameRunning = false;
        this.gamePaused = false;
        this.timer = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.delay = 1000; // 1 second
        this.ctx = canvas.context;
        this.background = new Background(canvas, 'img/bg.png');
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
    }

    _draw()
    {
        this.background.draw();
    }
}

let canvas = new Canvas(700, 400);
new Game(canvas).start();