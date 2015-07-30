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
    values.forEach(function(value, i){
        d[keys[i]] = parseFloat(value);
    });
}
function csvDictReader(fileContent, delim){
        var fields, result = [];
        var lines = fileContent.split('\n');
        lines.forEach(function(line, idx){
            if(idx == 0){   //The first row always contains the fields
                    fields = line.trim().split(delim);
                    return;
            }
            values = line.trim().split(delim);
            if(values.length === fields.length)
                result.push(new dict(fields, values));
        });
        return result;  //An array of objects
}

function max(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, max is
        // undefined and is thus made the maximum element in the array
        if (x[i] > value || value === undefined) {
            value = x[i];
        }
    }
    return value;
}
function min(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, min is
        // undefined and is thus made the minimum element in the array
        if (x[i] < value || value === undefined) {
            value = x[i];
        }
    }
    return value;
}

function mean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    return sum(x) / x.length;
}


function variance(x) {
    // The variance of no numbers is null
    if (x.length === 0) { return null; }

    var meanValue = mean(x),
        deviations = [];

    // Make a list of squared deviations from the mean.
    for (var i = 0; i < x.length; i++) {
        deviations.push(Math.pow(x[i] - meanValue, 2));
    }

    // Find the mean value of that list
    return mean(deviations);
}


/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance.
 *
 * @param {Array<number>} x input
 * @returns {number} standard deviation
 */
function standardDeviation(x) {
    // The standard deviation of no numbers is null
    if (x.length === 0) { return null; }

    return Math.sqrt(variance(x));
}

function sum(x) {
    var value = 0;
    for (var i = 0; i < x.length; i++) {
        value += x[i];
    }
    return value;
}
