//Width and height
			var w = 1000, h = 1000;
			
			//Create SVG element for India's map
			var svg = d3.select("#map")
						.append("svg")
						.attr("width", w)
						.attr("height", h);
			
			//Create SVG element for World's map
			var worldSvg = d3.select("#worldMap")
						.append("svg")
						.attr("width", w)
						.attr("height", h - 400);
			
			// Adding groups for layering
			var states = svg.append("g");
			var arcs = svg.append("g").attr("class","arcs");
			var longArc = svg.append("g").attr("class","arcs");
			var stations = svg.append("g");
			var world = worldSvg.append("g")
			var countries = worldSvg.append("g");	

			// Rail routes to HQ (New Delhi) in lon/lat form
			var zonalTrainRoutes = [
				{sourceLocation: [77.215956,28.613897],targetLocation: [83.357728,26.610168]}, // NDLS - GOR
				{sourceLocation: [77.215956,28.613897],targetLocation: [88.347602,22.567746]}, // NDLS - KOL
				{sourceLocation: [77.215956,28.613897],targetLocation: [78.4983,17.4399]}, // NDLS - SEC
				{sourceLocation: [77.215956,28.613897],targetLocation: [80.282953,13.079691]}, // NDLS - CHE
				{sourceLocation: [77.215956,28.613897],targetLocation: [72.832711,18.95238]}, // NDLS - BOM
				{sourceLocation: [77.215956,28.613897],targetLocation: [75.137985,15.351838]}, // NDLS - HUB
				{sourceLocation: [77.215956,28.613897],targetLocation: [75.820406,26.916129]}, // NDLS - JAI
				{sourceLocation: [77.215956,28.613897],targetLocation: [80.107287,23.328862]}, // NDLS - JAB
				{sourceLocation: [77.215956,28.613897],targetLocation: [81.896732,25.28596]}, // NDLS - ALL
				{sourceLocation: [77.215956,28.613897],targetLocation: [81.686986,22.395583]}, // NDLS - BIL
				{sourceLocation: [77.215956,28.613897],targetLocation: [85.825794,20.28315]}, // NDLS - BHU
				{sourceLocation: [77.215956,28.613897],targetLocation: [85.209009,25.690557]} // NDLS - HAJI			
			];
			
			var longestRoute = [
				{sourceLocation: [94.91542,27.485983],targetLocation: [77.549934,8.079252]} // DIB - KAN
			];
		
			// Projection for India
			var projection = d3.geoMercator()
							.translate([w/2, h/2 - 140])
							.center([80,25])
							.scale(1500);
			
			// Projection for world
			var worldProjection = d3.geoEquirectangular()
								.translate([w/2, h/2 - 200])
								.precision(.1)
								.scale(153);
			
			// Colors taken from colorbrewer2
			var color = d3.scaleLinear()
						.range(["#f7fbff", "#08306b"]); 

			//India's path generator
			var path = d3.geoPath()
						.projection(projection);
			
			//World's path generator
			var worldPath = d3.geoPath().projection(worldProjection);
	
			/* Legend begins */
			
			// Legend for choropleth created using http://d3-legend.susielu.com/
			var legendGroup = svg.append("g")
								.attr("scale", 2);
			
			var log = d3.scaleLog()
    				.domain([ 10, 1000, 10000 ])
    				.range(["#f7fbff", "#08306b"]);
				
			var bars = legendGroup.append("g")
  						.attr("class", "legendLog")
  						.attr("transform", "translate(600,50)");

			var logLegend = d3.legendColor()
							.cells([10, 50, 100, 500, 1000, 5000, 10000])
							.orient("horizontal")
							.shapeWidth(50)
							.labelFormat(d3.format(".0f"))
							.title("Total track length (km)")
							.scale(log);

			legendGroup.select(".legendLog").call(logLegend);
			
			var stationCircle = legendGroup.append("circle")
								.attr("cx", 610).attr("cy", 150).attr("r", 10).style("fill", "yellow")
           						.style("opacity", 0.9).attr("stroke", "black").attr("stroke-width, 1")
						
			var twoStations = legendGroup.append("circle").attr("cx", 800).attr("cy", 150)
								.attr("r", 10).attr("fill", "brown")
           						.attr("opacity", 0.9).attr("stroke", "black").attr("stroke-width, 1");
								
			var hqText = legendGroup.append("text").text("Zonal Railways HQ").attr("x", 630).attr("y", 155);
						
			var stationText = legendGroup.append("text").text("Railway Station").attr("x", 820).attr("y", 155);
							
			var routeText = legendGroup.append("text")
							.text("Train Route")
							.attr("x", 860)
							.attr("y", 208);
			
			var track = legendGroup.append("rect")
								.attr("x", 800).attr("y", 200)							
								.attr("height", 5).attr("width", 50)				
								.attr("fill", "#fc4e2a");
			var longestTrack = legendGroup.append("rect")
								.attr("x", 600).attr("y", 250)							
								.attr("height", 5).attr("width", 50)				
								.attr("fill", "green");
			var longestRouteText = svg.append("text")
							.text("Longest rail route in India").attr("x", 660).attr("y", 258);				
			
			var delhiHQ = legendGroup.append("rect")
								.attr("x", 601).attr("y", 190)
								.attr("height", 20).attr("width", 20)
								.attr("fill", "yellow").attr("stroke-width", 1).attr("stroke", "black");
			
			var delhiText = legendGroup.append("text")
							.text("National Railways HQ").attr("x", 630).attr("y", 208);
			
			var worldLegend = worldSvg.append("text")
							.text("Area = Size (km)").attr("x", 70).attr("y", 400)
							.attr("fill", "black");
			var worldSize = worldSvg.append("text")
							.text("[1.27, 250000]").attr("x", 70).attr("y", 420)
							.attr("fill", "black");
	
			/* Legend ends */
			
			// Loading three datasets using queue
			
			d3.queue()
				.defer(d3.json, "data/india.geojson")
				.defer(d3.csv, "data/indian-states.csv")
				.defer(d3.csv, "data/indian-stations.csv")
				.defer(d3.json, "data/world.json")
				.defer(d3.csv, "data/world-countries.csv")
				.await(function(error, json, data, citydata, worldJSON, countrydata) {
    				if (error) {
        				console.error('Oh dear, something went wrong: ' + error);
    				}
    				else {
						
					// Mapping track length of each state (indian-states.csv) to India's GeoJSON states(india.json) in order to create a choropleth
					for(var i = 0; i < data.length; i++) {
						var dataSet = data[i].state;
						var dataValue = parseFloat(data[i].value);

						for (var j = 0; j < json.features.length; j++) {
							var jsonState = json.features[j].properties.NAME_1;
							if(dataSet == jsonState) {
								json.features[j].properties.value = dataValue;
								break;
							}
						}
					} 
					
					// Defining colors for the choropleth
					color.domain([
						d3.min(data, function(d) { return d.value; }),
						d3.max(data, function(d) { return d.value; })
					]); 

					//Bind data and create one path per GeoJSON feature
					states.selectAll("path")
					   .data(json.features)
					   .enter()
					   .append("path")
					   .attr("d", path)
					   .attr("fill", function(d) {
							var value = d.properties.value;
							if(value) {
								return color(value);
							} else
								return "#ccc";
					});
						
					// Drawing world map
					world.selectAll("worldPath")
						.data(worldJSON.features)
						.enter().append("path")
						.attr("d", worldPath)
						.attr("fill","#eaeaea")
						.attr("stroke","black").attr("stroke-width", 0.5);
						
					// Drawing country circle
					countries.selectAll(".world-countries")
						.data(countrydata)
						.enter()
						.append("circle")
						.attr("cx", function(d) {
							return worldProjection([d.lon, d.lat])[0];
						})
						.attr("cy", function(d) {
							return worldProjection([d.lon, d.lat])[1];
						})
					
						.attr("r", function(d) {
							return Math.sqrt(d.size / 300);
						})
						
						.attr("fill", function(d) {
							if (d.name == "India") {
							return "green";
						} else return "yellow";
						})
           				
						.attr("opacity", 0.8)
						.attr("stroke", "black")
						.attr("stroke-width, 1");

					
					// Draw circles for each station					
					stations.selectAll(".indian-stations")
						.data(citydata)
						.enter()
						.append("circle")
						.attr("cx", function(d) {
							return projection([d.lon, d.lat])[0];
						})
						.attr("cy", function(d) {
							return projection([d.lon, d.lat])[1];
						})
					
						.attr("r", function(d) {
							if (d.name == "New Delhi") {
								return 0;
							} else return 8;
						})
						
						.attr("fill", function(d) {
							if (d.name == "Dibrugarh" || d.name == "Kanyakumari") {
							return "brown";
						} else return "yellow";
						})
           				
						.attr("opacity", 0.95)
						.attr("stroke", "black")
						.attr("stroke-width, 1");
					
					// Draw square for New Delhi (Main HQ)
					var Delhi = svg.append("rect")
								.attr("x", 415.113).attr("y", 245.969)
								.attr("height", 20).attr("width", 20)
								.attr("fill", "yellow").attr("stroke-width", 1).attr("stroke", "black");
					
					// Write city names
					stations.selectAll(".indian-stations")
								.data(citydata)
								.enter()
								.append("text")
								.text(function(d) { return d.name; })
								.attr("x", function(d) { 
									if (d.name == "New Delhi") {
										return projection([d.lon, d.lat])[0] - 90;
									} else
									return projection([d.lon, d.lat])[0] + 10; 
								})
								.attr("y", function(d) { 
									return projection([d.lon, d.lat])[1] + 15; 
								})
								.attr("class", "city-name");		
						
					// Draw arcs between stations
					arcs.selectAll("path")
						.data(zonalTrainRoutes)
						.enter().append("path").attr("fill", "none")
						.attr("stroke", "#fc4e2a").attr("stroke-width", "3")
						.attr('d', function(d) { 
						return makeArc(d, 'sourceLocation', 'targetLocation', 4); 
						});
					
					// Draw arc for longest train route
					longArc.selectAll("path")
						.data(longestRoute)
						.enter().append("path").attr("fill", "none")
						.attr("stroke", "green").attr("stroke-width", "3")
						.attr('d', function(d) { 
						return makeArc(d, 'sourceLocation', 'targetLocation', 0.9); 
						});
					}
				});
			
			// Function to create arcs
			function makeArc(d, sourceName, targetName, bend){
			var sourceLngLat = d[sourceName],
				targetLngLat = d[targetName];

			if (targetLngLat && sourceLngLat) {
				var sourceXY = projection(sourceLngLat),
					targetXY = projection(targetLngLat);

				if (!targetXY) console.log(d, targetLngLat, targetXY)
				var sourceX = sourceXY[0], sourceY = sourceXY[1];
					
				var targetX = targetXY[0], targetY = targetXY[1];
						
				var dx = targetX - sourceX, dy = targetY - sourceY, dr = Math.sqrt(dx * dx + dy * dy)*bend;

				var west_of_source = (targetX - sourceX) < 0;

				if (west_of_source) 
				{
					return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
				}
				else {
					return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
				}
			} 
			else {
				return "M0,0,l0,0z";
			}
		} 