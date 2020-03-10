// Override save


		
var io = (function() {
	'use strict';

	let keyPrefix = "abc_"
	let botPrefix = "abc_bot_"


	let allBotData = {
		local: [],
		examples: [],
	}
	
	
	function setLocal(key, val) {
		window.localStorage.setItem(keyPrefix + key, JSON.stringify(val));
	}

	function getLocal(key) {
		return JSON.parse(window.localStorage.getItem(keyPrefix + key));
	}

	function saveBot(id, bot) {
		console.log("IO: save:", id, bot)
		// Set metadata for this bot
		let isNew = false
	
		let metadata = {
			type: "tracery",
			lastSaved: Date.now(),
			id: id
		}

		let botdata = {
			id: id,
			raw: bot.raw
		}

		if (!allBotData.local[id])
			metadata.createdOn = Date.now()
		console.log("... save metadata", metadata)

		window.localStorage.setItem(botPrefix + id,JSON.stringify(botdata))

		console.log("... save data", botdata)
		loadBotDataLocal()

	}

	function loadBot(src, id,callback) {
		if (src === "local") {
			console.log("load from local:", id)
			let key = botPrefix + id
			console.log(key)
			let bot = JSON.parse(window.localStorage.getItem(key))
			console.log(window.localStorage.getItem(botPrefix + id))
			callback(bot)
		}
		else if (src === "examples") {
			console.log("load from examples:", id)
			let bot = allBotData.examples.filter(bot => bot.id === id)[0]
			callback(bot)
		} else {
			console.warn("Unknown bot source", src, id)
			callback()
		}
		
	} 

	function loadBotDataLocal() {
		// Load info about local bots
		console.log("load local bot data")
			
		let localKeys = Object.keys(localStorage)
		let botKeys = localKeys.filter(s => s.startsWith(botPrefix))

	
		// When was each bot last edited?
		let botMetadata = botKeys.map(key => {
			let data = JSON.parse(window.localStorage.getItem(key + "_metadata"));
			if (data === null) {
				data = {
					id: key.substring(botPrefix.length),
					lastEdited: 0
				}
			}
			return data
		})
	
		botMetadata.sort((a, b) => a.lastEdited - b.lastEdited)
		
		console.log(` ... ${botMetadata.length} bots, most recent:${botMetadata[0]?botMetadata[0].id:"--None--"}`)
		
		allBotData.local = botMetadata
	}

	function init(onComplete) {
		loadBotDataLocal()
		loadBotDataExamples(() => {
			console.log("local bot load complete", allBotData.examples)
			onComplete()
		})
		
		
 	}

	function loadBotDataExamples(callback) {
		// Load all the bots from this particular set
		let botsrc = "data/2016-06-01-cbdq.json"
		botsrc = "data/example-grammars.json"

		io.allBotData.examples = []

		$.getJSON(botsrc, (json) => {
			
			// If its an object, convert it to a CBDQ style array
			if (!Array.isArray(json)) {
				json = mapObjectToArray(json, (val, key) => [key, 0, 0, 1, val])
			}
			console.log(`Loaded json: ${json.length} bots` )

			// for (var i = 0; i < json.length; i++) {
			for (var i = 0; i < json.length; i++) {
		
				let botData = json[i]
				if (botData.length < 4)
					console.warn(botData)
				else {
					let id = botData[0]
					let grammar = botData[4]
					let bot = {
						id: id, 
						raw: grammar,
						
					}
					io.allBotData.examples.push(bot)
				}	
			}
			
			callback()
		});



	}


	//==============
	// Local

	return {
		init: init,
		allBotData: allBotData,
		setLocal: setLocal,
		// getLocalNum: getLocalNum,
		getLocal: getLocal,
		loadBot: loadBot,
		saveBot: saveBot
	};
})();