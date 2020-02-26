class Game
{
    constructor()
    {
        this.timer = 0;
        this.gameRunning = false;
        this.gamePaused = false;
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


    _animate()
    {
        if (this.gamePaused)
        {
            return;
        }

        this._update();
        this._draw();
        requestAnimationFrame(() => this._animate());
    }

    _update()
    {
        this.timer++;
    }

    _draw()
    {
    }
}

