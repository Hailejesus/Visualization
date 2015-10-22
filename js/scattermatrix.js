var MatrixPlot = function(options){  

}
      var width = 960, size = 150, padding = 19.5;
                var rawdata = {}, filteredFields = ["eval_id"], fields, domainByField = {};
                var xScale = d3.scale.linear().range([padding / 2, size - padding / 2]);
                var yScale = d3.scale.linear().range([size - padding / 2, padding / 2]);
                var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
                var yAxis = d3.svg.axis().scale(yScale).orient("left") .ticks(5);
                var color = d3.scale.category10();              
    
                var separators = {'Comma': ',', 'Semicolon': ';', 'Tab': '\t'};                 
              
                $('.btn-file :file').on('fileselect', function(event) {
                    readfile(event);
                });
               
                $('.btn-file :file').on('change', function() {
                    var input = $(this);
                    input.trigger('fileselect');
                }); 

                function readfile(e){  //An event handler function to be called when the input control 'changes'
                    var fileobj = e.target.files[0];
                    var fr = new FileReader();
                    fr.readAsText(fileobj);
                    fr.onload = readerHandler;  //onload implies, after reading is complete call 'readerHandler'
                } 
                function readerHandler(e){
                    /*Generate the dataset from the file and populate the menu */
                    var checked = $('[name="delimradio"]:checked');
                    delim = separators[checked[0].value]

                    fileContent = e.target.result;
                    
                    var headerFlag = $('#headerFlag').prop('checked');
                    
                    rawdata = csvDictReader(fileContent, delim, headerFlag);
                    originalData = rawdata.map(function(row){return clone(row);});
                    
                    fields = Object.keys(rawdata[0]);
                    
                    var mainFS = $('#mainFS');
                    
                    mainFS.find('#fieldsFS').remove();   //clear previously rendered fieldset

                    var fieldsFS = $('<fieldset></fieldset>')
                                    .attr('id', 'fieldsFS').attr('class', 'fieldPile')
                                    .css({'max-height':'250px', 'overflow': 'auto'})
                                    .html('<legend>Fields</legend>').appendTo(mainFS);
                  
                    /*Populate checkboxes with fields names */   
                    fieldsFS.buttonset();
                    fieldsFS.append(function(){                       
                            var html = [];
                            fields.forEach(function(field){                               
                                html.push('<input type="checkbox" id="' + field + '" value="' + field +'"><label for="' + field + '">' + field + '</label>');
                            });                           
                            return html.join(''); 
                    })                        
                    //.buttonset()
                    
                    $('<button>')
                        .appendTo(fieldsFS).attr('id', 'btnPlot').attr('type', 'submit')
                        .attr('class', 'btn btn-default').text('Plot').on('click', draw)
                
                    $('#d3Chart').html('');
                    $('#statDiv').css('opacity', 0);
                }
                
                function draw(){
                    $('#d3Chart').html('');
                    var checkedFields = [];
                    $.each($('#fieldsFS input:checked'), function(){
                        checkedFields.push($(this).val());
                    })                 
                  
                    fieldCount = checkedFields.length;
                    checkedFields.forEach(function(field) {//The minimum and maximum values corresponding to a field
                        domainByField[field] = d3.extent(rawdata, function(d){
                            return d[field];
                        });
                    });

                    var n = checkedFields.length;

                    xAxis.tickSize(size * n);
                    yAxis.tickSize(-size * n);

                  var brush = d3.svg.brush().x(xScale).y(yScale)
                      .on("brushstart", brushstart).on("brush", brushmove).on("brushend", brushend);

                  var svg = d3.select("#d3Chart").append("svg")
                      .attr("width", size * n + padding)
                      .attr("height", size * n + padding)
                    .append("g")
                      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

                  svg.selectAll(".x.axis")
                      .data(checkedFields).enter().append("g")
                        .attr("class", "x axis")
                        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
                        .each(function(d) { xScale.domain(domainByField[d]); d3.select(this).call(xAxis); });
  
                  svg.selectAll(".y.axis")
                      .data(checkedFields).enter().append("g").attr("class", "y axis")
                      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
                      .each(function(d) { yScale.domain(domainByField[d]); d3.select(this).call(yAxis); });

                  var cell = svg.selectAll(".cell").data(cross(checkedFields, checkedFields))
                                .enter().append("g").attr("class", "cell")
                                .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
                                .each(plot);

                  // Titles for the diagonal.
                  cell.filter(function(d) { return d.i === d.j; }).append("text")
                      .attr("x", padding).attr("y", padding).attr("dy", ".71em")
                      .text(function(d) { return d.x; });

                  cell.call(brush);

                  function plot(p) {
                    var cell = d3.select(this);

                    xScale.domain(domainByField[p.x]);
                    yScale.domain(domainByField[p.y]);

                    cell.append("rect").attr("class", "frame")
                        .attr("x", padding / 2).attr("y", padding / 2)
                        .attr("width", size - padding).attr("height", size - padding);

                    cell.selectAll("circle").data(rawdata)
                      .enter().append("circle")
                        .attr("cx", function(d) { return xScale(d[p.x]); })
                        .attr("cy", function(d) { return yScale(d[p.y]); })
                        .attr("r", 3).style("fill", function(d) { return color(d.species); });
                  }

                  var brushCell;

                  // Clear the previously-active brush, if any.
                  function brushstart(p) {
                    if (brushCell !== this) {
                      d3.select(brushCell).call(brush.clear());
                      xScale.domain(domainByField[p.x]);
                      yScale.domain(domainByField[p.y]);
                      brushCell = this;
                    }
                  }

                  // Highlight the selected circles.
                  function brushmove(p) {
                    var e = brush.extent();
                    svg.selectAll("circle").classed("hide", function(d) {
                      return e[0][0] > d[p.x] || d[p.x] > e[1][0] || e[0][1] > d[p.y] || d[p.y] > e[1][1];
                    });
                  }

                  // If the brush is empty, select all circles.
                  function brushend() {
                    if (brush.empty()) svg.selectAll(".hide").classed("hide", false);
                  }

                  function cross(a, b) {
                    var c = [], n = a.length, m = b.length, i, j;
                    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
                    return c;
                    }

                    d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");