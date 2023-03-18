// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { spawn } = require('child_process');
function selectPreviousPythonComment(editor) {

    const currentSelection = editor.selection;
    let lineIndex = currentSelection.start.line - 1;

    while (lineIndex >= 0) {
        const line = editor.document.lineAt(lineIndex);
        const text = line.text.trim();

        if (text.startsWith('#')) {
            const commentStart = text.indexOf('#');
            const commentEnd = line.range.end.character;
            const commentStartPosition = new vscode.Position(lineIndex, commentStart);
            const commentEndPosition = new vscode.Position(lineIndex, commentEnd);

            editor.selection = new vscode.Selection(commentStartPosition, commentEndPosition);
            return;
        } else if (text !== '') {
            return;
        }

        lineIndex--;
    }
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "texttocode" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let helloWorldCommand = vscode.commands.registerCommand('texttocode.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from texttocode!');
	});

	let runQueryCommand = vscode.commands.registerCommand('texttocode.runQuery',async function() {
		return new Promise(function () {
			vscode.window.showInformationMessage('Running Command');
			var editor = vscode.window.activeTextEditor;
			if(!editor){
				vscode.window.showInformationMessage('No active editor selected!');
			}else{
				selectPreviousPythonComment(editor);
				var selection = editor.selection;
				var selectedText = editor.document.getText(selection)+" in python language";
				// Define the command to call the Python script
				console.log("Command : ",selectedText);
				vscode.window.showInformationMessage("Command : ",selectedText);
				const pythonScriptPath = context.extensionPath + "\\runModel.py";
				const args = [selectedText];
				// Spawn a child process to run the Python script
				vscode.window.showInformationMessage("Running Python Process");
				const pythonProcess = spawn('python', [pythonScriptPath, ...args]);
				// Log any output from the Python script to the console
				pythonProcess.stdout.on('data', (data) => {
					editor.edit(editBuilder => {
						const selection = editor.selection.active;
						const selectionEnd = editor.document.lineAt(selection.line).range.end;
						editBuilder.insert(selectionEnd,"\n"+data+"\n");
					})
				});

				// Log any errors from the Python script to the console
				pythonProcess.stderr.on('data', (data) => {
					editor.edit(editBuilder => {
						const selection = editor.selection.active;
						const selectionEnd = editor.document.lineAt(selection.line).range.end;
						editBuilder.insert(selectionEnd,"\n"+data+"\n");
					})
				});
				// Handle the Python script's exit event
				pythonProcess.on('close', (code) => {
					editor.edit(editBuilder => {
						const selection = editor.selection.active;
						const selectionEnd = editor.document.lineAt(selection.line).range.end;
						editBuilder.insert(selectionEnd,"\n"+code+"\n");
					})
				});
			}
			context.subscriptions.push(helloWorldCommand);
			context.subscriptions.push(runQueryCommand);
		});
	});
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
