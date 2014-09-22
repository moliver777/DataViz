// ------------------------ \\
// ----- ODDS TRACKER ----- \\
// ------------------------ \\
var OddsTracker = function OddsTracker(){}

OddsTracker.prototype.start = function(options) {
	try {
		// Validate options
		if (!(typeof options["name"] === "string") || options["name"].length < 1) throw "Viz requires a name";
		if (!(typeof options["container"]) === "string" || options["container"].length < 1) throw "Viz requires a container";
		if (!$("#"+options["container"])[0]) throw "Container with id #"+options["container"]+" could not be found";
		if (!(typeof options["type"] === "string") || options["type"].length < 1) throw "Viz requires a race type (THOROUGHBRED, etc)";
		if (isNaN(parseInt(options["numRunners"])) || parseInt(options["numRunners"]) < 1) throw "Viz requires numRunners >= 1"
		if (isNaN(parseInt(options["historyLength"]))) options["historyLength"] = 30;
    if (!(options["data"] instanceof Array) || options["data"].length < 1) throw "Viz requires a data Array with at least 1 dataset";
		if (isNaN(parseInt(options["xLabelSpacing"]))) options["xLabelSpacing"] = 30;
		if (isNaN(parseInt(options["yLabelSpacing"]))) options["yLabelSpacing"] = 60;
		if (isNaN(parseInt(options["fontSize"]))) options["fontSize"] = 12;
		if (isNaN(parseInt(options["radius"]))) options["radius"] = 3;
		if (isNaN(parseInt(options["stroke"]))) options["stroke"] = 2;
		this._init(options);
		return {};
	} catch(e) {
		return {error: e};
	}
}

// Toggle a dataset
// Returns status object including details of datasets
OddsTracker.prototype.toggle = function(bettingInterestNumber) {
  var self = this;
  try {
		if (isNaN(parseInt(bettingInterestNumber))) throw "Selected runner does not exist";
		if (parseInt(bettingInterestNumber) > this.numRunners) throw "Selected runner does not exist";
		if (parseInt(bettingInterestNumber) <= 0) throw "Selected runner does not exist";
    this.visibility[bettingInterestNumber] = !this.visibility[bettingInterestNumber];
    var odds = d3.select("g#oddsTrackerG"+this.name)
  	odds.selectAll("line.connector.r"+bettingInterestNumber)
  		.transition()
  			.duration(250)
  			.style("opacity",function(){return self.visibility[bettingInterestNumber] ? 1 : 0});
  	odds.selectAll("circle.node.r"+bettingInterestNumber)
  		.transition()
  			.duration(250)
  			.style("opacity",function(){return self.visibility[bettingInterestNumber] ? 1 : 0});
  	return this._status();
  } catch (e) {
    return this._status(e);
  }
}

// Update datasets with latest odds
// Returns status object including details of datasets
OddsTracker.prototype.update = function(oddsJson) {
  // do something with the new odds json
  this._animate();
  return this._status();
}

// ----------------------------- \\
// ----- PRIVATE FUNCTIONS ----- \\
// ----------------------------- \\
OddsTracker.prototype._init = function(options) {
	this.name = options["name"];
	this.container = "#"+options["container"];
	this.xLabelSpacing = parseInt(options["xLabelSpacing"]);
	this.yLabelSpacing = parseInt(options["yLabelSpacing"]);
	this.wrapperWidth = $(this.container).width();
	this.wrapperHeight = $(this.container).height();
	this.width = this.wrapperWidth-this.yLabelSpacing;
	this.height = this.wrapperHeight-this.xLabelSpacing;
	
	this.data = options["data"];
	this.numRunners = parseInt(options["numRunners"]);
  this.historyLength = parseInt(options["historyLength"]);
  this.type = options["type"].toUpperCase();
	this.fontSize = options["fontSize"]+"px";
	this.radius = parseInt(options["radius"]);
	this.stroke = parseInt(options["stroke"]);
  this.labels = ["5","10","15","20","25+"];
  this.labelInterval = null;
	this.lastUpdated = new Date();
	
  // set all paths visible to start
  this.visibility = new Object();
  for (i=1; i<=this.numRunners; i++) this.visibility[i] = true;
    
	// axis definitions
	this.x = d3.scale.linear().domain([0,this.data.length-1]).range([0,this.width]);
	this.y = d3.scale.linear().domain([0,25]).range([this.height,0]);
	
	this._build();
  this._intervals();
}

OddsTracker.prototype._teardown = function() {
  clearInterval(this.label_updater);
	this.name = null;
	this.container = null;
	this.xLabelSpacing = null;
	this.yLabelSpacing = null;
	this.wrapperWidth = null;
	this.wrapperHeight = null;
	this.width = null;
	this.height = null;
	this.data = null;
  this.numRunners = null;
  this.historyLength = null;
	this.type = null;
	this.fontSize = null;
	this.radius = null;
	this.stroke = null;
  this.labels = null;
  this.labelInterval = null;
	this.lastUpdated = null;
  this.visibility = null;
	this.x = null;
	this.y = null;
}

// build initial state of viz
OddsTracker.prototype._build = function() {
  var self = this;
  $(this.container).empty();

	// create svg canvas
	var oddsWrapper = d3.select("#"+$(this.container).attr("id"))
		.append("svg:svg")
		.attr("width",this.wrapperWidth)
		.attr("height",this.wrapperHeight)
		.attr("id","oddsTrackerSvg"+this.name);
	
	// create svg group with label padding
	var odds = d3.select("svg#oddsTrackerSvg"+this.name)
		.append("svg:g")
		.attr("width",this.width)
		.attr("height",this.height)
		.attr("transform","translate(5,5)")
		.attr("id","oddsTrackerG"+this.name);
	
	// x axis
	odds.append("svg:line")
		.attr("x1",0)
		.attr("x2",this.width)
		.attr("y1",this.height)
		.attr("y2",this.height)
		.style("stroke","#000");
	odds.append("svg:text")
		.attr("id","xLabel1"+this.name)
		.attr("dx",function(){return 0})
		.attr("dy",function(){return self.height+(self.xLabelSpacing/2)})
		.style("font-size",this.fontSize)
		.style("fill","#000")
		.style("text-anchor","start")
		.style("dominant-baseline","central")
		.text("5mins");
	odds.append("svg:text")
		.attr("id","xLabel2"+this.name)
		.attr("dx",this.width)
		.attr("dy",function(){return self.height+(self.xLabelSpacing/2)})
		.style("font-size",this.fontSize)
		.style("fill","#000")
		.style("text-anchor","end")
		.style("dominant-baseline","central")
		.text("0mins");
	
	// y axis
	odds.append("svg:line")
		.attr("x1",this.width)
		.attr("x2",this.width)
		.attr("y1",0)
		.attr("y2",this.height)
		.style("stroke","#000");
	odds.selectAll("text.label")
			.data(this.labels)
		.enter().append("svg:text")
			.attr("class","label")
			.attr("dx",function(){return self.width+2})
			.attr("dy",function(d){return self.y(parseInt(d))})
			.style("font-size",this.fontSize)
			.style("fill","#000")
			.style("text-anchor","left")
			.style("dominant-baseline","central")
			.text(function(d){return d});

  // create paths
  for (bettingInterestNumber=1; bettingInterestNumber<=this.numRunners; bettingInterestNumber++) {
    var dataset = self._dataset(bettingInterestNumber);
    
    // initialise connectors
    odds.selectAll("line.r"+bettingInterestNumber)
        .data(dataset.slice(0,dataset.length-1))
      .enter().append("svg:line")
        .attr("id",function(d,i){return "connector"+bettingInterestNumber+"_"+i})
        .attr("class",function(d,i){return "connector r"+bettingInterestNumber})
        .attr("x1",function(d,i){return self.x(i)})
        .attr("x2",function(d,i){return self.x(i+1)})
        .attr("y1",function(d){return (d>25) ? self.y(25) : self.y(d)})
        .attr("y2",function(d,i){
          if (dataset[i+1]) {
            return (dataset[i+1]>25) ? self.y(25) : self.y(dataset[i+1]);
          } else {
            return (d>25) ? self.y(25) : self.y(d);
          }
        })
        .attr("value1",function(d,i){return d })
        .attr("value2",function(d,i){return dataset[i+1] ? dataset[i+1] : d})
        .attr("position",function(d,i){return i})
        .style("z-index",10000)
        .style("opacity",function(){return self.visibility[bettingInterestNumber] ? 1 : 0})
        .style("stroke-width",this.stroke)
  			.style("stroke",function(){
  				return (DataViz.saddleCloth(self.type,bettingInterestNumber) == "#FFFFFF" ? 
  					"#000000" : 
  						DataViz.saddleCloth(self.type,bettingInterestNumber))
  			});
    
    // initialise nodes
    odds.selectAll("circle.r"+bettingInterestNumber)
        .data(dataset)
      .enter().append("svg:circle")
        .attr("id",function(d,i){return "node"+bettingInterestNumber+"_"+i})
        .attr("class","node r"+bettingInterestNumber)
        .attr("cx",function(d,i){return self.x(i)})
        .attr("cy",function(d){return (d>25) ? self.y(25) : self.y(d)})
        .attr("r",this.radius)
        .attr("value",function(d){return d})
        .attr("position",function(d,i){return i})
        .style("z-index",10000)
        .style("opacity",function(){return self.visibility[bettingInterestNumber] ? 1 : 0})
  			.style("fill",function(){return DataViz.saddleCloth(self.type,bettingInterestNumber)})
  			.style("stroke",function(){
  				return (DataViz.saddleCloth(self.type,bettingInterestNumber) == "#FFFFFF" ? 
  					"#000000" : 
  						DataViz.saddleCloth(self.type,bettingInterestNumber))
  			});
  }
}

OddsTracker.prototype._animate = function() {
  //   try {
  //     self.count += 1;
  //     var chart = d3.select("#overtimeChart");
  //     var odds_json = self.data[self.data.length-1];
  //     var prev_odds_json = self.data[self.data.length-2];
  //     for(r=1;r<=self.num_runners;r++) {
  //       var jodds = odds_json[r];
  //       var prev_odds = prev_odds_json[r];
  //       try { odds = parseFloat(jodds["pp"]) } catch (e) { odds = 0; }
  //       try { prev_odds = parseFloat(prev_odds["pp"]) } catch (e) { prev_odds = 0; }
  //       odds = isNaN(odds) ? 0 : odds;
  //
  //       // create new connectors
  //       chart.append("svg:line")
  //         .attr("id", "connector"+r+"_"+self.count)
  //         .attr("class", "connector r"+r)
  //         .attr("x1", function() { return x(self.data.length) })
  //         .attr("x2", function() { return x(self.data.length+1) })
  //         .attr("y1", function() { return (odds>25) ? y(25) : y(odds) })
  //         .attr("y2", function() { return (odds>25) ? y(25) : y(odds) })
  //         .attr("value1", function() { return odds })
  //         .attr("value2", function() { return odds })
  //         .attr("position", function() { return self.data.length })
  //         .style("z-index", 5000)
  //         .style("stroke", function() { return (DATAVIS.saddleCloth(self.breed, r, self.country)=="#FFFFFF") ? "#000000" : DATAVIS.saddleCloth(self.breed, r, self.country) })
  //         .style("display", function() { return self.status[r] ? 'block' : 'none' });
  //
  //       // create new nodes
  //       chart.append("svg:circle")
  //         .attr("id", "node"+r+"_"+self.count)
  //         .attr("class", "node r"+r)
  //         .attr("cx", function() { return x(self.data.length) })
  //         .attr("cy", function() { return (odds>25) ? y(25) : y(odds) })
  //         .attr("r", "2")
  //         .attr("value", function() { return odds })
  //         .attr("position", function() { return self.data.length-1 })
  //         .style("z-index", 5000)
  //         .style("fill", function() { return DATAVIS.saddleCloth(self.breed, r, self.country) })
  //         .style("stroke", function() { return (DATAVIS.saddleCloth(self.breed, r, self.country)=="#FFFFFF") ? "#000000" : DATAVIS.saddleCloth(self.breed, r, self.country) })
  //         .style("display", function() { return self.status[r] ? 'block' : 'none' });
  //
  //       chart.select("line#connector"+r+"_"+(self.count-1))
  //         .attr("value2", function() { return odds });
  //     }
  //
  //     // animate everything to new x and y positions
  //     $.each($("#overtimeChart line.connector"), function(i,el) {
  //       if (self.data.length==self.maxTime) $(el).attr("position", parseInt($(el).attr("position"))-1);
  //       chart.select("#"+$(el).attr("id"))
  //         .transition()
  //           .duration(1000)
  //           .attr("x1", function() { return x(parseInt($(el).attr("position"))-1) })
  //           .attr("x2", function() { return x(parseInt($(el).attr("position"))) })
  //           .attr("y2", function() { return (parseFloat($(el).attr("value2"))>25) ? y(25) : y(parseFloat($(el).attr("value2"))) });
  //     })
  //     $.each($("#overtimeChart circle.node"), function(i,el) {
  //       if (self.data.length==self.maxTime) $(el).attr("position", parseInt($(el).attr("position"))-1);
  //       chart.select("#"+$(el).attr("id"))
  //         .transition()
  //           .duration(1000)
  //           .attr("cx", function() { return x(parseInt($(el).attr("position"))) })
  //     })
  //
  //     // exit old nodes and connectors out of svg range
  //     $('#overtimeChart circle.node[position="'+String(-1)+'"]').remove();
  //     $('#overtimeChart line.connector[position="'+String(-1)+'"]').remove();
  //   } catch (e) {
  //     // console.log(e.message)
  //   }
}

OddsTracker.prototype._intervals = function() {
  // set up label interval
}

// build dataset
OddsTracker.prototype._dataset = function(bettingInterestNumber) {
	var self = this;
	var dataset = new Array();
	// build target dataset for animation of viz
	if (this.data && (this.data instanceof Array)) {
    $.each(this.data, function(i,history) {
      var odds = parseFloat(history.odds[bettingInterestNumber]);
      if (isNaN(odds)) odds = 0; // rescue NaN values
      dataset.push(odds);
    });
	}
	return dataset;
}

OddsTracker.prototype._status = function(e) {
	return {
		data: this.data,
		error: e,
		lastUpdated: this.lastUpdated
	}
}
