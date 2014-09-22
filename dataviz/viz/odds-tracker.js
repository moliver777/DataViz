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
FormComparison.prototype.toggle = function(bettingInterestNumber) {
  // return this._status();
}

// Update datasets with latest odds
// Returns status object including details of datasets
FormComparison.prototype.update = function(oddsJson) {
  // return this._status();
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
  this.labelInterval = null;
	this.lastUpdated = new Date();
	
	// axis definitions
	this.x = d3.scale.linear().domain([0,this.formLength-1]).range([0,this.width]);
	this.y = d3.scale.linear().domain([0,11]).range([this.height,0]);
	
	this._build();
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
  this.labelInterval = null;
	this.lastUpdated = null;
	this.x = null;
	this.y = null;
}

// build initial state of viz
OddsTracker.prototype._build = function() {
  
}

OddsTracker.prototype._status = function() {
	return {
		data: this.data,
		error: e,
		lastUpdated: this.lastUpdated
	}
}






// OvtGraph = function(container, options) {
//   this.init(container, options);
// }
// jQuery.extend(OvtGraph.prototype, {
//   init: function(container, options) {
//     this.container = container;
//     this.data = [];
//     this.num_runners = options['num_runners'];
//     this.country = options['country'];
//     this.breed = options['breed'];
//     this.status = {};
//     this.count = null;
//     this.maxTime = 31;
//     this.pool_id = options['subscription']
//     this.label_updater = null;
//     this.sub = null;
//
//     var self = this;
//     $.getJSON("/datavis/load_odds_history/"+this.pool_id, function(data) {
//       self.data = data;
//       $.each(self.data, function(i,data) {
//         self.data[i]["created_at"] -= Math.floor(+new Date()/60000);
//       })
//       if (self.data.length == 1) self.data[1] = self.data[0];
//       self.count = self.data.length-1;
//       if (options['subscription']) self.subscribe(options['subscription']);
//       self.setup();
//     })
//   },
//
//   teardown: function() {
//     if (this.sub) this.sub.cancel();
//     clearInterval(this.label_updater);
//     this.container = null;
//     this.data = null;
//     this.num_runners = null;
//     this.country = null;
//     this.breed = null;
//     this.status = null;
//     this.count = null;
//     this.maxTime = null;
//     this.pool_id = null;
//     this.label_updater = null;
//     this.sub = null;
//   },
//
//   setup: function() {
//     var self = this;
//
//     this.label_updater = setInterval(function() { self.setLabels() }, 500);
//
//     $.each($('div#overtime_key span.box'), function(i,key) {
//       $(this).css({'color': DATAVIS.saddleClothText(self.breed, $(this).parent().parent().attr('betting_interest_number')), 'background-color': DATAVIS.saddleCloth(self.breed, $(this).parent().parent().attr('betting_interest_number'), self.country)});
//     })
//
//     if (this.breed == 'GREYHOUND') {
//       if (navigator.userAgent.match(/Firefox/)) {
//         $('div#overtime_key li[betting_interest_number="7"] span.box').css({'background-image': '-moz-linear-gradient(rgba(255, 255, 255, 1) 50%, transparent 50%, transparent)'});
//         $('div#overtime_key li[betting_interest_number="8"] span.box').css({'background-image': '-moz-linear-gradient(360deg, rgba(0, 0, 0, 1) 50%, transparent 50%, transparent)'});
//       } else {
//         $('div#overtime_key li[betting_interest_number="7"] span.box').css({'background-image': '-webkit-gradient(linear, 0 0, 0 100%, color-stop(.5, rgba(255, 255, 255, 1)), color-stop(.5, transparent), to(transparent))'});
//         $('div#overtime_key li[betting_interest_number="8"] span.box').css({'background-image': '-webkit-gradient(linear, 0 0, 100% 0, color-stop(.5, rgba(0, 0, 0, 1)), color-stop(.5, transparent), to(transparent))'});
//       }
//     } else if (this.breed == 'HARNESS') {
//       if (navigator.userAgent.match(/Firefox/)) {
//         $('div#overtime_key li[betting_interest_number="10"] span.box').css({'background-image': '-moz-linear-gradient(-45deg, rgba(0, 0, 208, 1) 50%, transparent 50%, transparent)'});
//       } else {
//         $('div#overtime_key li[betting_interest_number="10"] span.box').css({'background-image': '-webkit-gradient(linear, 0 0, 100% 100%, color-stop(.5, rgba(0, 0, 208, 1)), color-stop(.5, transparent), to(transparent))'});
//       }
//     }
//
//     $.each($('div#overtime_key ul li'), function(i,key) {
//       self.status[$(key).attr('betting_interest_number')] = $(key).find('a').first().hasClass('selected') ? true : false;
//       $(key).unbind('click').click(function() {
//         var el = $(this).find('a').first();
//         self.status[$(this).attr('betting_interest_number')] = $(el).hasClass('selected') ? false : true;
//         $('div#overtime_key ul li[betting_interest_number="'+$(this).attr('betting_interest_number')+'"] a').toggleClass('selected');
//         if (self.status[$(this).attr('betting_interest_number')]) {
//           $('.node.r'+$(this).attr('betting_interest_number')).show();
//           $('.connector.r'+$(this).attr('betting_interest_number')).show();
//         } else {
//           $('.node.r'+$(this).attr('betting_interest_number')).hide();
//           $('.connector.r'+$(this).attr('betting_interest_number')).hide();
//         }
//       })
//     })
//
//     this.setLabels();
//     this.build();
//   },
//
//   build: function(update) {
//     var self = this;
//     var runner = [];
//     var xMax = (this.data.length == this.maxTime) ? this.data.length-2 : this.data.length-1;
//     var yMax = 25;
//
//     // linear scales for axis
//     var x = d3.scale.linear()
//       .domain([0, xMax])
//       .range([0, 450]);
//     var y = d3.scale.linear()
//       .domain([0, yMax])
//       .range([220, 0]);
//
//     if (update != undefined) {
//       animate();
//       this.setLabels();
//       return;
//     }
//
//     $(this.container).empty();
//
//     var container = d3.select("#"+$(this.container).attr("id"))
//       .append("svg:svg")
//       .attr("width", 450)
//       .attr("height", 280)
//       .attr("id","overtimeSvg");
//
//     var chart = d3.select("svg#overtimeSvg")
//       .append("svg:g")
//       .attr("id", "overtimeChart")
//       .attr("width", 450)
//       .attr("height", 220);
//
//     // x axis
//     container.append("svg:line")
//       .attr("x1", 0)
//       .attr("x2", 450)
//       .attr("y1", 220)
//       .attr("y2", 220)
//       .style("stroke", "#000");
//
//     // y axis
//     container.append("svg:line")
//       .attr("x1", 450)
//       .attr("x2", 450)
//       .attr("y1", 0)
//       .attr("y2", 220)
//       .attr("transform", "translate(-1,0)")
//       .style("stroke", "#000");
//
//     // create paths
//     try {
//       for(r=1;r<=self.num_runners;r++) {
//         var runner = [];
//         $.each(this.data, function(j,odds_json) {
//           var jodds = odds_json[r];
//           try { odds = parseFloat(jodds["pp"]) } catch (e) { odds = 0; }
//           odds = isNaN(odds) ? 0 : odds;
//           runner.push(odds);
//         })
//
//         // initialise connectors
//         chart.selectAll("line.r"+r)
//             .data(runner)
//           .enter().append("svg:line")
//             .attr("id", function(d,i) { return "connector"+r+"_"+i })
//             .attr("class", function(d,i) { return "connector r"+r })
//             .attr("x1", function(d,i) { return x(i) })
//             .attr("x2", function(d,i) { return x(i+1) })
//             .attr("y1", function(d) { return (d>25) ? y(25) : y(d) })
//             .attr("y2", function(d,i) { if (runner[i+1]) { return (runner[i+1]>25) ? y(25) : y(runner[i+1]) } else { return (d>25) ? y(25) : y(d) } })
//             .attr("value1", function(d,i) { return d })
//             .attr("value2", function(d,i) { return runner[i+1] ? runner[i+1] : d })
//             .attr("position", function(d,i) { return i+1 })
//             .style("z-index", 10000)
//             .style("stroke", function() { return (DATAVIS.saddleCloth(self.breed, r, self.country)=="#FFFFFF") ? "#000000" : DATAVIS.saddleCloth(self.breed, r, self.country) })
//             .style("display", function() { return self.status[r] ? 'block' : 'none' });
//
//         // initialise nodes
//         chart.selectAll("circle.r"+r)
//             .data(runner)
//           .enter().append("svg:circle")
//             .attr("id", function(d,i) { return "node"+r+"_"+i })
//             .attr("class", "node r"+r)
//             .attr("cx", function(d,i) { return x(i) })
//             .attr("cy", function(d) { return (d>25) ? y(25) : y(d) })
//             .attr("r", "2")
//             .attr("value", function(d) { return d })
//             .attr("position", function(d,i) { return i })
//             .style("z-index", 10000)
//             .style("fill", function() { return DATAVIS.saddleCloth(self.breed, r, self.country) })
//             .style("stroke", function() { return (DATAVIS.saddleCloth(self.breed, r, self.country)=="#FFFFFF") ? "#000000" : DATAVIS.saddleCloth(self.breed, r, self.country) })
//             .style("display", function() { return self.status[r] ? 'block' : 'none' });
//       }
//     } catch (e) {
//       // console.log(e.message)
//     }
//
//     function animate() {
//       try {
//         self.count += 1;
//         var chart = d3.select("#overtimeChart");
//         var odds_json = self.data[self.data.length-1];
//         var prev_odds_json = self.data[self.data.length-2];
//         for(r=1;r<=self.num_runners;r++) {
//           var jodds = odds_json[r];
//           var prev_odds = prev_odds_json[r];
//           try { odds = parseFloat(jodds["pp"]) } catch (e) { odds = 0; }
//           try { prev_odds = parseFloat(prev_odds["pp"]) } catch (e) { prev_odds = 0; }
//           odds = isNaN(odds) ? 0 : odds;
//
//           // create new connectors
//           chart.append("svg:line")
//             .attr("id", "connector"+r+"_"+self.count)
//             .attr("class", "connector r"+r)
//             .attr("x1", function() { return x(self.data.length) })
//             .attr("x2", function() { return x(self.data.length+1) })
//             .attr("y1", function() { return (odds>25) ? y(25) : y(odds) })
//             .attr("y2", function() { return (odds>25) ? y(25) : y(odds) })
//             .attr("value1", function() { return odds })
//             .attr("value2", function() { return odds })
//             .attr("position", function() { return self.data.length })
//             .style("z-index", 5000)
//             .style("stroke", function() { return (DATAVIS.saddleCloth(self.breed, r, self.country)=="#FFFFFF") ? "#000000" : DATAVIS.saddleCloth(self.breed, r, self.country) })
//             .style("display", function() { return self.status[r] ? 'block' : 'none' });
//
//           // create new nodes
//           chart.append("svg:circle")
//             .attr("id", "node"+r+"_"+self.count)
//             .attr("class", "node r"+r)
//             .attr("cx", function() { return x(self.data.length) })
//             .attr("cy", function() { return (odds>25) ? y(25) : y(odds) })
//             .attr("r", "2")
//             .attr("value", function() { return odds })
//             .attr("position", function() { return self.data.length-1 })
//             .style("z-index", 5000)
//             .style("fill", function() { return DATAVIS.saddleCloth(self.breed, r, self.country) })
//             .style("stroke", function() { return (DATAVIS.saddleCloth(self.breed, r, self.country)=="#FFFFFF") ? "#000000" : DATAVIS.saddleCloth(self.breed, r, self.country) })
//             .style("display", function() { return self.status[r] ? 'block' : 'none' });
//
//           chart.select("line#connector"+r+"_"+(self.count-1))
//             .attr("value2", function() { return odds });
//         }
//
//         // animate everything to new x and y positions
//         $.each($("#overtimeChart line.connector"), function(i,el) {
//           if (self.data.length==self.maxTime) $(el).attr("position", parseInt($(el).attr("position"))-1);
//           chart.select("#"+$(el).attr("id"))
//             .transition()
//               .duration(1000)
//               .attr("x1", function() { return x(parseInt($(el).attr("position"))-1) })
//               .attr("x2", function() { return x(parseInt($(el).attr("position"))) })
//               .attr("y2", function() { return (parseFloat($(el).attr("value2"))>25) ? y(25) : y(parseFloat($(el).attr("value2"))) });
//         })
//         $.each($("#overtimeChart circle.node"), function(i,el) {
//           if (self.data.length==self.maxTime) $(el).attr("position", parseInt($(el).attr("position"))-1);
//           chart.select("#"+$(el).attr("id"))
//             .transition()
//               .duration(1000)
//               .attr("cx", function() { return x(parseInt($(el).attr("position"))) })
//         })
//
//         // exit old nodes and connectors out of svg range
//         $('#overtimeChart circle.node[position="'+String(-1)+'"]').remove();
//         $('#overtimeChart line.connector[position="'+String(-1)+'"]').remove();
//
//         // tooltip
//         $.each($('svg#overtimeSvg circle'), function(i,path) {
//           $(path).unbind('mouseenter').mouseenter(function(e) {
//             var stamp = new Date(self.data[$(path).attr('position')].created_at);
//             var now = new Date();
//             var time = Math.round((now.getTime()-stamp.getTime())/(1000*60));
//             $('#ovtTooltip').html(time+' mins: '+$(path).attr('value'));
//             $('#ovtTooltip').css({left:e.pageX-$(this).parents('div.datavisPanel').offset().left+20, top:e.pageY-$(this).parents('div.datavisPanel').offset().top+30});
//             if (!$('#ovtTooltip').is(':visible')) $('#ovtTooltip').fadeIn(100);
//           }).unbind('mousemove').mousemove(function(e) {
//             $('#ovtTooltip').css({left:e.pageX-$(this).parents('div.datavisPanel').offset().left+20, top:e.pageY-$(this).parents('div.datavisPanel').offset().top+30});
//           }).unbind('mouseleave').mouseleave(function() {
//             $('#ovtTooltip').fadeOut(100);
//           })
//         })
//       } catch (e) {
//         // console.log(e.message)
//       }
//     }
//
//     // tooltip
//     $.each($('svg#overtimeSvg circle'), function(i,path) {
//       $(path).mouseenter(function(e) {
//         var stamp = self.data[$(path).attr('position')].created_at;
//         var now = Math.floor(+new Date()/60000);
//         var time = now+stamp;
//         $('#ovtTooltip').html(time+' mins: '+$(path).attr('value'));
//         $('#ovtTooltip').css({left:e.pageX-$(this).parents('div.datavisPanel').offset().left+20, top:e.pageY-$(this).parents('div.datavisPanel').offset().top+30});
//         if (!$('#ovtTooltip').is(':visible')) $('#ovtTooltip').fadeIn(100);
//       }).mousemove(function(e) {
//         $('#ovtTooltip').css({left:e.pageX-$(this).parents('div.datavisPanel').offset().left+20, top:e.pageY-$(this).parents('div.datavisPanel').offset().top+30});
//       }).mouseleave(function() {
//         $('#ovtTooltip').fadeOut(100);
//       })
//     })
//   },
//
//   setLabels: function() {
//     var last = this.data[0].created_at;
//     var first = this.data[this.data.length-1].created_at;
//     var now = Math.floor(+new Date()/60000);
//     $('span#ovt_time_last').html((now+last)+"mins");
//     $('span#ovt_time_first').html((now+first)+"mins");
//   },
//
//   subscribe: function(id) {
//     var self = this;
//     var timeout = 0;
//
//     var myInterval = setInterval(function() {
//       if (window.app.faye) {
//         if (window.app.faye.client) {
//           clearInterval(myInterval);
//           self.sub = window.app.faye.client.subscribe('/odds_history/'+id, function(message) { self.update(message) });
//         }
//       } else if (timeout > 50) {
//         clearInterval(myInterval);
//       }
//       timeout++;
//     }, 100);
//   },
//
//   update: function(message) {
//     if (this.data.length==this.maxTime) this.data.splice(0,1);
//     message['created_at'] = Math.floor(+new Date()/60000)*-1;
//     this.data.push(message);
//     this.build(true);
//   }
// });