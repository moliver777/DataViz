var DataViz = {
	INSTANCES: {},
	
	// build data visualisation
	// returns array [success, error-message]
	build: function(viz, options) {
		try {
			if (DataViz.INSTANCES[options["name"]]) throw "Visualisation already initialised with name: "+options["name"];
			switch (viz) {
				case "ExactaDonut" : DataViz.INSTANCES[options["name"]] = new ExactaDonut(); break;
				case "DoubleDonut" : DataViz.INSTANCES[options["name"]] = new DoubleDonut(); break;
				case "OddsTracker" : DataViz.INSTANCES[options["name"]] = new OddsTracker(); break;
				case "DistributionTracker" : DataViz.INSTANCES[options["name"]] = new DistributionTracker(); break;
				case "FormComparison" : DataViz.INSTANCES[options["name"]] = new FormComparison(); break;
				case "ProfitAndLoss" : DataViz.INSTANCES[options["name"]] = new ProfitAndLoss(); break;
				default : throw "Could not find viz of type "+viz; break;
			}
			return DataViz.INSTANCES[options["name"]].start(options);
		} catch(e) {
			return {error: e};
		}
	},
	
	saddleCloth: function(type, runner) {
		var code = null;
		switch (type) {
			case 'GREYHOUND' : 
				switch (parseInt(runner)) {
					case 0: code="#F0EFEE";break;
					case 1: code='#CE1126';break;
					case 2: code='#0072C6';break;
					case 3: code="#FFFFFF";break;
					case 4: code='#00B760';break;
					case 5: code='#000000';break;
					case 6: code='#F9D616';break;
					case 7: code='#23AD17';break;
					case 8: code='#F9D300';break;
					default: code='#00B2AA';break;
				}
			break;
			case 'HARNESS' : 
				switch (parseInt(runner)) {
					case 0: code="#F0EFEE";break;
					case 1: code="#FF0000";break;
					case 2: code='#3333FF';break;
					case 3: code='#FFFFFF';break;
					case 4: code='#009F04';break;
					case 5: code='#000000';break;
					case 6: code='#E8DA00';break;
					case 7: code='#D106C1';break;
					case 8: code='#CCCCCC';break;
					case 9: code='#6600CC';break;
					case 10: code='#F30021';break;
					case 11: code='#000000';break;
					case 12: code='#000000';break;
					default: code='#00B2AA';break;
				}
			break;
			default : 
				switch (parseInt(runner)) {
					case 0: code="#F0EFEE";break;
					case 1: code='#CE1126';break;
					case 2: code='#FFFFFF';break;
					case 3: code='#0072C6';break;
					case 4: code='#F9D616';break;
					case 5: code='#00B760';break;
					case 6: code='#000000';break;
					case 7: code='#F74902';break;
					case 8: code='#F2ADB2';break;
					case 9: code='#00B2AA';break;
					case 10: code='#9E4FA5';break;
					case 11: code='#D1CEC6';break;
					case 12: code='#7FBA00';break;
					case 13: code='#593D2B';break;
					case 14: code='#7A2638';break;
					case 15: code='#C4B796';break;
					case 16: code='#5960A8';break;
					case 17: code='#2F2FFF';break;
					case 18: code='#007F01';break;
					case 19: code='#5986CC';break;
					default: code='#870539';break;
				}
			break;
		}
		return code;
	},
	
	saddleClothText: function(type, runner) {
		var code = null;
		switch (type) {
			case 'GREYHOUND' : 
				switch (parseInt(runner)) {
					case 1: code='#FFFFFF';break;
					case 2: code='#FFFFFF';break;
					case 5: code='#FF0000';break;
					case 8: code='#FFFFFF';break;
					default: code='#000000';break;
				}
			break;
			case 'HARNESS' : 
				switch (parseInt(runner)) {
					case 1: code='#FFFFFF';break;
					case 2: code='#FFFFFF';break;
					case 3: code='#F10101';break;
					case 4: code='#000000';break;
					case 5: code='#FFFFFF';break;
					case 6: code='#010101';break;
					case 7: code='#000000';break;
					case 8: code='#000000';break;
					case 9: code='#FFFFFF';break;
					case 10: code='#FFFFFF';break;
					case 11: code='#FFFFFF';break;
					case 12: code='#FFFFFF';break;
					default: code='#222222';break;
				}
			break;
			default : 
				switch (parseInt(runner)) {
					case 1: code='#FFFFFF';break;
					case 3: code='#FFFFFF';break;
					case 5: code='#FFFFFF';break;
					case 6: code='#F9D616';break;
					case 10: code='#FFFFFF';break;
					case 11: code='#CE1126';break;
					case 14: code='#F9D616';break;
					case 16: code='#F74902';break;
					case 17: code='#FFFFFF';break;
					case 18: code='#FFFFFF';break;
					case 19: code='#FFFFFF';break;
					case 20: code='#FFFFFF';break;
					default: code='#000000';break;
				}
			break;
		}
		return code;
	}
}

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
}