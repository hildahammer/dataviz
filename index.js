document.addEventListener('DOMContentLoaded', initVisualization);

function initVisualization() {
    // Set up dimensions and margins
    const margin = {top: 30, right: 50, bottom: 50, left: 70};
    const width = document.getElementById('chart').clientWidth - margin.left - margin.right;
    const height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip');
    
    // Process and organize data
    // First, create a mapping of gigs by city and year
    const gigsByCity = {};
    const yearsRange = range(2015, 2025);
    
    // Initialize city data structure
    Cities.forEach(city => {
        gigsByCity[city.id] = {
            id: city.id,
            name: city.name,
            population: city.population,
            yearlyEarnings: {},
            totalEarnings: 0,
            totalGigs: 0,
            totalAttendance: 0
        };
        
        // Initialize yearly earnings for each year
        yearsRange.forEach(year => {
            gigsByCity[city.id].yearlyEarnings[year] = 0;
        });
    });
    
<<<<<<< HEAD
    // Skapa SVG-element och tooltip-div
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "chart-svg";
    const tooltipDiv = document.createElement('div');
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    tooltipDiv.style.position = "absolute";
    tooltipDiv.style.backgroundColor = "white";
    tooltipDiv.style.padding = "8px";
    tooltipDiv.style.borderRadius = "4px";
    tooltipDiv.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
    tooltipDiv.style.border = "1px solid #ccc";
    tooltipDiv.style.opacity = "0";
    tooltipDiv.style.pointerEvents = "none";
    tooltipDiv.style.zIndex = "10";
    tooltipDiv.style.transition = "opacity 0.2s";
    
    // Skapa kontrollpanelen
    const controlPanel = document.createElement('div');
    controlPanel.className = "control-panel";
    controlPanel.style.marginBottom = "20px";
    
    // Skapa knappar för olika visningslägen
    const allButton = createButton('Visa alla städer', () => changeViewMode('all'));
    const top10Button = createButton('Topp 10 städer', () => changeViewMode('top10'));
    const top3Button = createButton('Topp 3 städer', () => changeViewMode('top3'));
    const compareButton = createButton('Jämför städer (välj 2)', toggleCompareMode);
    
    // Lägg till knappar i kontrollpanelen
    controlPanel.appendChild(allButton);
    controlPanel.appendChild(top10Button);
    controlPanel.appendChild(top3Button);
    controlPanel.appendChild(compareButton);
    
    // Skapa info-panel för jämförelseläge
    const compareInfo = document.createElement('div');
    compareInfo.id = "compare-info";
    compareInfo.style.marginBottom = "15px";
    compareInfo.style.padding = "10px";
    compareInfo.style.backgroundColor = "#f4f4f4";
    compareInfo.style.borderRadius = "4px";
    compareInfo.style.display = "none";
    compareInfo.innerHTML = `
      <p>Välj upp till 2 städer från legendens lista till höger i grafen.</p>
      <p>Valda städer: <span id="selected-cities">Ingen vald</span></p>
    `;
    
    // Skapa analys-sektion
    const analysisSection = document.createElement('div');
    analysisSection.className = "analysis";
    analysisSection.style.marginTop = "30px";
    
    const analysisTitle = document.createElement('h3');
    analysisTitle.textContent = "Analys";
    analysisTitle.style.fontSize = "1.25rem";
    analysisTitle.style.fontWeight = "bold";
    
    const analysisContent = document.createElement('div');
    analysisContent.id = "analysis-content";
    
    // Lägg till analys-komponenter
    analysisSection.appendChild(analysisTitle);
    analysisSection.appendChild(analysisContent);
    
    // Lägg till alla komponenter i wrapper
    wrapper.appendChild(controlPanel);
    wrapper.appendChild(compareInfo);
    wrapper.appendChild(svg);
    wrapper.appendChild(tooltipDiv);
    wrapper.appendChild(analysisSection);
    
    // Applikationstillstånd
    let state = {
      loading: true,
      error: null,
      viewMode: 'top10',
      selectedCities: [],
      compareMode: false,
      cityData: []
    };
    
    // Hämta eller generera data
    generateData()
      .then(data => {
        state.cityData = data;
        state.loading = false;
        updateChart();
      })
      .catch(err => {
        console.error("Fel vid datahämtning:", err);
        state.error = "Fel vid datahämtning";
        state.loading = false;
        showError();
      });
    
    // Funktion för att skapa knapp
    function createButton(text, onClick) {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.padding = "8px 16px";
      button.style.margin = "0 8px 8px 0";
      button.style.borderRadius = "4px";
      button.style.cursor = "pointer";
      button.style.backgroundColor = "#e2e8f0";
      button.style.border = "none";
      button.onclick = onClick;
      return button;
    }
    
    // Funktion för att visa fel
    function showError() {
      const errorDiv = document.createElement('div');
      errorDiv.textContent = state.error;
      errorDiv.style.color = "red";
      errorDiv.style.textAlign = "center";
      errorDiv.style.padding = "40px";
      wrapper.innerHTML = '';
      wrapper.appendChild(errorDiv);
    }
    
    // Funktion för att ändra visningsläge
    function changeViewMode(mode) {
      if (state.compareMode) return;
      state.viewMode = mode;
      updateChart();
      updateButtonStyles();
    }
    
    // Funktion för att växla jämförelseläge
    function toggleCompareMode() {
      state.compareMode = !state.compareMode;
      state.selectedCities = [];
      compareInfo.style.display = state.compareMode ? "block" : "none";
      updateChart();
      updateButtonStyles();
    }
    
    // Funktion för att uppdatera knappstilarna
    function updateButtonStyles() {
      const buttons = controlPanel.querySelectorAll('button');
      
      buttons.forEach((button, index) => {
        if ((index === 0 && state.viewMode === 'all') || 
            (index === 1 && state.viewMode === 'top10') || 
            (index === 2 && state.viewMode === 'top3') || 
            (index === 3 && state.compareMode)) {
          button.style.backgroundColor = index === 3 ? "#059669" : "#2563eb";
          button.style.color = "white";
        } else {
          button.style.backgroundColor = "#e2e8f0";
          button.style.color = "white";
=======
    // Process gig data
    Gigs.forEach(gig => {
        const cityId = gig.cityID;
        const year = new Date(gig.date).getFullYear();
        
        if (gigsByCity[cityId] && yearsRange.includes(year)) {
            gigsByCity[cityId].yearlyEarnings[year] += gig.cityEarnings;
            gigsByCity[cityId].totalEarnings += gig.cityEarnings;
            gigsByCity[cityId].totalGigs += 1;
            gigsByCity[cityId].totalAttendance += gig.attendance;
>>>>>>> hildasbranch
        }
    });
    
    // Transform data for D3
    const cityData = Object.values(gigsByCity).map(city => {
        const yearData = yearsRange.map(year => ({
            year: year,
            earnings: city.yearlyEarnings[year]
        }));
        
        return {
            id: city.id,
            name: city.name,
            population: city.population,
            yearData: yearData,
            totalEarnings: city.totalEarnings,
            totalGigs: city.totalGigs,
            totalAttendance: city.totalAttendance
        };
    });
    
    // Sort cities by total earnings for TOP filters
    cityData.sort((a, b) => b.totalEarnings - a.totalEarnings);
    
    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([2015, 2024])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(cityData, d => d3.max(d.yearData, y => y.earnings)) * 1.1])
        .range([height, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'))
        .ticks(10);
    
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => {
            if (d >= 1000000) return d3.format('.1f')(d / 1000000) + 'M';
            else if (d >= 1000) return d3.format('.0f')(d / 1000) + 'K';
            return d;
        });
    
    // Add axes to chart
    svg.append('g')
        .attr('class', 'axis xAxis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);
    
    svg.append('g')
        .attr('class', 'axis yAxis')
        .call(yAxis);
    
    // Create line generator
    const lineGenerator = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.earnings))
        .curve(d3.curveMonotoneX);
    
   
    let permanentMarker = null;
    let selectedCity = null;
    // Modifiera cityLines-skapandet med en klickhändelse
    const cityLines = svg.selectAll('.cityLine')
        .data(cityData)
        .enter()
        .append('path')
        .attr('class', 'cityLine')
        .attr('d', d => lineGenerator(d.yearData))
        .attr('fill', 'none')
        .attr('stroke', '#00CED1')
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
        .attr('data-id', d => d.id)
        .on('click', function(event, d) {
            // Ta bort tidigare permanent markör
            if (permanentMarker) {
                permanentMarker.remove();
            }

            // Beräkna klickad punkt
            const x = d3.pointer(event)[0];
            const year = Math.round(xScale.invert(x));
            const pointData = d.yearData.find(yd => yd.year === year);

            // Skapa permanent markör
            permanentMarker = svg.append('circle')
                .attr('class', 'permanentMarker')
                .attr('cx', x)
                .attr('cy', yScale(pointData.earnings))
                .attr('r', 8)
                .attr('fill', '#FF00FF')
                .attr('stroke', 'white')
                .attr('stroke-width', 2);

            // Uppdatera vald stad och år
            selectedCity = d;
            
            // Uppdatera cirklarna med procentandelar för specifik punkt
            updatePointStatCircles(d, year, pointData);

            // Inaktivera hover-effekter
            cityLines
                .on('mouseover', null)
                .on('mouseout', null);
        });
    
    // Add mouse events to lines
    cityLines
        .on('mouseover', function(event, d) {
            // Highlight line
            d3.select(this)
                .attr('stroke', '#FF00FF')
                .attr('stroke-width', 3)
                .attr('opacity', 1);
            
            // Find most recent gig for this city
            const cityGigs = Gigs.filter(gig => gig.cityID === d.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let tooltipContent = `
                <div style="text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 10px;">
                    ${d.name}
                </div>
            `;
            
            if (cityGigs.length > 0) {
                const latestGig = cityGigs[0];
                const dateParts = latestGig.date.split('-');
                const formattedDate = `${dateParts[0]} - ${dateParts[1]} - ${dateParts[2]}`;
                
                tooltipContent += `
                    <div>${formattedDate}</div>
                    <div>👤 ${latestGig.attendance}</div>
                    <div>€ ${(latestGig.price / 1000).toFixed(1)} K EUR</div>
                    <div>👥 ${Math.round(d.totalAttendance * 0.55)}%</div>
                `;
            }
            
            // Show tooltip
            tooltip
                .html(tooltipContent)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 30) + 'px')
                .style('opacity', 1);
            
            // Update stat circles for this city
            updateStatCircles([d.id]);
        })
        .on('mouseout', function(event, d) {
            // Reset line appearance unless city is selected
            const cityBtn = document.getElementById(`city-${d.id}`);
            const isSelected = cityBtn && cityBtn.classList.contains('active');
            
            d3.select(this)
                .attr('stroke', isSelected ? '#FF00FF' : '#00CED1')
                .attr('stroke-width', 2)
                .attr('opacity', isSelected ? 1 : 0.7);
            
            // Hide tooltip
            tooltip.style('opacity', 0);
            
            // Update stat circles based on selected cities
            updateStatsForSelectedCities();
        });

        function updatePointStatCircles(city, year, pointData) {
          // Find best point for each category across all cities
          const bestPointEarnings = Math.max(...cityData.flatMap(c => c.yearData.map(yd => yd.earnings)));
          
          // Calculate percentage for this specific point
          const pointEarningsPercentage = Math.round((pointData.earnings / bestPointEarnings) * 100);
          
          // Update circles
          updateCircleProgress('revenueChart', pointEarningsPercentage);
          
          // Show extra information
          d3.select('#revenueChart .percentage').style('color', '#9932CC');
          
          // Add reset button
          addResetButton(city, year);
      }
      
      function resetVisualization() {
          // Remove permanent marker
          if (permanentMarker) {
              permanentMarker.remove();
              permanentMarker = null;
          }
          
          // Restore hover effects
          cityLines
              .on('mouseover', function(event, d) {
                  d3.select(this)
                      .attr('stroke', '#FF00FF')
                      .attr('stroke-width', 3)
                      .attr('opacity', 1);
              })
              .on('mouseout', function(event, d) {
                  d3.select(this)
                      .attr('stroke', '#00CED1')
                      .attr('stroke-width', 2)
                      .attr('opacity', 0.7);
              });
          
          // Remove reset button
          d3.select('#resetButton').remove();
          
          // Reset circles
          setCirclesOffline();
      }

      function addResetButton(city, year) {
        // Ta bort tidigare reset-knappar
        d3.select('#resetButton').remove();
        
        // Skapa ny reset-knapp
        const resetButton = d3.select('.filterButtons')
            .append('button')
            .attr('id', 'resetButton')
            .text(`Reset ${city.name} (${year})`)
            .on('click', resetVisualization);
      }

  
      // Resten av koden förblir oförändrad från tidigare version
      // (Återstående funktioner som toggleCity, showAllCities etc.)
    
    // Create city buttons
    const cityButtonsContainer = document.getElementById('cityButtons');
    
    cityData.forEach(city => {
        const btn = document.createElement('button');
        btn.id = `city${city.id}`;
        btn.className = 'cityBtn';
        btn.textContent = city.name;
        btn.addEventListener('click', () => toggleCity(city.id));
        cityButtonsContainer.appendChild(btn);
    });
    
    // Set up filter buttons
    document.getElementById('allBtn').addEventListener('click', showAllCities);
    document.getElementById('top10Btn').addEventListener('click', () => showTopCities(10));
    document.getElementById('top3Btn').addEventListener('click', () => showTopCities(3));
    
    // Create stat circles
    createStatCircle('gigsChart', '#00CED1', '79%');
    createStatCircle('revenueChart', '#9932CC', '42%');
    createStatCircle('audienceChart', '#FF00FF', '67%');
    
    // Function to create a stat circle
    function createStatCircle(id, color, initialValue) {
        const container = d3.select(`#${id}`);
        
        // Create SVG
        const svg = container
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 100 100');
        
        // Add background circle
        svg.append('circle')
            .attr('cx', 50)
            .attr('cy', 50)
            .attr('r', 45)
            .attr('fill', 'transparent')
            .attr('stroke', '#333')
            .attr('stroke-width', 8);
        
        // Add foreground circle as path
        svg.append('path')
            .attr('class', 'progress')
            .attr('stroke', color)
            .attr('stroke-width', 8)
            .attr('fill', 'none')
            .attr('stroke-linecap', 'round');
        
        // Add center text
        container.append('div')
            .attr('class', 'percentage')
            .text(initialValue);
        
        // Set initial value
        updateCircleProgress(id, parseInt(initialValue));
    }
    
    // Function to update circle progress
    function updateCircleProgress(id, percentage) {
        const svg = d3.select(`#${id} svg`);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        
        // Calculate arc path
        const angle = (percentage / 100) * 360;
        const rads = (angle * Math.PI) / 180;
        const x = 50 + radius * Math.sin(rads);
        const y = 50 - radius * Math.cos(rads);
        const largeArc = angle > 180 ? 1 : 0;
        
        // Set path data
        svg.select('.progress')
            .attr('d', `M 50,5 A ${radius},${radius} 0 ${largeArc},1 ${x},${y}`);
        
        // Update percentage text
        d3.select(`#${id} .percentage`).text(`${percentage}%`);
    }
    
   
// Uppdatera toggleCity-funktionen för att hantera en enskild stad
function toggleCity(cityId) {
  const btn = document.getElementById(`city${cityId}`);
  
  // Om knappen redan är aktiv, avaktivera den
  const wasActive = btn.classList.contains('active');
  
  // Avaktivera alla stadsknapparna först
  document.querySelectorAll('.cityBtn').forEach(b => {
      b.classList.remove('active');
  });
  
  // Om knappen inte var aktiv tidigare, aktivera bara denna
  if (!wasActive) {
      btn.classList.add('active');
      
      // Visa bara denna stad
      cityLines.each(function(d) {
          const line = d3.select(this);
          const isSelected = d.id === cityId;
          
          line
              .attr('stroke', isSelected ? '#FF00FF' : '#00CED1')
              .attr('opacity', isSelected ? 1 : 0.7)
              .attr('visibility', isSelected ? 'visible' : 'hidden');
      });
      
      // Uppdatera statistik för den valda staden
      updateStatCircles([cityId]);
  } else {
      // Om knappen var aktiv, återgå till "visa alla"-läget
      showAllCities();
  }
  
  // Uppdatera filterknappstatus
  updateFilterButtonStates();
}
    
    // Function to show all cities
    // Uppdatera också showAllCities-funktionen
function showAllCities() {
  // Avaktivera alla stadsknapparna
  document.querySelectorAll('.cityBtn').forEach(btn => {
      btn.classList.remove('active');
  });
  
  // Visa alla stadslinjer
  cityLines
      .attr('stroke', '#00CED1')
      .attr('opacity', 0.7)
      .attr('visibility', 'visible');
  
  // Sätt aktiv status för ALL-knappen
  document.querySelectorAll('.filterButtons button').forEach(btn => {
      btn.classList.remove('active');
  });
  document.getElementById('allBtn').classList.add('active');
  
  // Sätt cirklarna i offline-läge
  setCirclesOffline();
}
    
   // Uppdatera showTopCities-funktionen
function showTopCities(n) {
  // Återställ alla städer först
  document.querySelectorAll('.cityBtn').forEach(btn => {
      btn.classList.remove('active');
  });
  
  // Aktivera top N-stadsknapparna
  const topCities = cityData.slice(0, n);
  topCities.forEach(city => {
      const btn = document.getElementById(`city${city.id}`);
      if (btn) btn.classList.add('active');
  });
  
  // Uppdatera stadssynlighet
  updateCityVisibility();
  
  // Sätt aktiv filtreringsknapp
  document.querySelectorAll('.filterButtons button').forEach(btn => {
      btn.classList.remove('active');
  });
  document.getElementById(n === 3 ? 'top3Btn' : 'top10Btn').classList.add('active');
  
  // Sätt cirklarna i offline-läge eftersom flera städer är valda
  setCirclesOffline();
}
    
    // Function to update city visibility based on active buttons
    function updateCityVisibility() {
        const activeCityIds = Array.from(document.querySelectorAll('.cityBtn.active'))
            .map(btn => parseInt(btn.id.replace('city', '')));
        
        cityLines.each(function(d) {
            const line = d3.select(this);
            const isActive = activeCityIds.includes(d.id);
            
            line
                .attr('stroke', isActive ? '#FF00FF' : '#00CED1')
                .attr('opacity', isActive ? 1 : 0.7)
                .attr('visibility', activeCityIds.length === 0 || isActive ? 'visible' : 'hidden');
        });
    }
    
    // Function to update stat circles based on selected cities
    function updateStatsForSelectedCities() {
        const activeCityIds = Array.from(document.querySelectorAll('.cityBtn.active'))
            .map(btn => parseInt(btn.id.replace('city', '')));
        
        if (activeCityIds.length === 0) {
            updateStatCircles(); // Reset to overall stats
        } else {
            updateStatCircles(activeCityIds);
        }
    }
    
    // Function to update filter button states
    function updateFilterButtonStates() {
        const activeCityIds = Array.from(document.querySelectorAll('.cityBtn.active'))
            .map(btn => parseInt(btn.id.replace('city', '')));
        
        const top3Ids = cityData.slice(0, 3).map(c => c.id);
        const top10Ids = cityData.slice(0, 10).map(c => c.id);
        
        // Reset all filter buttons
        document.querySelectorAll('.filterButtons button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (activeCityIds.length === 0) {
            document.getElementById('allBtn').classList.add('active');
        } else if (activeCityIds.length === 3 && 
                  arrayEquals(activeCityIds.sort(), top3Ids.sort())) {
            document.getElementById('top3Btn').classList.add('active');
        } else if (activeCityIds.length === 10 && 
                  arrayEquals(activeCityIds.sort(), top10Ids.sort())) {
            document.getElementById('top10Btn').classList.add('active');
        }
    }
    
    function updateStatCircles(selectedCityIds = null) {
      // Om vi har en enskild stad, visa dess data
      if (selectedCityIds && selectedCityIds.length === 1) {
          const cityId = selectedCityIds[0];
          const selectedCity = cityData.find(city => city.id === cityId);
          
          if (selectedCity) {
              // Hitta den bästa staden för varje kategori
              const bestGigsCity = cityData.reduce((max, city) => 
                  city.totalGigs > max.totalGigs ? city : max);
              
              const bestEarningsCity = cityData.reduce((max, city) => 
                  city.totalEarnings > max.totalEarnings ? city : max);
              
              const bestAttendanceCity = cityData.reduce((max, city) => 
                  city.totalAttendance > max.totalAttendance ? city : max);
              
              // Beräkna procentandel jämfört med den bästa staden
              const gigsPercentage = Math.round((selectedCity.totalGigs / bestGigsCity.totalGigs) * 100);
              const earningsPercentage = Math.round((selectedCity.totalEarnings / bestEarningsCity.totalEarnings) * 100);
              const attendancePercentage = Math.round((selectedCity.totalAttendance / bestAttendanceCity.totalAttendance) * 100);
              
              // Uppdatera cirklarna med data för den valda staden
              updateCircleProgress('gigsChart', gigsPercentage);
              updateCircleProgress('revenueChart', earningsPercentage);
              updateCircleProgress('audienceChart', attendancePercentage);
              
              // Visa att cirklarna är "online" genom att sätta färgen på texten
              d3.select('#gigsChart .percentage').style('color', '#00CED1');
              d3.select('#revenueChart .percentage').style('color', '#9932CC');
              d3.select('#audienceChart .percentage').style('color', '#FF00FF');
              
              return;
          }
      }
      
      // Om ingen specifik stad är vald, sätt cirklarna till offline-läge
      setCirclesOffline();
    }

    // Funktion för att sätta cirklarna i "offline"-läge
    function setCirclesOffline() {
      // Sätt standardvärden för offline-läge
      updateCircleProgress('gigsChart', 0);
      updateCircleProgress('revenueChart', 0);
      updateCircleProgress('audienceChart', 0);
      
      // Ändra färgen till grå för att indikera offline-läge
      d3.select('#gigsChart .percentage').style('color', '#888').text('Offline');
      d3.select('#revenueChart .percentage').style('color', '#888').text('Offline');
      d3.select('#audienceChart .percentage').style('color', '#888').text('Offline');
    }
    
    // Helper function to compare arrays
    function arrayEquals(a, b) {
        return a.length === b.length && 
               a.every((val, index) => val === b[index]);
    }
    
    // Helper function to create range of years
    function range(start, end) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    
    // Initialize with all cities shown
    showAllCities();
}


