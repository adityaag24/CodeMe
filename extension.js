// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const http = require('http');

// create a function to send data to Python using http
function sendDataToPython(text) {
  // define the data to send as a JSON string
  const data = JSON.stringify({ text });

  // set up the options for the http request
  const options = {
    hostname: 'localhost', // replace with your server hostname
    port: 5000, // replace with your server port
    path: './runModel.py',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  // create the http request
  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      console.log(responseData);
    });
  });

  // handle any errors that occur
  req.on('error', (error) => {
    console.error(error);
  });

  // send the request with the data
  req.write(data);
  req.end();
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
		var editor = vscode.window.activeTextEditor;
		if(!editor){
			vscode.window.showInformationMessage('No active editor selected!');
		}else{
			var selection = editor.selection;
			var selectedText = editor.document.getText(selection);
			var responseText = sendDataToPython(selectedText);
			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, "\n"+responseText+"\n");
			})
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
