
Vue.component('ery-editor', {
	template: `
	<div class="ery-editor">
		<div class="ery-editor-ruleviewer column">
			<tracery-grammar :grammar="bot.parsed" :key="parseKey"/>
		</div>

		<div class="ery-editor-editor column" :key="bot.key">
			<json-editor :json="bot.raw" @changed="updateJSON"/>
		</div>

	</div>
	`,

	methods: {
		updateJSON: function(val) {
			console.log("new JSON", val)
			this.bot.parsed = Tracery.parseGrammar(this.bot.raw)
			this.parseKey++
			
		}
	},

	mounted: function() {
	
	},
	props: {
	
		bot: {
			type: Object,
			required: true
		}
	},
	data: function() {
		return {
			parseKey: 0
		}
	}
})
