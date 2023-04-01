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
	let disposable = vscode.commands.registerCommand('texttocode.codemesidebar',async function () {

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
		const htmlPath = vscode.Uri.file(
			path.join(extensionPath,'sidebar-html','sidebar.html')
		);
		const htmlContent = await vscode.workspace.fs.readFile(htmlPath);
		panel.webview.html = htmlContent.toString();
		// Handle messages from the webview
      	panel.webview.onDidReceiveMessage(
        	message => {
          		vscode.window.showInformationMessage(message.command);
        	},
        	undefined,
        	context.subscriptions
      	);
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
