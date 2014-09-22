// ------------------------ \\
// ----- EXACTA DONUT ----- \\
// ------------------------ \\
var ExactaDonut = function ExactaDonut(){}

ExactaDonut.prototype.start = function(options) {
	try {
		// Validate options
		if (!(typeof options["name"] === "string") || options["name"].length < 1) throw "Viz requires a name";
		if (!(typeof options["container"]) === "string" || options["container"].length < 1) throw "Viz requires a container";
		if (!$("#"+options["container"])[0]) throw "Container with id #"+options["container"]+" could not be found";
		if (!(typeof options["type"] === "string") || options["type"].length < 1) throw "Viz requires a race type (THOROUGHBRED, etc)";
		if (isNaN(parseInt(options["numRunners"])) || parseInt(options["numRunners"]) < 2) throw "Viz requires numRunners >= 2"
		if (!(options["data"] instanceof Object)) throw "Viz requires a data Object"
		this._init(options);
		return {};
	} catch(e) {
		return {error: e};
	}
}

// Rebuild exacta donut with full animation (runner focus change)
// Returns status object including odds values for focussed runner
ExactaDonut.prototype.change = function(bettingInterestNumber) {
	try {
		if (this.runner == String(bettingInterestNumber)) throw "Focussed runner is same as selected runner";
		if (isNaN(parseInt(bettingInterestNumber))) throw "Selected runner does not exist";
		if (parseInt(bettingInterestNumber) > this.numRunners) throw "Selected runner does not exist";
		if (parseInt(bettingInterestNumber) <= 0) throw "Selected runner does not exist";
		this.runner = String(bettingInterestNumber);
		this._fullAnimate();
		return this._status();
	} catch(e) {
		return this._status(e);
	}
}

// Rebuild exacta donut with partial animation (odds update)
// Returns status object including odds values for focussed runner
ExactaDonut.prototype.update = function(oddsJson) {
	try {
		if (!(oddsJson instanceof Object)) throw "Data update must be an Object";
		this.lastUpdated = new Date();
		this.data = oddsJson;
		this._partialAnimate();
		return this._status();
	} catch(e) {
		return this._status(e);
	}
}

// ----------------------------- \\
// ----- PRIVATE FUNCTIONS ----- \\
// ----------------------------- \\
ExactaDonut.prototype._init = function(options) {
	this.name = options["name"];
	this.container = "#"+options["container"];
	this.height = Math.min($(this.container).height(),$(this.container).width());
	this.width = this.height;
	this.rOuter = this.height/2;
	this.rInner = this.rOuter*0.4;
	
	this.data = options["data"];
	this.total = 0;
	this.runner = '1';
	this.numRunners = parseInt(options["numRunners"]);
	this.type = options["type"].toUpperCase();
	this.originDataset = new Array();
	this.targetDataset = new Array();
	this.lastUpdated = new Date();
	
	this._build();
}

ExactaDonut.prototype._teardown = function() {
  this.name = null;
	this.container = null;
	this.height = null;
	this.width = null;
	this.rOuter = null;
	this.rInner = null;
	this.data = null;
	this.total = null;
	this.runner = null;
	this.numRunners = null;
	this.type = null;
	this.originDataset = null;
	this.targetDataset = null;
	this.lastUpdated = null;
}

// build initial state of viz
ExactaDonut.prototype._build = function() {
	var self = this;
	$(this.container).empty();
	this.originDataset = this._dataset(); // format initial dataset
	
	// create svg canvas
	var exa = d3.select("#"+$(this.container).attr('id'))
		.append("svg:svg")
		.attr("width",this.width)
		.attr("height",this.height)
		.attr("id","exactaSvg"+this.name);
	
	// create focussed runner indicator circle and text
	exa.append("svg:circle")
		.attr("class","exaCircle")
		.attr("cx",this.rInner)
		.attr("cy",this.rInner)
		.attr("r",this.rInner+0.5)
		.attr("transform","translate("+(this.rOuter-this.rInner)+","+(this.rOuter-this.rInner)+")")
		.style("fill",function(){return DataViz.saddleCloth(self.type,self.runner)});
	exa.append("svg:text")
		.attr("class","exaText")
		.attr("dx",function(){return self.width/2})
		.attr("dy",function(){return self.height/2})
		.style("font-size",function(){return self.rInner+"px"})
		.style("fill",function(d,i){return DataViz.saddleClothText(self.type,self.runner)})
		.style("opacity",1)
		.style("text-anchor","middle")
		.style("dominant-baseline","central")
	  .text(this.runner);
	
	// create paths
	exa.selectAll("g.exaArc")
		.data(this._arcs(this.originDataset,this.originDataset))
		.enter().append("svg:g")
		.attr("class","exaArc")
		.attr("transform","translate("+this.rOuter+","+this.rOuter+")")
		.append("svg:path")
		.attr("d",d3.svg.arc())
		.attr("id",function(d,i){return i})
		.style("fill",function(d,i){return DataViz.saddleCloth(self.type,i)});
}

// trigger full animation sequence (fracture -> shuffle -> reunite)
ExactaDonut.prototype._fullAnimate = function() {
	var self = this;
	this.targetDataset = this._dataset(); // format new dataset
	
	// animate focussed runner elements
	focussedRunnerAnimate();
	
	// select all paths and push new positions to fracture->shuffle->reunite animations
	d3.selectAll("g.exaArc > path")
		.data(this._arcs(this.originDataset,this.targetDataset))
		.each(fracture);
	this.originDataset = this.targetDataset.slice(0); // set origin same as target (animation complete)
	
	// path fracture animation definition
	function fracture(d,i) {
		d3.select(this).transition().duration(500)
			.attrTween("d",self._tween(radiusMod()))
			.each("end",shuffle);
	}

	// paht shuffle animation definition
	function shuffle(d,i) {
		d3.select(this).transition().duration(500)
			.attrTween("d",self._tween({
				startAngle: d.next.startAngle,
				endAngle: d.next.endAngle
			}))
			.each("end",reunite);
	}

	// path reunite animation definition
	function reunite(d,i) {
		d3.select(this).transition().duration(500)
			.attrTween("d",self._tween({
				innerRadius: self.rInner,
				outerRadius: self.rOuter
			}));
	}
	
	// random modification of fracture radii
	function radiusMod() {
		switch (Math.round(Math.random()*3)) {
			case 0: var innerMod=0; var outerMod=(self.rOuter-self.rInner)*.25; break;
			case 1: var innerMod=(self.rOuter-self.rInner)*.25; var outerMod=(self.rOuter-self.rInner)*.5; break;
			case 2: var innerMod=(self.rOuter-self.rInner)*.5; var outerMod=(self.rOuter-self.rInner)*.75; break;
			case 3: var innerMod=(self.rOuter-self.rInner)*.75; var outerMod=self.rOuter-self.rInner; break;
		}
		return {
			innerRadius: innerMod+self.rInner,
			outerRadius: outerMod+self.rInner
		}
	}
	
	// focussed-runner animation definition
	function focussedRunnerAnimate() {
		// morph circle fill
		d3.selectAll("circle.exaCircle").transition().duration(1500)
			.style("fill",function(){return DataViz.saddleCloth(self.type,self.runner)});
		// animate text: fade out -> change content and fill -> fade in
		d3.selectAll("text.exaText").transition().duration(700)
			.style("opacity",0)
			.each("end",function() {
				d3.select(this).transition().duration(100)
					.style("fill",function(d,i){return DataViz.saddleClothText(self.type,self.runner)})
					.text(self.runner)
					.each("end",function() {
						d3.select(this).transition().duration(700)
							.style("opacity",1);
					});
			});
	}
}

// trigger partial animation sequence (reposition)
ExactaDonut.prototype._partialAnimate = function() {
	var self = this;
	this.targetDataset = this._dataset(); // format new dataset
	
	// select all paths and push new positions reposition animation
	d3.selectAll("g.exaArc > path")
		.data(this._arcs(this.originDataset,this.targetDataset))
		.each(reposition);
	this.originDataset = this.targetDataset.slice(0); // set origin same as target (animation complete)
	
	// reposition animation definition (partial)
	function reposition(d,i) {
		d3.select(this).transition().duration(500)
			.attrTween("d",self._tween({
				startAngle: d.next.startAngle,
				endAngle: d.next.endAngle
			}));
	}
}

// animation tweening
ExactaDonut.prototype._tween = function(b) {
	return function(a) {
		var i = d3.interpolate(a,b);
		for (var key in b) a[key] = b[key];
		return function(t) {
			return d3.svg.arc()(i(t));
		}
	}
}

// build dataset
ExactaDonut.prototype._dataset = function() {
	var self = this;
	var dataset = new Array();
	// build target dataset for animation of viz
	this.total = 0;
	if (this.data && (this.data instanceof Object)) {
		for (i=1;i<=this.numRunners;i++) {
			dataset[i] = parseFloat(this.data[this.runner+','+i]);
			if (isNaN(dataset[i])) dataset[i] = 0; // rescue NaN values
			this.total += dataset[i];
		}
	}
	dataset[0] = (this.total > 0) ? 0 : 1; // rescue for empty odds (give runner0 100% of distribution)
	$.each(dataset, function(i,v) { if (v>0) dataset[i] = 1/v }); // invert dataset (1/v for distribution)
	return dataset;
}

// layout
ExactaDonut.prototype._arcs = function(x,y) {
	var currentArcs = d3.layout.pie()(x);
	var newArcs = d3.layout.pie()(y);
	var i = -1;
	while (++i <= this.numRunners) {
		arc = currentArcs[i];
		arc.innerRadius = this.rInner;
		arc.outerRadius = this.rOuter;
		arc.next = newArcs[i];
	}
	return currentArcs;
}

// build status object of viz
ExactaDonut.prototype._status = function(e) {
	return {
		data: this.data,
		error: e,
		lastUpdated: this.lastUpdated,
		runner: this.runner
	}
}
