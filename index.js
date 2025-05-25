const wSvg = 1350;
const hSvg = 600;

const hViz = .7 * hSvg;
const wViz = .85 * wSvg;

const hPadding = (hSvg - hViz) / 2
const wPadding = (wSvg - wViz) / 2;

const svg = d3.select("#wrapper").append("svg")
            .attr("viewBox", `0 0 ${wSvg} ${hSvg}`) 
            .style("width", "100%")

const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip");

const cityDataset = [];
for (let city of Cities) {
    const cityID = city.id;
    const dataset = {
        id: cityID,
        name: city.name,
        population: city.population,
        yearlyData: [],
        totalEarnings: 0,
        totalGigs: 0,
        totalAttendance: 0
    }
    
    for (let year = 2015; year <= 2024; year++) {
        let cityGigs = Gigs.filter(x => x.cityID == cityID)
                            .filter(x => {
                            let _date = new Date(x.date);
                            let _year = _date.getFullYear();
                            return _year == year;
                            });
        
        let yearEarnings = 0;
        for (let gig of cityGigs) {
            yearEarnings = yearEarnings + gig.cityEarnings ;
            dataset.totalEarnings = dataset.totalEarnings + gig.cityEarnings;
            dataset.totalGigs = dataset.totalGigs + 1;
            dataset.totalAttendance = dataset.totalAttendance + gig.attendance;
        }
        
        let point = {
          year: year, 
          earnings: yearEarnings
        };

        dataset.yearlyData.push(point);
    }
    
    cityDataset.push(dataset);
}

for (let city of cityDataset) {
  
    let firstYear = city.yearlyData[0].earnings;    
    let years = city.yearlyData.length - 1;
    let lastYear = city.yearlyData[city.yearlyData.length - 1].earnings;

    city.growthEarnings = lastYear - firstYear
  
    let averageYearlyIncrease = (lastYear - firstYear) / years;
    city.averageYearlyIncrease = averageYearlyIncrease;
    city.predicted2025 = lastYear + averageYearlyIncrease;
}

let maxEarnings = 0;
for (let dataset of cityDataset) {
    for (let point of dataset.yearlyData) {
        maxEarnings = Math.max(maxEarnings, point.earnings);
    }
}

cityDataset.sort((a, b) => b.totalEarnings - a.totalEarnings);

let xScale = d3.scaleLinear()
                .domain([2015, 2024])
                .range([wPadding, wPadding + wViz]);

let yScale = d3.scaleLinear()
                .domain([0, maxEarnings * 1.1])
                .range([hPadding + hViz, hPadding]);

let xAxisFunction = d3.axisBottom(xScale)
                        .tickFormat(d3.format('d'))
                        .ticks(10);

let xG = svg.append("g")
            .attr("class", "axis")
            .call(xAxisFunction)
            .attr("transform", `translate(0, ${hPadding + hViz})`);

svg.append("text")
    .attr("transform", `translate(${wPadding + wViz/2}, ${hPadding + hViz + 50})`)
    .style("text-anchor", "middle")
    .style("fill", "#00FFFF")
    .style("font-size", "16px")
    .style("font-weight", "600")
    .style("letter-spacing", "2px")
    .style("text-shadow", "0 0 10px rgba(0, 255, 255, 0.6)")
    .text("ÅR");

let yAxisFunction = d3.axisLeft(yScale)
.tickFormat(d => Math.round(d / 1000000) + 'M');
        
let yG = svg.append("g")
            .attr("class", "axis")
            .call(yAxisFunction)
            .attr("transform", `translate(${wPadding}, 0)`);

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", wPadding - 50)
    .attr("x", 0 - (hPadding + hViz/2))
    .style("text-anchor", "middle")
    .style("fill", "#00FFFF")
    .style("font-size", "16px")
    .style("font-weight", "600")
    .style("letter-spacing", "2px")
    .style("text-shadow", "0 0 10px rgba(0, 255, 255, 0.6)")
    .text("INTÄKTER");

const dMaker = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.earnings))
            .curve(d3.curveLinear);

let cityLines = svg.append("g")
                    .selectAll("path")
                    .data(cityDataset)
                    .enter()
                    .append("path")
                    .attr("id", d => `line_${d.id}`)
                    .attr("stroke", "#00CED1")
                    .attr("stroke-width", 2)
                    .attr("fill", "transparent")
                    .attr("opacity", 0.7)
                    .attr("visibility", "hidden")
                    .attr("d", d => dMaker(d.yearlyData))
                    .style("filter", "drop-shadow(0 0 5px rgba(0, 206, 209, 0.5))");

let cityHitAreas = svg.append("g")
                    .selectAll("path")
                    .data(cityDataset)
                    .enter()
                    .append("path")
                    .attr("id", d => `hitarea_${d.id}`)
                    .attr("stroke", "transparent")
                    .attr("stroke-width", 15)
                    .attr("fill", "none")
                    .attr("opacity", 0)
                    .attr("visibility", "hidden")
                    .attr("d", d => dMaker(d.yearlyData))
                    .style("cursor", "pointer");

cityHitAreas.on("mouseover", (event, d) => {
    d3.select(`#line_${d.id}`)
        .attr("stroke", "#FF00FF")
        .attr("stroke-width", 3)
        .attr("opacity", 1)
        .style("filter", "drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))");
})

.on("mousemove", (event, d) => {
    let mouseX = d3.pointer(event)[0];
    let year = Math.floor(xScale.invert(mouseX));
    year = Math.max(2015, Math.min(2024, year));

    let yearData = d.yearlyData.find(yd => yd.year == year);
    let yearEarnings = yearData ? yearData.earnings : 0;

    let yearGigs = Gigs.filter(gig => gig.cityID == d.id)
                        .filter(gig => {
                        let gigDate = new Date(gig.date);
                        return gigDate.getFullYear() == year;
                        });

    let tooltipContent = `<div class="city-name">${d.name}</div>`;
    tooltipContent += `<div style="color: #888; margin-bottom: 10px;">${year}</div>`;
    tooltipContent += `<div class="stat-row"><span class="icon">💰</span>${Math.round(yearEarnings)} per år</div>`;

    if (yearGigs.length > 0) {
        tooltipContent += `<div class="stat-row"><span class="icon">🎵</span> ${yearGigs.length} gigs</div>`;
        let totalAttendance = yearGigs.reduce((sum, gig) => sum + gig.attendance, 0);
        tooltipContent += `<div class="stat-row"><span class="icon">🎫</span> ${totalAttendance.toLocaleString()} Biljetter</div>`;
    } else {
        tooltipContent += `<div class="stat-row"><span class="icon"></span> No gigs this year</div>`;
    }

    tooltip.html(tooltipContent)
            .style("left", (event.pageX - 110) + "px")
            .style("top", (event.pageY - 200) + "px")
            .style("opacity", 1);

    updateGrowthBars([d.id]);
})

.on("mouseout", (event, d) => {
    let activeButton = document.querySelector(`#city_${d.id}.active`);
    let isActive = activeButton != null;
    
    d3.select(`#line_${d.id}`)
        .attr("stroke", isActive ? "#FF00FF" : "#00CED1")
        .attr("stroke-width", 2)
        .attr("opacity", isActive ? 1 : 0.7)
        .style("filter", isActive ? 
        "drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))" : 
        "drop-shadow(0 0 5px rgba(0, 206, 209, 0.5))");
    
    tooltip.style("opacity", 0);
    updateStatsForSelectedCities();
});

d3.select("#wrapper")
    .append("div")
    .attr("id", "filterButtons")
    .selectAll("button")
    .data([
    {id: "allBtn", text: "Alla", action: showAllCities},
    {id: "top10Btn", text: "Top 10", action: () => showTopCities(10)},
    {id: "top3Btn", text: "Top 3", action: () => showTopCities(3)}
    ])
    .enter()
    .append("button")
    .attr("id", d => d.id)
    .text(d => d.text)
    .on("click", (event, d) => {
    d3.selectAll("#filterButtons button").classed("active", false);
    event.target.classList.add("active");
    d.action();
    });

d3.select("#wrapper")
    .append("div")
    .attr("id", "cityButtons")
    .selectAll("button")
    .data(cityDataset)
    .enter()
    .append("button")
    .attr("id", d => `city_${d.id}`)
    .attr("class", "cityBtn")
    .text(d => d.name)
    .on("click", (event, d) => {
    let button = event.target;
    button.classList.toggle("active");
    updateCityLineVisibility();
    updateFilterButtonStates();
    updateStatsForSelectedCities();
    });

let analyticsContainer = d3.select("#wrapper")
                        .append("div")
                        .attr("id", "analyticsContainer");

let topPerformerDiv = analyticsContainer.append("div")
                                        .attr("id", "topPerformer")
                                        .attr("class", "analytics-section");

let growthTrendsDiv = analyticsContainer.append("div")
                                        .attr("id", "growthTrends")
                                        .attr("class", "analytics-section");

let predictionsDiv = analyticsContainer.append("div")
                                        .attr("id", "predictions2025")
                                        .attr("class", "analytics-section");

createTopPerformerSection();
createGrowthTrendsChart();
createPredictionsChart();

function showAllCities() {
    d3.selectAll(".cityBtn").classed("active", false);
    
    cityLines
        .attr("stroke", "#00CED1")
        .attr("opacity", 0.7)
        .attr("visibility", "visible")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 0 5px rgba(0, 206, 209, 0.5))");
    
    cityHitAreas
        .attr("visibility", "visible");
}

function showTopCities(n) {
    d3.selectAll(".cityBtn").classed("active", false);
    
    let topCities = cityDataset.slice(0, n);
    
    for (let city of topCities) {
        d3.select(`#city_${city.id}`).classed("active", true);
    }
    
    cityLines.each(function(d) {
      let isTop = topCities.some(city => city.id == d.id);
      d3.select(`#line_${d.id}`)
          .attr("stroke", isTop ? "#FF00FF" : "#00CED1")
          .attr("stroke-width", isTop ? 3 : 2)
          .attr("opacity", isTop ? 1 : 0.7)
          .attr("visibility", isTop ? "visible" : "hidden")
          .style("filter", isTop ? 
          "drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))" : 
          "drop-shadow(0 0 5px rgba(0, 206, 209, 0.5))");
    });
    
    cityHitAreas.each(function(d) {
      let isTop = topCities.some(city => city.id == d.id);
      d3.select(`#hitarea_${d.id}`)
          .attr("visibility", isTop ? "visible" : "hidden");
    });
}

function updateCityLineVisibility() {
    let activeButtons = d3.selectAll(".cityBtn.active").nodes();
    let activeCityIds = [];
    for (let i = 0; i < activeButtons.length; i++) {
        let buttonId = activeButtons[i].id;
        let cityId = buttonId.split('_')[1]; // tar delen efter '_'
        activeCityIds.push(Number(cityId));
    }    
    if (activeCityIds.length == 0) {
        showAllCities();
        return;
    }
    
    cityLines.each(function(d) {
      let isActive = activeCityIds.includes(d.id);
      d3.select(`#line_${d.id}`)
          .attr("stroke", isActive ? "#FF00FF" : "#00CED1")
          .attr("stroke-width", isActive ? 3 : 2)
          .attr("opacity", isActive ? 1 : 0.7)
          .attr("visibility", isActive ? "visible" : "hidden")
          .style("filter", isActive ? 
          "drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))" : 
          "drop-shadow(0 0 5px rgba(0, 206, 209, 0.5))");
  });
    
    cityHitAreas.each(function(d) {
      let isActive = activeCityIds.includes(d.id);
      d3.select(`#hitarea_${d.id}`)
          .attr("visibility", isActive ? "visible" : "hidden");
    });
}

function updateFilterButtonStates() {
    let activeCities = d3.selectAll(".cityBtn.active").nodes();
    let activeCount = activeCities.length;
    
    d3.selectAll("#filterButtons button").classed("active", false);
    
    if (activeCount == 0) {
        d3.select("#allBtn").classed("active", true);
    } else if (activeCount == 3) {
        let topThreeCities = cityDataset.slice(0, 3);
        let isExactlyTopThree = topThreeCities.every(city => 
            activeCities.some(btn => btn.id === `city_${city.id}`)
        );
        if (isExactlyTopThree) {
            d3.select("#top3Btn").classed("active", true);
        }
    } else if (activeCount == 10) {
        let topTenCities = cityDataset.slice(0, 10);
        let isExactlyTopTen = topTenCities.every(city => 
            activeCities.some(btn => btn.id === `city_${city.id}`)
        );
        if (isExactlyTopTen) {
            d3.select("#top10Btn").classed("active", true);
        }
    }
}

function createTopPerformerSection() {
    let container = d3.select("#topPerformer");
    
    container.append("h3")
            .attr("class", "section-title")
            .text("MEST POPULÄRA STÄDER");
    
    let topEarnings = cityDataset[0];
    for (let city of cityDataset) {
        if (city.totalEarnings > topEarnings.totalEarnings) {
            topEarnings = city;
        }
    }

    let topGigs = cityDataset[0];
    for (let city of cityDataset) {
        if (city.totalGigs > topGigs.totalGigs) {
            topGigs = city;
        }
    }

    let topAttendance = cityDataset[0];
    for (let city of cityDataset) {
        if (city.totalAttendance > topAttendance.totalAttendance) {
            topAttendance = city;
        }
    }

    let topGrowth = cityDataset[0];
    for (let city of cityDataset) {
        if (city.averageYearlyIncrease > topGrowth.averageYearlyIncrease) {
            topGrowth = city;
        }
    }      

    // let topEarnings = [...cityDataset].sort((a, b) => b.totalEarnings - a.totalEarnings)[0];
    // let topGigs = [...cityDataset].sort((a, b) => b.totalGigs - a.totalGigs)[0];
    // let topAttendance = [...cityDataset].sort((a, b) => b.totalAttendance - a.totalAttendance)[0];
    // let topGrowth = [...cityDataset].sort((a, b) => b.averageYearlyIncrease - a.averageYearlyIncrease)[0];

    let winnerGrid = container.append("div")
                            .attr("class", "winner-grid");
    
    winnerGrid.append("div")
                .attr("class", "winner-card")
                .html(`
                <div class="winner-icon"></div>
                <div class="winner-title">Högst Intäkter</div>
                <div class="winner-name">${topEarnings.name}</div>
                <div class="winner-value">${Math.round(topEarnings.totalEarnings)} Kr</div>
                `);
    
    winnerGrid.append("div")
                .attr("class", "winner-card")
                .html(`
                <div class="winner-icon"></div>
                <div class="winner-title">Flest Gigs</div>
                <div class="winner-name">${topGigs.name}</div>
                <div class="winner-value">${topGigs.totalGigs} konserter</div>
                `);
    
    winnerGrid.append("div")
                .attr("class", "winner-card")
                .html(`
                <div class="winner-icon"></div>
                <div class="winner-title">Största Publiken</div>
                <div class="winner-name">${topAttendance.name}</div>
                <div class="winner-value">${topAttendance.totalAttendance.toLocaleString()} personer</div>
                `);
                
    winnerGrid.append("div")
                .attr("class", "winner-card")
                .html(`
                <div class="winner-icon"></div>
                <div class="winner-title">Snabbast Tillväxt Per År</div>
                <div class="winner-name">${topGrowth.name}</div>
                <div class="winner-value">${(topGrowth.averageYearlyIncrease).toFixed(0)} Kr</div>
                `);
}

function createGrowthTrendsChart() {
    let container = d3.select("#growthTrends");
    
    container.append("h3")
            .attr("class", "section-title")
            .text("STÖRST ÖKNING 2015-2024");
    
    let chartDiv = container.append("div")
                            .attr("id", "growthChart")
                            .attr("class", "bar-chart");
    
    let growthData = [...cityDataset].sort((a, b) => b.growthEarnings - a.growthEarnings).slice(0, 8);
    let maxGrowth = Math.max(...growthData.map(d => Math.abs(d.growthEarnings))); 

    growthData.forEach(city => {
        let barContainer = chartDiv.append("div")
                                    .attr("class", "bar-container")
                                    .attr("id", `growth_${city.id}`);
        
        barContainer.append("div")
                    .attr("class", "bar-label")
                    .text(city.name);
        
        let barWrapper = barContainer.append("div")
                                    .attr("class", "bar-wrapper");
        
        let percentage = Math.abs(city.growthEarnings) / maxGrowth * 100;
        
        let barFill = barWrapper.append("div")
                                .attr("class", "bar-fill growth-bar")
                                .style("width", `${percentage}%`)  
                                .style("background", city.growthEarnings >= 0 ? 
                                    "linear-gradient(90deg, #00CED1, #20B2AA)" : 
                                    "linear-gradient(90deg, #FF4444, #CC0000)");
        
        barContainer.append("div")
                    .attr("class", "bar-value")
                    .text(`${(city.growthEarnings)} Kr`);
    });
}

function createPredictionsChart() {
    let container = d3.select("#predictions2025");
    
    container.append("h3")
            .attr("class", "section-title")
            .text("INTÄKTSPROGNOS 2025"); //vad vi tror den kommer tjäna nästa år
    
    let chartDiv = container.append("div")
                            .attr("id", "predictionChart")
                            .attr("class", "bar-chart");
    
    let predictionData = [...cityDataset].sort((a, b) => b.predicted2025 - a.predicted2025).slice(0, 8);
    let maxPrediction = Math.max(...predictionData.map(d => d.predicted2025));
    
    predictionData.forEach(city => {
        let barContainer = chartDiv.append("div")
                                    .attr("class", "bar-container")
                                    .attr("id", `prediction_${city.id}`);
        
        barContainer.append("div")
                    .attr("class", "bar-label")
                    .text(city.name);
        
        let barWrapper = barContainer.append("div")
                                    .attr("class", "bar-wrapper");
        
        let percentage = city.predicted2025 / maxPrediction * 100;
        
        let barFill = barWrapper.append("div")
                                .attr("class", "bar-fill prediction-bar")
                                .style("width", `${percentage}%`)  
                                .style("background", "linear-gradient(90deg, #9932CC, #FF00FF)");
        
        barContainer.append("div")
                    .attr("class", "bar-value")
                    .text(`${Math.round(city.predicted2025)} Kr`);
    });
}

function updateGrowthBars(selectedCityIds) {
    if (selectedCityIds && selectedCityIds.length == 1) {
        let cityId = selectedCityIds[0];
        let selectedCity = cityDataset.find(city => city.id == cityId);
        
        if (selectedCity) {
            d3.selectAll('.bar-container').classed('highlighted', false);
            d3.select(`#growth_${cityId}`).classed('highlighted', true);
            d3.select(`#prediction_${cityId}`).classed('highlighted', true);
            
            let growthData = [...cityDataset].sort((a, b) => b.growthEarnings - a.growthEarnings).slice(0, 8);
            let maxGrowth = Math.max(...growthData.map(d => Math.abs(d.growthEarnings)));
            
            growthData.forEach(city => {
                let percentage = Math.abs(city.growthEarnings) / maxGrowth * 100;
                d3.select(`#growth_${city.id} .bar-fill`)
                    .transition()
                    .duration(800)
                    .style("width", `${percentage}%`);
            });
            
            let predictionData = [...cityDataset].sort((a, b) => b.predicted2025 - a.predicted2025).slice(0, 8);
            let maxPrediction = Math.max(...predictionData.map(d => d.predicted2025));
            
            predictionData.forEach(city => {
                let percentage = city.predicted2025 / maxPrediction * 100;
                d3.select(`#prediction_${city.id} .bar-fill`)
                    .transition()
                    .duration(800)
                    .style("width", `${percentage}%`);
            });
        }
    } 
}

function updateStatsForSelectedCities() {
    let activeButtons = d3.selectAll(".cityBtn.active").nodes();
    let activeCityIds = activeButtons.map(btn => parseInt(btn.id.replace('city_', '')));
    
    if (activeCityIds.length == 1) {
        updateGrowthBars(activeCityIds);
    } 
}

showAllCities();
d3.select("#allBtn").classed("active", true);