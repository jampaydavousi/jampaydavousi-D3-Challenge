//Set the svg chart area
var svgWidth = 800;
var svgHeight = 600;

// Margin spacing for graph, and axis labels at the bottom and left, and text
var margin = 20;
var marginTop = 20;
var marginRight= 40;
var marginBottom = 40;
var marginLeft = 40;
var marginText = 100;

//Set the width and heigth variables
var width = svgWidth - marginLeft - marginRight;
var height = svgHeight - marginTop - marginBottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${marginLeft}, ${marginTop})`);

// Create group of x-axis labels.
chartGroup.append("g")
  .attr("class", "labelXAxis");

var labelXAxis = d3.select(".labelXAxis");

function XAxis() {
  labelXAxis.attr("transform", "translate(" +
      ((width - marginText) / 2 + marginText) +
      ", " +(height - margin - marginBottom) + ")"
  );
}
XAxis();

// Append all three x -axis labels, including the label for 
//the default active x-axis with respective y-axis values.
labelXAxis
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
labelXAxis
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
labelXAxis
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// Adjust margins
var marginTextX = margin + marginLeft;
var marginTextY = (height + marginText) / 2 - marginText;

// Create group of y-axis labels.
chartGroup.append("g")
.attr("class", "labelYAxis");

var labelYAxis = d3.select(".labelYAxis");

function YAxis() {
  labelYAxis.attr("transform", "translate(" + 
  marginTextX + ", " + marginTextY + ")rotate(-90)");
}
YAxis();

// Append all three y-axis labels, including the label for 
// the default active y-axis.
labelYAxis
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");
labelYAxis
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");
labelYAxis
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;
  
  render(data);
});

//set initial deafult data that is displayed
function render(chartData) {

  var currentX = "poverty";
  var currentY = "obesity";

  // Use d3-tip.js instead of tooltip per Justin Palmer at 
  // https://github.com/Caged.
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      console.log(d)
      
      var chosenXAxis;
      var current = "<div>" + d.state + "</div>";
      var chosenYAxis = "<div>" + currentY + ": " + d[currentY] + "%</div>";
      
      if (currentX === "poverty") {
        chosenXAxis = "<div>" + currentX + ": " + d[currentX] + "%</div>";
      }
      else {
        chosenXAxis = "<div>" +
          currentX +
          ": " +
          parseFloat(d[currentX]).toLocaleString("en") +
          "</div>";
      }
      return current + chosenXAxis + chosenYAxis;
    });
  chartGroup.call(toolTip);

   // set min and max of x and y.
    var xMin;
    var xMax;
    var yMin;
    var yMax;

  function rangeX() {
    xMin = d3.min(chartData, (d) => {
      return parseFloat(d[currentX]) * 0.90;
    });
    xMax = d3.max(chartData, (d) => {
      return parseFloat(d[currentX]) * 1.10;
    });
  }

  function rangeY() {
    yMin = d3.min(chartData, function(d) {
      return parseFloat(d[currentY]) * 0.90;
    });
    yMax = d3.max(chartData, function(d) {
      return parseFloat(d[currentY]) * 1.10;
    });
  }

 // Update chart when different variable is selected 
  function update(axis, selected) {
    d3.selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    selected.classed("inactive", false).classed("active", true);
  }

  // Calculate the max and min for both x-axis and y-axis values
  rangeX();
  rangeY();

  var xLinearScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([margin + marginText, width - margin]);

  var yLinearScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - marginText, margin]);

  var xAxis = d3.axisBottom(xLinearScale);
  var yAxis = d3.axisLeft(yLinearScale);

  // Define the marker and the respective function for all circle markers
  var marker;
  function renderCircles() {
    if (width <= 530) {
      marker = 5;
    }
    else {
      marker = 10;
    }
  }
  renderCircles();
  
  // Append chart label elements
  chartGroup.append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - marginText) + ")");
  chartGroup.append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + marginText) + ", 0)");

   // Append the data values for the circle markers
  var circlesGroup = chartGroup.selectAll("circles")
    .data(chartData)
    .enter();

  // Append values for markers per state
  circlesGroup.append("circle")
    .attr("cx", function(d) {
      return xLinearScale(d[currentX]);
    })
    .attr("cy", function(d) {
      return yLinearScale(d[currentY]);
    })
    .attr("r", marker)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })

    // Add mouse hover and move-off rules and attributes
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "#e3e3e3");
    });

  // Append matching labels per state
  circlesGroup.append("text")
    .text(function(d) {
      return d.abbr;
    })
    .attr("dx", function(d) {
      return xLinearScale(d[currentX]);
    })
    .attr("dy", function(d) {

      // Place the label in the middle of each state market
      return yLinearScale(d[currentY]) + marker / 2.5;
    })
    .attr("font-size", marker)
    .attr("class", "stateText")
    
    // Add mouse hover and move-off rules and attributes
    .on("mouseover", function(d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  // Add 'click' functionality that sets new varaibles ACTIVE
  d3.selectAll(".aText").on("click", function() {
    var clicked = d3.select(this);
    if (clicked.classed("inactive")) {
      var axis = clicked.attr("data-axis");
      var name = clicked.attr("data-name");

      if (axis === "x") {
        currentX = name;

        rangeX();

        xLinearScale.domain([xMin, xMax]);

        chartGroup.select(".xAxis").transition()
        .duration(1000)
        .call(xAxis);

        d3.selectAll("circle").each(function() {
          d3.select(this).transition()
            .attr("cx", (d) => {
              return xLinearScale(d[currentX]);
            })
            .duration(1000);
        });

        d3.selectAll(".stateText").each(function()  {
          d3.select(this).transition()
            .attr("dx", (d) => {
              return xLinearScale(d[currentX]);
            })
            .duration(1000);
        });

        update(axis, clicked);
      }
      else {
        currentY = name;

        rangeY();

        // Get new y values for the respective selection and update y-axis
        yLinearScale.domain([yMin, yMax]);
        chartGroup.select(".yAxis").transition()
        .duration(1000)
        .call(yAxis);

        d3.selectAll("circle").each(function() {
          d3.select(this)
            .transition()
            .attr("cy", function(d) {
              return yLinearScale(d[currentY]);
            })
            .duration(1000);
        });

        d3.selectAll(".stateText").each(function() {
          d3.select(this)
            .transition()
            .attr("dy", function(d) {
              return yLinearScale(d[currentY]) + marker / 3;
            })
            .duration(1000);
        });

        // Update Chart
        update(axis, clicked);
      }
    }
  });
}