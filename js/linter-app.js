

// Open one of the loaded grammars, or edit a blank one


var app = new Vue({
	template: `<div class="app">
		<div class="header">
			<div>
				<input type="text" v-model="grammarID"></input>
				<button @click="saveGrammar">save</button>
			</div>

			<div>
				{{Object.keys(botTests)}}
				<label for="loadgrammar">Load:</label>
				<select id="loadgrammar" v-model=grammarID @change="loadGrammar"><option v-for="(bot,id) in botTests">{{bot.id}}</option></select>
				<button>clear</button>
			</div>


		</div>
		
		<ery-editor :bot="bot" />
	</div>`,
	el: '#main-app',

	mounted: function() {

		console.log("Load json")

		// Load all the bots from this particular set
		let botsrc = "data/2016-06-01-cbdq.json"
		botsrc = "data/example-grammars.json"

		$.getJSON(botsrc, (json) => {
			console.log(`Loaded json: ${json.length} bots` )

			// If its an object, convert it to a CBDQ style array
			if (!Array.isArray(json)) {
				json = mapObjectToArray(json, (val, key) => [key, 0, 0, 1, val])
			}

			// for (var i = 0; i < json.length; i++) {
			for (var i = 0; i < json.length; i++) {
		
				let bot = json[i]
				if (bot.length < 4)
					console.warn(bot)
				else {
					let id = bot[0]
					let grammar = bot[4]
					this.$set(this.botTests, id, {
						key: i*1000,
						id: id, 
						raw: grammar,
						parsed: undefined,
						// parsed: Tracery.parseGrammar(grammar)
					})
				}	
			}

			console.log(Object.keys(this.botTests))
			this.grammarID = Object.keys(this.botTests)[0]
			this.loadGrammar()
		});


	},

	
	methods: {
		loadGrammar: function() {
			console.log("load grammar", this.grammarID)
			
			this.bot = this.botTests[this.grammarID]
			this.bot.parsed = Tracery.parseGrammar(this.bot.raw)

		},
		saveGrammar: function() {
			console.log("save grammar", this.grammarID)
		}
	},
	data: {
		
		grammarID: "custom",
		bot: {
			rawCode: {},
			parsedCode: {}
		},
		botTests:{}
	}
})