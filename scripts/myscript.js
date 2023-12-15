// add your JavaScript/D3 to this file

d3.select("#title-1").text("Electric Vehicle Percentage (%) over Time in WA");

d3.select("#description-1").text("This State Level Plot shows overall Electric Vehicle Percentage (Number of Electric Vehicles/Number of Total Vehicles) trend in WA. Compare it with your Selected County's Plot below!");

d3.csv("https://raw.githubusercontent.com/sw547/EVpop/main/data/d3_data_1.csv").then(StateData => {
  StateData.forEach(d => {
    d.EV_perc = +d.EV_perc;
    d.Date = d3.timeParse("%Y-%m-%d")(d.Date);
  });

  const margin = { top: 30, right: 50, bottom: 60, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#state-plot")
    .html("")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .domain(StateData.map(d => d.Date));

  const yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(StateData, d => d.EV_perc)]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%Y-%m")))
    .selectAll("text")
      .attr("y", 0)
      .attr("x", -8)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("class", "axis-title")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("dy", "1em")
    .text("EV Percentage");

  svg.selectAll(".bar")
    .data(StateData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.Date))
    .attr("width", xScale.bandwidth())
    .attr("y", d => yScale(d.EV_perc))
    .attr("height", d => height - yScale(d.EV_perc))
    .attr("fill", "#beb9db");
});

function CreateBarPlot(data, SelectedCounty) {
  const CountyData = data.filter(d => d.County === SelectedCounty);

  const margin = { top: 30, right: 50, bottom: 60, left: 50 };
  const width = 800- margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#county-plot")
    .html("") // Clear any previous SVG content
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .domain(CountyData.map(d => d.Date));

  const yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(CountyData, d => d.EV_perc)]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%Y-%m")))
    .selectAll("text")
      .attr("y", 0)
      .attr("x", -8)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(yScale));

  svg.selectAll(".bar")
    .data(CountyData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.Date))
    .attr("width", xScale.bandwidth())
    .attr("y", d => yScale(d.EV_perc))
    .attr("height", d => height - yScale(d.EV_perc))
    .attr("fill", "#7eb0d5");
}

d3.csv("https://raw.githubusercontent.com/sw547/EVpop/main/data/d3_data.csv").then(data => {
  data.forEach(d => {
    d.EV_perc = +d.EV_perc;
    d.Date = d3.timeParse("%Y-%m-%d")(d.Date);
  });

  const MeanEVperc = new Map(d3.rollups(data, v => d3.mean(v, d => d.EV_perc), d => d.County));

  const SortedCounties = Array.from(MeanEVperc.keys())
    .sort((a, b) => d3.descending(MeanEVperc.get(a), MeanEVperc.get(b)));

  const selector = d3.select("#countySelector");
  const radioContainers = selector.selectAll(".radio-container")
    .data(SortedCounties)
    .enter()
    .append("div")
    .attr("class", "radio-container");

  radioContainers.append("input")
    .attr("type", "radio")
    .attr("name", "county")
    .attr("id", d => "radio-" + d.replace(/\s+/g, ""))
    .attr("value", d => d)
    .on("change", event => CreateBarPlot(data, event.target.value));

  radioContainers.append("label")
    .attr("for", d => "radio-" + d.replace(/\s+/g, ""))
    .text(d => d);

  const FirstCounty = SortedCounties[0];
  d3.select(`#radio-${FirstCounty.replace(/\s+/g, "")}`).property("checked", true);
  CreateBarPlot(data, FirstCounty);
});

d3.select("#title-2").text("Electric Vehicle Percentage (%) over Time in a Selected County in WA");

d3.select("#description-2").text("Select a county in Washington State to see Electric Vehicle Percentage over time in that county. Note that y-axis scale changes for differnet counties for clearer graphs. Counties is sorted from highest mean EV percentage to lowest. Have fun!");
