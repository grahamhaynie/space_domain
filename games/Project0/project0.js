// define rectangles as a list
var rectangles = [];

// define balls as a list, keep ballsize constant
var ballsize = 8;
var balls = [];

// count number stuck
var numStuck = 0;

//---------------------------------------------------
//---------------------------------------------------
// define ball object
var ball = function(){

    // if ball position is fixed (intersects with rectangle),
    // do not move it
    this.stuck = false;

    this.generate = function(){
        //define speed of ball
        this.speed = random(10, 50);

        // assign to one of the edges
        var edge = floor(random(0,4));
        if(edge === 0){ // top
            this.x = random(-width/2 + ballsize/2, width/2 - ballsize/2);
            this.y = -width/2 + ballsize/2;
        }else if(edge === 1){ // right 
            this.x = width/2-ballsize/2;
            this.y = random(-width/2 + ballsize/2, width/2 - ballsize/2);
        }else if(edge === 2){ // bottom
            this.x = random(-width/2 + ballsize/2, width/2 - ballsize/2);
            this.y = width/2 - ballsize/2;
        }else if(edge === 3){ // left 
            this.x = -width/2 + ballsize/2;
            this.y =  random(-width/2 + ballsize/2, width/2-ballsize/2);
        }
    }

    // draw the ball
    this.draw = function(){
        noStroke(); // turn off outlines
        fill(255, 255, 255); //white
        ellipse(this.x, this.y, ballsize, ballsize);
    };

    // update the ball
    this.update = function(){

        // test intersection with rectangles, if intersect
        // freeze balls
        for(var i = 0; i < rectangles.length; i++){
            if(rectangles[i].ballIntersect(this) && !this.stuck){
                this.stuck = true;
                numStuck++;
            }
        }
        // if ball is not stuck, update position
        if(this.stuck === false){
            // direct balls to 0 axis for x and y (center of canvas)
            //if at 0 for x and y, reset
            if(abs(this.x) - this.speed<= 0 && abs(this.y) - this.speed <= 0){
                this.generate();
            }else{
                // otherwise increment x and y according to speed
                if(this.x > 0){
                    this.x -= this.speed;
                }else{
                    // += before
                    this.x += this.speed;
                }
                if(this.y > 0){
                    this.y -= this.speed;
                }else{
                    // += before, also remove *inc
                    this.y += this.speed;
                }

            }
        }
    };
};

//---------------------------------------------------
//---------------------------------------------------
// define rectangle 
var rectangle = function(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // test if ball falls in area
    this.ballIntersect = function(ball){
        // get distance from ball's x to middle of rectangle
        var distX = abs(ball.x  - this.x - this.w/2);
        var distY = abs(ball.y - this.y - this.h/2);

        // if both distances are less than width, intersects
        if(distX  < this.w/2  && distY < this.h/2 ){
            return true;
        }else{
            return false;
        }
        
    };
};

//---------------------------------------------------
//---------------------------------------------------
// handle player clicking reset button by resetting animation state
mouseReleased = function(){
    if(numStuck === balls.length && mouseX > 160 + width/2 && mouseX < 280 + width/2 && 
        mouseY > 230 + height/2 && mouseY < 280 + height/2){
        numStuck = 0;
        balls = [];
        for (var i=0; i < 3000; i++) {
            balls.push(new ball());
            balls[i].generate();
        }
    }
};

//---------------------------------------------------
//---------------------------------------------------
function setup(){
    
    frameRate(30);
    
    var canvas = createCanvas(600, 600);
    canvas.parent('sketch-holder');

    // create rectangles to form name object
    // G
    rectangles.push(new rectangle(-150, -75, 125, 25));
    rectangles.push(new rectangle(-150, -50, 25, 125));
    rectangles.push(new rectangle(-150, 50, 125, 25));
    rectangles.push(new rectangle(-50, -10, 25, 60));
    rectangles.push(new rectangle(-75, -10, 25, 25));
    // H
    rectangles.push(new rectangle(25, -75, 25, 150));
    rectangles.push(new rectangle(125, -75, 25, 150));
    rectangles.push(new rectangle(50, -10, 100, 25));
    
    // create balls on four edges of canvas
    for (var i=0; i < 3000; i++) {
        balls.push(new ball());
        balls[i].generate();
    }
};

//---------------------------------------------------
//---------------------------------------------------
function draw(){
    // set (0, 0) to be the center of the screen
    translate(width/2, height/2);

    background(0, 0, 0); // black

    // draw the balls
    for (var i=0; i<balls.length; i++) {
        balls[i].draw();
        balls[i].update();
    }

    // draw reset buton
    if(numStuck === balls.length){
        fill(0, 0, 255);
        rect(160, 230, 120, 50, 20);
        fill(255, 255, 255);
        textSize(30);
        textAlign(CENTER);
        text('Reset', 220, 265);
    }
};
