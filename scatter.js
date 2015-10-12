var ScatterPlot = function (options){
    this canvas = d3.select(options.renderTo);
    this chartW = options.chart.width;
    this chartH = options.chart.height;
    this margin = options.margin;
    this tickCounts = options.chart.grid.ticks;
    this chartX = options.position.x;
    this chartY = options.position.y;
    this xaxisName = options.series.xaxisName;
    this yaxisName = options.series.yaxisName;
    this data = options.series.data;
    this title = options.chart.title;
    this xMinMax = d3.extent(data, function(d){return d[xaxisName];});
    this yMinMax = d3.extent(data, function(d){return d[yaxisName];});

    this chartBrushStart = options.chart.brush.start.bind(this);
    this chartBrushMove = options.chart.brush.move.bind(this);
    this chartBrushEnd = options.chart.brush.end.bind(this);

    this navW = options.navigator.width;
    this navH = options.navigator.height;
    this navX = options.navigator.position.x;
    this navY = options.navigator.position.y;
    this navBrushStart = options.navigator.brush.start.bind(this);
    this navBrushMove = options.navigator.brush.move.bind(this);
    this navBrushEnd = options.navigator.brush.end.bind(this);

}
ScatterPlot.Prototype.draw() = function(){
    /*################################## BEGIN MAIN CHART ####################################*/
    var mainChart = this.canvas.append('g').attr('id', 'mainChart')
                        .attr('width', this.chartW).attr('height', this.chartH)
                        .attr('transform', function(){ return 'translate(' + this.chartX + ', ' + this.chartY + ')';
                        });

    /*Main chart x axis scale */
    var xScale = d3.scale.linear().domain(xMinMax).range([0, this.chartW]).nice();
    var xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(tickCount)

    /*Main chart y axis scale */
    var yScale = d3.scale.linear().domain(yMinMax).range([this.chartH, 0]).nice();
    var yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(tickCount)

    /*Add xAxis*/
    mainChart.append('g').attr('transform', 'translate(0, ' + this.chartH + ')').attr('class', 'x axis').call(xAxis);

    /*Add xAxis Label*/
    mainChart.append('text').attr('x', this.chartW/2).attr('y', this.chartH + margin/2)
    .style('text-anchor', 'middle').text(xaxisName);

    /*Add yAxis*/
    mainChart.append('g').attr('class', 'y axis').call(yAxis);

    /*Add yAxis Label*/
    mainChart.append('text').attr('transform', 'rotate(-90)')
    .attr('x', 0 - this.chartH/2).attr('y', 0 - margin)
    .style('text-anchor', 'middle').attr('dy', '2em').text(yaxisName);

    /*Chart title*/
    mainChart.append('text').attr('x', this.chartW/2).attr('y', 0 - margin / 2)
    .style('text-anchor', 'middle').style('text-font', '16px').text(title);

    /*Create a brush behaviour to be used on the main chart*/
    var chartBrush = d3.svg.brush().x(xScale).y(yScale).on('brushstart', chartBrushStart)
        .on("brush", chartBrushMove).on("brushend", chartBrushEnd);

    /*Attach a brush behaviour on the main chart */
    var chartBrushHandle = mainChart.append("g").attr("class", "brush").call(chartBrush);

    /*Select all the data points and join the data*/
    var chartPoints = mainChart.selectAll('circle').data(data).enter().append('circle')
        .attr("transform", function(d, i){ 
                return "translate (" + xScale(d[xaxisName]) + ", " + yScale(d[yaxisName]) + ")"
        }).attr('r', 4).on('click', function(d, i){onSelected(d3.select(this), d, i);})


    /*################################## END MAIN CHART ####################################*/

    /*################################## BEGIN NAVIGATOR CHART ####################################*/

    /*navigator xAxis scale*/
    var navXScale = d3.scale.linear().domain(xMinMax).range([0, navW]);

    /*navigator yAxis scale*/
    var navYScale = d3.scale.linear().domain(yMinMax]).range([navH,  0]);

    var navChart = this.canvas.append("g")
        .attr("transform", function(){return "translate(" + navX + ', ' + navY + ")"; })
        .attr("width", navW).attr("height", navH)

    var navPoints = navChart.selectAll("circle")
        .data(data).enter().append("circle")
        .attr("transform", function(d, i){ 
                return "translate(" + navXScale(d[xaxisName]) + "," + navYScale(d[yaxisName]) + ")"; 
                })
        .attr("r", 2);

    var navBrush = d3.svg.brush().x(navXScale).y(navYScale).extent([xMinMax, yMinMax])
        .on("brushstart", navBrushStart).on("brush", navBrushMove).on("brushend", navBrushEnd);

    var navBrushHandle = navChart.append("g").attr("class", "brush").call(navBrush);
    /*################################## END NAVIGATOR CHART ####################################*/

    chartBrushStart(); 
    navBrushStart();
    navBrushMove();

    var chartSelectedData = [];
    function chartBrushStart(){
        mainChart.classed("chart", true);
        chartSelectedData = [];
    }
    function chartBrushMove(){
        var extent = chartBrush.extent();
        var x0 = extent[0][0], y0 = extent[0][1],
            x1 = extent[1][0], y1 = extent[1][1];
        chartPoints.classed("selected", function(d) { 
                var x = inRange(d[xaxisName], x0, x1); 
                var y = inRange(d[yaxisName], y0, y1); 
                var isSelected  = x && y;

                return isSelected;
                });
    }

    function chartBrushEnd(){
        var partialData = {};
        partialData[xaxisName] = [];
        partialData[yaxisName] = [];

        var extent = chartBrush.extent();
        var x0 = extent[0][0], y0 = extent[0][1],
            x1 = extent[1][0], y1 = extent[1][1];

        var chartSelectedPoints = chartPoints.filter(function(){
                var p = d3.select(this);
                /*If the point is 'selected' and not 'hidden'*/
                return p.classed('selected') && !p.classed('hidden');
                });
        chartSelectedPoints.each(function(d, i){
                /*d={'x1': 5, 'y2': 87, 'objfn1': 58, 'objfn2': 18}*/
                for(key in partialData)//partialData:{xaxisName:[], yaxisName:[]}
                partialData[key].push(d[key]);
                //e.g
                /*partialData = {
                  'objfn1':[56, 58, 90, 345],
                  'objfn2':[32, 18, 222, 234] 
                  }
                  */
                });
        var count = partialData[xaxisName].length;
        if(count != 0 && flags['zoom']){
            /*Resize the main chart's x axis to the width of the selected navbar*/
            xScale.domain([x0, x1]);
            mainChart.selectAll('.x.axis').call(xAxis);

            /*Resize the main chart's y axis to the height of the selected navbar*/
            yScale.domain([y0, y1]);
            mainChart.selectAll('.y.axis').call(yAxis);

            var selectedData = []; 
            chartSelectedPoints.each(function(d, i){
                    selectedData.push(d);
                    });

            /*Remove previous points from the main chart before redrawing*/
            mainChart.selectAll('circle').remove();
            chartPoints = mainChart.selectAll("circle").data(selectedData).enter().append("circle")
                .attr("transform", function(d, i){ 
                        return "translate(" + xScale(d[xaxisName]) + "," + yScale(d[yaxisName]) + ")"; 
                        }).attr("r", 4)//function(d){return parseFloat(d['petal length'])})
            .classed('hidden', function(d, i){return d3.select(chartSelectedPoints[0][i]).classed('hidden');})
                .on('click', function(d, i){onSelected(d3.select(this), d, i)})
                //.on('mouseover', function(d, i){drawToolTip(d);})
                //.on('mouseout', function(d, i){emptyToolTip();});
                if(flags['tooltip'])
                    positionToolTip();


            /*navigator xAxis scale*/
            navXScale.domain([x0, x1]);

            /*navigator yAxis scale*/
            navYScale.domain([y0, y1]);

            navChart.selectAll("circle").remove();
            navPoints = navChart.selectAll("circle")
                .data(selectedData).enter().append("circle")
                .attr("transform", function(d, i){ 
                        return "translate(" + navXScale(d[xaxisName]) + "," 
                        + navYScale(d[yaxisName]) + ")"; 
                        }).attr("r", 2);
            navBrushStart();
            navBrushMove();
        }
        if(count !== 0 && flags['stat']){ 
            $('#statDiv').css('opacity', 0);
            var html = '<table>' 
                + '<thead>' 
                + '<tr><th></th>'
                + '<th>' + xaxisName + '</th><th>' + yaxisName + '</th>'
                + '</thead>'  
                + '<tfoot><tr>'
                + '<th colspan="0">Selection Size: ' + count + ' out of ' + data.length + '</th></tr>'
                + '</tfoot>' 
                + '<tbody></tbody>';

            $("#statDiv").empty();  //Clear the table before redraw
            $('#statDiv').css('opacity', 1);
            $("#statDiv").append(html);
            $.each(getStat, function(name, statFunction){
                    var html = '<tr><th align="right">' + name + ' </th>' 
                    $.each(partialData, function(axis, valuesArray){
                        html += '<td>' + statFunction(valuesArray).toFixed(3) + '</td>';
                        });
                    html += '</tr>'
                    lastRow = $("#statDiv table tbody").append(html);
                    });
        }
    }

    var getStat = {
        "Minimum":min,  "Maximum": max, "Mean": mean,
        "Variance":variance, "Std. dev.": standardDeviation
    };


    chartPoints.each(function(d, i){
            pointMap[d.lineNo] = {'main':d3.select(this), 'nav': d3.select(navPoints[0][i])};
            });

    function toolboxtip(e, msg){
        toolboxtipDiv.transition().duration(200).style('opacity', 0.9);
        toolboxtipDiv.text(msg);
        toolboxtipDiv.style('left', e.pageX+'px').style('top', (e.pageY + 10) + 'px');
    }
    function onSelected(circle, d, i){
        pointMap[d.lineNo]['main'].classed('hidden', true);
        pointMap[d.lineNo]['nav'].classed('hidden', true);
    }
    function inRange(x, arg1, arg2){ 
        var min, max;
        if(arg1 < arg2){ min = arg1; max = arg2; }
        else{ min = arg2; max = arg1;}

        return min <= x && x <= max
    }

    function navBrushStart() {
        navChart.classed("chart", true);
        $("#statDiv").css("opacity", 0);  //Clear the table before redraw
        chartPoints.classed("selected", false);
        mainChart.select('.brush').call(chartBrush.clear());    //clear main chart brush
    }

    function navBrushMove() {
        var s = navBrush.extent();
        navPoints.classed("selected", function(d) { 
                var x0 = s[0][0], y0 = s[0][1],
                x1 = s[1][0], y1 = s[1][1];

                var x = inRange(d[xaxisName], x0, x1); 
                var y = inRange(d[yaxisName], y0, y1); 
                return x && y;
                });
    }

    function navBrushEnd() {
        navChart.classed("chart", !d3.event.target.empty());
        var navSelectedData = [];

        var s = navBrush.extent();

        var x0 = s[0][0], y0 = s[0][1], x1 = s[1][0], y1 = s[1][1];
        if(navBrush.empty()){
            //Reset navbar if it's empty
            navBrush.extent([[xMin, yMin], [xMax, yMax]])
                navBrushHandle.call(navBrush); 
            navBrushStart();
            navBrushMove();
            x0 = xMin, y0 = yMin, x1 = xMax, y1 = yMax;
        }

        /*Resize the main chart's x axis to the width of the selected navbar*/
        xScale.domain([x0, x1]);
        mainChart.selectAll('.x.axis').call(xAxis);

        /*Resize the main chart's y axis to the height of the selected navbar*/
        yScale.domain([y0, y1]);
        mainChart.selectAll('.y.axis').call(yAxis);

        var selectedNavPoints = navPoints.filter(function(){return d3.select(this).classed('selected');});
        selectedNavPoints.each(function(d, i){
                navSelectedData.push(d);
                });

        /*Remove previous points from the main chart before redrawing*/
        mainChart.selectAll('circle').remove();
        chartPoints = mainChart.selectAll("circle").data(navSelectedData).enter().append("circle")
            .attr("transform", function(d, i){ 
                    return "translate(" + xScale(d[xaxisName]) + "," + yScale(d[yaxisName]) + ")"; 
                    }).attr("r", 4)//function(d){return parseFloat(d['petal length'])})
        .classed('hidden', function(d, i){return d3.select(selectedNavPoints[0][i]).classed('hidden');})
            .on('click', function(d, i){onSelected(d3.select(this), d, i)})
            //.on('mouseover', function(d, i){drawToolTip(d);})
            //.on('mouseout', function(d, i){emptyToolTip();});
            if(flags['tooltip'])
                positionToolTip();

        pointMap = {};
        chartPoints.each(function(d, i){    //Reflect the new points in the mapping as well
                pointMap[d.lineNo] = {'main':d3.select(this), 'nav': d3.select(selectedNavPoints[0][i])};
                });
    }

    function emptyToolTip(){
        div.transition()
            .duration(100)
            .style('opacity', 0);
    }

    function positionToolTip(){
        $('#d3Chart circle').tipsy({
            gravity: 'e',
            html: true,
            title: function(){
                var d = this.__data__;
                return drawToolTip(d);
            }
        });
    }

    function drawToolTip(d){
        /*Fields listed row-wise*/
        html = '<table><tbody>';
        fields.forEach(function(field, idx){
                var v = d[field];
                html += '<tr><th>' + field + '</th><td>' + trim(v, 3) +'</td></tr>';
                });
        html += '</tbody></table>'; 
        return html;
    }
}
