// Set up the margin, width, and height for the main visualization SVG
var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append a div to the body to contain the title
var titleDiv = d3.select("body").insert("div", ":first-child") 
        .attr("class", "title");

// Add the title text
titleDiv.append("h1") 
        .text("Modern Portfolio Optimizator") 

// Calculate the title's height
var titleHeight = document.querySelector('.title').offsetHeight;

// Now add this titleHeight to the top position of your SVG elements
var distance_to_add_to_absolute_svg = margin.top + titleHeight + 18; 
        
// Define the 'zoomed' function that updates positions and sizes of elements based on the zoom level
function zoomed() {
    // Calculate new scales based on the zoom event
    var new_xScale = d3.event.transform.rescaleX(xScale);
    var new_yScale = d3.event.transform.rescaleY(yScale);

    // Update the position and size of the dots based on the new scales
    svg.selectAll("circle.dot")
        .attr('cx', d => new_xScale(d['Isomap-1']))
        .attr('cy', d => new_yScale(d['Isomap-2']))
        .attr('r', d => d3.event.transform.k * size(d['Marketcap'] / 2));
}

// Create the main SVG element with applied margins and zoom behavior
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(d3.zoom().on("zoom", zoomed))
    .on("dblclick.zoom", null)  // Disable double-click zoom
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
    .attr("id", "instruction-text")
    .attr("class", "inner-title") 
    .attr("x", width / 2) 
    .attr("y", margin.top) 
    .attr("text-anchor", "middle") 
    .style("font-size", "16px") 
    .text("Scroll though scatter plot and select your stocks by clicking on the circles");

// Define the x and y scales for the scatter plot
var xScale = d3.scaleLinear()
    .domain([-30, 30])
    .range([0, width]);
var yScale = d3.scaleLinear()
    .domain([-30, 30])
    .range([height, 0]);

// Define the color scale and size scale for the dots
var color = d3.scaleOrdinal(d3.schemeCategory10);
var size = d3.scaleLinear()
    .domain([0, 1e12])
    .range([1, 9]);

// Select the tooltip element in the DOM
var tooltip = d3.select("#tooltip");

// Define dimensions and create the detail SVG for displaying additional information
var detailWidth = 150;
var detailHeight = height - 200;
var detailSvg = d3.select("body").append("svg")
    .attr("width", detailWidth)
    .attr("height", detailHeight + 10)
    .style("position", "absolute")
    .style("left", `${width + margin.left + margin.right + 30}px`)
    .style("top", margin.top + distance_to_add_to_absolute_svg );

// Define a clip path to hide overflow in the detail SVG
detailSvg.append("defs").append("clipPath")
    .attr("id", "clip-detail-view")
    .append("rect")
    .attr("width", detailWidth)
    .attr("height", detailHeight);

// Create a group for the scrollable content inside the detail SVG
var detailGroup = detailSvg.append("g")
    .attr("clip-path", "url(#clip-detail-view)");

// Similar setup for returnSvg and returnGroup for displaying return information
var returnSvg = d3.select("body").append("svg")
    .attr("width", 200)
    .attr("height", detailHeight - 210)
    .style("position", "absolute")
    .style("left", `${width + margin.left + margin.right + detailWidth + 50}px`)
    .style("top", margin.top + distance_to_add_to_absolute_svg);
var returnGroup = returnSvg.append("g");


// Initialize the SVG for displaying the normal distribution curve. Set its dimensions and styling.
var normalCurveSvg = d3.select("body").append("svg")
    .attr("width", 200) // Define the width to align with other SVG elements for consistency.
    .attr("height", 200) // Define a fixed height for the SVG.
    .style("position", "absolute") // Use absolute positioning to place the SVG correctly in the layout.
    .style("left", `${width + margin.left + margin.right + detailWidth + 50}px`) // Position horizontally.
    .style("top", `${margin.top + detailHeight + margin.bottom - 220 + distance_to_add_to_absolute_svg}px`); // Position vertically.

// Create a group within the SVG to hold the curve and its elements.
var normalCurveGroup = normalCurveSvg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Function to generate the data points for the normal distribution curve based on mean and standard deviation.
function generateNormalData(mean, standardDeviation) {
    const data = [];
    // Iterate over a range of values to generate the curve's data points.
    for (let i = mean - 4 * standardDeviation; i <= mean + 4 * standardDeviation; i += 0.1) {
        // Calculate the y-value (probability density) for each x-value using the normal distribution formula.
        const pdfValue = (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - mean) / standardDeviation, 2));
        data.push({ x: i, y: pdfValue });
    }
    return data;
}

// Function to draw the normal distribution curve on the SVG
function drawNormalCurve(mean, standardDeviation) {
    // Generate the data points for the curve based on the provided mean and standard deviation
    const data = generateNormalData(mean, standardDeviation);

    // Define the x-scale. The domain is based on the mean and standard deviation, and the range is adjusted for the SVG's width.
    const x = d3.scaleLinear()
        .domain([mean - 4 * standardDeviation, mean + 4 * standardDeviation])
        .range([-40, 200 - 40]);

    // Define the y-scale. The domain is from 0 to the maximum y-value in the data, and the range is adjusted for the SVG's height.
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([200 - margin.top - margin.bottom, 0]);

    // Define the line generator for the normal curve using the D3 line method.
    const line = d3.line()
        .x(d => x(d.x)) // Set the x-coordinate based on the scaled x-value.
        .y(d => y(d.y)) // Set the y-coordinate based on the scaled y-value.
        .curve(d3.curveBasis); // Apply a curve to make the line smooth.

    // Clear any existing elements in the normal curve group to prepare for new drawing.
    normalCurveGroup.selectAll("*").remove();

    // Draw the line representing the normal curve.
    normalCurveGroup.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("class", "normal-curve-path")  // Assign the class
        .attr("d", line);

    // Create the area to the left of the mean (considered negative values) and color it red.
    const areaLeft = d3.area()
        .defined(d => d.x < 0) // Use only data points with x-values less than zero.
        .x(d => x(d.x)) // x-coordinate based on the scaled x-value.
        .y0(200 - margin.bottom) // y0-coordinate at the bottom of the SVG.
        .y1(d => y(d.y)); // y1-coordinate based on the scaled y-value.

    // Draw the area on the left side of the mean.
    normalCurveGroup.append("path")
        .datum(data.filter(d => d.x < 0)) // Bind data points to the left of zero.
        .attr("class", "light-red-PDF") // Class for styling.
        .attr("d", areaLeft); // Define the area shape.

    // Create the area to the right of the mean (considered positive values) and color it green.
    const areaRight = d3.area()
        .defined(d => d.x >= 0) // Use only data points with x-values greater than or equal to zero.
        .x(d => x(d.x)) // x-coordinate based on the scaled x-value.
        .y0(200 - margin.bottom) // y0-coordinate at the bottom of the SVG.
        .y1(d => y(d.y)); // y1-coordinate based on the scaled y-value.

    // Draw the area on the right side of the mean.
    normalCurveGroup.append("path")
        .datum(data.filter(d => d.x >= 0)) // Bind data points to the right of zero.
        .attr("class", "light-green-PDF") // Class for styling.
        .attr("d", areaRight); // Define the area shape.

    // Draw the x-axis at the bottom of the SVG with a reduced number of ticks for clarity.
    normalCurveGroup.append("g")
        .attr("transform", `translate(0, ${200 - margin.bottom})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(x).ticks(5));
}

// Initialize the SVG for the scatter plot. The width is calculated based on other SVG elements for a cohesive layout.
var scatterPlotWidth = detailWidth + 220;  // Total width is derived from the detail SVG and normal curve SVG.
var scatterPlotHeight = 207;  // Define a fixed height, but this can be adjusted as needed.

// Create the scatter plot SVG with specified dimensions and styles.
var scatterPlotSvg = d3.select("body").append("svg")
    .attr("width", scatterPlotWidth)
    .attr("height", scatterPlotHeight)
    .style("position", "absolute")  // Positioning to place it in the correct location on the page.
    .style("left", `${width + margin.left + margin.right + 30}px`)  // Align horizontally with other elements.
    .style("top", `${margin.top + detailHeight + 30 + distance_to_add_to_absolute_svg}px`);  // Position below the normal curve SVG.

// Define the x and y scales for the scatter plot. The domain is based on expected data ranges, and the range is based on SVG dimensions.
var xScaleScatter = d3.scaleLinear()
    .domain([0, 100])  // Set the domain based on the expected volatility range.
    .range([40, scatterPlotWidth - 40]);  // The range adjusts for SVG width and margins.

var yScaleScatter = d3.scaleLinear()
    .domain([0, 100])  // Set the domain based on the expected return range.
    .range([scatterPlotHeight - 30, 10]);  // The range adjusts for SVG height and margins.

// Add and style the x-axis label for the scatter plot.
scatterPlotSvg.append("text")
    .attr("class", "axis-label")  // Class for styling the label.
    .attr("transform", `translate(${scatterPlotWidth / 2}, ${scatterPlotHeight - margin.bottom + 27})`)
    .style("text-anchor", "middle")  // Center the text.
    .text("Volatility %");  // Label text.

// Add and style the y-axis label for the scatter plot.
scatterPlotSvg.append("text")
    .attr("class", "axis-label")  // Class for styling the label.
    .attr("transform", "rotate(-90)")  // Rotate the label for vertical orientation.
    .attr("y", 0 - margin.left + 45)  // Positioning along the y-axis.
    .attr("x", 0 - (scatterPlotHeight / 2))  // Positioning along the x-axis.
    .attr("dy", "1em")  // Adjust the position along the y-axis.
    .style("text-anchor", "middle")  // Center the text.
    .text("Return %");  // Label text.

// Append and position the x-axis on the scatter plot SVG.
scatterPlotSvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${scatterPlotHeight - 30})`)  // Position at the bottom of the SVG.
    .call(d3.axisBottom(xScaleScatter));  // Create the axis with the defined scale.

// Append and position the y-axis on the scatter plot SVG.
scatterPlotSvg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(40, 0)`)  // Position to the right of the SVG.
    .call(d3.axisLeft(yScaleScatter));  // Create the axis with the defined scale.

// Initialize an array to store the data points for the scatter plot.
var allPoints = [];

// Define a function to determine if a point on the scatter plot is efficient.
// An efficient point is one where no other point has higher return and lower or equal volatility.
function isEfficient(point, allPoints) {
    // Use the `some` method to check if there exists any point that dominates the current point
    return !allPoints.some(function(otherPoint) {
        return otherPoint.returnVal > point.returnVal && otherPoint.volatility <= point.volatility;
    });
}

// Initialize the tooltip
var scatterPlotTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

// Function to show and update the tooltip
function showScatterPlotTooltip(d, x, y) {
    scatterPlotTooltip.transition()
        .duration(200)
        .style("opacity", 0.9);

    // Construct a string that lists each stock with its count
    var tooltipContent = "Stocks:<br>" + d.stocks.map(stock => `${stock.symbol}: ${stock.count}`).join("<br>");

    scatterPlotTooltip.html(tooltipContent)
        .style("left", x + "px")
        .style("top", y + "px");

}
function hideScatterPlotTooltip() {
    scatterPlotTooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

// Define a function to update the scatter plot whenever a new data point is added or the data changes.
function updateScatterPlot(volatility, returnVal, associatedStocks) {
    // Construct a new point object and add it to the array of all points
    var newPoint = { volatility: volatility, returnVal: returnVal, stocks: associatedStocks };
    console.log(newPoint)
    allPoints.push(newPoint);
    
    // Re-evaluate the efficiency of all points after adding the new point
    allPoints.forEach(function(point) {
        point.isEfficient = isEfficient(point, allPoints);
    });
    
    // Bind the updated data to the circle elements in the SVG
    var circles = scatterPlotSvg.selectAll("circle.scatter-point")
        .data(allPoints);

    // Use the enter selection to create new circle elements for new data points
    circles.enter().append("circle")
        .attr("class", "scatter-point") // Assign a base class for styling
        .merge(circles) // Merge the enter selection with the update selection
        .attr("class", function(d) { // Dynamically assign a class based on the point's efficiency
            return "scatter-point " + (d.isEfficient ? "efficient" : "inefficient");
        })
        .attr("cx", function(d) { return xScaleScatter(d.volatility); }) // Set the x-position based on volatility
        .attr("cy", function(d) { return yScaleScatter(d.returnVal); }) // Set the y-position based on return
        .attr("r", 4) // Set the radius of the circle
        .on("mouseover", function(d) {
            var x = d3.event.pageX;
            var y = d3.event.pageY;
            showScatterPlotTooltip(d, x, y);
        })
        .on("mouseout", function(d) {
            hideScatterPlotTooltip();
        });
    
    // Use the exit selection to remove circles that no longer correspond to data points
    circles.exit().remove();
}

// Create a button on the webpage to record data points
var recordButton = d3.select("body").append("button")
    .text("Record Point") // Set the button text
    .style("position", "absolute") // Position the button absolutely for layout control
    .style("left", `${width + margin.left + margin.right + 30}px`) // Set the left position
    .style("top", `${margin.top + detailHeight + scatterPlotHeight + 50 + distance_to_add_to_absolute_svg}px`); // Set the top position

// Initialize variables for tracking the translation (scrolling/panning) of the detail SVG
var currentTranslation = 0;
var maxTranslation = 0;

// Declare variables to hold data; they will be populated asynchronously
var data, stockData;


Promise.all([
    d3.csv("sp_500_clustering.csv"),
    d3.csv("sp_500_stocks.csv")
]).then(function (files) {
    data = files[0];
    stockData = files[1];

    // Initial data parsing, as you already have in your code
    data.forEach(function (d) {
        d['Isomap-1'] = parseFloat(d['Isomap-1']);
        d['Isomap-2'] = parseFloat(d['Isomap-2']);
        d['Marketcap'] = parseFloat(d['Marketcap']);
        d['Cluster'] = parseInt(d['Cluster']);
        d.selectionCount = 0;
    });

    // Expand the stockData parsing to process the last 1260 columns of daily returns
    stockData.forEach(function (d) {
        d['Year 1 Returns'] = parseFloat(d['Year 1 Returns']);
        d['Year 2 Returns'] = parseFloat(d['Year 2 Returns']);
        d['Year 3 Returns'] = parseFloat(d['Year 3 Returns']);
        d['Year 4 Returns'] = parseFloat(d['Year 4 Returns']);
        d['Year 5 Returns'] = parseFloat(d['Year 5 Returns']);

        // Add a new property to store the daily returns for the last 5 years
        d.dailyReturns = [];

        // Assume that the CSV has columns for each day, like "2024-03-20", "2024-03-19", etc.
        // We want the last 1260 of these, excluding any NaN values
        var returnColumns = Object.keys(d).slice(-1260).filter(function (key) {
            return !isNaN(d[key]) && key.indexOf('Year') === -1; // This excludes Year columns and NaNs
        });

        // Store only the return values, converted to numbers
        d.dailyReturns = returnColumns.map(function (key) {
            return parseFloat(d[key]);
        }).filter(function (value) {
            return !isNaN(value); // This excludes any NaNs from the daily returns
        });
    });

    var scatter = svg.append('g')
        .attr("clip-path", "url(#clip)");

    var circles = scatter.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) { return xScale(d['Isomap-1']); })
        .attr("cy", function (d) { return yScale(d['Isomap-2']); })
        .attr("r", function (d) { return size(d['Marketcap']/2); })
        .style("fill", function (d) { return color(d['Cluster']); })
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d['Shortname'] + "<br/>" + d['Symbol'])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    circles.on("click", function (d) {
            // Check for the first selection
        if (d3.select("#instruction-text").empty() === false) {
            // Remove the instruction text
            d3.select("#instruction-text").remove();
        }

        if (d3.event.ctrlKey || d3.event.metaKey) {
            d.selectionCount = 0;
        } else {
            d.selectionCount++;
        }

        d3.select(this).classed("selected", d.selectionCount > 0)
            .style("opacity", d.selectionCount > 0 ? 1 : 0.5);

        // Update the details view
        updateDetailView();
    });

    function calculateYearlyAverageReturn(stock) {
        var yearlyReturns = ['Year 1 Returns', 'Year 2 Returns', 'Year 3 Returns', 'Year 4 Returns', 'Year 5 Returns']
            .map(key => stock[key])
            .filter(val => !isNaN(val)); // Filter out NaN values
    
        return yearlyReturns.length > 0 ? d3.mean(yearlyReturns) : 0;
    }
    

    function calculateAverageReturn(dailyReturns) {
        // Use simple-statistics to calculate the mean, excluding NaNs
        return ss.mean(dailyReturns.filter(r => !isNaN(r)));
    }

    function calculatePortfolioReturn(selectedData, stockData) {
        var totalWeight = d3.sum(selectedData, d => d.Currentprice * d.selectionCount);
        var portfolioReturn = 0;
    
        if (totalWeight > 0) {
            selectedData.forEach(d => {
                var stock = stockData.find(s => s.Symbol === d.Symbol);
                var averageYearlyReturn = calculateYearlyAverageReturn(stock);
                portfolioReturn += (d.Currentprice * d.selectionCount) / totalWeight * averageYearlyReturn;
            });
        }
    
        return portfolioReturn; // This is now a weighted average of the yearly returns
    }

    function calculateVariance(dailyReturns) {
        // Use simple-statistics to calculate the variance, excluding NaNs
        return ss.variance(dailyReturns.filter(r => !isNaN(r)));
    }

    function calculateCovariance(dailyReturns1, dailyReturns2) {
        // Make sure both arrays are the same length
        const length = Math.min(dailyReturns1.length, dailyReturns2.length);
        dailyReturns1 = dailyReturns1.slice(0, length);
        dailyReturns2 = dailyReturns2.slice(0, length);
    
        // Use simple-statistics to calculate the covariance, excluding NaNs
        return ss.sampleCovariance(dailyReturns1, dailyReturns2);
    }

    function calculatePortfolioVolatility(selectedData, stockData) {
        // Calculate the weighted average return for the portfolio
        var totalWeight = d3.sum(selectedData, d => d.Currentprice * d.selectionCount);
        var portfolioReturn = d3.sum(selectedData, d => {
            var stock = stockData.find(s => s.Symbol === d.Symbol);
            return (stock.Currentprice * d.selectionCount)*100 / totalWeight * calculateAverageReturn(stock.dailyReturns);
        });

        // Calculate portfolio variance
        var portfolioVariance = 0;
        selectedData.forEach(stock_i => {
            var stock_i_data = stockData.find(s => s.Symbol === stock_i.Symbol);
            var weight_i = (stock_i.Currentprice * stock_i.selectionCount) / totalWeight;
            var variance_i = calculateVariance(stock_i_data.dailyReturns);
            portfolioVariance += weight_i * weight_i * variance_i;

            selectedData.forEach(stock_j => {
                if (stock_i.Symbol !== stock_j.Symbol) {
                    var stock_j_data = stockData.find(s => s.Symbol === stock_j.Symbol);
                    var weight_j = (stock_j.Currentprice * stock_j.selectionCount) / totalWeight;
                    var covariance_ij = calculateCovariance(stock_i_data.dailyReturns, stock_j_data.dailyReturns);
                    portfolioVariance += 2 * weight_i * weight_j * covariance_ij;
                }
            });
        });

        // Compute portfolio volatility
        var portfolioVolatility = Math.sqrt(portfolioVariance * 252);

        // Return the results
        return {
            portfolioReturn: (portfolioReturn).toFixed(4),
            portfolioVolatility: (portfolioVolatility * 100).toFixed(2)
        };
    }

    function updateDetailView() {
        var selectedData = data.filter(d => d.selectionCount > 0);

        var texts = detailGroup.selectAll("text")
            .data(selectedData, d => d['Symbol']);

        // Enter and update
        texts.enter()
            .append("text")
            .merge(texts)
            .attr("x", 10)
            .attr("y", (d, i) => 20 * (i + 1)) // Dynamic y-position
            .text(d => `${d['Symbol']}: ${d.selectionCount}`);

        // Exit
        texts.exit().remove();

        // Update the maxTranslation based on the number of selected items
        var newHeight = 20 * selectedData.length;
        detailSvg.select("defs clipPath rect").attr("height", newHeight); // Adjust clipPath height dynamically
        maxTranslation = Math.max(0, newHeight - detailHeight);

        // Update return view
        updateReturnView(selectedData);
    }

    // And when updating the return view:
    function updateReturnView(selectedData) {
        var portfolioReturn = calculatePortfolioReturn(selectedData, stockData) * 100; // Multiply by 100 to convert to percentage
        var volatilityResults = calculatePortfolioVolatility(selectedData, stockData);

        // Now draw the normal curve based on the latest values
        const mean = parseFloat(portfolioReturn);
        const standardDeviation = parseFloat(volatilityResults.portfolioVolatility); // Adjust this calculation based on your data
        drawNormalCurve(mean, standardDeviation);


        // Update the portfolio return and volatility display
        returnGroup.selectAll("text.return-text, text.volatility-text").remove(); // Clear existing texts

        // Display portfolio return
        returnGroup.append("text")
            .attr("class", "return-text")
            .attr("x", 10)
            .attr("y", 20)
            .text(`Portfolio Return: ${portfolioReturn.toFixed(2)}%`);

        // Display portfolio volatility
        returnGroup.append("text")
            .attr("class", "volatility-text")
            .attr("x", 10)
            .attr("y", 40)
            .text(`Portfolio Volatility: ${volatilityResults.portfolioVolatility}%`);
    }

    // Scroll event handler for the detail SVG
    detailSvg.on("wheel", function() {
        var deltaY = d3.event.deltaY;
        currentTranslation = Math.max(0, Math.min(currentTranslation - deltaY, maxTranslation));
        detailGroup.attr("transform", `translate(0,${-currentTranslation})`);
    });


    recordButton.on("click", function() {
        // Record the current point in the scatterplot
        var selectedData = data.filter(d => d.selectionCount > 0);
        var portfolioReturn = calculatePortfolioReturn(selectedData, stockData) * 100;
        var volatilityResults = calculatePortfolioVolatility(selectedData, stockData);
        var associatedStocks = selectedData.map(d => ({symbol: d.Symbol, count: d.selectionCount}));

        updateScatterPlot(volatilityResults.portfolioVolatility, portfolioReturn, associatedStocks);
    
        // Reset selections
        data.forEach(function(d) {
            d.selectionCount = 0;
        });
        svg.selectAll("circle.dot")
            .classed("selected", false)
            .style("opacity", 0.5);
    
        updateDetailView();
    });

});
