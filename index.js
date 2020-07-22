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

    static _timestamp()
    {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }

    /*
    Delete an element from an array without
    having to create a new array in the process
    to keep garbage collection at a minimum
    */
    static removeIndex(array, index)
    {
        if (index >= array.length || array.length <= 0)
        {
            return;
        }

        array[index] = array[array.length - 1];
        array[array.length - 1] = undefined;
        array.length = array.length - 1;
    }

    static round(number)
    {
        return Math.round(number);
    }
}

class Sound
{
    constructor(src)
    {
        this.audio = new Audio(src);
    }

    play()
    {
        this.audio.currentTime = 0;
        this.audio.play().then(() => {}).catch(() => {})
    }
}

class Canvas
{
    constructor(width, height, zIndex)
    {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.append(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.canvas.style.zIndex = zIndex;
    }
}

class Background
{
    constructor(context, src, speed)
    {
        this.ctx = context;
        this.img = new Image();
        this.scrollX = 0;
        this.scrollSpeed = speed;
        this.img.src = src;
        this.totalSeconds = 0;
        this.numImages = Math.ceil(this.ctx.canvas.width / this.img.width) + 1;
    }

    update(dt)
    {
        this.totalSeconds += dt;
        this.scrollX = this.totalSeconds * this.scrollSpeed % this.img.width
    }

    draw()
    {
        this.ctx.save();
        this.ctx.translate(-this.scrollX, 0);
        for (let i = 0; i < this.numImages; i++)
        {
            this.ctx.drawImage(this.img, i * this.img.width, 0);
        }
        this.ctx.restore();
    }
}

class Balloon
{
    constructor(x, y, dx, dy, img, context)
    {
        this.y = y;
        this.x = x;
        this.dx = dx;
        this.dy = dy;
        this.h = 50;
        this.w = 50;
        this.radius = 25;
        this.ctx = context;
        this.img = img;
    }

    update(dt)
    {
        this.x += this.dx * dt;
        this.y += this.dy * dt;

        // this.x = Math.round(this.x);
        // this.y = Math.round(this.y);
    }

    draw()
    {
        this.ctx.drawImage(
          this.img, //The image file
          Helper.round(this.x), Helper.round(this.y), //The destination x and y position
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
        this.playerCanvas = new Canvas(context.canvas.width, context.canvas.height, 1);
        this.ctx = this.playerCanvas.context;
        this.h = 100;
        this.x = x;
        this.y = this.ctx.canvas.height - this.groundY - this.h;
        this.dy = 0;
        this.radius = 40;

        this.img = new Image();
        this.img.src = 'img/alsu.png';

        this.jumpSound = new Sound('sound/jump.mp3');

        this.timer = 0;
        this.nextFrame = 0;
        this.frameInterval = 4;

        this.jumpHeight = 500;
        this.grounded = true;
        this.gravity = 20;
    }

    update(dt)
    {
        this.y += this.dy * dt;

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

        //this.y = Math.round(this.y);
    }

    draw()
    {

        this.ctx.canvas.width = this.ctx.canvas.width;
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
              this.x, Helper.round(this.y),
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
              this.x, Helper.round(this.y),
              this.jumpSprites[0].w, this.jumpSprites[0].h
            );
        }
    }

    jump()
    {
        if (this.grounded)
        {
            this.jumpSound.play();
            this.dy = -this.jumpHeight;
            this.grounded = false;
        }
    }

    collidesWith(object)
    {
        return this.distanceBetween(object) < (this.radius + object.radius);
    }

    distanceBetween(object)
    {
        return Math.sqrt(Math.pow(this.x - object.x, 2) + Math.pow(this.y - object.y, 2));
    }
}

class Game
{
    constructor(context)
    {
        this.gameRunning = false;
        this.gamePaused = false;
        this.speed = 200;
        this.fps = 60;
        this.step = 1 / this.fps;
        this.now = 0;
        this.lastTime = Helper._timestamp();
        this.deltaTime = 0;
        this.elapsedTime = 0;

        this.ctx = context;
        this.background = new Background(this.ctx, 'img/bg.png', this.speed);
        this.groundY = 124;
        this.balloonCanvas = new Canvas(context.canvas.width, context.canvas.height, 2);
        this.balloonTimer = 0;
        this.balloonColors = ['aqua', 'blue', 'green', 'pink', 'red'];
        this.balloons = [];
        this.balloonSpawnInterval = 100;
        this.collectSound = new Sound('sound/collect.mp3');

        this.player = new Player(100, this.groundY, 10, this.ctx);
        this.score = 0;
        this.balloonImgs = [];

        Object.keys(this.balloonColors).forEach(key =>
        {
            this.balloonImgs[key] = new Image();
            this.balloonImgs[key].src = 'img/balloon-' + this.balloonColors[key] + '.png';
        });
    }

    start()
    {
        if (this.gameRunning)
        {
            return false;
        }

        document.getElementById('game-starter').style.display = 'none';
        document.getElementById('game-stats').style.display = 'block';
        this.gameRunning = true;
        this._mouseLeftClickListener();
        this._animate();
    }

    _animate()
    {
        if (this.gamePaused)
        {
            return;
        }

        this.now = Helper._timestamp();
        this.deltaTime = Math.min(0.1, (this.now - this.lastTime) / 1000);
        this.elapsedTime += this.deltaTime;

        while (this.elapsedTime > this.step)
        {
            this._update(this.step);
            this.elapsedTime -= this.step;
        }

        this._draw(this.deltaTime);
        this.lastTime = this.now;

        requestAnimationFrame(() => this._animate());
    }

    spawnBalloons()
    {
        if (this.balloonTimer % this.balloonSpawnInterval === 0)
        {
            // Get balloon randomly
            let balloonImg = this.balloonImgs[Helper.getRandomInt(0, 4)];

            this.balloons.push(new Balloon(
              700,
              Helper.getRandomInt(50, 170),
              -this.speed,
              0,
              balloonImg,
              this.balloonCanvas.context,
            ));

            this.balloonSpawnInterval = Helper.getRandomInt(50, 100);
            this.balloonTimer = 0;
        }
    }

    _update(dt)
    {
        // Update Background position
        this.background.update(dt);

        // Update player position
        this.player.update(dt);

        this.spawnBalloons();

        // Update Balloons
        for (let i in this.balloons)
        {
            if (this.balloons.hasOwnProperty(i))
            {
                if (this.player.collidesWith(this.balloons[i]))
                {
                    Helper.removeIndex(this.balloons, i);
                    this.collectSound.play();
                    this._scoreUpdate();
                }

                // Remove the balloon if out of screen.
                if (this.balloons.hasOwnProperty(i) && this.balloons[i].outOfScreen())
                {
                    Helper.removeIndex(this.balloons, i);
                }

                // Update balloon position
                if (this.balloons.hasOwnProperty(i))
                {
                    this.balloons[i].update(dt);
                }
            }
        }

        this.balloonTimer++;
    }

    _draw(dt)
    {
        this.background.draw(dt);
        this.player.draw();
        // Draw balloons
        this.balloonCanvas.context.canvas.width = this.balloonCanvas.context.canvas.width;
        for (let i in this.balloons)
        {
            if (this.balloons.hasOwnProperty(i))
            {
                this.balloons[i].draw();
            }
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
        document.body.addEventListener(window.PointerEvent ? 'pointerdown' : 'mousedown', (event) =>
        {
            if (event.defaultPrevented)
            {
                return; // Do nothing if the event was already processed
            }
            this._mouseLeftClick(event);
            event.preventDefault();
        }, true);
    }

    _scoreUpdate()
    {
        document.getElementById('game-score').innerText = '' + ++this.score;
    }
}

let canvas = new Canvas(700, 400, 0);
let game = new Game(canvas.context);