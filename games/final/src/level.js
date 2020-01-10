/* level object - 
 * create a level by passing in unique information about level
 */
var level = function(jsonObj){
    // load data according to json object 
    this.name = jsonObj.name;
    this.difficulty = jsonObj.difficulty;
    this.tilemap = jsonObj.tilemap;
    
    // waves for the game
    this.waves = [];
    this.waveIndex = 0;
    // push waves with types of adversaries in order: tunnelers, runners
    for(var i = 0; i < jsonObj.waves.length; i++){
        this.waves.push(new wave(jsonObj.waves[i][0], jsonObj.waves[i][1], jsonObj.waves[i][2]));
    }

    // tooltips to give the player information
    this.helpTexts = [];
    this.helpTextIndex = 0;
    // push helptexts
    for(var i = 0; i < jsonObj.helpTexts.length; i++){
        this.helpTexts.push(jsonObj.helpTexts[i]);
    }

    // a list of actions to take, where
    // w = wave
    // t = text
    this.actions = jsonObj.actions;
    this.actionIndex = 0;

    // state of displaying help text
    // 0 = coming up from bottom
    // 1 = writing text
    // 2 = displaying text
    // 3 = going back down
    this.helpTextState = 0;
    // timer to time between help states
    this.helpTextTimer = 60;

    // state of tutorial
    // 0 = launching wave
    // 1 = waiting for wave to end
    // 2 = waiting between waves
    // 3 = displaying help text
    // 4 = prep stage
    // 5 = game over
    this.state = 0;
    
    // track when to count adversaries to signal game end again
    this.countTimer = 0;

    // track when to draw wave name
    this.waveNameTimer = 0;

    // a timer to track transition between states
    this.stateTransitionTimer = 60;

    // starting state depend on actions
    if(this.actions[0] === 't'){
        this.state = 3;
    }else if(this.actions[0] == 'p'){
        this.state = 4;
        this.waveNameTimer = 150;
        this.prepTimer = 1200;
    }

    // ---------------------------------------------
    // ---------------------------------------------
    // call the reload function to reset the state of the level
    this.reload = function(){
        this.state = 0;
        this.helpTextState = 0;
        this.helpTextIndex = 0;
        this.helpTextTimer = 60;
        this.countTimer = 0;
        this.waveNameTimer = 0;
        this.waveIndex = 0;
        this.stateTransitionTimer = 60;
        this.actionIndex = 0;

        // starting state depend on actions
        if(this.actions[0] === 't'){
            this.state = 3;
        }else if(this.actions[0] == 'p'){
            this.state = 4;
            this.waveNameTimer = 150;
            this.prepTimer = 1200;
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
        if(this.state === 4){
            text('Build Phase', 0, -width/6);

            // draw timer line showing when build phase over
            fill(20, 201, 35);
            rect(-width/6, -height/6 + 10, (this.prepTimer/1200) * 200, 10);

        }else{
            text(this.waves[this.waveIndex].name, 0, -height/6);
        }
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
            text(this.helpTexts[this.helpTextIndex].substring(0, this.charsDisplayed), 20, 5*(height/6) + 30);
        
        }else if(this.helpTextState === 3){
            rect(0, height, width, -(this.helpTextTimer/60)*height/6);
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // determine next state depending on the next action
    this.nextAction = function(){
        this.actionIndex++;
        // determine next action
        if(this.actionIndex < this.actions.length){
            // setup for wave state
            if(this.actions[this.actionIndex] === 'w'){
                this.state = 0;
            }
            // setup for text state
            else if(this.actions[this.actionIndex] === 't'){
                this.state = 3;
                this.helpTextState = 0;
                this.helpTextTimer = 60;
            }
            // setup for prep phase
            else if(this.actions[this.actionIndex] === 'p'){
                this.state = 4;
                this.waveNameTimer = 150;
                this.prepTimer = 1200;
            }
        }else{
            this.state = 5;
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // manage this level's state using timers 
    this.play = function(){
        // give buffer before starting
        if(this.stateTransitionTimer > 0){
            this.stateTransitionTimer--;
        }else{
            // launching
            if(this.state === 0){
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
                this.state = 1;
                this.countTimer = 30;
                this.waveNameTimer = 200;
            }
            // waiting for wave to end
            else if(this.state === 1){

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
                            this.state = 2;
                            this.transitionTimer = 60;
                        }else{
                            this.countTimer = 30;
                        }
                    }
                }
            }
            // time waiting between waves
            else if(this.state === 2){
                if(this.transitionTimer > 0){
                    this.transitionTimer--;
                    if(this.transitionTimer === 0){
                        this.waveIndex++;
                        if(this.waveIndex == this.waves.length){
                            this.state = 5;
                        }
                        this.nextAction();
                    }
                }
            }
            // displaying help text
            else if(this.state === 3){
                // update timer and state of help text
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
                            if(this.charsDisplayed >= this.helpTexts[this.helpTextIndex].length){
                                this.helpTextTimer = this.helpTexts[this.helpTextIndex].length*4;
                                this.helpTextState = 2;
                            }else{
                                this.charsDisplayed++;
                                this.helpTextTimer = 1;
                            }
                        }else if(this.helpTextState === 2){
                            this.helpTextTimer = 60;
                            this.helpTextState = 3;
                        
                        }else if(this.helpTextState === 3){
                            this.stateTransitionTimer = this.helpTexts[this.helpTextIndex].length*4/2;
                            this.helpTextIndex++;
                            this.nextAction();
                        }
                    }
                }
            }
            // prep stage, so just wait and display stage name
            else if(this.state === 4){
                // start fading out once coming to end
                if(this.prepTimer < 100){
                    this.waveNameTimer--;
                }
                
                // decrement preparation timer, if expired go on to next stage
                if(this.prepTimer > 0){
                    this.prepTimer--;
                    if(this.prepTimer === 0){
                        this.nextAction();
                        this.stateTransitionTimer = 60;
                    }
                }
            }
        }
    }
};