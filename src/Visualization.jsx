import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import * as d3 from 'd3'
import * as ss from 'simple-statistics'
import './Visualization.module.css'

function Visualization () {
    
    const showBrands = useRef(false)
    const initialized = useRef(false)
    const firstSelection = useRef(true)

    const location = useLocation()
    const brandData = location.state


    useEffect(() => {
        if(!initialized.current) {
            initialized.current = true

            if(brandData != null) {
                showBrands.current = true
            }

            var titleDiv = d3.select("#d3-container").insert("div", ":first-child") 
            .attr("class", "title")
            .style("text-align", "center")

            titleDiv.append("h1") 
                .text("Modern Portfolio Optimizer")

            var margin = { top: 10, right: 30, bottom: 30, left: 40 },
            width = 900 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

            var titleHeight = document.querySelector('.title').offsetHeight;

            var distance_to_add_to_absolute_svg = margin.top + titleHeight + 18;

            var xScale = d3.scaleLinear()
                .domain([-30, 30])
                .range([0, width]);
            var yScale = d3.scaleLinear()
                .domain([-30, 30])
                .range([height, 0]);

            var svg = d3.select("#d3-container").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .call(d3.zoom().on("zoom", zoomed))
                .on("dblclick.zoom", null)
                .style("margin-left", "1%")
                .style("position", "absolute")
                .style("top", margin.top + distance_to_add_to_absolute_svg )
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            
            svg.append("text")
                .attr("id", "instruction-text")
                .attr("class", "inner-title") 
                .attr("x", width / 2) 
                .attr("y", margin.top) 
                .attr("text-anchor", "middle") 
                .style("font-size", "16px") 
                .text("Scroll though scatter plot and select your stocks by clicking on the circles");

            var color = d3.scaleOrdinal(d3.schemeCategory10);
            var size = d3.scaleLinear()
                    .domain([0, 1e12])
                    .range([1, 9]);

            var tooltip = d3.select("#d3-container").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "rgb(217, 230, 255)")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px")
                .style("font-size", "12px")
                .style("text-align", "center")
                .style("z-index", 5)

            var detailWidth = 150;
            var detailHeight = height - 200;
            var detailSvg = d3.select("#d3-container").append("svg")
                .attr("width", detailWidth)
                .attr("height", detailHeight + 10)
                .style("position", "absolute")
                .style("left", `${width + margin.left + margin.right + 30}px`)
                .style("top", margin.top + distance_to_add_to_absolute_svg );

            detailSvg.append("defs").append("clipPath")
                .attr("id", "clip-detail-view")
                .append("rect")
                .attr("width", detailWidth)
                .attr("height", detailHeight);

            var detailGroup = detailSvg.append("g")
                .attr("clip-path", "url(#clip-detail-view)");
            
            var returnSvg = d3.select("#d3-container").append("svg")
                .attr("width", 200)
                .attr("height", detailHeight - 210)
                .style("position", "absolute")
                .style("left", `${width + margin.left + margin.right + detailWidth + 50}px`)
                .style("top", margin.top + distance_to_add_to_absolute_svg);
            var returnGroup = returnSvg.append("g");

            var normalCurveSvg = d3.select("#d3-container").append("svg")
                .attr("width", 200) 
                .attr("height", 200) 
                .style("position", "absolute") 
                .style("left", `${width + margin.left + margin.right + detailWidth + 50}px`)
                .style("top", `${margin.top + detailHeight + margin.bottom - 220 + distance_to_add_to_absolute_svg}px`);

            var normalCurveGroup = normalCurveSvg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            var scatterPlotWidth = detailWidth + 220;
            var scatterPlotHeight = 207;

            var scatterPlotSvg = d3.select("#d3-container").append("svg")
                .attr("width", scatterPlotWidth)
                .attr("height", scatterPlotHeight)
                .style("position", "absolute")  
                .style("left", `${width + margin.left + margin.right + 30}px`)  
                .style("top", `${margin.top + detailHeight + 30 + distance_to_add_to_absolute_svg}px`)

            var xScaleScatter = d3.scaleLinear()
                .domain([0, 100])  
                .range([40, scatterPlotWidth - 40]);  

            var yScaleScatter = d3.scaleLinear()
                .domain([0, 100])  
                .range([scatterPlotHeight - 30, 10]); 

            scatterPlotSvg.append("text")
                .attr("class", "axis-label")  // Class for styling the label.
                .attr("transform", `translate(${scatterPlotWidth / 2}, ${scatterPlotHeight - margin.bottom + 27})`)
                .style("text-anchor", "middle")  // Center the text.
                .text("Volatility %")  // Label text.
                .style("font-size", "10px");
            
            scatterPlotSvg.append("text")
                .attr("class", "axis-label")  // Class for styling the label.
                .attr("transform", "rotate(-90)")  // Rotate the label for vertical orientation.
                .attr("y", 0 - margin.left + 45)  // Positioning along the y-axis.
                .attr("x", 0 - (scatterPlotHeight / 2))  // Positioning along the x-axis.
                .attr("dy", "1em")  // Adjust the position along the y-axis.
                .style("text-anchor", "middle")  // Center the text.
                .text("Return %")  // Label text.
                .style("font-size", "10px");
            
            scatterPlotSvg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${scatterPlotHeight - 30})`)  // Position at the bottom of the SVG.
                .call(d3.axisBottom(xScaleScatter));  // Create the axis with the defined scale.

            d3.select(".x-axis")
                .selectAll("text")
                .style("font-size", "10px");
            
            scatterPlotSvg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(40, 0)`)  // Position to the right of the SVG.
                .call(d3.axisLeft(yScaleScatter));

            d3.select(".y-axis")
                .selectAll("text")
                .style("font-size", "10px");

            var allPoints = [];

            var scatterPlotTooltip = d3.select("#d3-container").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px")
                .style("font-size", "12px")
                .style("text-align", "center")
                .style("z-index", 5)

            var recordButton = d3.select("#d3-container").append("button")
                .text("Record Point") // Set the button text
                .style("position", "absolute") // Position the button absolutely for layout control
                .style("left", `${width + margin.left + margin.right + 30}px`) // Set the left position
                .style("top", `${margin.top + detailHeight + scatterPlotHeight + 50 + distance_to_add_to_absolute_svg}px`); // Set the top position
            
            var brandsButton = d3.select("#d3-container").append("button")
                .text("Toggle Brand Preferences") // Set the button text
                .style("position", "absolute") // Position the button absolutely for layout control
                .style("left", `${width + margin.left + margin.right + 150}px`) // Set the left position
                .style("top", `${margin.top + detailHeight + scatterPlotHeight + 50 + distance_to_add_to_absolute_svg}px`) // Set the top position
                .style("opacity", function() {
                    if(brandData == null) {
                        return 0.5
                    } else {
                        return 1
                    }
                })

            var brandStatus = d3.select("#d3-container").append("button")
                .text(function() {
                    if(brandData == null) {
                        return "Off"
                    }
                    return "On"
                })
                .style("position", "absolute")
                .style("left", `${width + margin.left + margin.right + 345}px`)
                .style("top", `${margin.top + detailHeight + scatterPlotHeight + 50 + distance_to_add_to_absolute_svg}px`)
                .style("opacity", function() {
                    if(brandData == null) {
                        return 0.5
                    }
                    return 1
                })
                .style("background-color", function() {
                    if (brandData == null) {
                        return "lightcoral"
                    }
                    return "#4CAF50"
                })


            var currentTranslation = 0;
            var maxTranslation = 0;
            
            var data, stockData;

            function zoomed(event) {
                var new_xScale = event.transform.rescaleX(xScale);
                var new_yScale = event.transform.rescaleY(yScale);
            
                svg.selectAll("circle.dot")
                    .attr('cx', d => new_xScale(d['Isomap-1']))
                    .attr('cy', d => new_yScale(d['Isomap-2']))
                    .attr('r', d => event.transform.k * size(d['Marketcap'] / 2));
            }

            function generateNormalData(mean, standardDeviation) {
                const data = [];
                for (let i = mean - 4 * standardDeviation; i <= mean + 4 * standardDeviation; i += 0.1) {
                    const pdfValue = (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((i - mean) / standardDeviation, 2));
                    data.push({ x: i, y: pdfValue });
                }
                return data;
            }

            function drawNormalCurve(mean, standardDeviation) {
                const data = generateNormalData(mean, standardDeviation);
            
                const x = d3.scaleLinear()
                    .domain([mean - 4 * standardDeviation, mean + 4 * standardDeviation])
                    .range([-40, 200 - 40]);
            
                const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.y)])
                    .range([200 - margin.top - margin.bottom, 0]);
            
                const line = d3.line()
                    .x(d => x(d.x)) // Set the x-coordinate based on the scaled x-value.
                    .y(d => y(d.y)) // Set the y-coordinate based on the scaled y-value.
                    .curve(d3.curveBasis); // Apply a curve to make the line smooth.
            
                normalCurveGroup.selectAll("*").remove();
            
                normalCurveGroup.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("class", "normal-curve-path")  // Assign the class
                    .attr("d", line);
            
                const areaLeft = d3.area()
                    .defined(d => d.x < 0) // Use only data points with x-values less than zero.
                    .x(d => x(d.x)) // x-coordinate based on the scaled x-value.
                    .y0(200 - margin.bottom) // y0-coordinate at the bottom of the SVG.
                    .y1(d => y(d.y)); // y1-coordinate based on the scaled y-value.
            
                normalCurveGroup.append("path")
                    .datum(data.filter(d => d.x < 0)) // Bind data points to the left of zero.
                    .attr("class", "light-red-PDF") // Class for styling.
                    .attr("d", areaLeft) // Define the area shape.
                    .attr("fill", "lightcoral");
            
                const areaRight = d3.area()
                    .defined(d => d.x >= 0) // Use only data points with x-values greater than or equal to zero.
                    .x(d => x(d.x)) // x-coordinate based on the scaled x-value.
                    .y0(200 - margin.bottom) // y0-coordinate at the bottom of the SVG.
                    .y1(d => y(d.y)); // y1-coordinate based on the scaled y-value.
            
                normalCurveGroup.append("path")
                    .datum(data.filter(d => d.x >= 0)) // Bind data points to the right of zero.
                    .attr("class", "light-green-PDF") // Class for styling.
                    .attr("d", areaRight) // Define the area shape.
                    .attr("fill", "lightgreen");
            
                normalCurveGroup.append("g")
                    .attr("transform", `translate(0, ${200 - margin.bottom})`)
                    .attr("class", "x-axis")
                    .call(d3.axisBottom(x).ticks(5));

                d3.select(".x-axis")
                    .selectAll("text")
                    .style("font-size", "10px");
            }

            function isEfficient(point, allPoints) {
                return !allPoints.some(function(otherPoint) {
                    return otherPoint.returnVal > point.returnVal && otherPoint.volatility <= point.volatility;
                });
            }

            function showScatterPlotTooltip(d) {
                scatterPlotTooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                var pointData = d.srcElement.__data__
                var tooltipContent = '(Ret: '+ pointData.returnVal.toFixed(2) + '%, Vol: ' + pointData.volatility + '%)<br>' + "Stocks:<br>" + pointData.stocks.map(stock => `${stock.symbol}: ${stock.count}`).join("<br>");
                
                scatterPlotTooltip.html(tooltipContent)
                    .style("left", d.x + 5 + "px")
                    .style("top", d.y - 17 + "px")
            
            }

            function hideScatterPlotTooltip() {
                scatterPlotTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            }

            function updateScatterPlot(volatility, returnVal, associatedStocks, event) {
                var newPoint = { volatility: volatility, returnVal: returnVal, stocks: associatedStocks };
                allPoints.push(newPoint);
                
                allPoints.forEach(function(point) {
                    point.isEfficient = isEfficient(point, allPoints);
                });
                
                var circles = scatterPlotSvg.selectAll("circle.scatter-point")
                    .data(allPoints);
            
                circles.enter().append("circle")
                    .attr("class", "scatter-point") // Assign a base class for styling
                    .merge(circles) // Merge the enter selection with the update selection
                    .attr("class", function(d) { // Dynamically assign a class based on the point's efficiency
                        return "scatter-point " + (d.isEfficient ? "efficient" : "inefficient");
                    })
                    .attr("fill", function(d) {
                        return (d.isEfficient ? "rgb(94, 138, 233)" : "rgb(232, 126, 126)")
                    })
                    .attr("cx", function(d) { return xScaleScatter(d.volatility); }) // Set the x-position based on volatility
                    .attr("cy", function(d) { return yScaleScatter(d.returnVal); }) // Set the y-position based on return
                    .attr("r", 4) // Set the radius of the circle
                    .on("mouseover", function(d) {
                        var x = event;
                        var y = event;
                        showScatterPlotTooltip(d, x, y);
                    })
                    .on("mouseout", function(d) {
                        hideScatterPlotTooltip();
                    });
                
                circles.exit().remove();
            }

            Promise.all([
                d3.csv("sp_500_clustering.csv"),
                d3.csv("sp_500_stocks.csv")
            ]).then(function (files) {
                data = files[0];
                stockData = files[1];
            
                data.forEach(function (d) {
                    d['Isomap-1'] = parseFloat(d['Isomap-1']);
                    d['Isomap-2'] = parseFloat(d['Isomap-2']);
                    d['Marketcap'] = parseFloat(d['Marketcap']);
                    d['Cluster'] = parseInt(d['Cluster']);
                    d.selectionCount = 0;
                });
            
                stockData.forEach(function (d) {
                    d['Year 1 Returns'] = parseFloat(d['Year 1 Returns']);
                    d['Year 2 Returns'] = parseFloat(d['Year 2 Returns']);
                    d['Year 3 Returns'] = parseFloat(d['Year 3 Returns']);
                    d['Year 4 Returns'] = parseFloat(d['Year 4 Returns']);
                    d['Year 5 Returns'] = parseFloat(d['Year 5 Returns']);
            
                    d.dailyReturns = [];
            
                    var returnColumns = Object.keys(d).slice(-1260).filter(function (key) {
                        return !isNaN(d[key]) && key.indexOf('Year') === -1; // This excludes Year columns and NaNs
                    });
            
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
                    .style("opacity", function (d) {
                        const circle_symbol = d.Symbol
                        if (brandData == null) {
                            return 0.5
                        }
                        if (brandData.includes(circle_symbol) && brandData != null) {
                            return 1
                        }
                        return 0.15
                    })
                    .on("mouseover", function (d, event) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(event.Shortname + "<br/>" + event.Symbol)
                            .style("left", d.x + 10 +"px")
                            .style("top", d.y - 15 + "px");
                    })
                    .on("mouseout", function (d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            
                circles.on("click", function (d, event) {
                    if (d3.select("#instruction-text").empty() === false) {
                        d3.select("#instruction-text").remove();
                    }

                    if (firstSelection.current) {
                        scatter.selectAll(".dot").style("opacity", 0.5)
                        firstSelection.current = false
                    }

                    showBrands.current = false
                    brandStatus.style("background-color", "lightcoral")
                    brandStatus.text("Off")

            
                    if (d.ctrlKey || d.metaKey) {
                        event.selectionCount = 0;
                    } else {
                        event.selectionCount++;
                    }
            
                    d3.select(this).classed("selected", event.selectionCount > 0)
                        .style("opacity", event.selectionCount > 0 ? 1 : 0.5);
            
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
                    return ss.variance(dailyReturns.filter(r => !isNaN(r)));
                }
            
                function calculateCovariance(dailyReturns1, dailyReturns2) {
                    const length = Math.min(dailyReturns1.length, dailyReturns2.length);
                    dailyReturns1 = dailyReturns1.slice(0, length);
                    dailyReturns2 = dailyReturns2.slice(0, length);
                
                    return ss.sampleCovariance(dailyReturns1, dailyReturns2);
                }
            
                function calculatePortfolioVolatility(selectedData, stockData) {
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
            
                    var portfolioVolatility = Math.sqrt(portfolioVariance * 252);
            
                    return {
                        portfolioReturn: (portfolioReturn).toFixed(4),
                        portfolioVolatility: (portfolioVolatility * 100).toFixed(2)
                    };
                }
            
                function updateDetailView() {
                    var selectedData = data.filter(d => d.selectionCount > 0);
                    // console.log(selectedData)
            
                    var texts = detailGroup.selectAll("text")
                        .data(selectedData, d => d['Symbol']);
            
                    texts.enter()
                        .append("text")
                        .merge(texts)
                        .attr("x", 10)
                        .attr("y", (d, i) => 20 * (i + 1)) // Dynamic y-position
                        .text(d => `${d['Symbol']}: ${d.selectionCount}`);
            
                    texts.exit().remove();
            
                    var newHeight = 20 * selectedData.length;
                    detailSvg.select("defs clipPath rect").attr("height", newHeight); // Adjust clipPath height dynamically
                    maxTranslation = Math.max(0, newHeight - detailHeight);
            
                    updateReturnView(selectedData);
                }
            
                function updateReturnView(selectedData) {
                    var portfolioReturn = calculatePortfolioReturn(selectedData, stockData) * 100; // Multiply by 100 to convert to percentage
                    var volatilityResults = calculatePortfolioVolatility(selectedData, stockData);
            
                    const mean = parseFloat(portfolioReturn);
                    const standardDeviation = parseFloat(volatilityResults.portfolioVolatility); // Adjust this calculation based on your data
                    drawNormalCurve(mean, standardDeviation);
            
            
                    returnGroup.selectAll("text.return-text, text.volatility-text").remove(); // Clear existing texts
            
                    returnGroup.append("text")
                        .attr("class", "return-text")
                        .attr("x", 10)
                        .attr("y", 20)
                        .text(`Portfolio Return: ${portfolioReturn.toFixed(2)}%`);
            
                    returnGroup.append("text")
                        .attr("class", "volatility-text")
                        .attr("x", 10)
                        .attr("y", 40)
                        .text(`Portfolio Volatility: ${volatilityResults.portfolioVolatility}%`);
                }
            
                detailSvg.on("wheel", function(event) {
                    var deltaY = event.deltaY;
                    currentTranslation = Math.max(0, Math.min(currentTranslation - deltaY, maxTranslation));
                    detailGroup.attr("transform", `translate(0,${-currentTranslation})`);
                });
            
            
                recordButton.on("click", function() {
                    var selectedData = data.filter(d => d.selectionCount > 0);
                    if (selectedData.length === 0) {
                        return
                    }
                    var portfolioReturn = calculatePortfolioReturn(selectedData, stockData) * 100;
                    var volatilityResults = calculatePortfolioVolatility(selectedData, stockData);
                    var associatedStocks = selectedData.map(d => ({symbol: d.Symbol, count: d.selectionCount}));
            
                    updateScatterPlot(volatilityResults.portfolioVolatility, portfolioReturn, associatedStocks);
                
                    data.forEach(function(d) {
                        d.selectionCount = 0;
                    });
                    svg.selectAll("circle.dot")
                        .classed("selected", false)
                        .style("opacity", 0.5);
                
                    updateDetailView();

                    showBrands.current = false
                    brandStatus.style("background-color", "lightcoral")
                    brandStatus.text("Off")

                    firstSelection.current = true
                });

                brandsButton.on("click", function() {
                    if (brandData != null) {
                        const currentShowBrands = !showBrands.current

                        if (!currentShowBrands) {
                            if (firstSelection.current) {
                                scatter.selectAll(".dot").style("opacity", 0.5)
                            } else {
                                scatter.selectAll(".dot")
                                    .style("opacity", 0.5)
                                scatter.selectAll(".dot")
                                    .filter(".selected")
                                    .style("opacity", 1)
                            }
                            brandStatus.style("background-color", "lightcoral")
                            brandStatus.text("Off")
                        } else {
                            scatter.selectAll(".dot").style("opacity", function (d) {
                                const circle_symbol = d.Symbol;
                                return brandData.includes(circle_symbol) ? 1 : 0.15;
                            });
                            brandStatus.style("background-color", "#4CAF50")
                            brandStatus.text("On")
                        }
                        showBrands.current = currentShowBrands
                    }
                })
            
            });
        }


    }, [])

    return (
        <div id="d3-container">
        </div>
    )
}

export default Visualization