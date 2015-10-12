function AtoO(input){
    /*Convert an array of object literals into an object of array values
        e.g input = [{k1: a, k2:b}, {k1:e, k2:f}]
            output = {k1:[a,e], k2:[b,f]}
    */

    var keys = Object.keys(input[0]);
    var output = {};
    keys.forEach(function(key){//Initialize the output
        output[key] = [];
    })
    input.map(function(value){
        keys.forEach(function(key){
            output[key].push(value[key])
        });
    })

    return output;
}
function OtoA(input){
    /*The function does the opposite of AtoO*/
    var keys = Object.keys(input);
    var output = [];
    var entry = {};
    input[keys[0]].forEach(function(value, i){
        keys.forEach(function(key){
            entry[key] = input[keys[key]][i];
        })
        output.push(entry)
    })

    return output;
}
function getHexPoints(AofO, cols){

/*USAGE:
 * var AofO = [
 *                  {'name':'haileyesus', 'sex': 'male', 'age': 30},
                    {'name':'alemu', 'sex': 'male', 'age': 70},
                    {'name':'abeba', 'sex': 'female', 'age': 46}       
            ]
var cols = ['name', 'age'];*/
    var output = AofO.map(function(entry, i){ 
        return cols.map(function(col){
            return entry[col];
        });
    }); 
    return output;
/*
 *  output = [['haileyesus', 29], ['alemu', 70], ['abeba', 46]]
 *
 */
}


var points = getHexPoints(input, cols);
