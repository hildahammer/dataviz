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