//use strict;
function clone(obj){
    /*Return a copy of 'obj'*/
    var result = {};
    Object.keys(obj).map(function(key){result[key] = copyValue(obj[key]);});
    return result;
}
function copyValue(value){
    /*Return a copy of 'value'
        'value' be different types supported
    */
    var primitives = ['string', 'number', 'undefined', 'boolean', 'function'];
    if(primitives.indexOf(typeof value) != -1){
        return value;
    }
    if(Array.isArray(value))
        return value.map(function(current){return copyValue(current);});
    if(typeof value === 'object')
        return clone(value);
}

var Dictionary = function (keys){
      var dict = this;
      dict.keyCount = keys.length;
      dict.keys = keys;
      keys.map(function(key, idx){dict[key] = [];});
}
Dictionary.prototype.insert = function(keys, values){
        var dict = this;
        if(keys.length === dict.keyCount){
            keys.map(function(key, idx){
                dict[key].push(values[idx]);
            });
        }
}

function dictReader(fileContent, delim, fields){
        var result = {};
        var lines = fileContent.split('\n');
        lines.forEach(function(line, idx){
            if(idx == 0){   
                if(fields === undefined){ //First row always contains the column headers
                    fields = line.trim().split(delim);
                    result = new Dictionary(fields)
                    return;
                }
                result = new Dictionary(fields)
                row = line.trim().split(delim);
                result.insert(fields, row);
                return
            }
            
            row = line.trim().split(delim);
            result.insert(fields, row);        
        });
        return result;
}
function dict(keys, values){
    var d = this;
    var v;
    values.forEach(function(value, i){
        v = +value;
        d[keys[i]] = isNaN(v)? value: v;
    });
}
function csvDictReader(fileContent, delim, header){
        var fields, currentValues, result = [];
        var lines = fileContent.split('\n');
        lines.forEach(function(line, idx){
            if(idx == 0){ 
                    var firstRow = line.trim().split(delim);
                    fields = ['lineNo'];
                    if(header){  //If the first row is treated as a header
                        fields = fields.concat(firstRow);
                        return; //In effect, continue to the next iteration
                    }
                    fields = fields.concat(firstRow.map(function(value, i){return "x"+i;}));
                    idx = idx+1;    //to enforce 'lineNo' to start from 1
            }
            currentValues = line.trim().split(delim);
            currentValues = [idx].concat(currentValues);
            if(currentValues.length === fields.length){
                result.push(new dict(fields, currentValues));                
            }
        });
        return result;  //An array of objects
}
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
function getHexPoints(AofO, cols){
    var output = AofO.map(function(entry, i){
                    return cols.map(function(col){
                        return entry[col];
                    });
                });
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

/*function readColumns(data, delim){
    var lines = data.split('\n'); 
    var columns = lines[0].trim().split(delim);

    var output = {};
    columns.forEach(function(col, i){
        output[col] = [];
    })
    var row;
    for(i = 1; i < lines.length; i++){
        currentLine = lines[i].trim().split(delim);
        columns.forEach(function(col, j){
            output[col].push(currentLine[j])
        });
    }
    return output;   
}
*/
function csvDictWriter(dictArray, delim){
    /*Takes an array of objects and returns a string where the 
     * each object's values are concatenated by 'delim' which in turn 
     * are concatenated by the newline character '\n'
     * */
    var row, rows;
    var fields = Object.keys(dictArray[0]);
    rows = fields.join(delim) + '\n'; 
    dictArray.forEach(function(obj, i){
        row = [];
        fields.forEach(function(field){
            row.push(obj[field]);
        });

        rows += row.join(delim) + '\n';
    });

    return rows;
}
function sum(x) {
    var value = 0;
    for (var i = 0; i < x.length; i++) {
        value += x[i];
    }
    return value;
}

function trim(num, dPoints){
    /* if 'num' has decimal points, trim upto 'dPoints'*/
    var p = (num.toString().split('.')[1] || []).length;
    return (p > dPoints)?parseFloat(num.toFixed(dPoints)):num;
}
