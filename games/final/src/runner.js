/* Runner - 
 * An adversary that starts in a random position a predefined distance from the center of the map.
 * The runner will try to find path towards nearest base by going straight towards it until a 
 * wall is encountered. When a wall is encountered, it will strafe left/right depending on the 
 * location of the nearest base, until it can move towards the base again. Then, it will
 * move on for a set distance and then try to calculate a new path to the base. This action
 * is defined by a FSM. 
 */
var runner = function(){
    // spawn a certain distance from center
    var spawnAngle = random(0, 2*PI);
    this.position = new createVector(cos(spawnAngle)*1.5*game.maxX + game.maxX/2 - 20, sin(spawnAngle)*1.5*game.maxY + game.maxY/2 - 20);
    //this.position = new createVector(200, 800);
    
    this.size = 30;

    // keep state of runner, if applicable
    // 0 = running towards nearest base
    // 1 = calculate path to strafe towards nearest wall
    // 2 = running on strafe path
    // 3 = running through hole found on strafe path
    this.runState = 0;

    // start adversary with 100 health
    this.health = 100;

    // offset for drawing appropriate sprite
    this.spriteOffsetX = 0;
    this.spriteOffsetY = 0;
    
    // timer to animate running
    this.runTimer = 10;

    // every 30 frames, want to re-calculate nearest base in case becomes closer to another one
    this.nearestBaseTimer = 30;

    // timer for drawing defeat animation
    this.defeatTimer = 0;

    // ---------------------------------------------
    // ---------------------------------------------
    // get the nearest base, calculate velocity based on that
    this.getNearestBase = function(){
        // locate nearest base, attempt to move there
        this.nearestBase = -1;
        var nearestBaseDist = game.maxX*game.maxY;
        for(var i = 0; i < game.walls.length; i++){
            if(game.walls[i] instanceof base && game.walls[i].health > 0){
                var d = dist(game.walls[i].x, game.walls[i].y, this.position.x, this.position.y);
                if(d < nearestBaseDist){
                    nearestBaseDist = d;
                    this.nearestBase = i;
                }
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // set velocity to path going straight towards nearest base
    this.pathNearestBase = function(){
        if(this.nearestBase !== -1){
            var dx = this.position.x - game.walls[this.nearestBase].x + 20;
            var dy = this.position.y - game.walls[this.nearestBase].y + 20;
            
            this.velocity = new createVector(-dx, -dy);
            this.velocity.normalize();
            this.angle = this.velocity.heading() + HALF_PI;
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // check if adversary is hit by a laser, if so decrement health
    // and defeat laser that hit adversary
    this.checkLaser = function(){
        for(var i = 0; i < game.lasers.length; i++){
            if(abs(game.lasers[i].position.x - this.position.x) < this.size/2 && 
               abs(game.lasers[i].position.y - this.position.y) < this.size/2 && 
               !game.lasers[i].defeated){
                this.health-= 20;
                game.lasers[i].defeatTimer = 5;
                game.lasers[i].defeated = true;
            }
        }

        // check if health < 0, if so update sprite
        if(this.health <= 0){
            this.defeatTimer = 15;
            this.spriteOffsetY = 1;
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw adversary according to center x, y
    this.draw = function(cx, cy){
        push();
        // adjust to where center of screen is
        translate(width/2 + this.position.x - cx, height/2 + this.position.y - cy);
        rotate(this.angle);
        image(imageDict['runner'][this.spriteOffsetY][this.spriteOffsetX],-(this.size+10)/2, -(this.size+10)/2, this.size + 10, this.size + 10);
        pop();
        // update sprite depending on health
        if(this.health > 0){

            // update run animation if game active
            if(this.runTimer > 0 && game.state === 1 && game.menu.state === 4){
                this.runTimer--;
                if(this.runTimer === 0){
                    this.runTimer = 10;
                    if(this.spriteOffsetX === 0){
                        this.spriteOffsetX = 1;
                    }else{
                        this.spriteOffsetX = 0;
                    }
                }
            }
        }else{

            // update defeat sprite
            if(this.defeatTimer > 0 && game.state === 1 && game.menu.state === 4){
                this.defeatTimer--;
                if(this.defeatTimer % 5 === 0){
                    if(this.size - 10 >= 10){
                        this.size -= 10;
                    }
                    if(this.spriteOffsetX === 0){
                        this.spriteOffsetX = 1;
                    }else{
                        this.spriteOffsetX = 0;
                    }
                }
                // add collectible to game when defeated
                else if(this.defeatTimer === 1){
                    game.collectibles.push(new collectible(this.position.x, this.position.y));
                }
            }
        }
    };


    // ---------------------------------------------
    // ---------------------------------------------
    // handle the 0 state of runner - 
    // running along path and checking for collisions
    this.run0 = function(){
        // check for collision with walls
        for(var i = 0; i < game.walls.length; i++){
            // only check collisions with non-picked up blocks, and walls with health  > 0
            if(!game.walls[i].pickedUp && game.walls[i].health > 0 && (game.walls[i] instanceof wall || game.walls[i] instanceof turret || game.walls[i] instanceof lighningTurret)){
                if(game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.size)){
                    
                    // if hit wall with negative x velocity and wall x less, collideX
                    // or if hit wall with pos x velocity and x greater
                    if(abs(this.velocity.x) > abs(this.velocity.y)){
                        this.collideX = true;
                        this.runState = 1;
                        
                        this.position.x += - this.velocity.x;
                        this.position.y += - this.velocity.y;

                        this.vmag = this.velocity.mag();
                        this.velocity.x = 0;
                        this.velocity.y = 0;
                    }
                    // if collide y
                    if(abs(this.velocity.x) < abs(this.velocity.y)){
                        this.collideX = false;
                        this.runState = 1;

                        this.position.x += - this.velocity.x;
                        this.position.y += - this.velocity.y;

                        this.vmag = this.velocity.mag();
                        this.velocity.x = 0;
                        this.velocity.y = 0;
                    }
                }
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // handle the 1 state of runner - 
    // figuring out which direction to strafe
    this.run1 = function(){
        // figure out if x or y is farther
        var dx = abs(game.walls[this.nearestBase].x - this.position.x);
        var dy = abs(game.walls[this.nearestBase].y - this.position.y);

        // if x is closer, move towards the nearest hole
        if(!this.collideX){
            if(game.walls[this.nearestBase].x > this.position.x){
                this.velocity.x = this.vmag;
            }else{
                this.velocity.x = -this.vmag;
            }
            this.velocity.y = 0;
        }else{
            if(game.walls[this.nearestBase].y > this.position.y){
                this.velocity.y = this.vmag;
            }else{
                this.velocity.y = -this.vmag;
            }
            this.velocity.x = 0;
        }
         
         this.angle = this.velocity.heading() + HALF_PI;
         this.runState = 2;
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // handle the 2 state of runner - 
    // looking for a hole to run through while strafing
    this.run2 = function(){

        // if strafe and hit wall, go other direction
        for(var i = 0; i < game.walls.length; i++){
            // only check collisions with non-picked up blocks, and walls with health  > 0
            if(!game.walls[i].pickedUp && game.walls[i].health > 0 && (game.walls[i] instanceof wall || game.walls[i] instanceof turret || game.walls[i] instanceof lighningTurret)){
                // if collide x
                if(this.velocity.y === 0 && game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                    this.velocity.x *= -1;
                    this.position.x += this.velocity.x;
                    this.angle = this.velocity.heading() + HALF_PI;
                }
                // if collide y
                else if(this.velocity.x === 0 && game.walls[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                    this.velocity.y *= -1;
                    this.position.y += this.velocity.y;
                    this.angle = this.velocity.heading() + HALF_PI;
                }
            }
        }

        // if running along x
        if(this.velocity.y === 0){
            // if go past min or max x, re-calculate strafe path
            if(this.position.x >= game.maxX + 40){
                this.velocity.y = -this.velocity.x;
                this.velocity.x = 0;
                // flip if to above of base
                if(this.position.y < game.walls[this.nearestBase].y){
                    this.velocity.y *= -1;
                }
                this.angle = this.velocity.heading() + HALF_PI;
            }else if(this.position.x <= -20){
                this.velocity.y = this.velocity.x;
                this.velocity.x = 0;
                // flip if to left of base
                if(this.position.y < game.walls[this.nearestBase].y){
                    this.velocity.y *= -1;
                }
                this.angle = this.velocity.heading() + HALF_PI;
            }else{

                // check for collision with walls
                var wallPosition = -1; 

                // find wall at position
                for(var i = 0; i < game.walls.length; i++){
                    // only check collisions with non-picked up blocks, and walls with health  > 0
                    if(!game.walls[i].pickedUp && game.walls[i].health > 0 && (game.walls[i] instanceof wall || game.walls[i] instanceof turret || game.walls[i] instanceof lighningTurret)){
                        // if y less than that of base, check below
                        if(this.position.y < game.walls[this.nearestBase].y){
                            if(game.walls[i].collidesWith(this.position.x, this.position.y + 20, this.size)){
                                wallPosition = i;
                            }
                        }
                        // if y greater than that of base, check above
                        else{ 
                            if(game.walls[i].collidesWith(this.position.x, this.position.y - 20, this.size)){
                                wallPosition = i;
                            }
                        }
                    }
                }

                // if no wall at position examining, go that way
                if(wallPosition === -1 && this.position.x > 0 && this.position.x < game.maxX){
                    this.runState = 3;
                    this.runDist = 0;

                    // if x velocity positive, going right so y velocity positive, left vice versa
                    if(this.velocity.x > 0){
                        this.velocity.y = this.velocity.x;
                    }else{
                        this.velocity.y = -this.velocity.x;
                    }
                    // flip if y greater than that of base
                    if(this.position.y > game.walls[this.nearestBase].y){
                        this.velocity.y *= -1;
                    }
                    this.velocity.x = 0;
                    this.angle = this.velocity.heading() + HALF_PI;
                }
            }
            
        }
        // if running along y
        else{
            // if go past min or max x, re-calculate strafe path
            if(this.position.y >= game.maxY + 40){
                this.velocity.x = -this.velocity.y;
                this.velocity.y = 0;
                // flip if to left of base
                if(this.position.x < game.walls[this.nearestBase].x){
                    this.velocity.x *= -1;
                }    
                this.angle = this.velocity.heading() + HALF_PI;
            }else if(this.position.y <= -20){
                this.velocity.x = this.velocity.y;
                this.velocity.y = 0;
                // flip if to left of base
                if(this.position.x < game.walls[this.nearestBase].x){
                    this.velocity.x *= -1;
                }
                this.angle = this.velocity.heading() + HALF_PI;
            }else{

                // check for collision with walls
                var wallPosition = -1; 

                // find wall at position
                for(var i = 0; i < game.walls.length; i++){
                    // only check collisions with non-picked up blocks, and walls with health  > 0
                    if(!game.walls[i].pickedUp && game.walls[i].health > 0 && (game.walls[i] instanceof wall || game.walls[i] instanceof turret || game.walls[i] instanceof lighningTurret)){
                        // if x less than that of base, check right
                        if(this.position.x < game.walls[this.nearestBase].x){
                            if(game.walls[i].collidesWith(this.position.x + 20, this.position.y, this.size)){
                                wallPosition = i;
                            }
                        }
                        // if x greater than that of base, check left
                        else{ 
                            if(game.walls[i].collidesWith(this.position.x - 20, this.position.y, this.size)){
                                wallPosition = i;
                            }
                        }
                    }
                }

                // if no wall at position examining, go that way
                if(wallPosition === -1 && this.position.y > 0 && this.position.y < game.maxY){
                    this.runState = 3;
                    this.runDist = 0;

                    // if y velocity positive, going right so y velocity positive, left vice versa
                    if(this.velocity.y > 0){
                        this.velocity.x = this.velocity.y;
                    }else{
                        this.velocity.x = -this.velocity.y;
                    }
                    // flip if x greater than that of base
                    if(this.position.x > game.walls[this.nearestBase].x){
                        this.velocity.x *= -1;
                    }
                    this.velocity.y = 0;
                    this.angle = this.velocity.heading() + HALF_PI;
                }
            }
            
        }
        
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // handle the 3 state of runner - 
    // running along path found while strafing
    this.run3 = function(){
        // check for collision with walls
        for(var i = 0; i < game.walls.length; i++){
            // only check collisions with non-picked up blocks, and walls with health  > 0
            if(!game.walls[i].pickedUp && game.walls[i].health > 0 && (game.walls[i] instanceof wall || game.walls[i] instanceof turret || game.walls[i] instanceof lighningTurret)){
                if(game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.size)){
                    // if collide, go back to 0 state but make sure not getting stuck in wall
                    
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    this.angle = this.velocity.heading() + HALF_PI;

                    this.runState = 0;
                    this.pathNearestBase();
                }
            }
        }
        
        // if run 80 pixels, want to change state to finding path straight towards center
        this.runDist += abs(this.velocity.mag());
        if(this.runDist >= 80){
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.runState = 0;
            this.pathNearestBase();

        }
        
    };
    

    // ---------------------------------------------
    // ---------------------------------------------
    // perform running action
    this.run = function(){

        // if running straight towards base and hit a wall, calculate strafe path
        if(this.runState === 0){
            this.run0();
        }
        // calculate strafe path
        else if(this.runState === 1){
            this.run1();
        }
        // if running along strafe path and hole in wall, go that way
        else if(this.runState === 2){
            this.run2();
        }
        // found path while strafing, go that way for a short distance then re-calculate 
        else if(this.runState === 3){
            this.run3(); 
        }

    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update adversary's state
    this.update = function(){

        // check collision with lasers
        this.checkLaser();

        this.run();

        // finally add velocity
        this.position.add(this.velocity);

        // re-check where nearest base is
        if(this.nearestBaseTimer > 0){
            this.nearestBaseTimer--;

            if(this.nearestBaseTimer === 0){
                this.getNearestBase();
                if(this.runState === 0){
                    this.pathNearestBase();
                }
                this.nearestBaseTimer = 30;
            }
        }

    };

    // ---------------------------------------------
    // ---------------------------------------------
    // check if adversary has collided with base
    this.collideBase = function(){
        for(var i = 0; i < game.walls.length; i++){
            if(game.walls[i] instanceof base  && game.walls[i].health > 0 && game.walls[i].collidesWith(this.position.x, this.position.y, this.size)){
                // also damage the base 
                game.walls[i].health-= 10;
                // check that base is not defeated
                game.walls[i].update();
                return true;
            }
        }
        return false;
    };

    // ---------------------------------------------
    // ---------------------------------------------    
    // check collision of something with an x, y with adversary
    // return true if the otherX, otherY collide with this adversary,
    // otherwise return false
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.position.x) < this.size/2 + otherSize/2 && abs(otherY - this.position.y) < this.size/2 + otherSize/2){
            return true;
        }else {
            return false;
        }
    };

};