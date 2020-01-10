/* menuObject
 * a top level menu object to contain menu items
 * the state of the menu is here, all graphics for 
 * storing the menu are also contained here
 */
var menuObject = function(){

    // give menu a state
    // 0 = main menu
    // 1 = selecting levels
    // 2 = Instructions
    // 3 = options, deprecated
    // 4 = menu box during gameplay
    // 5 = menu if clicked during gameplay
    // 6 = game over menu
    this.state = 0;
    // nextState is used for animation
    this.nextState = 0;

    // add a hover effect to menu items
    this.hover = '';

    // want to have a menuPlayer - a player just for 
    // demonstration on the menu
    this.mp = new menuPlayer(width/2, height/2);

    // if this bool is set, transitioning between states
    this.transition = false;
    this.transitionTimer = 0;

    // flags for when returning to menu, loading a level, or reloading a level after defeat
    this.loadLevel = false;
    this.menuReturn = false; 
    this.reload = false;

    // vault door for animating transition between states
    this.vd = new vaultdoor();

    // add lines to draw title animation
    this.zaplines = [];
    // add lines for:
    // M
    this.zaplines.push(new zapline(3*(width/10), width/10, 3*(width/10), 2*(width/10)));
    this.zaplines.push(new zapline(3*(width/10), width/10, 3.5*(width/10), 2*(width/10)));
    this.zaplines.push(new zapline(4*(width/10), width/10, 3.5*(width/10), 2*(width/10)));
    this.zaplines.push(new zapline(4*(width/10), width/10, 4*(width/10), 2*(width/10)));
    // A
    this.zaplines.push(new zapline(4.8*(width/10), width/10, 5.1*(width/10), 2*(width/10)));
    this.zaplines.push(new zapline(4.8*(width/10), width/10, 4.5*(width/10), 2*(width/10)));
    this.zaplines.push(new zapline(4.6*(width/10), 1.5*(width/10), 5*(width/10), 1.5*(width/10)));
    // R
    this.zaplines.push(new zapline(5.5*(width/10), width/10, 5.5*(width/10), 2*(width/10)));
    this.zaplines.push(new zapline(5.5*(width/10), 1.5*(width/10), 6*(width/10), 2*(width/10)));
    this.zaplines.push(new zapline(5.5*(width/10), (width/10), 6*(width/10), 1.2*(width/10)));
    this.zaplines.push(new zapline(5.5*(width/10), 1.5*(width/10), 6*(width/10), 1.2*(width/10)));
    // S
    this.zaplines.push(new zapline(6.3*(width/10), 1.3*(width/10), 6.7*(width/10), (width/10)));
    this.zaplines.push(new zapline(6.3*(width/10), 1.3*(width/10), 6.7*(width/10), 1.6*(width/10)));
    this.zaplines.push(new zapline(6.3*(width/10), 2*(width/10), 6.7*(width/10), 1.6*(width/10)));
    
    // I
    this.zaplines.push(new zapline(1.5*(width/10), 2.5*(width/10), 1.5*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(1.2*(width/10), 2.5*(width/10), 1.8*(width/10), 2.5*(width/10)));
    this.zaplines.push(new zapline(1.2*(width/10), 3.5*(width/10), 1.8*(width/10), 3.5*(width/10)));
    // N
    this.zaplines.push(new zapline(2.2*(width/10), 2.5*(width/10), 2.2*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(2.2*(width/10), 2.5*(width/10), 2.8*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(2.8*(width/10), 2.5*(width/10), 2.8*(width/10), 3.5*(width/10)));
    // V 
    this.zaplines.push(new zapline(3.1*(width/10), 2.5*(width/10), 3.4*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(3.7*(width/10), 2.5*(width/10), 3.4*(width/10), 3.5*(width/10)));
    // A
    this.zaplines.push(new zapline(4.3*(width/10), 2.5*(width/10), 4.6*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(4*(width/10), 3.5*(width/10), 4.3*(width/10), 2.5*(width/10)));
    this.zaplines.push(new zapline(4.2*(width/10), 3*(width/10), 4.5*(width/10), 3*(width/10)));
    // S
    this.zaplines.push(new zapline(4.8*(width/10), 2.8*(width/10), 5.2*(width/10), 2.5*(width/10)));
    this.zaplines.push(new zapline(4.8*(width/10), 2.8*(width/10), 5.2*(width/10), 3.1*(width/10)));
    this.zaplines.push(new zapline(4.8*(width/10), 3.5*(width/10), 5.2*(width/10), 3.1*(width/10)));
    // I
    this.zaplines.push(new zapline(5.7*(width/10), 2.5*(width/10), 5.7*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(5.4*(width/10), 2.5*(width/10), 6*(width/10), 2.5*(width/10)));
    this.zaplines.push(new zapline(5.4*(width/10), 3.5*(width/10), 6*(width/10), 3.5*(width/10)));
    // O
    this.zaplines.push(new zapline(6.4*(width/10), 2.5*(width/10), 6.4*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(7*(width/10), 2.5*(width/10), 7*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(6.4*(width/10), 2.5*(width/10), 7*(width/10), 2.5*(width/10)));
    this.zaplines.push(new zapline(6.4*(width/10), 3.5*(width/10), 7*(width/10), 3.5*(width/10)));
    /// N
    this.zaplines.push(new zapline(7.5*(width/10), 2.5*(width/10), 7.5*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(7.5*(width/10), 2.5*(width/10), 8.1*(width/10), 3.5*(width/10)));
    this.zaplines.push(new zapline(8.1*(width/10), 2.5*(width/10), 8.1*(width/10), 3.5*(width/10)));

    // ---------------------------------------------
    // ---------------------------------------------
    // draw the game's title
    this.drawGameTitle = function(){
        for(var i = 0; i < this.zaplines.length; i++){
            this.zaplines[i].draw(width/2, height/2);
            this.zaplines[i].update();
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw a menu box with given dimensions and text, 
    // drawing with different adjustments for a small box
    this.drawMenuBox = function(x, y, w, h, t, small){
        if(t === 'x'){
            fill(240, 240, 240);
        }else{
            fill(214, 214, 214);
        }
        stroke(0, 0, 0);
        strokeWeight(5);
        textFont(qfont);
        textSize(30);
        textAlign(CENTER);
        if(small){
            strokeWeight(3);
        }
        // draw stroke differently if highligted
        // also highlight if shift or space for instructions screen
        if(this.hover == t ||(game.keyArray[SHIFT] === 1 && t === 'Shift') || 
            (game.keyArray[32] === 1 && t === 'Space')){
            stroke(64, 186, 45);
        }
        // draw box
        rect(x, y, w, h, 10);
        // draw text
        fill(0, 0, 0);
        noStroke();
        if(small){
            text(t, x + w/2, y + h*8/10);
        }else{
            text(t, x + w/2, y + h*2/3);
        }
        strokeWeight(1);
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw text t at x, y in title format
    this.drawTitle = function(t, x, y){
        fill(214, 214, 214);
        stroke(0, 0, 0);
        strokeWeight(3);
        textFont(qfont);
        textSize(30);
        textAlign(CENTER);
        text(t, x, y);
        strokeWeight(1);
    };

     // ---------------------------------------------
    // ---------------------------------------------
    // draw paragraph text t at location x, y in paragraph format
    this.drawPText = function(t, x, y){
        fill(214, 214, 214);
        stroke(0, 0, 0);
        strokeWeight(3);
        textFont(qfont);
        textSize(20);
        textAlign(CENTER);
        text(t, x, y);
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw an arrow key at x, y with text t
    // highlight if highlight bool is set
    this.drawArrowKey = function(t, x, y){
        fill(214, 214, 214);
        stroke(0, 0, 0);
        strokeWeight(5);

        // if user pressing arrow key highlight
        if(game.keyArray[UP_ARROW] === 1 && t === 'UP' || 
           game.keyArray[DOWN_ARROW] === 1 && t === 'DOWN' ||
           game.keyArray[LEFT_ARROW] === 1 && t === 'LEFT' ||
           game.keyArray[RIGHT_ARROW] === 1 && t === 'RIGHT' ){
            stroke(64, 186, 45);
        }
        rect(x, y, width/12, width/12, 10);
        // draw arrow
        fill(0, 0, 0);
        stroke(0, 0, 0);
        if(t === 'UP'){
            triangle(x + 15, y + 35, x + 25, y + 15, x + 35, y + 35);
        }else if(t === 'DOWN'){
            triangle(x + 15, y + 15, x + 25, y + 35, x + 35, y + 15);
        }
        else if(t === 'LEFT'){
            triangle(x + 15, y + 25, x + 35, y + 15, x + 35, y + 35);
        }
        else if(t === 'RIGHT'){
            triangle(x + 15, y + 15, x + 15, y + 35, x + 35, y + 25);
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw menu
    this.draw = function(){

        // main menu
        if(this.state === 0){
            // draw title
            this.drawGameTitle();
            this.drawTitle("By Graham Haynie", width/2, 4.5*(width/10));

            // draw menu selection options
            this.drawMenuBox(width/6, 3*(width/6), 2*(width/3), width/8, 'Select Level', false);
            this.drawMenuBox(width/6, 4*(width/6), 2*(width/3), width/8, 'instructions', false);
            
        }
        // level selection
        else if(this.state === 1){
            this.drawTitle("Select level:", width/2, 40);

            // draw text describing level difficulty
            this.drawPText("The green dots indicate difficulty, from 1 to 4", width/2, height/6);          

            // draw tutorial selection box
            fill(214, 214, 214);
            stroke(0, 0, 0);
            strokeWeight(3);
            textSize(30);
            if(this.hover === 'Tutorial'){
                stroke(20, 201, 35);
            }
            rect(width/24, width/4, width/4, width/6, 10);
            // tutorial level name
            noStroke();
            fill(0, 0, 0);
            text('Tutorial', width/6, width/4 + width/12);

            // draw level selection boxes
            // show level name and level difficulty in box
            for(var x = 0; x < levels.length; x++){
                if(x < 2 ){
                    fill(214, 214, 214);
                    stroke(0, 0, 0);
                    strokeWeight(3);
                    if(this.hover === 'level' + str(x + 1)){
                        stroke(20, 201, 35);
                    }
                    rect((x+1)*(width/3) + width/24, width/4, width/4, width/6, 10);
                    //level name
                    noStroke();
                    fill(0, 0, 0);
                    text(levels[x].name, (x+1)*(width/3) + width/6, width/4 + width/12);
                    // difficuty 
                    fill(64, 186, 45);
                    for(var i = 0; i < levels[x].difficulty; i++){
                        ellipse((x+1)*(width/3) + width/6 + i*25 - 35, width/4 + width/8, 15, 15);
                    }
                }
                else if(x >= 2 && x < 5){
                    fill(214, 214, 214);
                    stroke(0, 0, 0);
                    if(this.hover === 'level' + str(x + 1)){
                        stroke(20, 201, 35);
                    }
                    rect((x-2)*(width/3) + width/24, width/2, width/4, width/6, 10);
                    //level name
                    noStroke();
                    fill(0, 0, 0);
                    text(levels[x].name, (x - 2)*(width/3) + width/6, width/2 + width/12);
                    // difficuty 
                    fill(64, 186, 45);
                    for(var i = 0; i < levels[x].difficulty; i++){
                        ellipse((x-2)*(width/3) + width/6 + i*25 - 35, width/2 + width/8, 15, 15);
                    }
                }
            }

            // back button
            this.drawMenuBox(3*(width/8), 5*(width/6), width/4, width/12, 'Back', false);
        }
        // Instructions menu
        else if(this.state === 2){
            this.drawTitle("instructions:", width/2, 40);

            // draw paragraph text for controls
            this.drawPText('Press the arrow keys to move your astronaut,', width/2, 2*(width/10));
            this.drawPText('Space to fire your laser blaster and shift', width/2, 2.8*(width/10));
            this.drawPText('to pick up and put down defenses. Try it out:', width/2, 3.6*(width/10));
            this.drawPText('Great, Now you\'re ready to play the tutorial!', width/2, 7.7*(width/10));

            this.mp.draw();
            this.mp.update();

            // draw arrow keys, rotating through which to draw
            this.drawArrowKey('UP', 8*(height/10) - 25, 5*(height/10));
            this.drawArrowKey('DOWN', 8*(height/10) - 25, 6*(height/10));
            this.drawArrowKey('LEFT', 8*(height/10) - 90, 6*(height/10));
            this.drawArrowKey('RIGHT', 8*(height/10) + 40, 6*(height/10));

            // draw other control keys
            this.drawMenuBox(width/10, 5*(height/10), width/4, width/12, 'Shift', false);
            this.drawMenuBox(width/10, 6*(height/10), width/2, width/12, 'Space', false);

            // back button
            this.drawMenuBox(1.5*(width/8), 5*(width/6), width/4, width/12, 'Back', false);
            // tutorial button
            this.drawMenuBox(4*(width/8), 5*(width/6), width/3, width/12, 'Tutorial', false);
        }
        // menu box during gameplay
        else if(this.state === 4){
            this.drawMenuBox(10, 10, 30, 30, 'x', true);
        }
        // menu that can select from during gameplay
        else if(this.state === 5){
            this.drawTitle("Paused", width/2, 40);

            // draw continue and back boxes
            this.drawMenuBox(width/6, width/8, 3*(width/10), width/12, 'exit', false);
            this.drawMenuBox(3*(width/6), width/8, 3*(width/10), width/12, 'Continue', false);
        }
        // game over
        else if(this.state === 6){
            // draw differently if player won or lost
            if(this.won){
                this.drawTitle("Game over!", width/2, 40);
                this.drawPText('You won! Click the menu button', width/2, 2*(width/10));
                this.drawPText('below to return to the menu.', width/2, 3*(width/10));

                // draw return to menu button
                this.drawMenuBox(3*(width/8), 4*(width/6), width/4, width/12, 'Menu', false);
            }else{
                this.drawTitle("Game over!", width/2, 40);

                this.drawPText('You Lost! Click the menu button', width/2, 2*(width/10));
                this.drawPText('below to return to the menu, or', width/2, 3*(width/10));
                this.drawPText('the try again button to play again.', width/2, 4*(width/10));

                // draw return to menu button and try again button
                this.drawMenuBox(width/6, 4*(width/6), width/4, width/12, 'Menu', false);
                this.drawMenuBox(3*(width/6), 4*(width/6), 3.5*(width/10), width/12, 'Try again', false);
                
            }
        }

        // if transitioning between states, draw vault door
        if(this.transitionTimer > 0 && this.transition){
            this.vd.draw();
            this.vd.update();
            this.transitionTimer--;
        }
        
        // want state to change halfway through timer, so when doors open
        // shows next screen
        if(this.transitionTimer === 35){
            // re-setup game
            if(this.reload){
                game.reload();
            }

            // load game's level
            if(this.loadLevel){
                game.loadLevel(this.nextLevel);
                game.level.reload();
                this.loadLevel = false;
            }
            // return to menu
            if(this.menuReturn){
                game.reload();
                game.state = 0;
            }

            this.state = this.nextState;
        }
        // if done transitioning, mark state and update flag
        else if(this.transitionTimer === 0 && this.transition){
            this.transition = false;
            this.vd.reset();
            
            if(this.menuReturn){
                this.menuReturn = false;
            }
        }

    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update menu state according to where mouse is clicked
    this.updateClick = function(){
        // main menu
        if(this.state === 0 && this.transitionTimer === 0){
            // if click select level, then move to select level menu
            if(mouseY > width/2 && mouseY < width/2 + width/8
                && mouseX > width/6 && mouseX < width/6 + 2*(width/3)){
                this.nextState = 1;
                this.transitionTimer = 75;
                this.transition = true;
            }
            // if click instructions, move to instructions screen
            else if(mouseY > 4*(width/6) && mouseY < 4*(width/6) + width/8
                && mouseX > width/6 && mouseX < width/6 + 2*(width/3)){
                this.nextState = 2;
                this.transitionTimer = 75;
                this.transition = true;
                this.mp.reload();
            }
        }

        // level selection - 
        // if player is in menu and selects a level, update game's level
        //attempt to load levels, first checking if levels are valid
        else if(this.state === 1 && this.transitionTimer === 0){
            var clickLevel = false;
            // first row of levels
            if(mouseY > width/4 && mouseY < width/4 + width/6){
                // first column
                if(mouseX > width/24 && mouseX < 7*(width/24)){
                    // click tutorial
                    this.nextLevel = 0;
                    clickLevel = true;
                }
                // second column
                else if(mouseX > 9*(width/24)  && mouseX < 15*(width/24)){
                    if(1 <= levels.length){
                        this.nextLevel = 1;
                        clickLevel = true;
                    }
                }
                // third column
                else if(mouseX > 2*(width/3) + width/24 && mouseX < 2*(width/3) + width/24 + width/4){
                    if(2 <= levels.length){
                        this.nextLevel = 2;
                        clickLevel = true;
                    }
                }
            }
            // second row of levels
            else if(mouseY > width/2 && mouseY < width/2 + width/6){
                // first column
                if(mouseX > width/24 && mouseX < 7*(width/24)){
                    if(3 <= levels.length){
                        this.nextLevel = 3;
                        clickLevel = true;
                    }
                }
                // second column
                else if(mouseX > 9*(width/24)  && mouseX < 15*(width/24)){
                    if(4 <= levels.length){
                        this.nextLevel = 4;
                        clickLevel = true;
                    }
                }
                // third column
                else if(mouseX > 2*(width/3) + width/24 && mouseX < 2*(width/3) + width/24 + width/4){
                    if(5 <= levels.length){
                        this.nextLevel = 5;
                        clickLevel = true;
                    }
                }

            }
            // if click back button, go to main menu
            else if(mouseX > 3*(width/8) && mouseX < 3*(width/8) + width/4
                    && mouseY > 5*(width/6) && mouseY < 5*(width/6) + width/12){
                this.nextState = 0;
                this.transitionTimer = 75;
                this.transition = true;
            }
            if(clickLevel){
                this.loadLevel = true;
                this.nextState = 4;
                this.transitionTimer = 75;
                this.transition = true;
            }

            
        }
        //instructions menu
        else if(this.state === 2 && this.transitionTimer === 0){
            // if click back button, go to main menu
            if(mouseX > 1.5*(width/8) && mouseX < 1.5*(width/8) + width/4
                    && mouseY > 5*(width/6) && mouseY < 5*(width/6) + width/12){
                this.nextState = 0;
                this.transitionTimer = 75;
                this.transition = true;
            }
            // if click tutorial button, play tutorial
            else if(mouseX > 4*(width/8) && mouseX < 4*(width/8) + width/3
                && mouseY > 5*(width/6) && mouseY < 5*(width/6) + width/12){
                this.nextLevel = 0;
                this.loadLevel = true;
                this.nextState = 4;
                this.transitionTimer = 75;
                this.transition = true;
                
            }

        }

        // menu button during game
        else if(this.state === 4 && this.transitionTimer === 0){
            if(mouseX > 10 && mouseX < 40 && mouseY > 10 && mouseY < 40){
                this.state = 5;
            }
        }

        // in game menu active
        else if(this.state === 5 && this.transitionTimer === 0){
            // click back so return to menu
            if(mouseX > width/6 && mouseX < width/6 + 3*(width/10) &&
                mouseY > width/8 && mouseY < width/8 + width/12){
                this.nextState = 0;
                this.transitionTimer = 75;
                this.transition = true;
                this.menuReturn = true;
            }
            // click continue so return to gameplay
            else if(mouseX > 3*(width/6) && mouseX < 3*(width/6) + 3*(width/10) &&
                mouseY > width/8 && mouseY < width/8 + width/12){
                this.state = 4;
            }
        }
        // game over menu
        else if(this.state === 6){
            // do differently if win or lose
            if(this.won){
                // return to menu
                if(mouseX > 3*(width/8) && mouseX < 3*(width/8) + width/4 &&
                    mouseY > 4*(width/6) && mouseY < 4*(width/6) + width/12){
                    this.nextState = 0;
                    this.transitionTimer = 75;
                    this.transition = true;
                    this.menuReturn = true;
                }
            }else{
                // return to menu
                if(mouseX > width/6 && mouseX < width/6 + width/4 &&
                    mouseY > 4*(width/6) && mouseY < 4*(width/6) + width/12){
                    this.nextState = 0;
                    this.transitionTimer = 75;
                    this.transition = true;
                    this.menuReturn = true;
                }
                // start level over
                else if(mouseX > 3*(width/6) && mouseX < 3*(width/6) + 3.5*(width/10) &&
                    mouseY > 4*(width/6) && mouseY < 4*(width/6) + width/12){
                    this.nextLevel = game.curLevelIndex;
                    this.loadLevel = true;
                    this.nextState = 4;
                    this.transitionTimer = 75;
                    this.transition = true;
                    this.menuReturn = false;
                    this.reload = true;
                }
            }
        }
        
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update state according to where mouse is hovering
    this.updateHover = function(){
        // main menu
        if(this.state === 0 && this.transitionTimer === 0){
            // hover select level
            if(mouseY > width/2 && mouseY < width/2 + width/8
                && mouseX > width/6 && mouseX < width/6 + 2*(width/3)){
                this.hover = 'Select Level';
            }
            // instructions
            else if(mouseY > 4*(width/6) && mouseY < 4*(width/6) + width/8
                && mouseX > width/6 && mouseX < width/6 + 2*(width/3)){
                this.hover = 'instructions';
            }
            else{
                this.hover = '';
            }
        }
        // level selection
        else if(this.state === 1 && this.transitionTimer === 0){
            // first row of levels
            if(mouseY > width/4 && mouseY < width/4 + width/6){
                // first column
                if(mouseX > width/24 && mouseX < 7*(width/24)){
                    this.hover = 'Tutorial';
                }
                // second column
                else if(mouseX > 9*(width/24)  && mouseX < 15*(width/24)){
                    this.hover = 'level1';
                }
                // third column
                else if(mouseX > 2*(width/3) + width/24 && mouseX < 2*(width/3) + width/24 + width/4){
                    this.hover = 'level2';
                }else{
                    this.hover = '';
                }
            }
            // second row of levels
            else if(mouseY > width/2 && mouseY < width/2 + width/6){
                // first column
                if(mouseX > width/24 && mouseX < 7*(width/24)){
                    this.hover = 'level3';
                }
                // second column
                else if(mouseX > 9*(width/24)  && mouseX < 15*(width/24)){
                    this.hover = 'level4';
                }
                // third column
                else if(mouseX > 2*(width/3) + width/24 && mouseX < 2*(width/3) + width/24 + width/4){
                    this.hover = 'level5';
                }else{
                    this.hover = '';
                }

            }
            // back button
            else if(mouseX > 3*(width/8) && mouseX < 3*(width/8) + width/4
                    && mouseY > 5*(width/6) && mouseY < 5*(width/6) + width/12){
                    this.hover = 'Back';
            }else{
                this.hover = '';
            }
        }
        // instructions menu
        else if(this.state === 2 && this.transitionTimer === 0){
            // back button
            if(mouseX > 1.5*(width/8) && mouseX < 1.5*(width/8) + width/4
                && mouseY > 5*(width/6) && mouseY < 5*(width/6) + width/12){
                this.hover = 'Back';
            }
            // tutorial button
            else if(mouseX > 4*(width/8) && mouseX < 4*(width/8) + width/3
                && mouseY > 5*(width/6) && mouseY < 5*(width/6) + width/12){
                this.hover = 'Tutorial';
            }
            else{
                this.hover = '';
            }

        }
        // menu button during game
        else if(this.state === 4 && this.transitionTimer === 0){
            if(mouseX > 10 && mouseX < 40 && mouseY > 10 && mouseY < 40){
                this.hover = 'x';
            }else{
                this.hover = '';
            }
        }

        // in game menu active
        else if(this.state === 5 && this.transitionTimer === 0){
            if(mouseX > width/6 && mouseX < width/6 + 3*(width/10) &&
                mouseY > width/8 && mouseY < width/8 + width/12){
                this.hover = 'exit';
            }
            else if(mouseX > 3*(width/6) && mouseX < 3*(width/6) + 3*(width/10) &&
                mouseY > width/8 && mouseY < width/8 + width/12){
                this.hover = 'Continue';
            }else{
                this.hover = '';
            }
        }
        // game over menu
        else if(this.state === 6){
            if(this.won){
                if(mouseX > 3*(width/8) && mouseX < 3*(width/8) + width/4 &&
                    mouseY > 4*(width/6) && mouseY < 4*(width/6) + width/12){
                    this.hover = 'Menu';
                }else{
                    this.hover = '';
                }
            }else{
                if(mouseX > width/6 && mouseX < width/6 + width/4 &&
                    mouseY > 4*(width/6) && mouseY < 4*(width/6) + width/12){
                    this.hover = 'Menu';
                }else if(mouseX > 3*(width/6) && mouseX < 3*(width/6) + 3.5*(width/10) &&
                    mouseY > 4*(width/6) && mouseY < 4*(width/6) + width/12){
                    this.hover = 'Try again';
                }else{
                    this.hover = '';
                }
            }
        }
        else{
            this.hover = '';
        }
    };

};