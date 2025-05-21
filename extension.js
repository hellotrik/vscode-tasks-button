const vscode = require('vscode');

function activate(context) {
    let buttons = [];
    function updateTaskButtons() {
        buttons.forEach(btn => btn.dispose());
        const tasks = vscode.workspace.getConfiguration('tasks').get('tasks') || [];
        buttons = tasks
            .filter(task => task.label && task.icon)
            .map(task => {
                const btn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
                btn.text = task.icon?.id ? `$(${task.icon.id}) ${task.label}` : task.label;
                btn.color = task.icon?.color || '';
                btn.tooltip = task.icon?.tooltip;
                btn.command = { command: 'workbench.action.tasks.runTask', arguments: [task.label] };
                btn.show();
                return btn;
            });
    }
    updateTaskButtons();
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            e.affectsConfiguration('tasks') && updateTaskButtons();
        })
    );
}

function deactivate() {}

module.exports = { activate, deactivate };