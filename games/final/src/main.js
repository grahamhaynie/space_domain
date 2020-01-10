/* main.js
 * define top level functions here, such as user input and 
 * overall state controlling functions (draw, update)
 */

// instantiate global game object
var game = new gameObject();

// instantiate fonts
var qfont;
var tfont;

// global images list so can re-use for drawing on 
// menu and gameplay
var images = [];

// dictionary to hold images in lists
var imageDict = {
    'background': [],
    'character': [],
    'tunneler': [],
    'runner': [],
    'wall': [],
    'turret': [],
    'lightningTurret': [],
    'boot': [],
    'collectible': []
};

// a list containing the levels in JSON format 
var levels = [];

// debug flag set for rapid developement of levels
var debug = false;

// ---------------------------------------------
// ---------------------------------------------
/* load 300x300 sprite from x*300, y*300 spritemap to image dictionary 
 * by creating a 2 dimensional array where the first index is the y value, 
 * and the second is the x value
 */
function loadSprite(name, index){
    var h = images[index].height/300;
    var w = images[index].width/300;
    imageDict[name] = new Array(h);
    for(var y = 0; y < h; y++){
        imageDict[name][y] = new Array(w);
        for(var x = 0; x < w; x++){
            imageDict[name][y][x] = images[index].get(x*300, y*300, 300, 300);
        }
    }
};

// ---------------------------------------------
// ---------------------------------------------
// need to load images before program runs
function preload(){
    // background
    imageDict['background'].push(loadImage('resources/floor.png'));
    
    // fonts
    qfont = loadFont('resources/spaceranger.ttf');
    tfont = loadFont('resources/ds-digi.ttf')
    
    // load to images so can load in setup
    images.push(loadImage('resources/character_map.png'));
    images.push(loadImage('resources/tunneler_map.png'));
    images.push(loadImage('resources/runner_map.png'));
    images.push(loadImage('resources/wall_map.png'));
    images.push(loadImage('resources/turret_map.png'));
    images.push(loadImage('resources/lightning_map.png'));
    images.push(loadImage('resources/boot_map.png'));
    images.push(loadImage('resources/collectible_map.png'));

    // load levels json files
    levels.push(loadJSON('levels/level1.json'));
    levels.push(loadJSON('levels/level2.json'));
    levels.push(loadJSON('levels/level3.json'));
    levels.push(loadJSON('levels/level4.json'));
    levels.push(loadJSON('levels/level5.json'));
};

// ---------------------------------------------
// ---------------------------------------------
// setup initial state
function setup() {
    // position canvas in center of screen
    var canvas = createCanvas(600, 600);
    //var x = (windowWidth - width) / 2;
    //var y = (windowHeight - height) / 2;
    //canvas.position(x, y);
    canvas.parent('sketch-holder');

    game.setup();

    // load sprites
    loadSprite('character', 0);
    loadSprite('tunneler', 1);
    loadSprite('runner', 2);
    loadSprite('wall', 3);
    loadSprite('turret', 4);
    loadSprite('lightningTurret', 5);
    loadSprite('boot', 6);
    loadSprite('collectible', 7);

    if(debug){
        game.loadLevel(4);
        game.menu.state = 4;
        game.state = 1;

    }
};

//---------------------------------------------------
//---------------------------------------------------
/* handle key presses
 * each time key is pressed, record it
 * and each time a key is released, un-record it
 */
function keyPressed() {
    game.keyArray[keyCode] = 1;
};
function keyReleased() {
    game.keyArray[keyCode] = 0;
}; 

//---------------------------------------------------
//---------------------------------------------------
/* handle mouse clicks
 *
 */
mouseReleased = function(){
    // if on menu or in game and click, call menu's update
    if(game.state === 0 || game.state === 1){
        game.menu.updateClick();
    }
};

// ---------------------------------------------
// ---------------------------------------------
// draw function for processing, use as wrapper
// for drawing game and updating it.
function draw() {
    angleMode(RADIANS);
    background(200, 200, 200);
    game.draw();
    game.update();
};