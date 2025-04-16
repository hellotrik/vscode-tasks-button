const vscode = require('vscode');

function activate(context) {
    let buttons = [];
    
    function updateTaskButtons() {
        buttons.forEach(btn => btn.dispose());
        const tasks = vscode.workspace.getConfiguration('tasks').get('tasks') || [];
        const displayCondition = vscode.workspace.getConfiguration('tasks').get('DisplayCondition') || 'ShowWithIcon';
        
        buttons = tasks
            .filter(task => task.label)
            .filter(task => {
                switch(displayCondition) {
                    case 'ShowAll': return true;
                    case 'HideAll': return false;
                    case 'ShowWithIcon': return !!(task.icon?.id);
                    default: return false;
                }
            })
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