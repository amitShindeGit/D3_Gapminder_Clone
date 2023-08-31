/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 2 - Gapminder Clone
 */

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

//Scales
const x = d3.scaleLog().domain([150, 150000]).range([0, WIDTH]).base(10);
const y = d3.scaleLinear().domain([0, 90]).range([HEIGHT, 0]);
const area = d3
  .scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000]);

const continentColor = d3.scaleOrdinal(d3.schemePastel1);

let time = 0;

const g = svg
  .append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

//Labels
const xLabels = g
  .append("text")
  .attr("y", HEIGHT + 50)
  .attr("x", WIDTH / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("GDP Per Capita ($)");

const yLabel = g
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Life Expectancy (Years)");

const timeLabel = g
  .append("text")
  .attr("y", HEIGHT - 10)
  .attr("x", WIDTH - 40)
  .attr("font-size", "40px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("1800");

var tooltip = d3
  .select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text("a simple tooltip");

//X Axis
const xAxisCall = d3
  .axisBottom(x)
  .tickValues([40, 4000, 40000])
  .tickFormat(d3.format("$"));

g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${HEIGHT})`)
  .call(xAxisCall);

// Y Axis
const yAxisCall = d3.axisLeft(y);
g.append("g").attr("class", "y axis").call(yAxisCall);

d3.json("data/data.json").then(function (data) {
  const filterData = data.map(({ countries, ...others }) => {
    const filteredLifeExp = countries.filter((ele) => ele.life_exp !== null);
    const filterIncomeWithLifeExp = filteredLifeExp.filter(
      (ele) => ele.income !== null
    );
    return filterIncomeWithLifeExp;
  });

  d3.interval(function () {
    time = time < 214 ? time + 1 : 0;
    update(filterData[time]);
  }, 100);

  update(filterData[time]);
});

function update(data) {
  // standard transition time for the visualization
  const t = d3.transition().duration(100);

  //4 phases of 	making charts dynamic in D3
  // JOIN new data with old elements.
  const circles = g.selectAll("circle").data(data, (d) => d.country);

  // EXIT old elements not present in new data.
  circles.exit().remove();

  circles
    .enter()
    .append("circle")
    .attr("fill", function (d) {
      if (d.country == "India") {
        return "orange";
      } else {
        return continentColor(d.continent);
      }
    })
    .on("mouseover", function (d) {
      return tooltip.style("visibility", "visible").text(d.country);
    })
    .on("mousemove", function () {
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    })
    .merge(circles)
    .transition(t)
    .attr("cx", (d) => x(d.income))
    .attr("cy", (d) => y(d.life_exp))
    .attr("r", (d) => Math.sqrt(area(d.population) / Math.PI));

  // update the time label
  timeLabel.text(String(time + 1800));
}
