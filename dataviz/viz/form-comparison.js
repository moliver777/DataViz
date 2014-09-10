// --------------------------- \\
// ----- FORM COMPARISON ----- \\
// --------------------------- \\
var FormComparison = function FormComparison(){}

FormComparison.prototype.start = function(options) {
	try {
		// Validate options
		if (!(typeof options["name"] === "string") || options["name"].length < 1) throw "Viz requires a name";
		if (!(typeof options["container"]) === "string" || options["container"].length < 1) throw "Viz requires a container";
		if (!$("#"+options["container"])[0]) throw "Container with id #"+options["container"]+" could not be found";
		if (!(typeof options["type"] === "string") || options["type"].length < 1) throw "Viz requires a race type (THOROUGHBRED, etc)";
		if (isNaN(parseInt(options["formLength"])) || parseInt(options["formLength"]) < 3) throw "Viz requires formLength >= 3"
		if (!(options["data"] instanceof Object) || Object.size(options["data"]) < 2) throw "Viz requires a data Object with at least 2 runners"
		if (!(options["labels"] instanceof Array) || options["labels"].length >= 12) options["labels"] = ["N/A","PFU","10th+","9th","8th","7th","6th","5th","4th","3rd","2nd","1st"]
		if (isNaN(parseInt(options["xLabelSpacing"]))) options["xLabelSpacing"] = 30;
		if (isNaN(parseInt(options["yLabelSpacing"]))) options["yLabelSpacing"] = 60;
		if (isNaN(parseInt(options["fontSize"]))) options["fontSize"] = 12;
		if (isNaN(parseInt(options["radius"]))) options["radius"] = 3;
		if (isNaN(parseInt(options["stroke"]))) options["stroke"] = 2;
		options["labels"].splice(12,options["labels"].length-12)
		this._init(options);
		return {};
	} catch(e) {
		return {error: e};
	}
}

// Change focussed runner A
// Returns status object including details for focussed runners
FormComparison.prototype.changeA = function(programNumber) {
	this.runnerA = this.data[programNumber];
	this.runnerADataset = this._dataset("A");
	this._animate("A");
	return this._status();
}

// Change focussed runner B
// Returns status object including details for focussed runners
FormComparison.prototype.changeB = function(programNumber) {
	this.runnerB = this.data[programNumber];
	this.runnerBDataset = this._dataset("B");
	this._animate("B");
	return this._status();
}

// ----------------------------- \\
// ----- PRIVATE FUNCTIONS ----- \\
// ----------------------------- \\
FormComparison.prototype._init = function(options) {
	this.name = options["name"];
	this.container = "#"+options["container"];
	this.xLabelSpacing = parseInt(options["xLabelSpacing"]);
	this.yLabelSpacing = parseInt(options["yLabelSpacing"]);
	this.wrapperWidth = $(this.container).width();
	this.wrapperHeight = $(this.container).height();
	this.width = this.wrapperWidth-this.yLabelSpacing;
	this.height = this.wrapperHeight-this.xLabelSpacing;
	
	this.data = options["data"];
	this.type = options["type"].toUpperCase();
	this.formLength = parseInt(options["formLength"]);
	this.runnerA = this.data[Object.keys(this.data)[0]];
	this.runnerB = this.data[Object.keys(this.data)[1]];
	this.runnerADataset = new Array();
	this.runnerBDataset = new Array();
	this.labels = options["labels"];
	this.fontSize = options["fontSize"]+"px";
	this.radius = parseInt(options["radius"]);
	this.stroke = parseInt(options["stroke"]);
	this.lastUpdated = new Date();
	
	// axis definitions
	this.x = d3.scale.linear().domain([0, this.formLength-1]).range([0, this.width]);
	this.y = d3.scale.linear().domain([0, 11]).range([this.height,0]);
	
	// form scoring definition
	this.scoring = {
		"1":11,"2":10,"3":9,"4":8,"5":7,"6":6,"7":5,"8":4,
		"9":3,"0":2,"P":1,"F":1,"L":1,"R":1,"U":1,"S":0,"X":0
	}
	
	this._build();
}

FormComparison.prototype._teardown = function() {
	this.name = null;
	this.container = null;
	this.xLabelSpacing = null;
	this.yLabelSpacing = null;
	this.wrapperWidth = null;
	this.wrapperHeight = null;
	this.width = null;
	this.height = null;
	this.data = null;
	this.type = null;
	this.formLength = null;
	this.runnerA = null;
	this.runnerB = null;
	this.runnerADataset = null;
	this.runnerBDataset = null;
	this.labels = null;
	this.fontSize = null;
	this.radius = null;
	this.stroke = null;
	this.lastUpdated = null;
	this.x = null;
	this.y = null;
	this.scoring = null;
}

FormComparison.prototype._build = function() {
	var self = this;
	$(this.container).empty();
	// format initial datasets
	this.runnerADataset = this._dataset("A");
	this.runnerBDataset = this._dataset("B");
	
	// create svg canvas
	var comWrapper = d3.select("#"+$(this.container).attr("id"))
		.append("svg:svg")
		.attr("width",this.wrapperWidth)
		.attr("height",this.wrapperHeight)
		.attr("id","comparisonSvg"+this.name);
	
	// create svg group with label padding
	var com = d3.select("svg#comparisonSvg"+this.name)
		.append("svg:g")
		.attr("width",this.width)
		.attr("height",this.height)
		.attr("transform","translate(5,5)")
		.attr("id","comparisonG"+this.name);
	
	// x axis
	com.append("svg:line")
		.attr("x1",0)
		.attr("x2",this.width)
		.attr("y1",this.height)
		.attr("y2",this.height)
		.style("stroke","#000");
	com.append("svg:text")
		.attr("id","xLabel"+this.name)
		.attr("dx",function(){return self.width/2})
		.attr("dy",function(){return self.height+(self.xLabelSpacing/2)})
		.style("font-size",this.fontSize)
		.style("fill","#000")
		.style("text-anchor","middle")
		.style("dominant-baseline","central")
		.text("Last "+this.formLength+" Runs --->");
	
	// y axis
	com.append("svg:line")
		.attr("x1",this.width)
		.attr("x2",this.width)
		.attr("y1",0)
		.attr("y2",this.height)
		.style("stroke","#000");
	com.selectAll("text.label")
			.data(this.labels)
		.enter().append("svg:text")
			.attr("class","label")
			.attr("dx",function(){return self.width+2})
			.attr("dy",function(d,i){return self.y(i)})
			.style("font-size",this.fontSize)
			.style("fill","#000")
			.style("text-anchor","left")
			.style("dominant-baseline","central")
			.text(function(d){return d});
	
	// build connector lines
	com.selectAll("line.connector.ra"+this.name)
			.data(this.runnerADataset.slice(0,this.runnerADataset.length-1))
		.enter().append("svg:line")
			.attr("class","connector ra"+this.name)
			.attr("id",function(d,i){return "connectora"+self.name+i})
			.attr("x1",function(d,i){return self.x(i)})
			.attr("x2",function(d,i){return self.x(i+1)})
			.attr("y1",function(d){return self.y(d)})
			.attr("y2",function(d,i){return self.y(self.runnerADataset[i+1])})
			.style("stroke",function(){
				return (DataViz.saddleCloth(self.type,self.runnerA.bettingInterestNumber) == "#FFFFFF" ? 
					"#000000" : 
						DataViz.saddleCloth(self.type,self.runnerA.bettingInterestNumber))
			});
	com.selectAll("line.connector.rb"+this.name)
			.data(this.runnerBDataset.slice(0,this.runnerBDataset.length-1))
		.enter().append("svg:line")
			.attr("class","connector rb"+this.name)
			.attr("id",function(d,i){return "connectorb"+self.name+i})
			.attr("x1",function(d,i){return self.x(i)})
			.attr("x2",function(d,i){return self.x(i+1)})
			.attr("y1",function(d){return self.y(d)})
			.attr("y2",function(d,i){return self.y(self.runnerBDataset[i+1])})
			.style("stroke",function(){
				return (DataViz.saddleCloth(self.type,self.runnerB.bettingInterestNumber) == "#FFFFFF" ? 
					"#000000" : 
						DataViz.saddleCloth(self.type,self.runnerB.bettingInterestNumber))
			});
	com.selectAll("line.connector")
		.style("stroke-width",this.stroke);

	// build form elements
	com.selectAll("circle.ra"+this.name)
			.data(this.runnerADataset)
		.enter().append("svg:circle")
			.attr("class","result ra"+this.name)
			.attr("id",function(d,i){return "resulta"+self.name+i})
			.attr("cx",function(d,i){return self.x(i)})
			.attr("cy",function(d){return self.y(d)})
			.style("fill",function(){return DataViz.saddleCloth(self.type,self.runnerA.bettingInterestNumber)})
			.style("stroke",function(){
				return (DataViz.saddleCloth(self.type,self.runnerA.bettingInterestNumber) == "#FFFFFF") ?
					"#000000" :
						DataViz.saddleCloth(self.type,self.runnerA.bettingInterestNumber);
			});
	com.selectAll("circle.rb"+this.name)
			.data(this.runnerBDataset)
		.enter().append("svg:circle")
			.attr("class","result rb"+this.name)
			.attr("id",function(d,i) { return "resultb"+self.name+i; })
			.attr("cx",function(d,i) { return self.x(i) })
			.attr("cy",function(d){return self.y(d)})
			.style("fill",function(){return DataViz.saddleCloth(self.type,self.runnerB.bettingInterestNumber)})
			.style("stroke",function(){
				return (DataViz.saddleCloth(self.type,self.runnerB.bettingInterestNumber) == "#FFFFFF") ?
					"#000000" :
						DataViz.saddleCloth(self.type,self.runnerB.bettingInterestNumber);
			});
	com.selectAll("circle")
		.attr("r",this.radius);

	// build average lines
	com.append("line")
		.attr("class","average")
		.attr("id","averagea"+this.name)
		.attr("x1",0)
		.attr("x2",this.width)
		.attr("y1",function(){return self.y(self._average("A"))})
		.attr("y2",function(){return self.y(self._average("A"))})
		.style("stroke-width",this.stroke)
		.style("stroke",function(){
			return (DataViz.saddleCloth(self.type,self.runnerA.bettingInterestNumber) == "#FFFFFF" ? 
				"#000000" : 
					DataViz.saddleCloth(self.type,self.runnerA.bettingInterestNumber))
		});
	com.append("line")
		.attr("class","average")
		.attr("id","averageb"+this.name)
		.attr("x1",0)
		.attr("x2",this.width)
		.attr("y1",function(){return self.y(self._average("B"))})
		.attr("y2",function(){return self.y(self._average("B"))})
		.style("stroke-width",this.stroke)
		.style("stroke",function(){
			return (DataViz.saddleCloth(self.type,self.runnerB.bettingInterestNumber) == "#FFFFFF" ? 
				"#000000" : 
					DataViz.saddleCloth(self.type,self.runnerB.bettingInterestNumber))
		});
}

FormComparison.prototype._animate = function(side) {
	var self = this;
	var column = side.toLowerCase();
	var runner = ((side == "A") ? this.runnerA : this.runnerB);
	var dataset = ((side == "A") ? this.runnerADataset : this.runnerBDataset);
	var com = d3.select("g#comparisonG"+this.name);
	
	// reposition form elements
	com.selectAll("circle.r"+column+this.name)
			.data(dataset)
		.transition()
			.duration(1000)
			.attr("cy",function(d){return self.y(d)})
			.style("fill",function(){return DataViz.saddleCloth(self.type,runner.bettingInterestNumber)})
			.style("stroke",function(){
				return (DataViz.saddleCloth(self.type,runner.bettingInterestNumber) == "#FFFFFF") ?
					"#000000" :
						DataViz.saddleCloth(self.type,runner.bettingInterestNumber);
			});
	
	// reposition connector lines
	com.selectAll("line.connector.r"+column+this.name)
			.data(dataset.slice(0,dataset.length-1))
		.transition()
			.duration(1000)
			.attr("y1",function(d){return self.y(d)})
			.attr("y2",function(d,i){return self.y(dataset[i+1])})
			.style("stroke",function(){
				return (DataViz.saddleCloth(self.type,runner.bettingInterestNumber) == "#FFFFFF" ?
					"#000000" :
						DataViz.saddleCloth(self.type,runner.bettingInterestNumber))
			});
	
	// reposition average line
	com.select("line#average"+column+this.name)
		.transition()
			.delay(500)
			.duration(500)
			.attr("y1",function(){return self.y(self._average(side))})
			.attr("y2",function(){return self.y(self._average(side))})
			.style("stroke",function(){
				return (DataViz.saddleCloth(self.type,runner.bettingInterestNumber) == "#FFFFFF" ?
					"#000000" :
						DataViz.saddleCloth(self.type,runner.bettingInterestNumber))
			});
}

FormComparison.prototype._average = function(side) {
	var result = 0;
	var ignore = 0;
	var dataset = ((side == "A") ? this.runnerADataset : this.runnerBDataset);
	$.each(dataset,function(i,val){(val==0) ? ignore++ : result += val});
	return result/(this.formLength-ignore);
}

FormComparison.prototype._dataset = function(side) {
	var self = this;
	var dataset = new Array();
	var form = ((side == "A") ? 
		this.runnerA.comparisonForm.replace("-","") : 
			this.runnerB.comparisonForm.replace("-",""));
	$.each(form.split(""), function(i,run) {
		isNaN(self.scoring[run]) ? dataset.push(0) : dataset.push(self.scoring[run]);
	});
	while (dataset.length > this.formLength) dataset.shift();
	while (dataset.length < this.formLength) dataset.unshift(0);
	return dataset;
}

FormComparison.prototype._status = function(e) {
	return {
		data: this.data,
		error: e,
		lastUpdated: this.lastUpdated,
		runnerA: this.runnerA,
		runnerB: this.runnerB
	}
}
