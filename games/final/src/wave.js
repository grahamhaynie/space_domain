/* Wave - 
 * A custom data type to represent waves of adversaries. A wave
 * has a count of each type of adversary, as well as a name.
 */
var wave = function(name, numTunnelers, numRunners){
    this.name = name;
    this.numTunnelers = numTunnelers;
    this.numRunners = numRunners;
};