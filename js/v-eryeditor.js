

Vue.component('ery-editor', {
	template: `
	<div class="ery-editor">

		<div class="column ery-editor-viewcolumn">
			
			<!-- KEY BROWSER -->
			<div class="column-section ery-editor-controls" >
				<header class="ery-header">
					<div class="ery-keybrowser">
						<div v-for="keyData in dictionaryData.keyData" 
							:key="keyData.key"
							:style="keyData.style"
							:class="{'ery-key': true, 'selected':selectedKey===keyData.key}"
							@click="selectKey(keyData.key, 'browser')" 

						>
							
							{{keyData.key}}

							<div class="ery-key-errorblip" 
								v-if="keyData.errors.length > 0">
								{{keyData.errors.length}}
							</div>
						</div>
					</div>
				</header>

				<!-- VALUE EDITOR -->
				<ery-valeditor v-if="selectedKey !== undefined" @selectKey="selectKey" :dictKey="selectedKey" :dictionaryData="dictionaryData" :value="dictionary[selectedKey]" />
			</div>

			

			<!-- PREVIEW WIDGET -->
			<ery-preview  :script="bot.parsed" :dictionaryData="dictionaryData" ref="preview" @selectAddress="selectAddress"/>
			

		</div>

		<!-- JSON EDITOR -->
		<div class="ery-editor-jsoncolumn column" :key="'bot-' + bot.key">
			<json-editor 
				ref="jsoneditor"
				:json="bot.raw" 

				@changed="updateJSON" 
				@caretChanged="setActiveSymbolFromJSONEditor"/>
		</div>



	</div>
	`,

	computed: {
		contrast: function() {

			return this.relativeContrast
		},
		// a lookoup table of data for each symbol in the grammar
		dictionaryData: function() {
			if (this.dictionary == undefined) {
				return {
					_eventBus: () => {
						console.log("no bus for empty dict")
					},
					keyData: {
					}
				}
			}
			
			let count = 0
			let dictData = {
				pathStyle: {
					backgroundColor: `hsl(290, 100%, ${50-50*this.contrast}%)`,
					color: `hsl(290, 100%, ${90 + 10*this.contrast}%)`
				},
				dynamicKeyStyle:  {
					backgroundColor: `hsl(190, 100%, ${50-50*this.contrast}%)`,
					color: `hsl(190, 100%, ${90 + 10*this.contrast}%)`
				},
				keyData: mapObject(this.dictionary, (val, key) => {

					let id = count++
					let hue = (count*.115)%1
					let keyData = {
						index:id,
						id:id,
						key: key,
						hue: hue,
						style: {
							backgroundColor: `hsl(${hue*360}, 90%, ${90 + 10*this.contrast}%)`,
							color: `hsl(${hue*360}, 100%, ${30-30*this.contrast}%)`
						},
						errors: []
					}

					return keyData
				}),
				_eventBus : (ev, params) => {
					console.warn(ev, params)
					if (ev=== "selectAddress") {
						if (Array.isArray(params)) {

						} else {
								this.selectKey(params)
						}
					
					}

				}
			}

		
			return dictData
		},

		dictionary: function() {
			// what's the current dictionary address? for Bottery
			// if (this.activeDictionaryID)
			// 	return this.bot.parsed[this.activeDictionaryID]
			return this.bot.parsed
		},

		
	},
	
	methods: {

		selectAddress: function() {
			console.log("SELECTED ADDRESS")
		},

		selectKey: function(key, source) {
			console.log("select key:", key)
			this.selectedKey = key


			// Was this change *not* from the user moving the curson in the JSON?
			// ..then set the caret in the JSON editor
			if (source !== "json") {

				// Hey JSON editor, scroll to where this key is.
				this.$refs.jsoneditor.scrollToProperty(key)
			}
		},	

		setActiveSymbolFromJSONEditor: function(path) {
			if (path!== undefined) {

				console.log("set active symbol", path)
				if (path.length === 0)
					return this.dictionaryKeys[0]
				this.selectedKey = path[0]
			}
		},


		updateJSON: function(newJSON, jsonRaw) {

			
			this.bot.raw = newJSON
			this.bot.parsed = Tracery.parseGrammar(this.bot.raw)

			this.bot.parseErrors = getAllGrammarErrors(this.bot.parsed)

			this.parseKey++


			this.selectedKey = Object.keys(this.bot.raw)[0]
			
		}
	},

	mounted: function() {
		
		let w = io.getLocal("editorWidth")
		
		
		$( ".ery-editor-viewcolumn" ).resizable({
			stop: ( event, ui )=> {
				io.setLocal("editorWidth", ui.size.width)
			},
			 handles: 'e'
		}).css({
			width: w + "px"
		})



	},

	// What do we need to edit about this ery (etc) object?
	// What are its properties?
	// * image/name/tags
	// * type, language version
	// * user (automatically scraped from io)
	// * interaction history (io)
	// * edit history
	// * parse errors
	// * "soft errors" (unused or missing symbols, etc)
	// * parsed version
	// * unparsed json object
	watch: {
		bot: function() {
			console.warn("BOT CHANGED")
			this.parseKey++
			console.log("Object raw keys: " + Object.keys(this.bot.raw))
			console.log("Object parsed keys: " + Object.keys(this.bot.parsed))
		}
	},
	props: {
	
		bot: {
			type: Object,
			required: true
		}
	},
	data: function() {
		return {
			relativeContrast: 0,
			activeDictionaryID: undefined,
			selectedKey: undefined,
			parseKey: 0,

		}
	}
})
