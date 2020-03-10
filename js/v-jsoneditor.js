function setCaretPosition(elem, caretPos) {
	if (elem.createTextRange) {
		var range = elem.createTextRange();
		range.move('character', caretPos);
		range.select();
	}
	else {
		if (elem.selectionStart) {
			elem.focus()
			elem.setSelectionRange(caretPos, caretPos)
		} else {
			elem.focus()
		}
	}
}


// let testLines = `How was she to bear the change?--It was true that her friend was going only half a mile from them; but Emma was aware that great must be the difference between a Mrs. Weston, only half a mile from them, and a Miss Taylor in the house; and with all her advantages, natural and domestic, she was now in great danger of suffering from intellectual solitude.  She dearly loved her father, but he was no companion for her.` 

// for (var i = 0; i < 10; i++) {
// 	breakLine(testLines, 20 + i*8)	
// }


Vue.component('json-editor', {
	template: "<div ref='editor' class='ery-editor-jsonholder'></div>",

	methods: {

		// Scroll or caret to some part of the text
		scrollToProperty: function(propKey) {
			console.log("JSON scroll to prop: " + propKey)

			
			if (!this.codeMode) {
				let textbox = $(".jsoneditor-text")
				let s = textbox.val()
				let elem = textbox.get(0)
				let index = s.indexOf(`\n  "${propKey}":`) + 3
				setCaretPosition(elem, index)
				elem.blur()
				elem.focus()
			}
		},
	
	},


	mounted: function() {
		console.log("remounted JSON editor, add editor dom")

		
		const editor = new JSONEditor(this.$refs.editor,  
			{ 
				"search": true,
				"mode": this.codeMode?"code":"text",
				"modes": ["code", "text"],
				"indentation": 2,
				onChange: () => {
					console.log("Changed!")
					this.raw =  this.editorTextField.val()
					this.$emit('changed',  editor.get(),this.raw)
				},

				onModeChange: (newMode) => {
					this.codeMode = newMode === "code"
					console.log("Changed mode!")
				},

				onTextSelectionChange: (start, end, text) => {
					this.row = start.row - 1
					this.column = start.column - 1

					this.caret = this.editorTextField.get(0).selectionStart
					let rawText = this.editorTextField.val()

					// If code mode, then the row/column are valid
					// If text mode, only the caret is valid
					// Given one of these two, find the last path
					// (Ignore code mode for now)
					
										
					// Where are we in the current object? 
					// If JSON is a tree, what are all the parent nodes 
					//   that lead to the node the cursor is in?

					// ace_line_group > ace_line > ace_variable
					this.path = getPathFromJSON(rawText, this.caret)
					// Some selection changed
				
					this.$emit('caretChanged', this.path)
		

				},

				  
		});
			
		if (this.json)
			editor.set(this.json)


		
		
		const updatedJson = editor.get()

		this.editorTextField = $(".jsoneditor-text")
		this.rawString = this.editorTextField.val()
		
		// jsonToIndexOverlay(this.rawString)

		// Set the current caret position
		// $(".jsoneditor-text").bind("keydown click focus", (ev) => {
			
		// 	let pos = ev.target.selectionStart
		// 	this.caretPos = pos
		// 	this.$emit('caretChanged',  this.caretPos, this.raw, $(".jsoneditor-text").val())
		// })
		this.$emit('changed',  editor.get())
	},

	data: function() {
		return {
			rawString: "",
			row: 0,
			column: 0,
			path: [],
			caretPos: 0,
			editorTextField: undefined,
			codeMode: false,
		}
	},

	props: {

		json: {
			 required: true
		}
	}

})