// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const extensionPath = context.extensionPath;
	let disposable = vscode.commands.registerCommand('texttocode.codemesidebar', function () {
		const panel = vscode.window.createWebviewPanel(
			'sidebar', // Unique ID
			'CodeMe', // Title
			vscode.ViewColumn.Two, // Show the panel in the second column of the editor area
			{
			  // Options for the webview panel
			  enableScripts: true
			}
		);
		// Initialize the webview content
		panel.webview.html = getWebviewContent();
		  function getWebviewContent() {
			return `
			<html>
			<head>
				<script src="https://kit.fontawesome.com/318ea5b02c.js" crossorigin="anonymous"></script>
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
				<link rel="icon" type="image/png" href="./resources/my-icon.png">
				<style>
					#heading{
						color:white;
						margin-top:5px;
					}
					body{
						background-color:#5d6169;
					}
					.output-window{
						background-color: inherit;
					}
					.input-section{
						background-color: inherit;
						display: flex;
						flex-direction: row;
						margin-bottom: 10px;
						align-items: center;
						width: 100%;
					}
					.button-area{
						background-color: inherit;
					}
					/* styles for textarea element */
					#output-area {
						width: 100%;
						height: 100%;
						overflow-y: auto;
						border: 1px solid black;
						color: white;
						font-size: 20px;
						background-color:#5d6169;
					}
					/* styles for input element */
					#query-field {
						flex: 1;
						padding: 10px;
						font-size: 20px;
						border: 1px solid black;
						color: white;
						background-color: #6f7275;
					}
					/* styles for button element */
					button {
						padding: 5px 10px;
						border: 1px solid black;
						margin: 5px;
						font-family: 'Arial';
						font-size: 20px;
						cursor: pointer;
					}   
					#check-button{
						border:none;
						font-size:25px;
						background-color: #337ef5;
						color:white;
					}
					#trash-can-clear{
						background-color: #5d6169;
						color:white;
						margin-top:5px;
					}
					input[type=text]:focus{
						background-color:black;
					}
					.top-right{
						position: absolute;
						border: none;
						top: 0px;
						right: 10px;
						font-size:10px;
					}
					.btn-matrix{
						position:absolute;
						bottom:5px;
						left:15px;
					}
				</style>
			</head>
			<body>
				<h5 id="heading">CodeMe</h5>
				<div class="output-window">
					<button class="top-right" disabled id="trash-can-clear"><i class="fas fa-trash-alt"></i></button>
					<textarea id="output-area" readonly rows="10" cols="100"></textarea>
				</div>
				<div class="input-section">
					<input type="text" id="query-field" />
					<button id="check-button">&rArr;</button>
				</div>
				<div class="btn-group btn-matrix" role="group" aria-label="Basic example">
					<button type="button" class="btn btn-primary">Generate</button>
					<button type="button" class="btn btn-primary">Explain</button>
					<button type="button" class="btn btn-primary">Summarize</button>
				</div>
			</body>
			<script>
				const input = document.getElementById('query-field');
				const processButton = document.getElementById('check-button');
				const output = document.getElementById('output-area');
				const clearBtn = document.getElementById('trash-can-clear');
				clearBtn.addEventListener('click',() => {
					output.textContent='';
					clearBtn.disabled=true;
				})
				processButton.addEventListener('click', () => {
					const text = input.value;
					output.textContent = processText(text);
					clearBtn.disabled=false;
				});
				input.addEventListener('keyup', (event) => {
					if (event.keyCode === 13) { 
						processButton.click();
						input.value="";
					}
				});
				function processText(text) {
					return 'Hi '+text;
				}
				</script>
			</html>
			`;
		}
		context.subscriptions.push(disposable);
	});
	let generateQueryCommand = vscode.commands.registerCommand('texttocode.generateQuery',async function() {
	var editor = vscode.window.activeTextEditor;
	if(!editor){
		vscode.window.showErrorMessage('No active editor selected!');
	}else{
		//The below function extracts the suffix (in <x> language) and the comment delimeter (commentDelim)
		var prefix = extractSuffixComment("Generate", editor);
		//The below function extracts the selection by selecting a non-empty text if already selected or selecting the previous comment
		var commandText = selectText(prefix, editor, "");	
		//Finally, we run the model
		runModel(context, commandText, editor);
	}
	context.subscriptions.push(generateQueryCommand);
	});
	let defectQueryCommand = vscode.commands.registerCommand('texttocode.defectQuery',async function() {
		var editor = vscode.window.activeTextEditor;
		if(!editor){
			vscode.window.showErrorMessage('No active editor selected!');
		}else{
			//The below function extracts the suffix (in <x> language) and the comment delimeter (commentDelim)
			var prefix = extractSuffixComment("Defect", editor);
			//The below function extracts the selection by selecting a non-empty text if already selected or selecting the previous comment
			var commandText = selectText(prefix, editor, "");	
			//Finally, we run the model
			runModel(context, commandText, editor);
		}
		context.subscriptions.push(defectQueryCommand);
	});
	let summarizeQueryCommand = vscode.commands.registerCommand('texttocode.summarizeQuery',async function() {
		var editor = vscode.window.activeTextEditor;
		if(!editor){
			vscode.window.showErrorMessage('No active editor selected!');
		}else{
			//The below function extracts the suffix (in <x> language) and the comment delimeter (commentDelim)
			var prefix = extractSuffixComment("Summarize", editor);
			//The below function extracts the selection by selecting a non-empty text if already selected or selecting the previous comment
			var commandText = selectText(prefix, editor, "");	
			//Finally, we run the model
			runModel(context, commandText, editor);
		}
		context.subscriptions.push(summarizeQueryCommand);
	});
	let refineQueryCommand = vscode.commands.registerCommand('texttocode.refineQuery',async function() {
		var editor = vscode.window.activeTextEditor;
		if(!editor){
			vscode.window.showErrorMessage('No active editor selected!');
		}else{
			//The below function extracts the suffix (in <x> language) and the comment delimeter (commentDelim)
			var prefix = extractSuffixComment("Refine", editor);
			//The below function extracts the selection by selecting a non-empty text if already selected or selecting the previous comment
			var commandText = selectText(prefix, editor, "");	
			//Finally, we run the model
			runModel(context, commandText, editor);
		}
		context.subscriptions.push(refineQueryCommand);
	});
	let translateQueryCommand = vscode.commands.registerCommand('texttocode.translateQuery',async function() {
		var editor = vscode.window.activeTextEditor;
		if(!editor){
			vscode.window.showErrorMessage('No active editor selected!');
		}else{
			const toLanguage = await vscode.window.showInputBox({
				prompt: 'Enter Language you want to convert to',
		 	});
			//The below function extracts the suffix (in <x> language) and the comment delimeter (commentDelim)
			var prefix = extractSuffixComment("Refine", editor);
			//The below function extracts the selection by selecting a non-empty text if already selected or selecting the previous comment
			var commandText = selectText(prefix, editor, toLanguage);	
			//Finally, we run the model
			runModel(context, commandText, editor);
		}
		context.subscriptions.push(translateQueryCommand);
	});
}

function runModel(context, commandText, editor) {
	const pythonScriptPath = context.extensionPath + "\\runModel.py";
	const args = [commandText];
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: 'Running CodeMe...',
		cancellable: true
	}, async () => {
		const pythonProcess = spawn('python', [pythonScriptPath, ...args]);
		pythonProcess.stdout.on('data', (data) => {
			printDataToEditor(editor, data);
		});
		pythonProcess.stderr.on('data', (data) => {
			handleError(data);
		});
		pythonProcess.on('close', (code) => {
			handleClose(code);
		});
		await new Promise((resolve) => {
			pythonProcess.on('exit', () => {
				resolve();
			});
		});
	});
}

function handleClose(code) {
	if (code === 0) {
		console.log('Python process completed successfully.');
	} else {
		console.log(`Python process failed with error code ${code}.`);
	}
}

function handleError(data) {
	console.log(`${data.toString()}`);
}

function printDataToEditor(editor, data) {
	editor.edit(editBuilder => {
		const selection = editor.selection.active;
		const selectionEnd = editor.document.lineAt(selection.line).range.end;
		editBuilder.insert(selectionEnd, "\n" + data + "\n");
	});
}

function selectText(prefix, editor, translateCommand) {
	const currentSelection = editor.selection;
	const candidateText = editor.document.getText(currentSelection);
	var commandText;
	if (candidateText.trim().length != 0) {
		commandText = candidateText;
	} else {// Get the position of the cursor
		const cursorPosition = editor.selection.active;
		const startOfDocumentPosition = new vscode.Position(0, 0);
		const selection = new vscode.Selection(startOfDocumentPosition, cursorPosition);
		editor.selection = selection;
		commandText = editor.document.getText(editor.selection);
	}
	if(translateCommand.length == 0){
		return prefix+":"+commandText;
	}else{
		return prefix+"to "+translateCommand+" :"+commandText;
	}
}

// function extractComment(currentSelection, editor, commentDelim) {
// 	let lineIndex = currentSelection.start.line;
// 	while (lineIndex >= 0) {
// 		const line = editor.document.lineAt(lineIndex);
// 		const text = line.text.trim();
// 		if (text.startsWith(commentDelim)) {
// 			const commentStart = text.indexOf(commentDelim) + 1;
// 			const commentEnd = line.range.end.character;
// 			const commentStartPosition = new vscode.Position(lineIndex, commentStart);
// 			const commentEndPosition = new vscode.Position(lineIndex, commentEnd);
// 			editor.selection = new vscode.Selection(commentStartPosition, commentEndPosition);
// 			break;
// 		} else if (text !== '') {
// 			break;
// 		}
// 		lineIndex--;
// 	}
// }

function extractSuffixComment(command, editor) {
	const document = editor.document;
	const fileName = document.fileName;
	var prefix;
	if (fileName.endsWith(".py")) {
		prefix = command+" Python ";
	} else if (fileName.endsWith(".c")) {
		prefix = command+" C ";
	} else if (fileName.endsWith(".cpp")) {
		prefix = command+" C++ ";
	} else if (fileName.endsWith(".java")) {
		prefix = command+" Java ";
	} else if (fileName.endsWith(".js")) {
		prefix = command+" Javascript ";
	} else if (fileName.endsWith(".go")) {
		prefix = command+" GoLang ";
	} else {
		prefix = "";
	}
	return prefix;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
