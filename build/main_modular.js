// Let's define all our global variables
const colors = {
    white:'#ffffff',
    black:'#000000',
    blue:'#0000ff',
    red:'#ff0000',
    darkPurple:'#120052',
    hotPink:'#ff2281'
}

class Vector2{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    getScaled(factorX, factorY){
        return new Vector2(this.x*factorX, this.y*factorY)
    }
    getScaledMono(factor){
        return new Vector2(this.x*factor, this.y*factor)
    }
    getAdd(vec = new Vector2()){
        return new Vector2(this.x + vec.x, this.y + vec.y)
    }
}

class Body{
    constructor(pos=Vector2(), size=Vector2(), color=colors.blue){
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.top = this.pos.y - this.size.y/2.0
        this.bottom = this.pos.y + this.size.y/2.0
        this.left = this.pos.x - this.size.x/2.0
        this.right = this.pos.x + this.size.x/2.0
    }

    refreshContents(){
        this.top = this.pos.y - this.size.y/2.0
        this.bottom = this.pos.y + this.size.y/2.0
        this.left = this.pos.x - this.size.x/2.0
        this.right = this.pos.x + this.size.x/2.0
    }
}

class RigidBodyRect extends Body{
    constructor(pos, size, color = colors.white){
        super(pos, size, color)
    }
    render(ct){ //Canvas context
        ct.fillStyle = this.color
        ct.beginPath();
        ct.fillRect(this.left,this.top,this.size.x,this.size.y);
        ct.closePath();
    }

    isThisBallColliding(ball){
        if (ball.right >= this.left && ball.left <= this.right &&
            ball.bottom >= this.top && ball.top <= this.bottom)
        {return true}
        return false
    }

    getBallPostCollisionVelocity(ball){
        let newVel = new Vector2(ball.vel.x, ball.vel.y)
        if (ball.pos.x < this.left) newVel.x = -Math.abs(newVel.x)
        if (ball.pos.x > this.right) newVel.x = Math.abs(newVel.x)

        if (ball.pos.y < this.top) newVel.y = -Math.abs(newVel.y)
        if (ball.pos.y > this.bottom) newVel.y = Math.abs(newVel.y)
        
        return newVel
    }
}

class Paddle extends RigidBodyRect{
    constructor(pos, size, color = colors.white){
        super(pos, size, color)
    }
}

class Brick extends RigidBodyRect{
    constructor(pos, size, color){
        super(pos, size, color)
        this.isAlive = true
    }
    render(ct){
        if (this.isAlive){
            super.render(ct)
        }
    }

    isThisBallColliding(ball){
        if (!this.isAlive) return false
        return super.isThisBallColliding(ball)
    }
}

class Ball extends Body{
    constructor(pos, radius, color, vel = new Vector2(0,0)){
        super(pos, new Vector2(radius, radius), color)
        this.radius = radius
        this.vel = vel
        this.color = color
    }
    render(ct){
        ct.fillStyle = this.color;
        ct.beginPath()
        ct.arc(
            this.pos.x, this.pos.y,
            this.radius, 0, Math.PI*2, false)
        ct.fill()
        ct.closePath()
    }

    setRandomInitialVelocity(mag = 2){
        let randAngle = 0.125 + 0.75*Math.random()*Math.PI
        this.vel = new Vector2(Math.cos(randAngle), -Math.sin(randAngle)
        ).getScaledMono(mag)
    }

    isTouchingBoundary(screen){
        if (this.left < screen.left || this.right > screen.right ||
            this.top < screen.top || this.bottom > screen.bottom) return true;
        return false
    }

    getBoundaryBounceVelocity(screen){
        let newVel = new Vector2(this.vel.x, this.vel.y)
        if (this.left <= screen.left) newVel.x = Math.abs(newVel.x)
        if (this.right >= screen.right) {newVel.x = -Math.abs(newVel.x)}

        if (this.top <= screen.top) {newVel.y = Math.abs(newVel.y)}
        if (this.bottom > screen.bottom) newVel.y = -Math.abs(newVel.y)
               
        return newVel
    }

    addFuzz(amount = 0.2){
        let angle = Math.atan2(this.vel.y, this.vel.x)
        let mag = Math.sqrt(this.vel.y*this.vel.y + this.vel.x*this.vel.x)
        angle = angle + amount*Math.random() - amount/2.0
        this.vel.x = mag*Math.cos(angle)
        this.vel.y = mag*Math.sin(angle)
        this.refreshContents()
    }
}

class BrickGrid{
    constructor(info = new Body(), rowcol = new Vector2(), gap = new Vector2(), defaultColor = colors.red){
        this.brickArray = []
        this.info = info
        this.rows = rowcol.x
        this.cols = rowcol.y
        this.gap = gap
        let singleSize = new Vector2(0,0)
        singleSize.x = (info.size.x - (this.cols - 1)*gap.x)/this.cols
        singleSize.y = (info.size.y - (this.rows - 1)*gap.y)/this.rows
    
        for (let i = 0; i < this.rows; ++i){
            let tempArray = []
            for (let j = 0; j < this.cols; ++j){
                let mypos = new Vector2(0,0)
                mypos.x = info.left + singleSize.x/2.0 + j*(singleSize.x + gap.x)
                mypos.y = info.top + singleSize.y/2.0 + i*(singleSize.y + gap.y)
                let mysize = singleSize.getScaledMono(1.0)
                let mybrick = new Brick(mypos, mysize, defaultColor)
                tempArray.push(mybrick)
            }
            this.brickArray.push(tempArray)
        }
    }

    render(ct){
        for (let i = 0; i < this.rows; ++i){
            for (let j = 0; j < this.cols; ++j){
                this.brickArray[i][j].render(ct)
            }
        }
    }
}

//some global variables we need to have
var globalMouseX = 0

function main(){
    //set up
    let canvas = document.getElementById("myCanvas")
    let ct = canvas.getContext("2d")

    let timeUnit = 1

    let canvasSize = new Vector2(1080, 720)
    canvas.width = canvasSize.x
    canvas.height = canvasSize.y
    
    let screen = new RigidBodyRect(
        canvasSize.getScaledMono(0.5),
        canvasSize, colors.darkPurple)

    let brickGridInfo = new Body(
        canvasSize.getScaled(0.5,0.25), //position
        canvasSize.getScaled(0.75, 0.25)) //size

    let brickGrid = new BrickGrid(
        brickGridInfo,
        new Vector2(4, 10), //rows, cols
        canvasSize.getScaledMono(0.005), //gap
        colors.white) 

    let player = new Paddle(
        canvasSize.getScaled(0.5, 0.9),
        canvasSize.getScaled(0.1, 0.02),
        colors.white
    )

    let ball = new Ball(
        canvasSize.getScaled(0.5, 0.7),
        canvasSize.x*0.015,
        colors.white
    )
    ball.setRandomInitialVelocity(2)//speed of the ball

    function update(){
        screen.render(ct)
        brickGrid.render(ct)

        
        
        player.render(ct)

        ball.render(ct)

        //variable updates for the next frame
        player.pos.x = globalMouseX;
        player.refreshContents();
        //moving the ball

        if (ball.isTouchingBoundary(screen)){
            ball.vel = ball.getBoundaryBounceVelocity(screen);
            ball.refreshContents();
        }

        for (let i = 0; i < brickGrid.rows; ++i){
            for (let j = 0; j < brickGrid.cols; ++j){
                if (brickGrid.brickArray[i][j].isThisBallColliding(ball)){
                    ball.vel = brickGrid.brickArray[i][j].getBallPostCollisionVelocity(ball)
                    ball.refreshContents();

                    //turn off the brick
                    brickGrid.brickArray[i][j].isAlive = false;
                }
            }
        }

        if (player.isThisBallColliding(ball)){
            ball.vel = player.getBallPostCollisionVelocity(ball)
            ball.addFuzz(amount = 0.3)
            ball.refreshContents();
        }


        ball.pos = ball.pos.getAdd(ball.vel.getScaledMono(timeUnit))
        ball.refreshContents()
    }

    setInterval(update, 1);
}

main()

// functions executed when a particular event happens
onmousemove = function(e){
    globalMouseX = e.clientX
};


