// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { spawn } = require('child_process');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let runQueryCommand = vscode.commands.registerCommand('texttocode.runQuery',async function() {
		var editor = vscode.window.activeTextEditor;
		if(!editor){
			vscode.window.showErrorMessage('No active editor selected!');
		}else{
			var suffix,commentDelim;
			//The below function extracts the suffix (in <x> language) and the comment delimeter (commentDelim)
			({ suffix, commentDelim } = extractSuffixComment(editor, suffix, commentDelim));
			const currentSelection = editor.selection;
			const candidateText = editor.document.getText(currentSelection);
			var commandText;
			var selectedText;
			//The below function extracts the selection by selecting a non-empty text if already selected or selecting the previous comment
			({ commandText, selectedText } = handleSelectionComment(candidateText, commandText, selectedText, suffix, currentSelection, editor, commentDelim));	
			//Finally, we run the model
			runModel(context, selectedText, editor);
		}
		context.subscriptions.push(runQueryCommand);
	});
}

function runModel(context, selectedText, editor) {
	const pythonScriptPath = context.extensionPath + "\\runModel.py";
	const args = [selectedText];
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
		vscode.window.showInformationMessage('Python process completed successfully.');
	} else {
		vscode.window.showErrorMessage(`Python process failed with error code ${code}.`);
	}
}

function handleError(data) {
	vscode.window.showInformationMessage(`${data.toString()}`);
}

function printDataToEditor(editor, data) {
	editor.edit(editBuilder => {
		const selection = editor.selection.active;
		const selectionEnd = editor.document.lineAt(selection.line).range.end;
		editBuilder.insert(selectionEnd, "\n" + data + "\n");
	});
}

function handleSelectionComment(candidateText, commandText, selectedText, suffix, currentSelection, editor, commentDelim) {
	if (candidateText.trim().length != 0) {
		commandText = candidateText;
		selectedText = commandText + suffix;
	} else {
		extractComment(currentSelection, editor, commentDelim);
		commandText = editor.document.getText(editor.selection);
	}
	return { commandText, selectedText };
}

function extractComment(currentSelection, editor, commentDelim) {
	let lineIndex = currentSelection.start.line;
	while (lineIndex >= 0) {
		const line = editor.document.lineAt(lineIndex);
		const text = line.text.trim();
		if (text.startsWith(commentDelim)) {
			const commentStart = text.indexOf(commentDelim) + 1;
			const commentEnd = line.range.end.character;
			const commentStartPosition = new vscode.Position(lineIndex, commentStart);
			const commentEndPosition = new vscode.Position(lineIndex, commentEnd);
			editor.selection = new vscode.Selection(commentStartPosition, commentEndPosition);
			break;
		} else if (text !== '') {
			break;
		}
		lineIndex--;
	}
}

function extractSuffixComment(editor, suffix, commentDelim) {
	const document = editor.document;
	const fileName = document.fileName;
	if (fileName.endsWith(".py")) {
		suffix = " in Python";
		commentDelim = "#";
	} else if (fileName.endsWith(".c")) {
		suffix = " in C";
		commentDelim = "//";
	} else if (fileName.endsWith(".cpp")) {
		suffix = " in C++";
		commentDelim = "//";
	} else if (fileName.endsWith(".java")) {
		suffix = " in Java";
		commentDelim = "//";
	} else if (fileName.endsWith(".js")) {
		suffix = " in Javascript";
		commentDelim = "//";
	} else if (fileName.endsWith(".go")) {
		suffix = " in GoLang";
		commentDelim = "//";
	} else {
		suffix = "";
		commentDelim = "//";
	}
	return { suffix, commentDelim };
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
