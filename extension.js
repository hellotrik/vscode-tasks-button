const vscode = require('vscode');

async function createButtons() {
    const buttons = vscode.workspace.getConfiguration('tasksButton').get('tasks') || [];
    const tasks = await vscode.tasks.fetchTasks();
    return buttons
        .filter(({label}) => tasks.some(task => task.name === label))
        .map(({icon, name, tip, label}) => {
            const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
            button.text = icon ? `$(${icon}) ${name}` : name;
            button.tooltip = tip;
            button.command = { command: 'workbench.action.tasks.runTask', arguments: [label] };
            return button.show(), button;
        });
}

function activate(context) {
    let statusBarItems = [];
    const updateButtons = () => createButtons().then(items => {
        statusBarItems.forEach(item => item.dispose());
        statusBarItems = items;
        context.subscriptions.push(...items);
    });
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => 
            e.affectsConfiguration('tasksButton.tasks') && updateButtons()
        )
    );
    updateButtons();
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}