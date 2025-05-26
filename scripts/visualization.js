
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