class Game
{
    constructor()
    {
        this.gameRunning = false;
        this.gamePaused = false;
        this.timer = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.delay = 1000; // 1 second
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
            this.timer =  0;
            this.elapsedTime++;
            console.log(this.elapsedTime);
        }
    }

    _draw()
    {
    }
}

new Game().start();