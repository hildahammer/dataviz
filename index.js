const wSvg = 800;
const hSvg = 500;

const hViz = .8 * hSvg;
const wViz = .8 * wSvg;

const hPadding = (hSvg - hViz) / 2
const wPadding = (wSvg - wViz) / 2;

const svg = d3.select("#wrapper").append("svg")
            .attr("width", wSvg)
            .attr("height", hSvg);

// Tooltip
const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip");

// Förbered dataset
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
            yearEarnings += gig.cityEarnings;
            dataset.totalEarnings += gig.cityEarnings;
            dataset.totalGigs += 1;
            dataset.totalAttendance += gig.attendance;
        }
        
        let point = {year: year, earnings: yearEarnings};
        dataset.yearlyData.push(point);
    }
    
    cityDataset.push(dataset);
}

// Beräkna tillväxt och 2025 prediction för varje stad
for (let city of cityDataset) {
    // Beräkna genomsnittlig årlig tillväxt
    let firstYear = city.yearlyData[0].earnings || 1;
    let lastYear = city.yearlyData[city.yearlyData.length - 1].earnings || 1;
    let years = city.yearlyData.length - 1;
    
    city.growthRate = years > 0 ? Math.pow(lastYear / firstYear, 1/years) - 1 : 0;
    
    // Förutsäg 2025 med linear regression
    let xValues = city.yearlyData.map((d, i) => i);
    let yValues = city.yearlyData.map(d => d.earnings);
    let n = xValues.length;
    let sumX = xValues.reduce((a, b) => a + b, 0);
    let sumY = yValues.reduce((a, b) => a + b, 0);
    let sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    let sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;
    
    city.predicted2025 = Math.max(0, slope * 10 + intercept); // 10 = index för 2025
    
    // Beräkna popularity score (kombination av earnings, gigs, attendance)
    city.popularityScore = (city.totalEarnings * 0.4) + (city.totalGigs * 50000 * 0.3) + (city.totalAttendance * 100 * 0.3);
}

// Förbered array med alla år
let years = [];
for (let year = 2015; year <= 2024; year++) { 
    years.push(year); 
}

// Hitta max earnings
let maxEarnings = 0;
for (let dataset of cityDataset) {
    for (let point of dataset.yearlyData) {
        maxEarnings = Math.max(maxEarnings, point.earnings);
    }
}

// Sortera städer efter totala intäkter
cityDataset.sort((a, b) => b.totalEarnings - a.totalEarnings);

// x-Skala
let xScale = d3.scaleLinear()
                .domain([2015, 2024])
                .range([wPadding, wPadding + wViz]);

// y-Skala  
let yScale = d3.scaleLinear()
                .domain([0, maxEarnings * 1.1])
                .range([hPadding + hViz, hPadding]);

// Skapa x-axel
let xAxisFunction = d3.axisBottom(xScale)
                        .tickFormat(d3.format('d'))
                        .ticks(10);

let xG = svg.append("g")
            .attr("class", "axis")
            .call(xAxisFunction)
            .attr("transform", `translate(0, ${hPadding + hViz})`);

// Skapa y-axel
let yAxisFunction = d3.axisLeft(yScale)
.tickFormat(d => Math.round(d / 100000) + 'K');
        
let yG = svg.append("g")
            .attr("class", "axis")
            .call(yAxisFunction)
            .attr("transform", `translate(${wPadding}, 0)`);

// Skapa linje-funktionen
const dMaker = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.earnings))
            .curve(d3.curveLinear);

// Skapa linjerna
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

// Skapa hit areas för hover
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

// Hover-events på hit areas
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
    tooltipContent += `<div class="stat-row"><span class="icon"></span> ${Math.round(yearEarnings / 100)} Kr</div>`;

    if (yearGigs.length > 0) {
        tooltipContent += `<div class="stat-row"><span class="icon">🎵</span> ${yearGigs.length} gigs</div>`;
        let totalAttendance = yearGigs.reduce((sum, gig) => sum + gig.attendance, 0);
        tooltipContent += `<div class="stat-row"><span class="icon">👥</span> ${totalAttendance.toLocaleString()} attendees</div>`;
    } else {
        tooltipContent += `<div class="stat-row"><span class="icon"></span> No gigs this year</div>`;
    }

    tooltip.html(tooltipContent)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 30) + "px")
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

// Skapa filterknapparna
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

// Skapa stadsknapparna
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

// Skapa nya analytics container
let analyticsContainer = d3.select("#wrapper")
                        .append("div")
                        .attr("id", "analyticsContainer");

// Top performer sektion
let topPerformerDiv = analyticsContainer.append("div")
                                        .attr("id", "topPerformer")
                                        .attr("class", "analytics-section");

// Growth trends sektion  
let growthTrendsDiv = analyticsContainer.append("div")
                                        .attr("id", "growthTrends")
                                        .attr("class", "analytics-section");

// 2025 predictions sektion
let predictionsDiv = analyticsContainer.append("div")
                                        .attr("id", "predictions2025")
                                        .attr("class", "analytics-section");

createTopPerformerSection();
createGrowthTrendsChart();
createPredictionsChart();

// FUNKTIONER

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
    
    setBarsOffline();
}

function showTopCities(n) {
    d3.selectAll(".cityBtn").classed("active", false);
    
    let topCities = cityDataset.slice(0, n);
    
    for (let city of topCities) {
        d3.select(`#city_${city.id}`).classed("active", true);
    }
    
    cityLines.each(function(d) {
        let isTop = topCities.some(city => city.id == d.id);
        d3.select(this)
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
        d3.select(this)
            .attr("visibility", isTop ? "visible" : "hidden");
    });
    
    setBarsOffline();
}

function updateCityLineVisibility() {
    let activeButtons = d3.selectAll(".cityBtn.active").nodes();
    let activeCityIds = activeButtons.map(btn => parseInt(btn.id.replace('city_', '')));
    
    if (activeCityIds.length == 0) {
        showAllCities();
        return;
    }
    
    cityLines.each(function(d) {
        let isActive = activeCityIds.includes(d.id);
        d3.select(this)
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
        d3.select(this)
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
    
    // Hitta top städer baserat på olika mått
    let topEarnings = [...cityDataset].sort((a, b) => b.totalEarnings - a.totalEarnings)[0];
    let topGigs = [...cityDataset].sort((a, b) => b.totalGigs - a.totalGigs)[0];
    let topAttendance = [...cityDataset].sort((a, b) => b.totalAttendance - a.totalAttendance)[0];
    let topGrowth = [...cityDataset].sort((a, b) => b.growthRate - a.growthRate)[0];
    
    let winnerGrid = container.append("div")
                            .attr("class", "winner-grid");
    
    winnerGrid.append("div")
                .attr("class", "winner-card")
                .html(`
                <div class="winner-icon"></div>
                <div class="winner-title">Högst Intäkter</div>
                <div class="winner-name">${topEarnings.name}</div>
                <div class="winner-value">${Math.round(topEarnings.totalEarnings / 100000)}K Kr</div>
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
                <div class="winner-title">Snabbast Tillväxt</div>
                <div class="winner-name">${topGrowth.name}</div>
                <div class="winner-value">${(topGrowth.growthRate * 100).toFixed(1)}% per år</div>
                `);
}

function createGrowthTrendsChart() {
    let container = d3.select("#growthTrends");
    
    container.append("h3")
            .attr("class", "section-title")
            .text("TILLVÄXT 2015-2024");
    
    let chartDiv = container.append("div")
                            .attr("id", "growthChart")
                            .attr("class", "bar-chart");
    
    // Sortera efter tillväxt
    let growthData = [...cityDataset].sort((a, b) => b.growthRate - a.growthRate).slice(0, 8);
    let maxGrowth = Math.max(...growthData.map(d => Math.abs(d.growthRate)));
    
    growthData.forEach(city => {
        let barContainer = chartDiv.append("div")
                                    .attr("class", "bar-container")
                                    .attr("id", `growth_${city.id}`);
        
        barContainer.append("div")
                    .attr("class", "bar-label")
                    .text(city.name);
        
        let barWrapper = barContainer.append("div")
                                    .attr("class", "bar-wrapper");
        
        let barFill = barWrapper.append("div")
                                .attr("class", "bar-fill growth-bar")
                                .style("width", "0%")
                                .style("background", city.growthRate >= 0 ? 
                                    "linear-gradient(90deg, #00CED1, #20B2AA)" : 
                                    "linear-gradient(90deg, #FF4444, #CC0000)");
        
        barContainer.append("div")
                    .attr("class", "bar-value")
                    .text(`${(city.growthRate * 100).toFixed(1)}%`);
    });
}

function createPredictionsChart() {
    let container = d3.select("#predictions2025");
    
    container.append("h3")
            .attr("class", "section-title")
            .text("2025 FÖRUTSÄGELSER");
    
    let chartDiv = container.append("div")
                            .attr("id", "predictionChart")
                            .attr("class", "bar-chart");
    
    // Sortera efter 2025 förutsägelse
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
        
        let barFill = barWrapper.append("div")
                                .attr("class", "bar-fill prediction-bar")
                                .style("width", "0%")
                                .style("background", "linear-gradient(90deg, #9932CC, #FF00FF)");
        
        barContainer.append("div")
                    .attr("class", "bar-value")
                    .text(`${Math.round(city.predicted2025 / 100)}K Kr`);
    });
}

function updateGrowthBars(selectedCityIds) {
    if (selectedCityIds && selectedCityIds.length == 1) {
        let cityId = selectedCityIds[0];
        let selectedCity = cityDataset.find(city => city.id == cityId);
        
        if (selectedCity) {
            // Highlighta vald stad i alla charts
            d3.selectAll('.bar-container').classed('highlighted', false);
            d3.select(`#growth_${cityId}`).classed('highlighted', true);
            d3.select(`#prediction_${cityId}`).classed('highlighted', true);
            
            // Animera tillväxt bars
            let growthData = [...cityDataset].sort((a, b) => b.growthRate - a.growthRate).slice(0, 8);
            let maxGrowth = Math.max(...growthData.map(d => Math.abs(d.growthRate)));
            
            growthData.forEach(city => {
                let percentage = Math.abs(city.growthRate) / maxGrowth * 100;
                d3.select(`#growth_${city.id} .bar-fill`)
                    .transition()
                    .duration(800)
                    .style("width", `${percentage}%`);
            });
            
            // Animera prediction bars
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
    } else {
        setBarsOffline();
    }
}

function updateStatsForSelectedCities() {
    let activeButtons = d3.selectAll(".cityBtn.active").nodes();
    let activeCityIds = activeButtons.map(btn => parseInt(btn.id.replace('city_', '')));
    
    if (activeCityIds.length == 1) {
        updateGrowthBars(activeCityIds);
    } else {
        setBarsOffline();
    }
}

function setBarsOffline() {
    d3.selectAll('.bar-container').classed('highlighted', false);
    d3.selectAll('.bar-fill')
        .transition()
        .duration(500)
        .style("width", "0%");
}

// Initiera med alla städer synliga
showAllCities();
d3.select("#allBtn").classed("active", true);