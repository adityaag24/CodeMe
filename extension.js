// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { spawn } = require('child_process');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let runQueryCommand = vscode.commands.registerCommand('texttocode.generateQuery',async function() {
		var editor = vscode.window.activeTextEditor;
		if(!editor){
			vscode.window.showErrorMessage('No active editor selected!');
		}else{
			//The below function extracts the suffix (in <x> language) and the comment delimeter (commentDelim)
			var prefix = extractSuffixComment("Generate", editor);
			//The below function extracts the selection by selecting a non-empty text if already selected or selecting the previous comment
			var commandText = selectText(prefix, editor);	
			//Finally, we run the model
			runModel(context, commandText, editor);
		}
		context.subscriptions.push(runQueryCommand);
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

function selectText(prefix, editor) {
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
	return prefix+commandText;
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
		prefix = command+" Python: ";
	} else if (fileName.endsWith(".c")) {
		prefix = command+" C: ";
	} else if (fileName.endsWith(".cpp")) {
		prefix = command+" C++: ";
	} else if (fileName.endsWith(".java")) {
		prefix = command+" Java: ";
	} else if (fileName.endsWith(".js")) {
		prefix = command+" Javascript: ";
	} else if (fileName.endsWith(".go")) {
		prefix = command+" GoLang: ";
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
