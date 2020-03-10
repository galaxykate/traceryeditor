
Vue.component('tracery-template-section', {
	template: `
		<div class="tracery-node-labelsection">
			<div class="label">{{label}}</div>
			<div class="content">
				<div v-if="isArray">
					<div v-for="(item,index) in node" class="tracery-node-labelsection-item">
						<div v-if="index !== 0 && divider !== undefined" class="tracery-node-punctuation" >{{divider}}</div>
						<tracery-template-node :node="item"  :dictionaryData="dictionaryData"  />
					</div>
				</div>
				
				<tracery-template-node v-else :node="node" :dictionaryData="dictionaryData" />
			</div>
		</div>`,
	computed: {
		isArray: function() {
			return Array.isArray(this.node)
		}
	},
	props: ["node", "label", "divider", "dictionaryData"]
})

Vue.component('tracery-template-node', {
	template: `
		<div v-if="node == undefined" class="tracery-node-emptynode">EMPTY</div>
		<pre v-else-if="node.type === 'text'">{{node.raw}}</pre>

		<div v-else-if="node.type === 'key' && !node.isDynamic" class="tracery-node-plainkey">{{node.raw}}</div>

		<div v-else class="tracery-node" :class="nodeClass">
			
		
			<div v-if="node.type === 'rule' || node.type === 'key'">
				<tracery-template-node 
					v-for="(section,sectionIndex) in node.content.sections" 
					:key="sectionIndex" 
					:node="section"
					:dictionaryData="dictionaryData" />
			</div>

			<div class="content" v-else-if="node.type === 'tag'" @click="selectTag">

				<tracery-template-section
					:label="'preactions'"
					:node="node.content.preactions" 
					:dictionaryData="dictionaryData"
					v-if="node.content.preactions.length > 0"
				/>

				<tracery-template-section
					
					:node="node.content.src"
					:dictionaryData="dictionaryData" />

				<tracery-template-section
					:label="'mods'"
					:node="node.content.mods" 
					:dictionaryData="dictionaryData"
					v-if="node.content.mods.length > 0"
				/>
				
			</div>

			
			
			<div class="content" v-else-if="node.type === 'address'">
				<tracery-template-section
					:label="'path'"
					:divider="'/'"
					:node="node.content.sections" 
					:dictionaryData="dictionaryData"
				/>
			</div>

			<div class="content" v-else-if="node.type === 'push'">
				<tracery-template-section
					:label="'target'"
					:node="node.content.key" 
					:dictionaryData="dictionaryData"
				/>
				<div class="tracery-node-punctuation">:</div>
				<tracery-template-section
					:label="'rules'"
					:node="node.content.rules" 
					:dictionaryData="dictionaryData"
				/>
			</div>
			
			<div class="content" v-else-if="node.type === 'fxn'">
				<tracery-template-section
					:node="node.content.address"
					:dictionaryData="dictionaryData"
					 />

				<tracery-template-section
					:label="'parameters'"
					:node="node.content.parameters" 
					:dictionaryData="dictionaryData"
					v-if="node.content.parameters.length > 0"
				/>
			</div>

			<div v-else>
				{{node.content}}
			</div>
		
		</div>`,
		computed: {
			nodeClass: function() {
				let c = {
					selected:this.selected
				}
				c["tracery-node-" + this.node.type] = true
				return c
			},
		},

		methods: {
			selectTag() {
				console.log("Selected tag", this.node.content.src.raw)
				console.log(this.dictionaryData)
				// this.dictionaryData._eventBus("selectAddress", this.node.content.src.raw)
			}
		},

	

	props: {
		"node":{
			required:true
		},
		"dictionaryData": {
			type: Object,
		 	required:true
		}
	}
})

Vue.component('ery-ruleeditor', {
	template: `
		<div class="ery-ruleeditor">
			<header v-if="editable" >
				<pre contenteditable=true class="tracery-node-raw"
					@focus="onFocus"
  					@blur="onBlur"
					@keyup="onChange" 
					ref="ruleText"
				>{{node.raw}}</pre>
			</header>
			<tracery-template-node :dictionaryData="dictionaryData" :node="activeNode"/>
		</div>
	`,
	methods: {
		onChange: function() {
			console.log("edited", this.index)
			let rawRule = this.$refs.ruleText.innerHTML
			
			this.tempParse = parseRule(rawRule)
			

			this.$emit('editedRule', this.index, rawRule)
		},
		onFocus: function() {
			this.isEditing = true
			let rawRule = this.$refs.ruleText.innerHTML
			this.tempParse = parseRule(rawRule)
		},
		onBlur: function() {
			this.isEditing = false
		}
	},
	computed: {
		activeNode: function(){
				if (this.isEditing)
					return this.tempParse
				else
					return this.node
		}
	},
	data: function() {
		return {
			tempParse: undefined,
			isEditing: false
		}
	},
	props: ["node", "editable", "index", "selected", "dictionaryData"]
})

Vue.component('ery-valeditor', {
	template: `<div class="content ery-editor-ruleview" :style="style" >
		{{dictKey}}

		<ery-ruleeditor @editedRule="editedRule" @selectRule="selectRule" :dictionaryData="dictionaryData" v-for="(item, index) in value" :selected="index===selectedRuleIndex" :index="index" :key="index" :node="item" :editable="true" />
	</div>`,

	methods: {
		editedRule: function(index, value) {
			console.log("Edited", this.dictKey, index, value)
		},
		selectRule: function(index) {
			console.log("select:", index)
			this.selectedRuleIndex = index
		}, 
		selectKey: function(key) {
			console.log(key)
		}

	},
	computed: {
		style: function() {

			if (this.dictionaryData.keyData[this.dictKey])
				return this.dictionaryData.keyData[this.dictKey].style
		}
		
	},
	data: function() {
		return {
			selectedRuleIndex: undefined
		}
		
	},
	mounted: function() {
		let h = io.getLocal("editorHeight")
	
		$( ".ery-editor-ruleview" ).resizable({
			stop: ( event, ui )=> {
				io.setLocal("editorHeight", ui.size.height)
			},
			 handles: 's'
		}).css({
			height: h + "px",

		})

	},
	props: ["dictKey", "value", "dictionaryData"]
})