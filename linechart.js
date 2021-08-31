require('easy-profiler')
var task = EP.begin('Generate_Pie_chart_report');
let printInConsoleRightNow = true;

async function generateLineChart() {
  const d3 = Object.assign({}, await import("d3"));
  // console.log(d3);
  const jsdom = require("jsdom");
  const { JSDOM } = jsdom;
  const fs = require("fs");

  const dom = new JSDOM(
    `<!DOCTYPE html><body><div id="my_dataviz"></div></body>`,
    { pretendToBeVisual: true }
  );

  // set the dimentions and margin
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  let body = d3.select(dom.window.document.querySelector("#my_dataviz"));
  var svg = body
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", "-35 -25 550 550")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  //Read the data
  const data = require("./data.json");

  // group the data: I want to draw one line per group
  const sumstat = d3.group(data, (d) => d.name); // nest function allows to group the calculation per level of a factor

  // Add X axis --> it is a date format
  const x = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return d.year;
      })
    )
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return +d.n;
      }),
    ])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // color palette
  const color = d3.scaleOrdinal().range(d3.schemeDark2);

  // Draw the line
  svg
    .selectAll(".line")
    .data(sumstat)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", function (d) {
      return color(d[0]);
    })
    .attr("stroke-width", 1.5)
    .attr("d", function (d) {
      return d3
        .line()
        .x(function (d) {
          return x(d.year);
        })
        .y(function (d) {
          return y(+d.n);
        })(d[1]);
    });

  fs.writeFileSync("liner_graph.svg", body.html());
  console.log(body.html());
  task.end(printInConsoleRightNow);
  EP.report(true);
  //   return body.html();
}

generateLineChart();