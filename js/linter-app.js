

// Open one of the loaded grammars, or edit a blank one


var app = new Vue({
	template: `<div class="app">
		<div class="header ery-header">
			<div>
				<input type="text" v-model="botID"></input>
				<button @click="saveBot">save</button>
				<button @click="newBot">new</button>
			</div>

			<div>
				
				<label for="loadgrammar-id">Load from:</label>
				<select id="loadgrammar-src" v-model="loadBotSrc">
					<option>local</option>
					<option>examples</option>
					<option disabled>cloud</option>
				</select>

				<select id="loadgrammar-id" v-model="loadBotID"  @change="loadBot">
					<option v-for="bot in botMetadata">{{botToDisplayName(bot)}}</option>
				</select>


				
				
			</div>


		</div>

		
		<ery-editor :bot="currentBot" />
	</div>`,
	el: '#main-app',

	mounted: function() {


		io.init(() => {
			
			this.loadBotID = io.getLocal("lastBotID")

			// get data to load an initial bot
			if (!this.loadBotID) {
				this.loadBotSrc  = "examples"
				this.loadBotID = "testTracery"
			} else {
				this.loadBotSrc = io.getLocal("lastBotSrc") 
			
			}
			
			console.log("init:", this.loadBotSrc, this.loadBotID)
			this.loadBot()
		})

		document.addEventListener("keydown", (e) => {
			if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
				e.preventDefault();
				this.saveBot()
				
			}
		}, false);

	},
	computed: {
		botMetadata: function() {
			return this.allBotData[this.loadBotSrc]
		}
	},
	
	methods: {
		botToDisplayName: function(botData) {
			let s = botData.id

			if (botData.lastEdited)
				s += `(${botData.lastEdited})`
			return s
		},
		loadBot: function() {
			
			io.loadBot(this.loadBotSrc, this.loadBotID, (bot) => {
				if (bot) {
					console.log("...successfully loaded:", bot)
					this.setBot(bot)
				} else {
					console.warn("could not load", this.loadBotSrc, this.loadBotID)
				}
				
			})
			io.setLocal("lastBotSrc", this.loadBotSrc)
			io.setLocal("lastBotID", this.loadBotID)
			console.log("last load: ", this.loadBotSrc, this.loadBotID)

			this.botID = this.loadBotID
		},
		setBot: function(bot) {
			
			bot.parsed = Tracery.parseGrammar(bot.raw)
			bot.parsedErrors = {}
			bot.key = Math.floor(Math.random()*1000)
			this.currentBot = bot
		},
		saveBot: function() {
			console.log("save bot", this.botID)
			if (this.botID == undefined || this.botID.trim().length == 0) {
				alert("Can't save unnamed bot")
			} else {
				io.saveBot(this.botID, this.currentBot)
				io.setLocal("lastBotSrc", this.loadBotSrc)
				io.setLocal("lastBotID", this.botID)
				this.loadBotSrc = "local"
				this.loadBotID = this.botID
			}

		},
		newBot: function() {
			this.botID = ""
			console.log("new bot")
			let bot = {
				raw: "",
			}
			this.setBot(bot)

		},
		copyToClipboard: function() {
			// todo, copy to clipboard
		}

	},
	data: {
		
		botID: "myNewBot",
		loadBotID: undefined,
		loadBotSrc: "examples",
		currentBot: {},
		allBotData:io.allBotData
	}
})