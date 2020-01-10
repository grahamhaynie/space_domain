/* GameObject - 
 * this is an object to hold the 
 * state of the game for this specific instance of the game
 */
var gameObject = function(){

    // ---------------------------------------------
    // ---------------------------------------------
    // create a setup that can be called to initialized game
    this.setup = function(){
        
        // keep track of game's state
        // 0 = menu
        // 1 = game
        this.state = 0;

        // menu item, menu has a state
        this.menu = new menuObject();

        // list to contain the walls, and all things
        // with wall behavior
        this.walls = [];

        // keep track of keys currently pressed
        this.keyArray = [];

        // keep track of levels
        this.levels = [];

        // holds lasers for player
        this.lasers = [];

        // list to hold adversaries
        this.adversaries = [];

        // list to hold collectibles
        this.collectibles = [];

        // list to hold boots to draw
        this.boots = [];
        this.numBoots = 0;
        // draw boots every 10 paces, make them dissapear when timer is 0
        this.bootDist = 0;
        this.bootTimer = 120;
        this.bootSwitch = 1;

        // need an offset to draw menu 
        this.backgroundOffset = new createVector(-50, -50);
        this.menuDirection = new createVector(0.2, 0.3);

    };

    // ---------------------------------------------
    // ---------------------------------------------
    // reload game's state, in case player loses a level and 
    // wants to try again
    this.reload = function(){
        this.state = 1;
        this.walls = [];
        this.lasers = [];
        this.adversaries = [];
        this.boots = [];
        this.numBoots = 0;
        this.bootDist = 0;
        this.bootTimer = 30;
        this.bootSwitch = 1;
        this.collectibles = [];

        this.backgroundOffset = new createVector(-50, -50);
        this.menuDirection = new createVector(0.2, 0.3);
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw the game in its current state
    this.draw = function(){

        // menu
        if(this.state === 0){
            // draw mars floor background
            image(imageDict['background'][0], this.backgroundOffset.x, this.backgroundOffset.y, 700, 700);
            this.menu.draw();
        }

        // gameplay
        else if(this.state === 1){
            // draw mars floor by stiching together images
            for(var x = 0; x < this.maxX + imageDict['background'][0].width; x+= imageDict['background'][0].width){
                for(var y = 0; y < this.maxY + imageDict['background'][0].height; y+= imageDict['background'][0].height){
                    image(imageDict['background'][0], this.backgroundOffset.x + x, this.backgroundOffset.y + y, 700, 700);
                }
            }

            // draw player boot prints if in frame
            for(var i = 0; i < this.numBoots; i++){
                if(this.boots[i].x >= this.centerX - width/2 - this.boots[i].size &&
                    this.boots[i].x <= this.centerX + width/2 + this.boots[i].size &&
                    this.boots[i].y >= this.centerY - width/2 - this.boots[i].size && 
                    this.boots[i].y <= this.centerY + width/2 + this.boots[i].size){
                        this.boots[i].draw(this.centerX, this.centerY);
                }
            }

            // only draw walls that are in current frame, not picked up, and still of health > 0
            for(var i = 0; i < this.walls.length; i++){
                if(this.walls[i].x >= this.centerX - width/2 - this.walls[i].size &&
                    this.walls[i].x <= this.centerX + width/2 + this.walls[i].size &&
                    this.walls[i].y >= this.centerY - width/2 - this.walls[i].size && 
                    this.walls[i].y <= this.centerY + width/2 + this.walls[i].size &&
                    !this.walls[i].pickedUp && this.walls[i].health > 0){
                        this.walls[i].draw(this.centerX, this.centerY);
                }
            }

            // draw collectibles in current frame 
            for(var i = 0; i < this.collectibles.length; i++){
                if(this.collectibles[i].position.x >= this.centerX - width/2 - this.collectibles[i].size &&
                    this.collectibles[i].position.x <= this.centerX + width/2 + this.collectibles[i].size &&
                    this.collectibles[i].position.y >= this.centerY - width/2 - this.collectibles[i].size && 
                    this.collectibles[i].position.y <= this.centerY + width/2 + this.collectibles[i].size){
                        this.collectibles[i].draw(this.centerX, this.centerY);
                }
            }
            // draw adversaries that are in current frame and health > 0 or drawing defeat animation
            for(var i = 0; i < this.adversaries.length; i++){
                if(this.adversaries[i].position.x >= this.centerX - width/2 - this.adversaries[i].size &&
                    this.adversaries[i].position.x <= this.centerX + width/2 + this.adversaries[i].size &&
                    this.adversaries[i].position.y >= this.centerY - width/2 - this.adversaries[i].size && 
                    this.adversaries[i].position.y <= this.centerY + width/2 + this.adversaries[i].size &&
                    (this.adversaries[i].health > 0 || this.adversaries[i].defeatTimer > 0)){
                        this.adversaries[i].draw(this.centerX, this.centerY);
                }
            }

            // player
            this.player.draw();
            
            // draw player's lasers
            for(var i = 0; i < this.lasers.length; i++){
                // check if laser in frame
                if(this.lasers[i].position.x >= this.centerX - width/2 - 20 &&
                    this.lasers[i].position.x <= this.centerX + width/2 + 20 &&
                    this.lasers[i].position.y >= this.centerY - width/2 - 20 && 
                    this.lasers[i].position.y <= this.centerY + width/2 + 20){
                    this.lasers[i].draw(this.centerX, this.centerY);
                }
            }

            // draw zap lines for lightning turret
            for(var i = 0; i < this.walls.length; i++){
                if(this.walls[i] instanceof lighningTurret && this.walls[i].health > 0){
                    // draw zaplines if timer > 0
                    if(this.walls[i].zapTimer > 0){
                        for(var z = 0; z < this.walls[i].zaplines.length; z++){
                            this.walls[i].zaplines[z].draw(this.centerX, this.centerY);
                        }
                    }
                }
            }

            // draw level's next wave title, if applicable
            if(((this.level instanceof level && this.level.state === 1) || 
                (this.level instanceof tutorial && this.level.waveState === 1 ) || 
                (this.level instanceof level && this.level.state === 4))   
                && this.level.waveNameTimer > 0){
                this.level.drawWaveName();
            } 

            // draw menu box or menu during gameplay
            this.menu.draw();

            // check frameRate 
            /*if(frameRate() < 30){
                console.log('WARNING: less than 30 fps');
            }*/
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // heal the bases by 5 points when a collectible is collected
    this.healBases = function(){
        for(var i = 0; i < this.walls.length; i++){
            if(this.walls[i] instanceof base){
                // don't overheal an ddon't heal if base destroyed
                if(this.walls[i].health > 0 && this.walls[i].health + 2 <= this.walls[i].maxHealth){
                    this.walls[i].health += 2;
                }
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update game's state
    this.update = function(){
        if(this.state === 0){
            // update menu offset
            this.backgroundOffset.add(this.menuDirection);
            if(this.backgroundOffset.x > 0 || this.backgroundOffset.x < -100){
                this.menuDirection.x *= -1;
                this.backgroundOffset.add(this.menuDirection);
            }
            if(this.backgroundOffset.y > 0 || this.backgroundOffset.y < -100){
                this.menuDirection.y *= -1;
                this.backgroundOffset.add(this.menuDirection);
            }

        }
        // update game state, but only if menu is not in paused during game state
        else if(this.state === 1 && this.menu.state === 4){
            // enforce that center of scren is player's x,y coordinates
            this.player.update();
            this.centerX = this.player.position.x;
            this.centerY = this.player.position.y;

            // update player's lasers
            for(var i = 0; i < this.lasers.length; i++){
                
                this.lasers[i].update();

                if(this.lasers[i].defeated && this.lasers[i].defeatTimer === 0){
                    this.lasers.splice(i, 1);
                }else if(!this.lasers[i].defeated){
                    // if laser hit a wall or out of screen, mark destruction animation
                    if(this.lasers[i].hitWall() || this.lasers[i].outOfScreen()){
                        this.lasers[i].defeatTimer = 5;
                        this.lasers[i].defeated = true;
                    }
                }
            
            }

            // update adversaries, only ones with health > 0 
            for(var i = 0; i < this.adversaries.length; i++){
                if(this.adversaries[i].health > 0){
                    this.adversaries[i].update();
                    // if adversary collides with base, decrease their health to 0
                    if(this.adversaries[i].collideBase()){
                        this.adversaries[i].health = 0;
                    }
                }
            }

            // update boots by adding a new one every 100 pixels traveled
            if(this.bootDist > 40){
                this.bootDist = 0;
                if(this.numBoots >= 5){
                    // splice from boots list
                    this.boots.splice(this.numBoots - 1, 1);
                    this.numBoots--;
                    this.bootTimer = 30;
                }

                if(this.numBoots < 5){
                    // push boot to beginning with player's position
                    this.boots.unshift(new boot(this.player.position.x, this.player.position.y, this.bootSwitch, this.player.angle));
                    this.bootSwitch *= -1;
                    this.numBoots++;
                }
            }
            else{
                this.bootDist += this.player.velocity.mag();
            }

            // also remove boots when timer expires
            if(this.bootTimer > 0){
                this.bootTimer--;
                if(this.bootTimer === 0){
                    // splice from boots list if possible
                    if(this.boots.length > 0){
                        this.boots.splice(this.numBoots - 1, 1);
                        this.numBoots--;
                    }
                    this.bootTimer = 30;
                }
            }

            // update collectibles
            for(var i = 0; i < this.collectibles.length; i++){
                this.collectibles[i].update(this.player.position.x, this.player.position.y);
                // if collectible collected, remove it from list and heal base
                if(this.collectibles[i].collidesWith(this.player.position.x, this.player.position.y, this.player.size)){
                    this.collectibles.splice(i, 1);
                    this.healBases();
                }
            }

            // update walls 
            for(var i = 0; i < this.walls.length; i++){
                // only update if a health > 0
                if(this.walls[i].health > 0){
                    this.walls[i].update();
                }
            }

            // update offset for drawing background
            this.backgroundOffset.x = -(this.centerX % imageDict['background'][0].width);
            this.backgroundOffset.y = -(this.centerY % imageDict['background'][0].height);

            // update level
            this.level.play();

            // check if all waves have been completed
            if((this.level instanceof tutorial && this.level.state == this.level.finalState) 
               ||(this.level instanceof level && this.level.state === 5)){
                this.menu.state = 6;
                this.menu.won = true;
            }
        
            // check if player has lost 
            if(this.numberBases === 0){
                this.menu.state = 6;
                this.menu.won = false;
                game.level.state = 3;
            }
        }

        // always want to update hover of menu
        this.menu.updateHover();
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // convert tilemap into objects for game object
    this.readTileMap = function(){

        // track number of bases
        this.numberBases = 0;

        // x and y are flipped for this loop because when
        // iterating, each line of the tilemap is the y
        // and each character of that line is the x
        for(var y = 0; y < this.level.tilemap.length; y++){
            // store maximum y value
            this.maxY = (this.level.tilemap.length-1)*40 + 20;

            for(var x = 0; x < this.level.tilemap[y].length; x++){
                // store maximum x value
                this.maxX = (this.level.tilemap[y].length-1)*40 + 20;

                // if encounter a wall, add to walls list
                if(this.level.tilemap[y][x] === "w"){
                    this.walls.push(new wall(x*40 + 20, y*40 + 20));
                }   
                // add base to walls list, since behaves like a wall
                else if(this.level.tilemap[y][x] === "b"){
                    this.walls.push(new base(x*40 + 20, y*40 + 20));
                    this.numberBases++;
                }
                // add turret to walls list, since also behaves like wall
                else if(this.level.tilemap[y][x] === "t"){
                    this.walls.push(new turret(x*40 + 20, y*40 + 20));
                }
                // add lightning turret to walls list, since also behaves like wall
                else if(this.level.tilemap[y][x] === "l"){
                    this.walls.push(new lighningTurret(x*40 + 20, y*40 + 20));
                }
                // player
                else if(this.level.tilemap[y][x] === "p"){
                    this.player = new player(x*40 + 20, y*40 + 20);
                    this.centerX = this.player.position.x;
                    this.centerY = this.player.position.y;
                }                           
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // load level at given index
    this.loadLevel = function(index){
        // load tutorial differently
        if(index === 0){
            this.level = new tutorial();
        }else{ 
            this.level = new level(levels[index - 1]);
        }
        this.curLevelIndex = index;
        this.readTileMap();
        this.state = 1;
    };

};