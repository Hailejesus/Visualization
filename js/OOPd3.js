var ScatterPlot = function (options){var self = this;
    this.options = options;

    this.canvas = options.renderTo; //Assumes a d3 selection
    this.chartW = options.chart.width;
    this.chartH = options.chart.height;
    this.chartX = options.chart.posX;
    this.chartY = options.chart.posY;
    this.margin = options.chart.margin;
    this.data = options.series.data;
    this.xaxisName = options.xAxis.name;
    this.yaxisName = options.yAxis.name;
    this.xMinMax = d3.extent(this.data, function(d){return d[self.xaxisName];});
    this.yMinMax = d3.extent(this.data, function(d){return d[self.yaxisName];});
    
    this.tooltip = options.chart.tooltip;
    this.chartBrushStart = options.chart.brush.start.bind(this);
    this.chartBrushMove = options.chart.brush.move.bind(this);
    this.chartBrushEnd = options.chart.brush.end.bind(this);
    
    this.navBrushStart = options.navigator.brush.start.bind(this);
    this.navBrushMove = options.navigator.brush.move.bind(this);
    this.navBrushEnd = options.navigator.brush.end.bind(this);
    this.navX = options.navigator.posX;
    this.navY = options.navigator.posY;
}

ScatterPlot.prototype.drawChart = function(){
    var self = this;
    var tickCount = 5;
    self.xMinMax = d3.extent(self.data, function(d){return d[self.xaxisName];});
    self.yMinMax = d3.extent(self.data, function(d){return d[self.yaxisName];});

    /*Setup X-axis*/
    self.xScale = d3.scale.linear().domain(self.xMinMax).range([0, self.chartW]).nice();    
    self.xAxis = d3.svg.axis().scale(self.xScale).orient('bottom').ticks(tickCount);
    self.mainChart.selectAll('.x.axis').remove();
    self.mainChart.append('g').attr('transform', 'translate(0, ' + self.chartH + ')')
            .attr('class', 'x axis').call(self.xAxis);

    /*Setup Y-axis*/
    self.yScale = d3.scale.linear().domain(self.yMinMax).range([self.chartH, 0]).nice();
    self.yAxis = d3.svg.axis().scale(self.yScale).orient('left');
    self.mainChart.selectAll('.y.axis').remove();        
    self.mainChart.append('g').attr('class', 'y axis').call(self.yAxis);    
    
    /*Remove previous points from the main chart before redrawing*/
    self.mainChart.selectAll('circle').remove();
    self.chartPoints = self.mainChart.selectAll("circle").data(self.data).enter().append("circle")
        .attr("transform", function(d, i){ 
                return "translate(" + self.xScale(d[self.xaxisName]) + "," + self.yScale(d[self.yaxisName]) + ")"; 
    }).attr("r", 4).style('fill', 'maroon').on('mouseover', self.tooltip.show).on('mouseout', self.tooltip.hide);

    self.chartBrush = d3.svg.brush().x(self.xScale).y(self.yScale)
        .on('brushstart', self.chartBrushStart)
        .on("brush", self.chartBrushMove)
        .on("brushend", self.chartBrushEnd);

    self.mainChart.selectAll('.brush').remove();
    var chartBrushHandle = self.mainChart.append("g").style('stroke-dasharray', ("3,3")).attr("class", "brush").call(self.chartBrush);
}
ScatterPlot.prototype.drawNav = function(){
    var self = this;
    var navHeight = 60;
    
    self.navXScale = d3.scale.linear().domain(self.xMinMax).range([0, self.chartW]);
    self.navYScale = d3.scale.linear().domain(self.yMinMax).range([navHeight,  0]);
        
    self.navChart.selectAll('circle').remove();
    self.navPoints = self.navChart.selectAll("circle")
        .data(self.data).enter().append("circle")
        .attr("transform", function(d, i){ 
                        return "translate(" + self.navXScale(d[self.xaxisName]) + "," 
                                + self.navYScale(d[self.yaxisName]) + ")"; 
    }).attr("r", 2);
    var xMin = self.xMinMax[0]; var xMax = self.xMinMax[1]; var yMin = self.yMinMax[0]; var yMax = self.yMinMax[1];


    self.navBrush = d3.svg.brush().x(self.navXScale).y(self.navYScale).extent([[xMin, yMin],[xMax, yMax]])
        .on("brushstart", self.navBrushStart).on("brush", self.navBrushMove).on("brushend", self.navBrushEnd);
    
    self.navChart.selectAll('.brush').remove();
    var navBrushHandle = self.navChart.append("g").attr("class", "brush").call(self.navBrush);
    
    var arc = d3.svg.arc().outerRadius(navHeight / 4).startAngle(0).endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

    //navBrushHandle.selectAll('.resize').append('path').attr("transform", "translate(0," +  navHeight / 2 + ")").attr("d", arc);
    
    //navBrushHandle.selectAll('rect').attr('height', navHeight);

    // ########################################  Draw the brush ############################
   
    
    /*brush = d3.svg.brush().x(x).on("brush", brushmove).on("brushend", brushend);
    
    brushg = barchart.append("g").attr("class", "brush").call(brush);

    brushg.selectAll(".resize").append("path").attr("transform", "translate(0," +  height / 2 + ")").attr("d", arc);

    brushg.selectAll("rect").attr("height", height);*/

    //########################################################################  
}
ScatterPlot.prototype.draw = function(){
    var self = this;
   
    self.mainChart = self.canvas.append('g').attr('id', 'mainChart')
                        .attr('width',  self.chartW).attr('height', self.chartH)
                        .attr('transform', function(){ return 'translate(' + self.chartX + ',' + self.chartY +')';});
    self.drawChart();

    self.navChart = self.canvas.append("g").attr("transform", function(){
                                    return "translate(" + self.navX + ', ' + self.navY + ')';
                        }).attr("width", self.chartW).attr("height", 60)
                        //.style('stroke', 'black').style('stroke-width', '1px');    
    self.drawNav();    
}
ScatterPlot.prototype.redraw = function(data, redrawNav){    
    var self = this;
    redrawNav = redrawNav || false;
    self.data = data;

    self.drawChart();
    
    if(redrawNav){        
        self.drawNav();
     }
}

var MatrixPlot = function (options){
    var MatrixPlot = this;
    MatrixPlot.options = options;
    
    MatrixPlot.padding = options.chart.padding || 20;                        //A number
    MatrixPlot.cellsize = options.chart.cellsize || 100;                       //A number   
    MatrixPlot.data = options.series.data || [];                              //An array of JS object literals
    MatrixPlot.fields = options.series.fields || [];                          //An array of strings
    MatrixPlot.checkedFields = options.series.checkedFields;                   //An array of strings
    MatrixPlot.colorBy = options.series.style.colorBy 
    MatrixPlot.sizeBy = options.series.style.sizeBy;
    MatrixPlot.domainByField = {};
    MatrixPlot.checkedFields.forEach(function(field) {//The minimum and maximum values corresponding to a field
        MatrixPlot.domainByField[field] = d3.extent(MatrixPlot.data, function(d){
            return d[field];
        });

    });
    
    MatrixPlot.canvas = options.renderTo;                               //Assumes a d3 selection
    MatrixPlot.chartW = options.chart.width;                            //A number
    MatrixPlot.chartX = options.chart.posX;                             //A number
    MatrixPlot.chartY = options.chart.posY;                             //A number
    MatrixPlot.tooltip = options.chart.tooltip;                         //d3-tip plugin
    MatrixPlot.chartBrushStart = options.chart.brush.start.bind(MatrixPlot);
    MatrixPlot.chartBrushMove = options.chart.brush.move.bind(MatrixPlot);
    MatrixPlot.chartBrushEnd = options.chart.brush.end.bind(MatrixPlot); 

    MatrixPlot.xScale = d3.scale.linear().range([MatrixPlot.padding / 2, MatrixPlot.cellsize - MatrixPlot.padding / 2]);
    MatrixPlot.yScale = d3.scale.linear().range([MatrixPlot.cellsize - MatrixPlot.padding / 2, MatrixPlot.padding / 2]);
    MatrixPlot.xAxis = d3.svg.axis().scale(MatrixPlot.xScale).orient("bottom").ticks(5);
    MatrixPlot.yAxis = d3.svg.axis().scale(MatrixPlot.yScale).orient("left") .ticks(5);   
}
MatrixPlot.prototype.draw = function(){
    var MatrixPlot = this;
    var n = MatrixPlot.checkedFields.length;    //The number of checked fields, i.e., n rows each containing n cells
    var color = d3.scale.category10();
    var size;

    var sizeBy = MatrixPlot.sizeBy;
    if(sizeBy){
        var sizeCategory = []
        MatrixPlot.data.forEach(function(d, i){
            sizeCategory[d[sizeBy]] = 0;
        });
        var sizes = Object.keys(sizeCategory);
        var ranges = sizes.map(function(s, i){return i + 3;});

        size = d3.scale.ordinal().domain(sizes).range(ranges);
    }

    MatrixPlot.xAxis.tickSize(MatrixPlot.cellsize * n)
    MatrixPlot.yAxis.tickSize(-MatrixPlot.cellsize * n)

    /*Specify the dimension of the canvas*/    
    MatrixPlot.canvas.attr("width", MatrixPlot.cellsize * n + MatrixPlot.padding)
        .attr("height", MatrixPlot.cellsize * n + MatrixPlot.padding)
        .append('g')
        .attr('transform', 'translate(' + MatrixPlot.padding + ',' + MatrixPlot.padding / 2 + ')');   
    
    /*Setup x axes*/   
    MatrixPlot.canvas.selectAll('.x.axis')
        .data(MatrixPlot.checkedFields).enter().append('g').attr('class', 'x axis')
        .attr("transform", function(d, i) {return "translate(" + (n - i - 1) * MatrixPlot.cellsize + ",0)"; })
        .each(function(d) {
            MatrixPlot.xScale.domain(MatrixPlot.domainByField[d]); 
            d3.select(this).call(MatrixPlot.xAxis); 
        });
   
    /*Setup y axes*/   
    MatrixPlot.canvas.selectAll('.y.axis')
        .data(MatrixPlot.checkedFields).enter().append('g').attr('class', 'y axis')
        .attr("transform", function(d, i) { return "translate(0, " + i * MatrixPlot.cellsize + ")"; })
        .each(function(d) {
            MatrixPlot.yScale.domain(MatrixPlot.domainByField[d]); 
            d3.select(this).call(MatrixPlot.yAxis); 
        });

   
    /*Individual Cell? */
    MatrixPlot.cell = MatrixPlot.canvas.selectAll(".cell")
        .data(MatrixPlot.cross(MatrixPlot.checkedFields, MatrixPlot.checkedFields))
        .enter().append("g").attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * MatrixPlot.cellsize + "," + d.j * MatrixPlot.cellsize + ")"; })
        .each(function(p, i){          
            var cell = d3.select(this);

            MatrixPlot.xScale.domain(MatrixPlot.domainByField[p.x]);
            MatrixPlot.yScale.domain(MatrixPlot.domainByField[p.y]);

            cell.append("rect").attr("class", "frame").attr("x", MatrixPlot.padding / 2).attr("y", MatrixPlot.padding / 2)
                .attr("width", MatrixPlot.cellsize - MatrixPlot.padding).attr("height", MatrixPlot.cellsize - MatrixPlot.padding);

            cell.selectAll("circle").data(MatrixPlot.data)
                .enter().append("circle")
                .attr("cx", function(d) { return MatrixPlot.xScale(d[p.x]); })
                .attr("cy", function(d) { return MatrixPlot.yScale(d[p.y]); })
                .attr("r", function(d){return size ? (size(d[MatrixPlot.sizeBy])) : 3; })
                .style("fill", function(d) { return MatrixPlot.colorBy ? (color(d[MatrixPlot.colorBy])) : "maroon";  });            
        });    

    // Titles for the diagonal.
    MatrixPlot.cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", MatrixPlot.padding).attr("y", MatrixPlot.padding).attr("dy", ".71em")
        .text(function(d) { return d.x; });

    MatrixPlot.chartBrush = d3.svg.brush().x(MatrixPlot.xScale).y(MatrixPlot.yScale)
        .on("brushstart", function(){/*'this' refers to the cell to which the brush is attached*/          
            MatrixPlot.chartBrushStart(this);
        })
        .on("brush", function(){MatrixPlot.chartBrushMove(this);})
        .on("brushend", MatrixPlot.chartBrushEnd);

    MatrixPlot.cell.call(MatrixPlot.chartBrush);

    d3.select(self.frameElement).style("height", MatrixPlot.cellsize * n + MatrixPlot.padding + 20 + "px");
}
MatrixPlot.prototype.cross = function(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    /*
        Return the cartesian product of a and b.      

        e.g.
        a = ['length', 'width'];
        b = ['height', 'depth'];

        c = [{x:'length', i:0, y:'height', j:0},
             {x: 'length', i:0, y:'depth', j:1},
             {x: 'width', i:1, y:'height', j:0},
             {x: 'width', i:1, y: 'depth', j:1}
        ]
    */
    for (i = 0; i < n; i++) 
        for (j = 0; j < m; j++) 
            c.push({x: a[i], i: i, y: b[j], j: j});
   
    return c; 
}