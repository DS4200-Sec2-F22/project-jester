// STYLE BRANCH
//Networks Graph Reference: https://observablehq.com/@d3/force-directed-graph & https://medium.com/ninjaconcept/interactive-dynamic-force-directed-graphs-with-d3-da720c6d7811
//Spider Chart Reference: https://d3-graph-gallery.com/spider


/*
- NeighorNodes needs to be all connections to the node and the node itself, not just the new connections
- linked hover state for spider chart to node
- make active nodes empty
- hover over to display only connections to selected node (https://bl.ocks.org/martinjc/7aa53c7bf3e411238ac8aef280bd6581) or (https://observablehq.com/@john-guerra/force-directed-graph-with-link-highlighting)
- get rid Song Added:

Possible Additions:
1. Toggle for each neighborNodes song to indicate whether it should be shown on spider chart or not
2. Update node titles to song names and fix tooltip
3. Drop down for number of nearest neighbors.
4. Can we just have one setup function for both intialization and update for node graph like spider? Do we even need setup if we're starting with it empty? We could just call "addNode" and "click" to start?

*/


// ----------CONSTANTS FOR PAGE SETUP----------------
import data from "../data/data.json" assert { type: "json" };

const nodes = data.nodes; 
const links = data.links;

console.log(links);

const FRAME_HEIGHT = 700;
const FRAME_WIDTH = 700;
const MARGINS = { left: 50, right: 50, top: 50, bottom: 50 };
const SCALE = 50;
const PADDING = 20;

const features = ["Acousticness", "Danceability", "Energy", "Instrumentalness", "Liveness", "Speechiness", "Valence"];
let ticks = [2, 4, 6, 8, 10];
let radialScale = d3.scaleLinear()
          .domain([0, 10])
          .range([0, 250]);

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.left - MARGINS.right;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.top - MARGINS.bottom; 

// ----------SETTING THE FRAME FOR BOTH VISUALIZATIONS----------------

// -----------------PLOT 1-----------------

let activeNodes = []; 
let neighborNodes = [];
let activeLinks = [];

let hoverNodeColor = '#FF8D32'
let defaultNodeColor = '#A400EC' 
let defaultLinkColor = '#A400EC'
let original_opacity = .4;
let hover_opacity = .7;
let original_node_opacity = .8;
let hover_node_opacity = 1;
let font = '14px Arial';
let text_color = 'white';

console.log(activeLinks);
console.log(links);
console.log(data.links);

let NETWORKFRAME = d3.select("#vis1")
.append("svg")
.attr("height", FRAME_HEIGHT)
.attr("width", FRAME_WIDTH)
.attr("class", "frame");

let simulation = d3.forceSimulation(nodes)
.nodes(nodes)
.force('link', d3.forceLink(links).id(d => d.id));

simulation = d3.forceSimulation(activeNodes)
.nodes(activeNodes)
.force('charge', d3.forceManyBody().strength(-200))
.force('link', d3.forceLink(activeLinks).id(d => d.id).distance(5))
.on('tick', ticked);

simulation.force('link', d3.forceLink()
  .strength(link => link.strength));

let linkElements = NETWORKFRAME
.append('g')
.attr("fill", "none")
.attr('stroke-width', 1)
.selectAll('line')
.data(activeLinks)
.enter()
.append('line')
.attr('stroke', defaultLinkColor);

let nodeElements = NETWORKFRAME
.append('g')
.selectAll('circle')
.data(activeNodes)
.enter()
.append('circle')
.attr('r', 10)
.on("mouseenter", node_hover_over)
.on("mousemove", node_move)
.on("mouseleave", node_hover_out)
.on("click", point_clicked)
.attr('fill', defaultNodeColor)
.attr('stroke', defaultLinkColor)
.attr('opacity', original_node_opacity)
.attr('stroke-width', 1)
.call(d3
  .drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended));
  // TESTING FOR DISPLAYING NEAREST NODE CONNECTIONS
  // .on("mouseenter", (evt, d) => {
  //   linkElements
  //     .attr("display", "none")
  //     .filter(l => l.source.id === d.id || l.target.id === d.id)
  //     .attr("display", "block");
  // })
  // .on("mouseleave", evt => {
  //   linkElements.attr("display", "block");
  // });
  
  let textElement = NETWORKFRAME
  .append("g")
  .selectAll("text")
  .data(activeNodes)
  .enter()
  .append("text")
  .style("font", font)
  .attr('font-weight', 100)
  .attr('pointer-events', 'none')
  .text(d => d.title_track);
  
  function ticked() {
    linkElements
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
    
    nodeElements.attr("cx", d => d.x).attr("cy", d => d.y);
    
    textElement
    .attr("x", d => d.x - 5)
    .attr("y", d => d.y + 5);
  }
  
  let tooltip = d3.select("#vis1")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "lightgrey")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("width", "125px")
  .style("height", "72px")
  .style("text-align", "center")
  .style("font-size", "12px");
  
  document.getElementById("button").addEventListener("click", buttonClicked);
  
  function node_hover_over(event, d) {

    d3.select(event.currentTarget)
    .style("fill", hoverNodeColor)
    .style('stroke',hoverNodeColor)
    .style('opacity', hover_node_opacity);
    
    tooltip.style("opacity", 1);
    
    linkElements
    .attr("display", "none")
    .filter(l => l.source.id === d.id || l.target.id === d.id)
    .attr("display", "block")
    .attr("stroke", hoverNodeColor);
    
  }
  
  function node_move(event, d) {
    // add 'hover' tooltop movement functionality and text to the tooltip
    tooltip.html("Category: " + d.id + "<p>Value: " + d.genre_top + "</p><p>Listens: " + d.listens + "</p>");
    
    // moves the tooltip with the mouse
    tooltip.style("transform", "translate(" + d3.pointer(event)[0] + "px," + (-620 + d3.pointer(event)[1]) + "px)");
  }
  
  function node_hover_out(event, d) {
    // on mouseleave, change back to the original color 
    d3.select(event.currentTarget)
    .style("fill", defaultNodeColor)
    .style('opacity', original_node_opacity)
    .style('stroke',defaultNodeColor);
    
    // hides the tooltip
    tooltip.style("opacity", 0);
    
    linkElements
    .attr("display", "block")
    .attr("stroke", defaultLinkColor)
    
  }
  
  const svg = d3.select("#vis2")
  .append("svg")
  .attr("width", 650)
  .attr("height", 800);

  setupSpider();
  
  
  function buttonClicked() {
    const songTitle = document.getElementById('information').value; // gets the information from the textbox
    document.getElementById('information').value = ""; // sets textbox to "" 
    
    if (findInformationWithSong(songTitle) != -1) {
      const node = findInformationWithSong(songTitle)
      // draw(node, svg); //todo: this can be removed when we integrate linking
      addNode(node);
    } else {
      alert("Song not found :(");
    }
  }
  
  function addNode(node) {
    console.log(node);
    if (!activeNodes.reduce((prev, curr) => (curr.id == node.id) || (prev), false)) {
      //console.log("made it");
      activeNodes.push(node); //adds node to graph
      document.getElementById("songTitle").innerHTML = "Song Added: " + node.title_track;
    }
    
    resetLinks(node);
    resetVis();
  }
  
  function addNeighbor(node) {
    console.log("addNeighbor called");
    addNode(node);
    neighborNodes.push(node);
  }

  function resetVis() {

    NETWORKFRAME.selectAll('circle').remove();
    NETWORKFRAME.selectAll('line').remove();
    NETWORKFRAME.selectAll('text').remove();
    
    simulation = simulation.nodes(activeNodes)
    .force('charge', d3.forceManyBody().strength(-250))
    .force('centerX', d3.forceX())
    .force('centerY', d3.forceY())
    .force('center', d3.forceCenter(FRAME_WIDTH/2, FRAME_HEIGHT/2))
    .on('tick', ticked)
    .restart();
    
    simulation.force("link", d3.forceLink(activeLinks).id(d => d.id));
    
    simulation.force('link', d3.forceLink()
      .strength(link => link.strength));
    
    linkElements = NETWORKFRAME
    .attr('stroke-width', 1)
    .selectAll('line')
    .data(activeLinks)
    .enter()
    .append('line')
    .attr('stroke', defaultLinkColor);
    
    nodeElements = NETWORKFRAME
    .selectAll('circle')
    .data(activeNodes)
    .enter()
    .append('circle')
    .attr('r', 10)
    .on("mouseenter", node_hover_over)
    .on("mousemove", node_move)
    .on("mouseleave", node_hover_out)
    .on("click", point_clicked)
    .attr('fill', defaultNodeColor)
    .attr('stroke', defaultLinkColor)
    .attr('opacity', original_node_opacity)
    .attr('stroke-width', 1)
    .call(d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    textElement = NETWORKFRAME
    .selectAll("text")
    .data(activeNodes)
    .enter()
    .append("text")
    .style("font", font)
    .attr('font-weight', 100)
    .attr('pointer-events', 'none')
    .attr("stroke", text_color)
    .attr("stroke-width", 1.2)

    .text(d => d.title_track);

    console.log(activeLinks);
  }

  function findInformationWithSong(songTitle) {
    for (let i = 0; i < nodes.length; i++) {
        // console.log(nodes[i].title_track)
        if(nodes[i].title_track == songTitle) {
          return nodes[i]
        }
      }
      return -1;
    }
    
    function point_clicked(event, d) {
      // css toggle; when point is clicked, 'yes_border' is activated
      //d3.select("circle").classed("yes_border", d3.select(this).classed("yes_border") ? false : true); //todo: should class everything in neighborNodes after resetVis
      
      const id = d.id;
      
      neighborNodes = [];
      addNeighbor(d);
      const tempNodes = nodes;
      const tempLinks = links;
      
      for (let i = 0; i < tempLinks.length; i++) {
        if(tempLinks[i].source.id == id) {
          console.log("matched source");
          
          for (let j = 0; j < tempNodes.length; j++) {
            if (tempLinks[i].target.id == tempNodes[j].id) {
              addNeighbor(tempNodes[j]);
            }
          }
        }
      }
      console.log(neighborNodes);
      draw(neighborNodes);
    }
    
    function resetLinks(node) {
      for (let i = 0; i < activeNodes.length; i++) {
        for (let k = 0; k < links.length; k++) {
          if (links[k].source.id == activeNodes[i].id && links[k].target.id == node.id) {
            activeLinks.push(links[k]);
          } else if (links[k].target.id == activeNodes[i].id && links[k].source.id == node.id) {
            activeLinks.push(links[k]);
          }
        }
      }
    }
    
    // restarts visual when drag actions starts
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fy = d.y;
      d.fx = d.x;
    }
    
    //axes change as node gets dragged
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    //the targeted node is released when the drag action ends
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // -----------------PLOT 2----------------
    
    
    let colors = d3
    .scaleOrdinal(
      ["#ffd700",
      "#ffb14e",
      "#fa8775",
      "#ea5f94",
      "#cd34b5",
      "#9d02d7",
      "#0000ff"]);


    function spider_mouseover(event, d) {
      d3.select(event.currentTarget).style("opacity", hover_opacity);
    }

    function spider_mouseleave(event, d) {
      d3.select(event.currentTarget).style("opacity", original_opacity);
    }


      function draw(neighborNodes) {//todo: draw should be modified to not take in an id and just draw all nodes in neighborNodes[]
        svg.selectAll("*").remove();
        let data = [];
        console.log('ACOUSTICNESS' + neighborNodes[0].acousticness)
        
        
        for(let i=0;i<neighborNodes.length;i++) {
          let point = {};
          
          const acoustincness = neighborNodes[i].acousticness;
          const danceability = neighborNodes[i].danceability;
          const energy = neighborNodes[i].energy;
          const instrumentalness = neighborNodes[i].instrumentalness;
          const liveness = neighborNodes[i].liveness;
          const speechiness = neighborNodes[i].speechiness;
          const valence = neighborNodes[i].valence;
          
          // removed tempo because it's not from 0 - 1 
          
          
          let information = [acoustincness, danceability, energy, instrumentalness, liveness, speechiness, valence];
          
          console.log('INFORMTION' +information)
          
          point["Acousticness"] = information[0] * 10;
          point["Danceability"] = information[1] * 10;
          point["Energy"] = information[2] * 10;
          point["Instrumentalness"] = information[3] * 10;
          point["Liveness"] = information[4] * 10;
          point["Speechiness"] = information[5] * 10;
          point["Valence"] = information[6] * 10;
          
          data.push(point);
        }
        console.log("INSIDE DRAW" +data);
        
        
        setupSpider();

        let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);



        function getPathCoordinates(data_point) {
          let coordinates = [];
          for (let i = 0; i < features.length; i++) {
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
          }
          return coordinates;
        }

        for (let i = 0; i < data.length; i++) {
          let d = data[i];
          let color = colors(i);
          let coordinates = getPathCoordinates(d);

              //draw the path element
              svg.append("path")
              .datum(coordinates)
              .attr("d", line)
              .attr("stroke-width", 1)
              .attr("stroke", color)
              .attr("fill", color)
              .attr("stroke-opacity", 1)
              .attr("opacity", original_opacity)
              .on("mouseover", spider_mouseover)
              .on("mouseleave", spider_mouseleave);
              
              
            }
            
            // get name of each neighbor node
            function getSongNamesFromNeighbor(arr) {
              let listOfNames = []
              for(let i=0; i<arr.length; i++){
                listOfNames.push(arr[i].title_track)
              }
              return listOfNames;
            }
            
            
            // Add one dot in the legend for each name.
            svg.selectAll("mydots")
            .data(getSongNamesFromNeighbor(neighborNodes))
            .enter()
            .append("circle")
            .attr("cx", MARGINS.left)
            .attr("cy", function(d,i){ return FRAME_HEIGHT - 125 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d, i){ return colors(i);})
            
            // Add one dot in the legend for each name.
            svg.selectAll("mylabels")
            .data(getSongNamesFromNeighbor(neighborNodes))
            .enter()
            .append("text")
            .attr("x", MARGINS.left +20)
            .attr("y", function(d,i){ return FRAME_HEIGHT - 125 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d, i){ return colors(i);})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
          }
          
          
          
          function resetButtonClicked() {

            activeLinks = [];
            activeNodes = [];
            neighborNodes = [];
            
            svg.selectAll("*").remove();
            NETWORKFRAME.selectAll("*").remove();
            
            document.getElementById("songTitle").innerHTML = "Song Added: ";
            
          }
          
          document.getElementById("reset").addEventListener("click", resetButtonClicked);

          function angleToCoordinate(angle, value) {
            let x = Math.cos(angle) * radialScale(value);
            let y = Math.sin(angle) * radialScale(value);
            return { "x": 300 + x, "y": 300 - y };
          }

          function setupSpider() {

            ticks.forEach(t =>
              svg.append("circle")
              .attr("cx", 300)
              .attr("cy", 300)
              .attr("fill", "none")
              .attr("stroke", "white")
              .attr("stroke-width", 1.2)
              .attr("r", radialScale(t))
              );

            ticks.forEach(t =>
              svg.append("text")
              .attr("x", 305)
              .attr("y", 300 - radialScale(t))
              .text((t / 10).toString())
              );
            
            
            for (let i = 0; i < features.length; i++) {
              let ft_name = features[i];
              let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
              let line_coordinate = angleToCoordinate(angle, 10);
              let label_coordinate = angleToCoordinate(angle, 10.5);
              
              //draw axis line
              svg.append("line")
              .attr("x1", 300)
              .attr("y1", 300)
              .attr("x2", line_coordinate.x)
              .attr("y2", line_coordinate.y)
              .attr("stroke", "white")
              .attr("stroke-width", 1,2);
              
              
              //draw axis label
              svg.append("text")
              .attr("x", label_coordinate.x)
              .attr("y", label_coordinate.y)
              .attr("stroke", "white")
              .attr("stroke-width", 1.3)
              .text(ft_name);
            }
          }
          