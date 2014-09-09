// ------------------------ \\
// ----- EXACTA DONUT ----- \\
// ------------------------ \\
var ExactaDonut = function ExactaDonut(options) {
	// TODO throw errors if required options are invalid
	this._init(options);
}

// Rebuild exacta donut with full animation (runner focus change)
// Returns status object including odds values for focussed runner
ExactaDonut.prototype.change = function(bettingInterestNumber) {
	try {
		if (this.runner != String(bettingInterestNumber) && bettingInterestNumber <= this.numRunners && bettingInterestNumber > 0) {
			this.runner = String(bettingInterestNumber);
			this._fullAnimate();
		}
		return this._status();
	} catch(e) {
		return this._status(e);
	}
}

// Rebuild exacta donut with partial animation (odds update)
// Returns status object including odds values for focussed runner
ExactaDonut.prototype.update = function(oddsJson) {
	try {
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
		.attr("fill",function(){return DataViz.saddleCloth(self.type,self.runner)});
	exa.append("svg:text")
		.attr("class","exaText")
		.attr("dx",function(){return self.width/2})
		.attr("dy",function(){return self.height/2})
		.attr("font-size",function(){return self.rInner+"px"})
		.attr("fill",function(d,i){return DataViz.saddleClothText(self.type,self.runner)})
		.attr("opacity",1)
		.attr("style","text-anchor:middle;dominant-baseline:central;")
	  .text(this.runner);
	
	// create paths
	exa.selectAll("g.exaArc")
		.data(this._arcs(this.originDataset,this.originDataset))
		.enter().append("svg:g")
		.attr("class","exaArc")
		.attr("transform","translate("+this.rOuter+","+this.rOuter+")")
		.append("svg:path")
		.attr("fill",function(d,i){return DataViz.saddleCloth(self.type,i)})
		.attr("d",d3.svg.arc())
		.attr("id",function(d,i){return i});
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
			.attrTween("d",tween(radiusMod()))
			.each("end",shuffle);
	}

	// paht shuffle animation definition
	function shuffle(d,i) {
		d3.select(this).transition().duration(500)
			.attrTween("d",tween({
				startAngle: d.next.startAngle,
				endAngle: d.next.endAngle
			}))
			.each("end",reunite);
	}

	// path reunite animation definition
	function reunite(d,i) {
		d3.select(this).transition().duration(500)
			.attrTween("d",tween({
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
	
	// animation tweening
	function tween(b) {
		return function(a) {
			var i = d3.interpolate(a,b);
			for (var key in b) a[key] = b[key];
			return function(t) {
				return d3.svg.arc()(i(t));
			}
		}
	}
	
	// focussed-runner animation definition
	function focussedRunnerAnimate() {
		// morph circle fill
		d3.selectAll("circle.exaCircle").transition().duration(1500)
			.attr("fill",function(){return DataViz.saddleCloth(self.type,self.runner)});
		// animate text: fade out -> change content and fill -> fade in
		d3.selectAll("text.exaText").transition().duration(700)
			.attr("opacity",0)
			.each("end",function() {
				d3.select(this).transition().duration(100)
					.attr("fill",function(d,i){return DataViz.saddleClothText(self.type,self.runner)})
					.text(self.runner)
					.each("end",function() {
						d3.select(this).transition().duration(700)
							.attr("opacity",1);
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
			.attrTween("d",tween({
				startAngle: d.next.startAngle,
				endAngle: d.next.endAngle
			}));
	}
	
	// animation tweening
	function tween(b) {
		return function(a) {
			var i = d3.interpolate(a,b);
			for (var key in b) a[key] = b[key];
			return function(t) {
				return d3.svg.arc()(i(t));
			}
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
	return dataset
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
		status: (e ? false : true)
	}
}
