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
