Vue.component('ery-preview-rule', {

	// 
	template: `
	<div v-if="node===undefined" class="tracery-previewnode-missing">MISSING</div>
	<div v-else  :style="addressToStyle()"  :class="getClass" @click.stop="dictionaryData._eventBus('selectAddress', address)">

		<header>

			<div v-if="address" class="tracery-previewnode-address">{{address}}</div>
		</header>
		<div class="content">
			<div v-for="section in node.content.sections" class="tracery-previewnode">

				<pre v-if="section.template.type=='text'" class="tracery-previewnode tracery-previewnode-text">{{section.template.raw}}</pre>
				<div v-else-if="section.template.type=='tag'" class="tracery-previewnode">
					
					<ery-preview-rule :node="section.expandedRule" :address="section.finishedAddress" :dictionaryData="dictionaryData"/>
					
				</div>
			
			</div>


		
		</div>
		
		
		
	</div>`,
	computed: {
		getClass:function() {
			let c = {
				"tracery-previewnode-rule": true
			}
			return c
		}
	},
	methods: {
		addressToStyle: function(){
			if (!this.address)
				return ""
			
			if (Array.isArray(this.address)) {
				// Path!
				return this.dictionaryData.pathStyle
				
			} else {
				if (this.dictionaryData.keyData[this.address])
					return this.dictionaryData.keyData[this.address].style

				// Dynamic
				return this.dictionaryData.dynamicKeyStyle
				
			}
		

		}
	},
	props: ["node", "address", "dictionaryData"]
})

// Preview for tracery stuff (add chancery later)
Vue.component('ery-preview', {
	template: `
	<div class="column-section ery-preview">
	

		<header class="ery-header">
			
			<div>
				<button @click="toggleNested" class="svg-button" :class="{disabled:!showNested}">
					<img v-if="useColor" src="css/img/abc-editor-icons-color-01.svg"/>
					<img v-else src="css/img/abc-editor-icons-color-01.svg"/>
				</button>
				<button @click="toggleText" class="svg-button" :class="{disabled:showNested}">
					<img v-if="useHTML" src="css/img/abc-editor-icons-color-04.svg"/>
					<img v-else src="css/img/abc-editor-icons-color-05.svg"/>
				</button>
			</div>

			<div>
				<select v-model="startSymbol">
					<option v-for="dictKey in allKeys">{{dictKey}}</option>
				</select>

				<select v-model="count">
					<option>1</option>
					<option>5</option>
					<option>15</option>
					<option>50</option>
				</select>

				<button class="svg-button" @click="lastSeed">
					<img src="css/img/arrow-back.svg"/>
				</button>
				<button class="svg-button" @click="randomize">
					<img src="css/img/randomize.svg"/>
				</button>
				<button class="svg-button" @click="nextSeed">
					<img src="css/img/arrow-forward.svg"/>
				</button>

				<input v-model="seed"/>
			</div>
		</header>

		<div class="content">
			<div class="ery-trace" v-for="trace in traces">
				<ery-preview-rule v-if="showNested"  :node="trace" :dictionaryData="dictionaryData"/>
				<div v-else-if="useHTML" class="ery-trace-text" v-html="trace.htmlOutput"></div>
				<pre v-else class="ery-trace-text">{{trace.finished}}</pre>
			</div>
		</div>
	</div>
	`,
	methods: {
		toggleText: function() {
			if (this.showNested)
				this.showNested = false
			else 
				this.useHTML = !this.useHTML

			io.setLocal("useHTML", this.useHTML)
			io.setLocal("showNested", this.showNested)
		},
		toggleNested: function() {
			if (!this.showNested)
				this.showNested = true
			else 
				this.useColor = !this.useColor

			io.setLocal("useColor", this.useColor)
			io.setLocal("showNested", this.showNested)
		},
		randomize: function() {
			this.seed = this.createRandomSeed()
			this.seedIndex++
			this.seedHistory[this.seedIndex] = this.seed
		},
		nextSeed: function() {
			console.log((this.seedIndex + 1) + "/" + this.seedHistory.length)
			if (this.seedIndex >= this.seedHistory.length - 1)
				this.randomize()
			else {
				this.seedIndex++
				this.seed = this.seedHistory[this.seedIndex]
			}
		},
		lastSeed: function() {
			this.seedIndex = Math.max(this.seedIndex - 1, 0)
			this.seed = this.seedHistory[this.seedIndex]
			console.log(this.seedIndex + "/" + this.seedHistory.length)
		
		},
		createRandomSeed: function() {
			let count = 6
			let s = ""
			for (var i = 0; i < count; i++) {
				if (Math.random() > .5) {
					s += String.fromCharCode(Math.floor(Math.random() * 26 + 65))
				} else {
					s += String.fromCharCode(Math.floor(Math.random() * 10 + 48))

				}
			}
			return s;
		}
	},
	
	computed: {
		allKeys: function() {
			return Object.keys(this.dictionaryData.keyData)

		},
		context: function() {
			console.log("create context", this.script)
			if (this.script)
				return Tracery.createContext(this.script, {
					random: new Math.seedrandom(this.seed)
				})
			return Tracery.createContext({})

		},
		traces: function() {
			console.log(`Create ${this.count} traces`)

			let rule = "#" + this.startSymbol + "#"

			let traces = []
			for (var i = 0;i < this.count; i++) {
				traces[i] = this.context.expand(rule)
				traces[i].htmlOutput = traces[i].finished.replace('\n', '<br>')
			}

			console.log(traces)
			return traces
		},
	},
	data: function() {
		let firstSeed = this.createRandomSeed()
		return {
			seedIndex: 0,
			seedHistory: [firstSeed],
			seed: firstSeed,
			showNested: io.getLocal("showNested"),
			useColor: io.getLocal("useColor"),
			useHTML: io.getLocal("useHTML"),
			count: 5,
			startSymbol: "origin"
		}
	},
	props: ["script", "dictionaryData"],

})
