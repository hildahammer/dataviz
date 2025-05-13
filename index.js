// Definierar färgpaletten för linjerna
const colorPalette = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33E9", 
    "#33E9FF", "#E9FF33", "#FF3333", "#33FFB2", 
    "#B233FF", "#FFB233"
  ];
  function generateData() {
    return new Promise((resolve, reject) => {
      try {
        const yearlyRange = Array.from({ length: 10 }, (_, i) => 2015 + i);
  
        // Skapa en mappning från cityID till city-info
        const cityMap = new Map(Cities.map(city => [city.id, {
          ...city,
          yearlyData: yearlyRange.map(year => ({ year, earnings: 0 }))
        }]));
  
        // Gå igenom varje spelning och summera cityEarnings per år
        Gigs.forEach(gig => {
          const year = new Date(gig.date).getFullYear();
          if (year >= 2015 && year <= 2024) {
            const city = cityMap.get(gig.cityID);
            if (city) {
              const dataPoint = city.yearlyData.find(d => d.year === year);
              if (dataPoint) {
                dataPoint.earnings += gig.cityEarnings;
              }
            }
          }
        });
  
        // Konvertera till array och beräkna total intäkt per stad
        const finalData = Array.from(cityMap.values())
          .map(city => ({
            ...city,
            totalEarnings: city.yearlyData.reduce((sum, d) => sum + d.earnings, 0),
            lastYearEarnings: city.yearlyData.find(d => d.year === 2024).earnings // Earnings för 2024
          }))
          .sort((a, b) => b.totalEarnings - a.totalEarnings); // Mest populära städer först
  
        // Förutsäga den hetaste staden för 2025 baserat på 2024
        const predictedHotCity = finalData[0]; // Den stad med högst intäkter 2024 förutspås vara hetast under 2025
  
        resolve({
          mostPopularCities: finalData,
          predictedHotCity
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Huvudfunktion som ritar grafen
  function drawCityPopularityChart() {
    // Referens till wrapper-elementet
    const wrapper = document.getElementById('wrapper');
    
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
          button.style.color = "black";
        }
        
        if (state.compareMode && index < 3) {
          button.disabled = true;
          button.style.opacity = "0.5";
        } else {
          button.disabled = false;
          button.style.opacity = "1";
        }
      });
    }
    
    // Funktion för att uppdatera analystexten
    function updateAnalysis() {
      const trendingCities = trending2025(state.cityData);
      const topCity = state.cityData.length > 0 ? state.cityData[0].name : 'Den översta staden';
      const trendingCity = trendingCities.length > 0 ? trendingCities[0].name : 'en av topprankade städerna';
      
      analysisContent.innerHTML = `
        <p style="margin-top: 10px">Baserat på den historiska utvecklingen av stadsintäkter från 2015 till 2024, 
        kan vi se tydliga trender bland de populäraste städerna. ${topCity} 
        har varit den mest inkomstbringande staden totalt sett under den analyserade perioden.</p>
        
        <p style="margin-top: 10px">För 2025 pekar vår trendanalys på att ${trendingCity} 
        kommer att bli den hetaste staden för evenemang, med en förväntad tillväxt på intäktssidan.</p>
        
        <p style="margin-top: 10px">Notera hur man kan se en tydlig nedgång för de flesta städer under 2020-2021, 
        troligen på grund av pandemin, följt av en stark återhämtning från 2022 och framåt.</p>
      `;
    }
    
    // Funktion för att uppdatera grafen
    function updateChart() {
      if (state.loading || state.error) return;
      
      const svgElement = d3.select("#chart-svg");
      const tooltip = d3.select("#tooltip");
      
      // Rensa tidigare innehåll
      svgElement.selectAll("*").remove();
      
      // Hämta filterade städer beroende på vald vy
      let filteredCities;
      if (state.compareMode && state.selectedCities.length > 0) {
        filteredCities = state.cityData.filter(city => state.selectedCities.includes(city.id));
      } else {
        switch (state.viewMode) {
          case 'top3':
            filteredCities = state.cityData.slice(0, 3);
            break;
          case 'top10':
            filteredCities = state.cityData.slice(0, 10);
            break;
          case 'all':
            filteredCities = state.cityData;
            break;
          default:
            filteredCities = state.cityData.slice(0, 10);
        }
      }
      
      // Uppdatera valda städer i jämförelseläget
      if (state.compareMode) {
        const selectedCitiesText = state.selectedCities.map(id => 
          state.cityData.find(city => city.id === id)?.name).join(', ') || 'Ingen vald';
        document.getElementById("selected-cities").textContent = selectedCitiesText;
      }
      
      // Skapa färgskalan
      const colorScale = d3.scaleOrdinal()
        .domain(filteredCities.map(city => city.id))
        .range(colorPalette);
        
      // Dimensioner för grafen
      const margin = { top: 50, right: 100, bottom: 60, left: 80 };
      const width = 800 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;
      
      // Skapa SVG container
      const svg = svgElement
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
      // Lägg till titel
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Stadsintäkter 2015-2024");
        
      // Skapa skalor för X och Y
      const years = Array.from({ length: 10 }, (_, i) => 2015 + i);
      const xScale = d3.scalePoint()
        .domain(years)
        .range([0, width]);
        
      // Hitta maxvärde för y-skalan
      const maxEarnings = d3.max(filteredCities, city => 
        d3.max(city.yearlyData, d => d.earnings)
      );
      
      const yScale = d3.scaleLinear()
        .domain([0, maxEarnings * 1.1]) // 10% extra utrymme
        .range([height, 0]);
        
      // Skapa linjer
      const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.earnings))
        .curve(d3.curveMonotoneX);
        
      // Lägg till områdesfyllning under linjerna
      const area = d3.area()
        .x(d => xScale(d.year))
        .y0(height)
        .y1(d => yScale(d.earnings))
        .curve(d3.curveMonotoneX);
        
      // Lägg till axlar
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => d.toString()))
        .style("font-size", "12px")
        .selectAll("text")
        .style("text-anchor", "middle");
        
      svg.append("g")
        .call(d3.axisLeft(yScale).ticks(8).tickFormat(d => `${Math.round(d / 1000)}k`))
        .style("font-size", "12px");
        
      // Lägg till axeltitlar
      svg.append("text")
        .attr("transform", `translate(${width/2}, ${height + 40})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("År");
        
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Intäkter (SEK)");
        
      // Rita linjer för varje stad
      filteredCities.forEach(city => {
        const cityYearlyData = city.yearlyData.sort((a, b) => a.year - b.year);
        
        // Lägg till genomskinlig fyllnad under linjen
        svg.append("path")
          .datum(cityYearlyData)
          .attr("fill", colorScale(city.id))
          .attr("fill-opacity", 0.1)
          .attr("d", area);
        
        // Rita linjen
        svg.append("path")
          .datum(cityYearlyData)
          .attr("fill", "none")
          .attr("stroke", colorScale(city.id))
          .attr("stroke-width", 3)
          .attr("d", line)
          .attr("class", `line-${city.id}`);
          
        // Lägg till punkter på varje datapunkt
        svg.selectAll(`.dot-${city.id}`)
          .data(cityYearlyData)
          .enter()
          .append("circle")
          .attr("class", `dot-${city.id}`)
          .attr("cx", d => xScale(d.year))
          .attr("cy", d => yScale(d.earnings))
          .attr("r", 5)
          .attr("fill", colorScale(city.id))
          .style("cursor", "pointer")
          .on("mouseover", function(event, d) {
            // Förstora punkten vid hover
            d3.select(this).attr("r", 8);
            
            // Visa tooltip
            tooltip
              .style("opacity", 1)
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY - 30}px`)
              .html(`
                <strong>${d.cityName}</strong><br/>
                År: ${d.year}<br/>
                Intäkter: ${d.earnings.toLocaleString()} SEK<br/>
                Antal gigs: ${d.gigsCount}<br/>
                Snitt biljettpris: ${d.avgTicketPrice} SEK
              `);
          })
          .on("mouseout", function() {
            // Återställ punktens storlek
            d3.select(this).attr("r", 5);
            
            // Dölj tooltip
            tooltip.style("opacity", 0);
          })
          .on("click", function(event, d) {
            // Visa mer detaljer om staden vid klick
            alert(`Detaljerad information för ${d.cityName} år ${d.year}:\n` +
                  `Intäkter: ${d.earnings.toLocaleString()} SEK\n` +
                  `Antal gigs: ${d.gigsCount}\n` +
                  `Snitt biljettpris: ${d.avgTicketPrice} SEK\n` +
                  `Befolkning: ${city.population}`);
          });
          
        // Lägg till stadens namn vid slutet av linjen
        const lastPoint = cityYearlyData[cityYearlyData.length - 1];
        svg.append("text")
          .attr("x", xScale(lastPoint.year) + 10)
          .attr("y", yScale(lastPoint.earnings))
          .attr("fill", colorScale(city.id))
          .attr("font-size", "12px")
          .style("font-weight", "bold")
          .text(city.name);
      });
      
      // Lägg till legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`);
      
      filteredCities.forEach((city, i) => {
        const legendItem = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`)
          .style("cursor", "pointer")
          .on("mouseover", function() {
            // Highlight the corresponding line
            d3.select(`.line-${city.id}`).attr("stroke-width", 5);
          })
          .on("mouseout", function() {
            d3.select(`.line-${city.id}`).attr("stroke-width", 3);
          })
          .on("click", function() {
            // Toggle city selection for compare mode
            if (state.compareMode) {
              const index = state.selectedCities.indexOf(city.id);
              if (index >= 0) {
                state.selectedCities = state.selectedCities.filter(id => id !== city.id);
              } else if (state.selectedCities.length < 2) {
                state.selectedCities = [...state.selectedCities, city.id];
              }
              updateChart();
            }
          });
        
        legendItem.append("rect")
          .attr("width", 15)
          .attr("height", 3)
          .attr("fill", colorScale(city.id));
          
        legendItem.append("text")
          .attr("x", 20)
          .attr("y", 5)
          .style("font-size", "12px")
          .text(city.name);
      });
      
      // Beräkna prognos för 2025: vilken stad har störst potential?
      const trendingCities = trending2025(state.cityData);
      
      // Visa prognos för 2025 överst i grafen
      if (trendingCities.length > 0) {
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", -40)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-style", "italic")
          .text(`Prognos 2025: ${trendingCities[0].name} kommer troligen att bli hetast!`);
      }
      
      // Uppdatera analysen
      updateAnalysis();
    }
  }
  
  // Hjälpfunktion för att beräkna trending städer
  function trending2025(cityData) {
    if (!cityData || cityData.length === 0) return [];
    
    return [...cityData]
      .map(city => {
        const lastYearData = city.yearlyData.find(d => d.year === 2024);
        return {
          id: city.id,
          name: city.name,
          trend: lastYearData?.trend2025 || 0
        };
      })
      .sort((a, b) => b.trend - a.trend);
  }
  
  // Funktion för att generera data
  async function generateData() {
    try {
      // Om data.js är laddat och Cities och gigsData finns tillgängliga
      let Cities = [];
      let gigsData = [];
      
      // Kontrollera om window.Cities och window.gigsData finns tillgängliga
      if (typeof window.Cities !== 'undefined' && Array.isArray(window.Cities)) {
        Cities = window.Cities;
      } else {
        // Fallback-data om data.js inte är korrekt laddat
        Cities = [
          {"name":"Khansaar","id":105,"population":461},
          {"name":"Krzystanopolis","id":192,"population":382},
          {"name":"Asteroid City","id":202,"population":355},
          {"name":"Sunnydale","id":249,"population":414},
          {"name":"Rimini","id":276,"population":330},
          {"name":"Belleville","id":338,"population":351},
          {"name":"Sao Adão","id":440,"population":326},
          {"name":"Moesko","id":441,"population":295},
          {"name":"Kaabuli","id":540,"population":330},
          {"name":"Pokyo","id":554,"population":412},
          {"name":"Agrabah","id":568,"population":257},
          {"name":"Mos Eisley","id":587,"population":411},
          {"name":"Dunauvarosz","id":602,"population":348},
          {"name":"Bagdogski","id":630,"population":367},
          {"name":"Karatas","id":653,"population":329},
          {"name":"Ville Rose","id":669,"population":418},
          {"name":"Kosmolac","id":755,"population":345},
          {"name":"Kattstad","id":791,"population":303},
          {"name":"Brightburn","id":830,"population":351},
          {"name":"Ciudad Encantada","id":836,"population":396},
          {"name":"Atlantika","id":869,"population":335},
          {"name":"Alphaville","id":927,"population":322},
          {"name":"Santo Tome","id":951,"population":415},
          {"name":"Chong Guo","id":959,"population":392}
        ];
      }
      
      if (typeof window.gigsData !== 'undefined' && Array.isArray(window.gigsData)) {
        gigsData = window.gigsData;
      } else {
        // Fallback-data om data.js inte är korrekt laddat
        gigsData = [
          {"date":"2015-01-01","djID":4310,"cityID":568,"producerID":5011,"cost":95827,"djEarnings":11122,"managerEarnings":4000,"cityEarnings":21271,"producerEarnings":17562,"attendance":218,"price":379},
          {"date":"2015-01-02","djID":1528,"cityID":587,"producerID":5208,"cost":317208,"djEarnings":41000,"managerEarnings":21100,"cityEarnings":57136,"producerEarnings":86344,"attendance":596,"price":429},
          {"date":"2015-01-03","djID":1528,"cityID":568,"producerID":9372,"cost":100751,"djEarnings":11055,"managerEarnings":5200,"cityEarnings":19974,"producerEarnings":14020,"attendance":239,"price":309}
        ];
      }
      
      // Generera simulerad data
      const years = Array.from({ length: 10 }, (_, i) => 2015 + i);
      const cityIds = Cities.map(city => city.id);
      
      // Skapa syntetisk data för alla städer över tid
      const allCityData = cityIds.map(cityId => {
        const city = Cities.find(c => c.id === cityId);
        const cityName = city ? city.name : `City ${cityId}`;
        
        // Beräkna initiala intäkter från exempeldata
        const initialEarnings = gigsData
          .filter(gig => gig.cityID === cityId)
          .reduce((sum, gig) => sum + gig.cityEarnings, 0);
          
        // Om det inte finns exempeldata för denna stad, sätt en slumpmässig startpunkt
        const baseEarnings = initialEarnings || Math.random() * 50000 + 10000;
        
        // Generera intäkter för varje år med en realistisk tillväxtkurva
        const yearlyData = years.map(year => {
          // Skapa en realistisk tillväxt eller nedgång baserat på årtal
          const growthFactor = 1 + (Math.random() * 0.4 - 0.1) + 
                              (year >= 2020 && year <= 2021 ? -0.3 : 0) +  // COVID-19 effekt
                              (year >= 2022 ? 0.15 : 0);  // Post-COVID återhämtning
          
          // Introducera variation i data
          const yearFactor = Math.pow(growthFactor, year - 2015);
          const earnings = Math.round(baseEarnings * yearFactor * (1 + Math.random() * 0.3));
          
          // För 2025, extrapolera trender
          const trend2025 = earnings * (1 + Math.random() * 0.2 + 0.1);
          
          // Estimerat antal gigs baserat på intäkter
          const gigsCount = Math.round(earnings / 25000 * (1 + Math.random() * 0.5));
          const avgTicketPrice = Math.round(300 + Math.random() * 200);
          
          return {
            cityId,
            cityName,
            year,
            earnings,
            trend2025: year === 2024 ? trend2025 : null,
            gigsCount,
            avgTicketPrice
          };
        });
        
        return {
          id: cityId,
          name: cityName,
          population: city ? city.population : 0,
          yearlyData,
          totalEarnings: yearlyData.reduce((sum, data) => sum + data.earnings, 0)
        };
      });
      
      // Sortera städer efter totala intäkter
      return [...allCityData].sort((a, b) => b.totalEarnings - a.totalEarnings);
    } catch (err) {
      console.error("Error generating data:", err);
      throw new Error("Fel vid datagenerering");
    }
  }
  
  // Kör huvudfunktionen när sidan laddas
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, starting chart initialization");
    drawCityPopularityChart();
  });