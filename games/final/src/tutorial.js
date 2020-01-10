/* Tutorial -  
 * The tutorial is its own class, since it behaves differently than the
 * generic levels. The tutorial behaves by performing a set of stages, where
 * for each stage a different action happens. It behaves similarly to
 * the generic level, but is not quite the same.
 */
var tutorial = function(){
    // load data according to json object 
    this.name = 'Tutorial';
    this.difficulty = 0;
    this.tilemap = 
        ["wwwwwwwwwwwwwww",
         "w             w",
         "w p           w",
         "w             w",
         "w             w",
         "w   t  b  t   w",
         "w             w",
         "w      w      w",
         "w             w",
         "w             w",
         "w   t  b  t   w",
         "w             w",
         "w             w",
         "w             w",
         "wwwwwwwwwwwwwww"];
    
    // waves for the game
    this.waves = [];
    this.waves.push(new wave("Wave 1" , 2, 0));
    this.waves.push(new wave("Wave 2" , 2, 2));
    this.waves.push(new wave("Final Wave" , 2, 4));
    this.waveIndex = 0;
    // state of wave
    // 0 = launching
    // 1 = wave active
    // 2 = wave over, all enemies defeated
    this.waveState = 0;

    // state of displaying help text
    // 0 = coming up from bottom
    // 1 = writing text
    // 2 = displaying text
    // 3 = going back down
    this.helpTextState = 0;
    // timer to time between help states
    this.helpTextTimer = 60;

    // stage number of tutorial
    this.state = 0;
    this.finalState = 20;
    
    // track when to count adversaries to signal game end again
    this.countTimer = 0;

    // track when to draw wave name
    this.waveNameTimer = 0;

    // a timer to track transition between states
    this.stateTransitionTimer = 60;

    // ---------------------------------------------
    // ---------------------------------------------
    // call the reload function to reset the state of the level
    this.reload = function(){
        this.state = 0;
        this.helpTextState = 0;
        this.helpTextTimer = 60;
        this.countTimer = 0;
        this.waveNameTimer = 0;
        this.waveIndex = 0;
        this.stateTransitionTimer = 60;
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw the name of the wave announcing, with transparency 
    // according to timer
    this.drawWaveName = function(){
        push();
        translate(width/2, height/4);
        textFont(qfont);
        textSize(30);
        textAlign(CENTER);
        fill(255, 255, 255, (this.waveNameTimer/150)*255);
        stroke(0, 0, 0, (this.waveNameTimer/150)*255);
        text(this.waves[this.waveIndex].name, 0, 0);
        pop();
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw some text to display to player
    this.drawHelpText = function(){
        textFont(tfont);
        textSize(25);
        textAlign(LEFT);
        fill(0, 0, 0, 230);
        stroke(255, 255, 255);
        if(this.helpTextState === 0){
            rect(0, height, width, -height/6 + (this.helpTextTimer/60)*height/6);
        }else if(this.helpTextState === 1 || this.helpTextState === 2){
            rect(0, height, width, -height/6);
            fill(20, 201, 35, 200);
            stroke(0, 0, 0, 200);
            text(this.helpText.substring(0, this.charsDisplayed), 20, 5*(height/6) + 30);
        
        }else if(this.helpTextState === 4){
            rect(0, height, width, -(this.helpTextTimer/60)*height/6);
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw the name of the wave announcing, with transparency 
    // according to timer
    this.drawWaveName = function(){
        push();
        translate(width/2, height/4);
        textFont(qfont);
        textSize(30);
        textAlign(CENTER);
        fill(255, 255, 255, (this.waveNameTimer/150)*255);
        stroke(0, 0, 0, (this.waveNameTimer/150)*255);
        text(this.waves[this.waveIndex].name, 0, 0);
        pop();
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // handle drawing the console 
    this.drawConsole = function(){
        
        if(this.helpTextTimer > 0){
            this.drawHelpText();
            this.helpTextTimer--;
            if(this.helpTextTimer === 0){
                if(this.helpTextState === 0){
                    this.helpTextTimer = 3;
                    this.helpTextState = 1;

                    // want to display characters one at a time
                    this.charsDisplayed = 0;
                }
                else if(this.helpTextState === 1){
                    // only move to next state if drawn all of characters
                    if(this.charsDisplayed >= this.helpText.length){    
                        this.helpTextTimer = this.helpText.length*4;
                        this.helpTextState = 2;
                    }else{
                        this.charsDisplayed++;
                        this.helpTextTimer = 1;
                    }
                }else if(this.helpTextState === 2){
                    if(this.condition){
                        this.helpTextTimer = this.helpText.length;
                        this.charsDisplayed = 0;
                        this.helpTextState = 1;
                        this.stateTransitionTimer = 10;
                    }else{
                        this.helpTextTimer = 1;
                    }
                }else if(this.helpTextState === 3){
                    this.stateTransitionTimer = this.helpText.length;
                }
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // perform stage where showing player help text
    this.helpTextStage = function(){
        if(this.helpTextTimer > 0){
            this.drawHelpText();
            this.helpTextTimer--;
            if(this.helpTextTimer === 0){
                if(this.helpTextState === 0){
                    this.helpTextTimer = 3;
                    this.helpTextState = 1;

                    // want to display characters one at a time
                    this.charsDisplayed = 0;
                }
                else if(this.helpTextState === 1){
                    // only move to next state if drawn all of characters
                    if(this.charsDisplayed >= this.helpText.length){    
                        this.helpTextTimer = this.helpText.length*4;
                        this.helpTextState = 2;
                    }else{
                        this.charsDisplayed++;
                        this.helpTextTimer = 1;
                    }
                }else if(this.helpTextState === 2){
                    // keep console tab up, but go to next stage and wipe it
                    this.helpTextTimer = this.helpText.length;
                    this.charsDisplayed = 0;
                    this.helpTextState = 1;
                    this.state++;
            
                }else if(this.helpTextState === 3){
                    this.stateTransitionTimer = this.helpText.length;
                }
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // perform adversary wave 
    this.waveStage = function(){
        this.helpTextState = 4;

        // draw console as coming back down
        if(this.helpTextTimer > 0){
            this.helpTextTimer--;
        }
        this.drawHelpText();

        // 0 = launching
        if(this.waveState === 0){

            game.adversaries = [];
            // add adversaries
            for(var i = 0; i < this.waves[this.waveIndex].numTunnelers + this.waves[this.waveIndex].numRunners; i++){
                // add tunnelers first
                if(i < this.waves[this.waveIndex].numTunnelers){
                    game.adversaries.push(new tunneler());
                }
                // then add runners
                else{
                    game.adversaries.push(new runner());
                }
                game.adversaries[i].getNearestBase();
                game.adversaries[i].pathNearestBase();
            }
            this.waveState = 1;
            this.countTimer = 30;
            this.waveNameTimer = 200;
        }
        // 1 = wave active
        else if(this.waveState === 1){
            // decrement timer
            if(this.waveNameTimer > 0){
                this.waveNameTimer--;
            }

            // count number of adversaries that are defeated, but only count every
            // 30 frames so not to waste computation
            if(this.countTimer > 0 && this.waveNameTimer === 0){
                this.countTimer--;
                if(this.countTimer === 0){
                    // count number of adversaries
                    var numDefeated = 0;
                    for(var i = 0; i < game.adversaries.length; i++){
                        if(game.adversaries[i].health <= 0){
                            numDefeated++;
                        }
                    }
                    if(numDefeated == game.adversaries.length){
                        this.waveState = 2;
                        this.waveIndex++;
                        this.stateTransitionTimer = 60;
                    }else{
                        this.countTimer = 30;
                    }
                }
            }
        }
        // 2 = wave over, all enemies defeated
        else if(this.waveState === 2){
            if(this.stateTransitionTimer > 0){
                this.stateTransitionTimer--;
                if(this.stateTransitionTimer === 0){
                    this.state++;
                    this.waveState = 0;

                    // want console to come back up
                    this.helpTextState = 0;
                    this.helpTextTimer = 60;
                }
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // perform stage 0 - setup 
    this.stage0 = function(){
        if(this.stateTransitionTimer > 0){
            this.stateTransitionTimer--;
            if(this.stateTransitionTimer === 0){
                this.state++;
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // for this stage, tell player to move specific block, once they move it
    // go to next stage
    this.stage5 = function(){
        this.helpText = "Pick up the block highlighted in red and move\nit to a new position.";
        
        // highlight block in middle 
        game.walls[31].showRedBorder = true; 
        this.condition = (game.walls[31].x !== this.prevX || game.walls[31].y != this.prevY);
        this.drawConsole();
        if(this.stateTransitionTimer > 0){
            this.stateTransitionTimer--;
            if(this.stateTransitionTimer === 0){
                this.state++;
                game.walls[31].showRedBorder = false; 
                this.helpTextTimer = 1;
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // for this stage, show player where turrets are
    this.stage6 = function(){
        // highlight turrets - 24, 26, 38, 40
        game.walls[24].showRedBorder = true; 
        game.walls[26].showRedBorder = true; 
        game.walls[38].showRedBorder = true;
        game.walls[40].showRedBorder = true;
        
        this.helpText = "The turret blocks, highlighted in red, will shoot\nenemies in their range.";
        this.helpTextStage();

        // track previous turret positions
        this.turretPrevX = [game.walls[24].x, game.walls[26].x, game.walls[38].x, game.walls[40].x];
        this.turretPrevY = [game.walls[24].y, game.walls[26].y, game.walls[38].y, game.walls[40].y];
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // for this stage, make player pick up base and move it
    this.stage7 = function(){
        this.helpText = "Move one of the highlighted turrets. Note the\ngreen circle showing its range when placing it.";
        
        // move to next stage once player has moved a turret
        this.condition = (
            !this.turretPrevX.includes(game.walls[24].x) || !this.turretPrevY.includes(game.walls[24].y) || 
            !this.turretPrevX.includes(game.walls[26].x) || !this.turretPrevY.includes(game.walls[26].y) ||
            !this.turretPrevX.includes(game.walls[38].x) || !this.turretPrevY.includes(game.walls[38].y) ||
            !this.turretPrevX.includes(game.walls[40].x) || !this.turretPrevY.includes(game.walls[40].y)
        );
        this.drawConsole();
        if(this.stateTransitionTimer > 0){
            this.stateTransitionTimer--;
            if(this.stateTransitionTimer === 0){
                this.state++;
                // turn off highlights
                game.walls[24].showRedBorder = false; 
                game.walls[26].showRedBorder = false; 
                game.walls[38].showRedBorder = false;
                game.walls[40].showRedBorder = false;
                this.helpTextTimer = 1;
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // for this stage, show player where base is
    this.stage8 = function(){
        this.helpText = "Your goal is to protect the bases, highlighed in red,\nwhose health is shown by the green bar on them.";
        this.helpTextStage();

        // highlight bases
        for(var i = 0; i < game.walls.length; i++){
            if(game.walls[i] instanceof base){
                game.walls[i].showRedBorder = true;
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // for this stage, de-highlight bases
    this.stage9 = function(){
        this.helpText = "Move the turrets and wall blocks to protect the\nbases. If the bases are destroyed, you lose.";
        this.helpTextStage();

        // de-highlight bases
        for(var i = 0; i < game.walls.length; i++){
            if(game.walls[i] instanceof base){
                game.walls[i].showRedBorder = false;
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // manage this level's state using timers 
    this.play = function(){
       // use this state to transition to state 1
        if(this.state === 0){
            this.stage0();
        }else if(this.state === 1){
            this.helpText = "Get used to moving around with the arrow keys\nand using space to shoot.";
            this.helpTextStage();
        }else if(this.state === 2){
            this.helpText = "To pause the game or return to the menu, click the\n'x' button in the upper left corner.";
            this.helpTextStage();
        }else if(this.state === 3){
            this.helpText = "To pick up a block, stand facing it and press shift\nto pick it up if it has a green highlight.";
            this.helpTextStage();
        }else if(this.state === 4){
            this.helpText = "To place a block in your hands, press shift when the\ngreen rectangle appears in the spot placing.";
            this.helpTextStage();
            this.prevX = game.walls[31].x;
            this.prevY = game.walls[31].y;
        }else if(this.state === 5){
            this.stage5();
        }else if(this.state === 6){
            this.stage6();
        }else if(this.state === 7){
            this.stage7();
        }else if(this.state === 8){
            this.stage8();
        }else if(this.state === 9){
            this.stage9();
        }else if(this.state === 10){
            this.helpText = "Enemies will come from outside the walls to attack\nthe bases. They drop collectibles to heal the bases.";
            this.helpTextStage();
        }else if(this.state === 11){
            this.helpText = "Green enemies will break blocks to get to the\nbases. Here come some now!";
            this.helpTextStage();
        }else if(this.state === 12){
            this.waveStage();
        }else if(this.state === 13){
            this.helpText = "Nice work. Collect the crystals dropped by the\nenemies to heal your bases.";
            this.helpTextStage();
        }else if(this.state === 14){
            this.helpText = "Red enemies will run through the holes made by the\ngreen enemies. Here, try it out.";
            this.helpTextStage();
        }else if(this.state === 15){
            this.waveStage();
        }else if(this.state === 16){
            this.helpText = "As you may have noticed, green enemies will damage\nthe wall blocks and turrets.";
            this.helpTextStage();
        }else if(this.state === 17){
            this.helpText = "Here comes one last wave of enemis. Don't let the\nbases get destroyed!";
            this.helpTextStage();
        }else if(this.state === 18){
            this.waveStage();
        }else if(this.state === 19){
            this.helpText = "Great job! Now you are ready for the harder levels.\n";
            this.helpTextStage();
        }


    }
};