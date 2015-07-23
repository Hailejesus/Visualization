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
