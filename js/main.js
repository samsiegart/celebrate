var gia = (function (obj){
	var stateEV=[["Alabama","AL",9,"SR"],["Alaska","AK",3,"SR"],["Arizona","AZ",11,"SR"],["Arkansas","AR",6,"SR"],["California","CA",55,"SO"],["Colorado","CO",9,"T"],["Connecticut","CT",7,"LO"],["Delaware","DE",3,"SO"],["Dist. of Columbia","DC",3,"SO"],["Florida","FL",29,"T"],["Georgia","GA",16,"SR"],["Hawaii","HI",4,"SO"],["Idaho","ID",4,"SR"],["Illinois","IL",20,"SO"],["Indiana","IN",11,"SR"],["Iowa","IA",6,"T"],["Kansas","KS",6,"SR"],["Kentucky","KY",8,"SR"],["Louisiana","LA",8,"SR"],["Maine","ME",4,"SO"],["Maryland","MD",10,"SO"],["Massachusetts","MA",11,"SO"],["Michigan","MI",16,"LO"],["Minnesota","MN",10,"SO"],["Mississippi","MS",6,"SR"],["Missouri","MO",10,"LR"],["Montana","MT",3,"SR"],["Nebraska","NE",5,"SR"],["Nevada","NV",6,"T"],["New Hampshire","NH",4,"T"],["New Jersey","NJ",14,"SO"],["New Mexico","NM",5,"SO"],["New York","NY",29,"SO"],["North Carolina","NC",15,"T"],["North Dakota","ND",3,"SR"],["Ohio","OH",18,"T"],["Oklahoma","OK",7,"SR"],["Oregon","OR",7,"SO"],["Pennsylvania","PA",20,"LO"],["Rhode Island","RI",4,"SO"],["South Carolina","SC",9,"SR"],["South Dakota","SD",3,"SR"],["Tennessee","TN",11,"SR"],["Texas","TX",38,"SR"],["Utah","UT",6,"SR"],["Vermont","VT",3,"SO"],["Virginia","VA",13,"T"],["Washington","WA",12,"SO"],["West Virginia","WV",5,"SR"],["Wisconsin","WI",10,"T"],["Wyoming","WY",3,"SR"]];
	var stateFaceLookup={ "VA": "s", "ND": "b", "NY": "h", "AL": "B", "RI": "m", "NE": "c", "MN": "W", "MD": "T", "HI": "K", "DE": "H", "CO": "F", "WY": "x", "MO": "X", "ME": "U", "IA": "L", "OR": "k", "OH": "i","KY": "Q", "IL": "N", "AZ": "D", "TX": "q", "TN": "p", "NH": "d", "GA": "J", "SC": "n", "IN": "O", "ID": "M", "SD": "o", "PA": "l", "OK": "j", "NJ": "e", "MS": "Y", "MI": "V", "FL": "I", "CT":"G", "AR": "C", "WI": "v", "MT": "Z", "US": "z", "VT": "t", "NV": "g", "KS": "P", "CA": "E", "WV": "w", "UT": "r", "NM": "f", "MA": "S", "DC": "y", "WA": "u", "NC": "a", "LA": "R", "AK": "A" }
	
	
	/*
	*
	*	- ADD LINK TO VOTER REGISTRATION
	*	- SEND A BALLOON?
	*
	*/
	
	var	w,
		h,
		origWidth,
		padding={"left":35,"top":197,"right":35,"bottom":0},
		demScale,demAxis,
		repScale,repAxis,
		electoralScale,electoralAxis,
		tossupScale,tossupColorScale,
		colorScale,
		allStates=[],demStates=[],repStates=[],tossupStates=[],
		demForce,demNodes,demNodeLinks=[],demForceWidth,demForceHeight,
		demLinks,demBalls,
		tossupForce,tossupBalls,tossupNodeLinks=[],tossupForceWidth,tossupForceHeight,
		tossupLinks,tossupBalls,
		blueColor,redColor,purpleColor,
		repForce,repNodes,repNodeLinks=[],repForceWidth,repForceHeight,
		repLinks,repBalls,
		demoBalloon,demoForce,demoNodes,demoLinks,
		evScale=7,
		tossupThreshhold=3,
		demEVs,repEVs,tossupEVs,
		floatDiv,
		leanLookup={"LO":"Leans Obama","SO":"Strong Obama","LR":"Leans Romney","SR":"Strong Romney"},
		// leanLookup={"LO":"Obama (No Poll)","SO":"Obama (No Poll)","LR":"Romney (No Poll)","SR":"Romney (No Poll)"},
		validBrowser=false;
	
	obj.init = function(){	
		// if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) 
		// 	validBrowser=true;
		
		w = $(window).width();
		h = $(window).height();
		
		floatDiv=$('#gia_hover')
		
		$(window).resize(onWindowResize)
		onWindowResize();
		//$.ajaxSetup({cache:true});
		$.getScript("http://gia.guim.co.uk/2012/08/polling/polling-widget/data/pollList.js",onListLoad) 

	}	

	onListLoad = function(){
		pollStates=_.filter(gia.pollList,function(state){
			return(state[0].indexOf("Romney vs. Obama")!=-1 && state[0].indexOf("General Election")==-1)
		})
		// console.log("pollStates",pollStates)
		
		tossupStates=_.filter(pollStates,function(state){
			return (parseFloat(state[2].split("|")[1])<=tossupThreshhold)
		})
		// console.log("tossups",tossupStates)
		
		leanStates=_.reject(pollStates,function(state){
			return (parseFloat(state[2].split("|")[1])<=tossupThreshhold)
		})
		// console.log("leanstates",leanStates)
		
		_.each(leanStates,function(state,index){
			if(state[2].split("|")[0]=="Obama")
				demStates.push(state)
			else if(state[2].split("|")[0]=="Romney")
				repStates.push(state)
		})
		
		_.each(stateEV,function(findState){ 
			var addState;
			
			addState=_.find(tossupStates,function(compareState){
				return (compareState[0].split(":")[0]==findState[0])
			});
			if(addState==undefined){
				addState=_.find(demStates,function(compareState){
					return (compareState[0].split(":")[0]==findState[0])
				})
				if(addState==undefined){
					addState=_.find(repStates,function(compareState){
						return (compareState[0].split(":")[0]==findState[0])
					})
					if(addState==undefined){
						(findState[3]=="SR" || findState[3]=="LR") ? repStates.push([findState[0],"null",findState[3]]) : demStates.push([findState[0],"null",findState[3]]);
						//console.log("no poll data for",findState)
						
					}
				}
			}				
		});
		
		setupNodes();
		setDate();
		populateStates();
		updateEVs();//setInterval(blowBalloons,4000)
		initd3();

		
	}
	
	setupNodes = function(){
		//demNodes = d3.range(20).map(function(el,index){var ev=3+Math.ceil(Math.random()*22); return {"x":Math.ceil(Math.random()*w/2),"y":100+Math.ceil(Math.random()*(h-200)),"electoralVotes":ev}}); 
		demNodes = demStates.map(
			function(el,index){
				var ev=_.find(stateEV,function(state){
					return state[0]==el[0].split(":")[0];
				}); 
				
				if(el[2].split("|").length>1){
					spread=parseFloat(el[2].split("|")[1])
					if(el[2].split("|")[0]=="Obama") spread=-spread;
				}
				else
					spread=el[2]
				
				stateName=el[0].split(":")[0];
				return {"nodeType":"democrat","pollSpread":spread,"ev":ev[2],"name":stateName,"postal":ev[1],"y":100+Math.random()*((2/3)*h-100)}
		});
		
		// console.log("democrat states")
		//link each node to itself, just to get the strings
		demNodes.forEach(function(el,index){demNodeLinks.push({"source":index,"target":index});})

		repNodes = repStates.map(
			function(el,index){
				var ev=_.find(stateEV,function(state){
					return state[0]==el[0].split(":")[0];
				}); 
				
				if(el[2].split("|").length>1){
					spread=parseFloat(el[2].split("|")[1])
					if(el[2].split("|")[0]=="Romney") spread=-spread;
				}
				else
					spread=el[2]
				
				stateName=el[0].split(":")[0];
				return {"nodeType":"republican","pollSpread":spread,"ev":ev[2],"name":stateName,"postal":ev[1],"x":w*(2/3)+Math.random()*w*(1/3),"y":100+Math.random()*((2/3)*h-100)}
			});

		// console.log("republican states")
		//link each node to itself, just to get the strings
		repNodes.forEach(function(el,index){repNodeLinks.push({"source":index,"target":index});})
		
		tossupNodes = tossupStates.map(
			function(el,index){
				var ev=_.find(stateEV,function(state){
					return state[0]==el[0].split(":")[0];
				}); 
				stateName=el[0].split(":")[0];
				spread=parseFloat(el[2].split("|")[1])
				if(el[2].split("|")[0]=="Obama") spread=-spread;
				return {"nodeType":"tossup","pollSpread":spread,"ev":ev[2],"name":stateName,"postal":ev[1],"x":w*(1/3)+Math.random()*w*(1/3),"y":100+Math.random()*((2/3)*h-100)}
			});

		// console.log("tossup states")
		//link each node to itself, just to get the strings
		tossupNodes.forEach(function(el,index){tossupNodeLinks.push({"source":index,"target":index});})
		
	}
		
	initd3 = function(){
		blueColor=d3.rgb("#0061a6");
		redColor=d3.rgb("#e14038");
		purpleColor=d3.rgb("#654766");
		
		svg = d3.select("#svg_holder")
			.append("svg")
			.attr("width", w)
			.attr("height", h);
			
		tossupColorScale=d3.scale.linear()
			.domain([-tossupThreshhold,tossupThreshhold])
			.range([blueColor.toString(),redColor.toString()]);
		
		
		demForceWidth=(w-(394*2));
		demForceHeight=300+$('#barack_n_mitt').offset().top
		demForce = d3.layout.force()
			.nodes(demNodes)
			.links(demNodeLinks)
			.size([demForceWidth, demForceHeight])
			.charge(function(d){return (-1)*Math.pow(Math.sqrt(d.ev)*evScale,2)/10})
			.gravity(.095)
			.friction(.9)
			.start();
			//force.stop();
	
		var demLinks = svg.selectAll("demline.link")
			.data(demNodeLinks)
			.enter().append("line")
			.attr("class", "link")
			.style("stroke-width", .5);//function(d) { return Math.sqrt(d.value); });	
		
		var demBallGradient = svg.append("svg:defs")
		  .append("svg:radialGradient")
		    .attr("id", "demBallGradient")
		    .attr("cx", "50%")
		    .attr("cy", "50%")
		    .attr("r", "50%")
		    .attr("fx", "60%")
		    .attr("fy", "20%")
		    .attr("spreadMethod", "pad");

		demBallGradient.append("svg:stop")
		    .attr("offset", "0%")
		    .attr("stop-color", blueColor.brighter().toString())
		    .attr("stop-opacity", .75);

		demBallGradient.append("svg:stop")
		    .attr("offset", "100%")
		    .attr("stop-color", blueColor.toString())
		    .attr("stop-opacity", 1);

		demBalls=svg.selectAll("obamas")
			.data(demNodes)
			.enter()
			.append("svg:circle")
				.attr("class", "node")
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.attr("r", function(d){ return Math.sqrt(d.ev)*evScale;})
				.style("opacity","1")
				.style("fill", "url(#demBallGradient)")
				.style("stroke", blueColor.darker().toString())
				.style("stroke-width", .2)
				.call(demForce.drag)
				.on("mouseover",overBalloon)
				.on("mouseout",offBalloon);
				
		

		demForce.on("tick", function(e) {
		  // Push different nodes in different directions for clustering.
			//e.alpha;
			demLinks.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return demForceWidth/2 })
				.attr("y2", function(d) { return padding.top+$('#barack_n_mitt').offset().top });
			
			demBalls.attr("cx", function(d,i) { return d.x; })
				.attr("cy", function(d,i) { return d.y; });
				
		});
		
		
		
		repForceWidth=(w+(386*2));
		repForceHeight=300+$('#barack_n_mitt').offset().top;
		repForce = d3.layout.force()
			.nodes(repNodes)
			.links(repNodeLinks)
			.size([repForceWidth,repForceHeight])
			.charge(function(d){return (-1)*Math.pow(Math.sqrt(d.ev)*evScale,2)/10})
			.gravity(.095)
			.friction(.9)
			.start();
			//force.stop();
	
		var repLinks = svg.selectAll("repline.link")
			.data(repNodeLinks)
			.enter().append("line")
			.attr("class", "link")
			.style("stroke-width", .5);//function(d) { return Math.sqrt(d.value); });	
		
		var repBallGradient = svg.append("svg:defs")
		  .append("svg:radialGradient")
		    .attr("id", "repBallGradient")
		    .attr("cx", "50%")
		    .attr("cy", "50%")
		    .attr("r", "50%")
		    .attr("fx", "40%")
		    .attr("fy", "20%")
		    .attr("spreadMethod", "pad");

		repBallGradient.append("svg:stop")
		    .attr("offset", "0%")
		    .attr("stop-color", redColor.brighter(1.5).toString())
		    .attr("stop-opacity", .75);

		repBallGradient.append("svg:stop")
		    .attr("offset", "100%")
		    .attr("stop-color", redColor.toString())
		    .attr("stop-opacity", 1);
	
		
		repBalls=svg.selectAll("romneys")
			.data(repNodes)
			.enter()
			.append("svg:circle")
				.attr("class", "node")
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.attr("r", function(d){ return Math.sqrt(d.ev)*evScale;})
				.style("opacity","1")
				.style("fill", "url(#repBallGradient)")
				.style("stroke", redColor.darker().toString())
				.style("stroke-width", .2)
				.on("mouseover",overBalloon)
				.on("mouseout",offBalloon)
				.call(repForce.drag);

		repForce.on("tick", function(e) {
		  // Push different nodes in different directions for clustering.
			//e.alpha;
			repLinks.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return repForceWidth/2 })
				.attr("y2", function(d) { return padding.top+$('#barack_n_mitt').offset().top });
			
			repBalls.attr("cx", function(d,i) { return d.x; })
				.attr("cy", function(d,i) { return d.y; });
		});
		
		tossupForceWidth=w-6;
		tossupForceHeight=375+$('#barack_n_mitt').offset().top;
		tossupForce = d3.layout.force()
			.nodes(tossupNodes)
			.links(tossupNodeLinks)
			.size([tossupForceWidth,tossupForceHeight])
			.charge(function(d){return (-1)*Math.pow(Math.sqrt(d.ev)*evScale,2)/10})
			.gravity(.095)
			.friction(.9)
			.start();
			//force.stop();
	
		var tossupLinks = svg.selectAll("tossline.link")
			.data(tossupNodeLinks)
			.enter().append("line")
			.attr("class", "link")
			.style("stroke-width", .5);//function(d) { return Math.sqrt(d.value); });	
		
		tossupBalls=svg.selectAll("tossups")
			.data(tossupNodes)
			.enter()
			.append("svg:circle")
				.attr("class", "node")
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.attr("r", function(d){ return Math.sqrt(d.ev)*evScale;})
				.style("opacity","1")
				.style("fill", function(d) { 
					var gradientID="tossupGradient"+String(Math.round(Math.random()*1000));
					var tossupGradient = svg.append("svg:defs")
					  .append("svg:radialGradient")
					    .attr("id", gradientID)
					    .attr("cx", "50%")
					    .attr("cy", "50%")
					    .attr("r", "50%")
					    .attr("fx", "50%")
					    .attr("fy", "20%")
					    .attr("spreadMethod", "pad");

					tossupGradient.append("svg:stop")
					    .attr("offset", "0%")
					    .attr("stop-color", d3.rgb(tossupColorScale(d.pollSpread)).brighter().toString() )
					    .attr("stop-opacity", .75);

					tossupGradient.append("svg:stop")
					    .attr("offset", "100%")
					    .attr("stop-color", d3.rgb(tossupColorScale(d.pollSpread)).toString())
					    .attr("stop-opacity", 1);
					
						return "url(#"+gradientID+")"
					})
				.style("stroke", function(d) { return d3.rgb(tossupColorScale(d.pollSpread)).darker().toString() })
				.style("stroke-width", .2)
				.call(tossupForce.drag)
				.on("mouseover",overBalloon)
				.on("mouseout",offBalloon);

		tossupForce.on("tick", function(e) {
		  // Push different nodes in different directions for clustering.
			//e.alpha;
			tossupLinks.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return tossupForceWidth/2 })
				.attr("y2", function(d) { return padding.top+$('#barack_n_mitt').offset().top });
			
			tossupBalls.attr("cx", function(d,i) { return d.x; })
				.attr("cy", function(d,i) { return d.y; });
		});
		
		
	}
	
	populateStates = function(){
		
		demStates="";
		_.each(demNodes,function(node){
			demStates+="<span id='"+node.postal+"' class='StateFaceRegular'>"+stateFaceLookup[node.postal]+"</span>"
		})
		$('.state_font_wrapper:eq(0)').html(demStates);
			
		tossupStates="";
		_.each(tossupNodes,function(node){
			tossupStates+="<span id='"+node.postal+"' class='StateFaceRegular'>"+stateFaceLookup[node.postal]+"</span>"
		})
		$('.state_font_wrapper:eq(1)').html(tossupStates);
		
		repStates="";
		_.each(repNodes,function(node){
			repStates+="<span id='"+node.postal+"' class='StateFaceRegular'>"+stateFaceLookup[node.postal]+"</span>"
		})
		$('.state_font_wrapper:eq(2)').html(repStates);
		
		$('.state_font_wrapper').children().each(function(){
				$(this).mouseover(function(){
					var lookupID=$(this).attr("id");
					d3.selectAll(".node").each(function(d){
						if(d.postal==lookupID)
							//$(d).trigger('mouseover')
							overBalloon(d,"true");
					})
				})
			})
			
		$('.state_font_wrapper').children().each(function(){
				$(this).mouseout(function(){
					var lookupID=$(this).attr("id");
					d3.selectAll(".node").each(function(d){
						if(d.postal==lookupID)
							offBalloon(d,"true");
					})
				})
			})
	}
	
	setDate = function(){
		var today=new Date();
		var electionDay=new Date("November 6, 2012")
		var difference=electionDay.getTime()-today.getTime();
		
		var one_day=1000*60*60*24;
		
		if(Math.ceil(difference/one_day)==0)
			$('#day_count').text("today,");
		else if (Math.ceil(difference/one_day)==1)
			$('#day_count').text(" in "+Math.ceil(difference/one_day)+" day on");
		else
			$('#day_count').text(" in "+Math.ceil(difference/one_day)+" days on");
		
		// set updated date
		var lastUpdated;
		var dateList=[];
		_.each(pollStates,function(state){
			dateList.push(new Date(state[3]))
		})
		
		dateList.sort(date_sort_asc);
		$('#update_div').text("Updated "+moment(dateList[dateList.length-1]).format("dddd, MMMM Do YYYY, h:mm a"))
	}
	
	updateEVs = function(){
		demEVs=0;
		_.each(demNodes,function(demState){demEVs+=demState.ev})
		$('#barack_num').text(demEVs)
		
		repEVs=0;
		_.each(repNodes,function(repState){repEVs+=repState.ev})
		$('#mitt_num').text(repEVs)
		
		tossupEVs=0;
		_.each(tossupNodes,function(tossupState){tossupEVs+=tossupState.ev})
		$('#tossup_num').text(tossupEVs)
		//also set tossup state num
		tossupArray=["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve"]
		if(tossupNodes.length > 1) 
			$('#tossup_state_num').text(String(tossupArray[tossupNodes.length])+" states' polls were") 
		else
			$('#tossup_state_num').text(String(tossupArray[tossupNodes.length])+" state's poll is");
		
		$('#tossup_range').text(tossupThreshhold);
		
		(repEVs > demEVs) ? $('#leader_span').text("Romney leading Obama") : $('#leader_span').text("Obama leading Romney")
	}
	
	overBalloon = function(balloon,overState){
		
		var targetForce;
		if (balloon.nodeType=="democrat") targetForce=demForce;
		else if (balloon.nodeType=="republican") targetForce=repForce;
		else if (balloon.nodeType=="tossup") targetForce=tossupForce;
		
		targetForce.charge(
			function(d){
				if(d!=balloon)
					return (-1)*Math.pow(Math.sqrt(d.ev)*evScale,2)/10
				else
					return Math.sqrt(d.ev)*evScale-650;
			})
		
		if(overState!="true") overState="false";	
		if(overState=="true"){
			var targetNodes=targetForce.nodes();
			_.each(targetNodes,function(node){
				if(node==balloon)
					balloon.fixed=true;
			})
		};
		targetForce.start();
		
		
		$('#gia_hover_state_name').text(balloon.name)
		$('#gia_hover_state_ev').text(balloon.ev)
		
		if (balloon.nodeType=="democrat"){ 
			$('#'+balloon.postal+"").css("color",blueColor.toString())
			$('#gia_hover_state_ev').css("color",blueColor.toString()) 
			
			if(balloon.pollSpread<0)
				$('#gia_hover_state_copy').text("Obama +"+Math.abs(balloon.pollSpread)+"%")
			else
				$('#gia_hover_state_copy').text(leanLookup[balloon.pollSpread])
		}
		else if (balloon.nodeType=="republican") {
			$('#'+balloon.postal).css("color",redColor.toString())
			$('#gia_hover_state_ev').css("color",redColor.toString())
			
			if(balloon.pollSpread<0)
				$('#gia_hover_state_copy').text("Romney +"+Math.abs(balloon.pollSpread)+"%")
			else
				$('#gia_hover_state_copy').text(leanLookup[balloon.pollSpread])
		}
		else if (balloon.nodeType=="tossup") {
			$('#'+balloon.postal).css("color",purpleColor.toString())
			$('#gia_hover_state_ev').css("color",purpleColor.toString())
			if(balloon.pollSpread<0)
				$('#gia_hover_state_copy').text("Obama +"+Math.abs(balloon.pollSpread)+"%")
			else if(balloon.pollSpread>0)
				$('#gia_hover_state_copy').text("Romney +"+Math.abs(balloon.pollSpread)+"%")
			else if(balloon.pollSpread==0)
				$('#gia_hover_state_copy').text("Even")
		}
		
		floatDiv.css('visibility', 'hidden').show();
		var hoverWidth= floatDiv.width();
		floatDiv.css('visibility', 'visible').hide();
		
		if(balloon.x+$('#svg_holder').offset().left > $(window).width()/2)
			$('#gia_hover').css({"top":balloon.y-(Math.sqrt(balloon.ev)*evScale),"left":(balloon.x+$('#svg_holder').offset().left)-(Math.sqrt(balloon.ev)*evScale)-hoverWidth-20})
		else
			$('#gia_hover').css({"top":balloon.y-(Math.sqrt(balloon.ev)*evScale),"left":(balloon.x+$('#svg_holder').offset().left)+Math.sqrt(balloon.ev)*evScale+2})

		floatDiv.stop();
		floatDiv.fadeTo(100,1)
	}
	
	offBalloon = function(balloon,overState){
		var targetForce;
		if (balloon.nodeType=="democrat") targetForce=demForce;
		else if (balloon.nodeType=="republican") targetForce=repForce;
		else if (balloon.nodeType=="tossup") targetForce=tossupForce;
		
		targetForce.charge(function(d){return (-1)*Math.pow(Math.sqrt(d.ev)*evScale,2)/10})
		targetForce.start()
		
		if(overState!="true") overState="false";
		if(overState=="true"){
			var targetNodes=targetForce.nodes();
			_.each(targetNodes,function(node){
				if(node==balloon)
					balloon.fixed=false;
			})
		}

	
		$('#'+balloon.postal).css("color","#eeeeee")
		
		floatDiv.stop();
		floatDiv.fadeTo(100,0,function(){floatDiv.hide()})
	}

	showBrowserWarning = function (){
		
	}

	date_sort_asc = function (date1, date2) {
	  // This is a comparison function that will result in dates being sorted in
	  // ASCENDING order. As you can see, JavaScript's native comparison operators
	  // can be used to compare dates. This was news to me.
	  if (date1 > date2) return 1;
	  if (date1 < date2) return -1;
	  return 0;
	};

	onWindowResize = function(){
		$('#svg_holder').css("left",-(w-$(window).width())/2)
		$('#count_div').css("left",($(window).width())/2-480)
	}

	return obj
} (gia || {}));


$(document).ready(function(){
	gia.init();
	
});