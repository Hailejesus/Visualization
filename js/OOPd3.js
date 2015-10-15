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