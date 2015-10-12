var ScatterPlot = function (options){
    var self = this;
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
    
    this.chartBrushStart = options.chart.brush.start.bind(this);
    this.chartBrushMove = options.chart.brush.move.bind(this);
    this.chartBrushEnd = options.chart.brush.end.bind(this);
    
    this.navBrushStart = options.navigator.brush.start.bind(this);
    this.navBrushMove = options.navigator.brush.move.bind(this);
    this.navBrushEnd = options.navigator.brush.end.bind(this);
    this.navX = options.navigator.posX;
    this.navY = options.navigator.posY;
}

ScatterPlot.prototype.draw = function(){
    var self = this;
    var tickCount = 5;
    self.mainChart = self.canvas.append('g').attr('id', 'mainChart')
                        .attr('width',  self.chartW).attr('height', self.chartH)
                        .attr('transform', function(){ return 'translate(' + self.chartX + ',' + self.chartY +')';});
    
    self.xScale = d3.scale.linear().domain(self.xMinMax).range([0, self.chartW]).nice();
    self.xAxis = d3.svg.axis().scale(self.xScale).orient('bottom').ticks(tickCount);
    self.mainChart.append('g').attr('transform', 'translate(0, ' + self.chartH + ')')
            .attr('class', 'x axis').call(self.xAxis);
    
    self.yScale = d3.scale.linear().domain(self.yMinMax).range([self.chartH, 0]).nice();
    self.yAxis = d3.svg.axis().scale(self.yScale).orient('left');
    self.mainChart.append('g').attr('class', 'y axis').call(self.yAxis);

    self.chartBrush = d3.svg.brush().x(self.xScale).y(self.yScale)
        .on('brushstart', self.chartBrushStart)
        .on("brush", self.chartBrushMove)
        .on("brushend", self.chartBrushEnd);

    var chartBrushHandle = self.mainChart.append("g").attr("class", "brush").call(self.chartBrush);
    self.chartPoints = self.mainChart.selectAll('circle').data(self.data).enter().append('circle')
        .attr("transform", function(d, i){ 
                var coord = "translate (" + self.xScale(d[self.xaxisName]) + ", " + self.yScale(d[self.yaxisName]) + ")";
                return coord;
        }).attr('r', 4).style('fill', 'red')

     
    self.navXScale = d3.scale.linear().domain(self.xMinMax).range([0, self.chartW]);
    self.navYScale = d3.scale.linear().domain(self.yMinMax).range([60,  0]);
    self.navChart = self.canvas.append("g").attr("transform", function(){
                                    return "translate(" + self.navX + ', ' + self.navY + ')';
                        }).attr("width", self.chartW).attr("height", 60)
                        //.style('stroke', 'black').style('stroke-width', '1px');
        
    self.navPoints = self.navChart.selectAll("circle")
        .data(self.data).enter().append("circle")
        .attr("transform", function(d, i){ 
                        return "translate(" + self.navXScale(d[self.xaxisName]) + "," 
                                + self.navYScale(d[self.yaxisName]) + ")"; 
        }).attr("r", 2);

    self.navBrush = d3.svg.brush().x(self.navXScale).y(self.navYScale).extent([self.xMinMax, self.yMinMax])
        .on("brushstart", self.navBrushStart)
        .on("brush", self.navBrushMove)
        .on("brushend", self.navBrushEnd);

    var navBrushHandle = self.navChart.append("g").attr("class", "brush").call(self.navBrush);
}

ScatterPlot.prototype.redraw = function(data, maintainNav){
    var self = this;
    self.data = data;
    self.xMinMax = d3.extent(self.data, function(d){return d[self.xaxisName];});
    self.yMinMax = d3.extent(self.data, function(d){return d[self.yaxisName];});

    self.xScale.domain(self.xMinMax);
    self.mainChart.selectAll('.x.axis').call(self.xAxis);
   
    self.yScale.domain(self.yMinMax);
    self.mainChart.selectAll('.y.axis').call(self.yAxis);

    /*Remove previous points from the main chart before redrawing*/
    self.mainChart.selectAll('circle').remove();
    self.chartPoints = self.mainChart.selectAll("circle").data(self.data).enter().append("circle")
        .attr("transform", function(d, i){ 
                return "translate(" + self.xScale(d[self.xaxisName]) + "," + self.yScale(d[self.yaxisName]) + ")"; 
    }).attr("r", 4).style('fill', 'red')
   
    if(!maintainNav){
        self.navChart.selectAll('circle').remove();
        self.navXScale.domain(xMinMax);
        self.navChart.selectAll('.x.axis').call(self.navXaXis)
        self.navYScale.domain(yMinMax);

        self.navChart.selectAll("circle").remove();
        self.navPoints = self.navChart.selectAll("circle")
    }
}
