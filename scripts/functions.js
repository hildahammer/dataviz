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
        let isTopCity = false;
        for (let i = 0; i < topCities.length; i++) {
            if (topCities[i].id == d.id) {
                isTopCity = true;
                break;
            }
        }

        let currentLine = d3.select(`#line_${d.id}`);
        
        if (isTopCity) {
            currentLine.attr("stroke", "#FF00FF")
                       .attr("stroke-width", 3)
                       .attr("opacity", 1)
                       .attr("visibility", "visible")
                       .style("filter", "drop-shadow(0 0 10px rgba(255, 0, 255, 0.8))");
        } 
        else {
            currentLine.attr("stroke", "#00CED1")
                       .attr("stroke-width", 2)
                       .attr("opacity", 0.7)
                       .attr("visibility", "hidden")
                       .style("filter", "drop-shadow(0 0 5px rgba(0, 206, 209, 0.5))");
        }
    });
    
    
    cityHitAreas.each(function(d) {
        let isTop = false;
        for (let i = 0; i < topCities.length; i++) {
            if (topCities[i].id == d.id) {
                isTop = true;
                break;
            }
        }
        
        if (isTop) {
            d3.select(`#hitarea_${d.id}`).attr("visibility", "visible");
        } else {
            d3.select(`#hitarea_${d.id}`).attr("visibility", "hidden");
        }
    });
}

function updateCityLineVisibility() {
    let activeButtons = d3.selectAll(".cityBtn.active").nodes();
    let activeCityIds = [];
    for (let i = 0; i < activeButtons.length; i++) {
        let buttonId = activeButtons[i].id;
        let cityId = buttonId.split('_')[1]; 
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

// ORIGINAL KOD (avancerad med some/every):
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

function updateFilterButtonStates() {
    let activeCities = d3.selectAll(".cityBtn.active").nodes();
    let activeCount = activeCities.length;
    
    d3.selectAll("#filterButtons button").classed("active", false);
    
    if (activeCount == 0) {
        d3.select("#allBtn").classed("active", true);
    } 
    else if (activeCount == 3) {
        let topThreeCities = cityDataset.slice(0, 3);
        
        let matchingCities = 0;
        for (let topCity of topThreeCities) {
            for (let activeButton of activeCities) {
                if (activeButton.id === `city_${topCity.id}`) {
                    matchingCities++;
                    break; 
                }
            }
        }
        
        if (matchingCities == 3) {
            d3.select("#top3Btn").classed("active", true);
        }
    } 
    else if (activeCount == 10) {
        let topTenCities = cityDataset.slice(0, 10);
        
        let matchingCities = 0;
        for (let topCity of topTenCities) {
            for (let activeButton of activeCities) {
                if (activeButton.id === `city_${topCity.id}`) {
                    matchingCities++;
                    break;
                }
            }
        }
        
        if (matchingCities == 10) {
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

function createRevenueTrendsChart() {
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
        
        barWrapper.append("div")
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
            .text("INTÄKTSPROGNOS 2025");
    
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
        
        barWrapper.append("div")
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

function fillGraphs () {
    createTopPerformerSection();
    createRevenueTrendsChart();
    createPredictionsChart();
    
    showAllCities();
    d3.select("#allBtn").classed("active", true);
}