// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const http = require('http');
const { spawn } = require('child_process');





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
		var editor = vscode.window.activeTextEditor;
		if(!editor){
			vscode.window.showInformationMessage('No active editor selected!');
		}else{
			var selection = editor.selection;
			var selectedText = editor.document.getText(selection);
      // Define the command to call the Python script
      const pythonScriptPath = context.extensionPath + "\\runModel.py";
      const args = [selectedText];
      // Spawn a child process to run the Python script
      const pythonProcess = spawn('python3', [pythonScriptPath, ...args]);
      // Log any output from the Python script to the console
      pythonProcess.stdout.on('data', (data) => {
        editor.edit(editBuilder => {
          editBuilder.insert(editor.selection.active,"\n"+data+"\n");
        })
      });

      // Log any errors from the Python script to the console
      pythonProcess.stderr.on('data', (data) => {
        editor.edit(editBuilder => {
          editBuilder.insert(editor.selection.active,"\n"+data+"\n");
        })
      });

      // Handle the Python script's exit event
      pythonProcess.on('close', (code) => {
        editor.edit(editBuilder => {
          editBuilder.insert(editor.selection.active,"\n"+code+"\n");
        })
      });
		}
	});

	context.subscriptions.push(helloWorldCommand);
	context.subscriptions.push(runQueryCommand);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
