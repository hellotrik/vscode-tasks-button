const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    let buttons = [];
    let fileWatchers = [];
    let refreshButton = null;

    function stripJsonComments(input) {
        // 兼容 tasks.json 的 JSONC 注释：支持 //... 和 /* ... */，并避免误删字符串中的注释符号。
        // 采用字符级状态机：在字符串外移除注释，在字符串内保持原样。
        let output = '';
        let inString = false;
        let quoteChar = '';
        let isEscaped = false;

        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            const next = i + 1 < input.length ? input[i + 1] : '';

            if (!inString) {
                // 单行注释：// ... \n
                if (ch === '/' && next === '/') {
                    i += 1; // 跳过第二个 '/'
                    while (i + 1 < input.length && input[i + 1] !== '\n') i += 1;
                    // 允许保留换行符（由循环自然处理到 '\n'）
                    continue;
                }

                // 多行注释：/* ... */
                if (ch === '/' && next === '*') {
                    i += 1; // 跳过 '*'
                    while (i + 1 < input.length && !(input[i] === '*' && input[i + 1] === '/')) i += 1;
                    i += 1; // 跳过 '/'
                    continue;
                }

                // 字符串开始
                if (ch === '"' || ch === '\'') {
                    inString = true;
                    quoteChar = ch;
                }

                output += ch;
                continue;
            }

            // inString
            output += ch;
            if (isEscaped) {
                isEscaped = false;
                continue;
            }
            if (ch === '\\') {
                isEscaped = true;
                continue;
            }
            if (ch === quoteChar) {
                inString = false;
                quoteChar = '';
            }
        }

        return output;
    }

    function readTasksFromFile(workspaceFolder) {
        const tasksJsonPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'tasks.json');
        try {
            if (fs.existsSync(tasksJsonPath)) {
                const content = fs.readFileSync(tasksJsonPath, 'utf8');
                const jsonText = stripJsonComments(content);
                const tasksConfig = JSON.parse(jsonText);
                return tasksConfig.tasks || [];
            }
        } catch (error) {
            console.error(`读取 tasks.json 失败: ${tasksJsonPath}`, error);
        }
        return [];
    }

    function getAllTasks() {
        const allTasks = [];
        const workspaceFolders = vscode.workspace.workspaceFolders || [];
        
        workspaceFolders.forEach(folder => {
            const tasks = readTasksFromFile(folder);
            allTasks.push(...tasks);
        });
        
        return allTasks;
    }

    function updateTaskButtons() {
        buttons.forEach(btn => btn.dispose());
        buttons = [];
        
        const tasks = getAllTasks();
        const tasksWithIcon = tasks.filter(task => task.label && task.icon);
        
        tasksWithIcon.forEach((task, index) => {
            const priority = Math.max(1000 - (index * 10), 100);
            const btn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, priority);
            btn.text = task.icon?.id ? `$(${task.icon.id}) ${task.label}` : task.label;
            btn.color = task.icon?.color || '';
            btn.tooltip = task.icon?.tooltip || task.label;
            btn.command = { command: 'workbench.action.tasks.runTask', arguments: [task.label] };
            btn.show();
            buttons.push(btn);
        });
        
        console.log(`Tasks Button: 已创建 ${buttons.length} 个按钮`, tasksWithIcon.map(t => t.label));
    }

    function createRefreshButton() {
        if (refreshButton) {
            refreshButton.dispose();
        }
        refreshButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2000);
        refreshButton.text = "$(refresh)";
        refreshButton.tooltip = "刷新任务按钮";
        refreshButton.command = 'tasks-button.refresh';
        refreshButton.show();
    }

    function setupFileWatchers() {
        fileWatchers.forEach(watcher => watcher.dispose());
        fileWatchers = [];
        
        const workspaceFolders = vscode.workspace.workspaceFolders || [];
        workspaceFolders.forEach(folder => {
            const tasksJsonPath = vscode.Uri.joinPath(folder.uri, '.vscode', 'tasks.json');
            const watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(folder, '.vscode/tasks.json')
            );
            
            watcher.onDidChange(() => updateTaskButtons());
            watcher.onDidCreate(() => updateTaskButtons());
            watcher.onDidDelete(() => updateTaskButtons());
            
            fileWatchers.push(watcher);
        });
    }

    updateTaskButtons();
    setupFileWatchers();
    createRefreshButton();

    const refreshCommand = vscode.commands.registerCommand('tasks-button.refresh', () => {
        updateTaskButtons();
        vscode.window.showInformationMessage('任务按钮已刷新');
    });

    context.subscriptions.push(
        refreshCommand,
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            updateTaskButtons();
            setupFileWatchers();
        })
    );

    fileWatchers.forEach(watcher => context.subscriptions.push(watcher));
    
    const buttonsDisposable = new vscode.Disposable(() => {
        buttons.forEach(btn => btn.dispose());
        if (refreshButton) {
            refreshButton.dispose();
        }
    });
    context.subscriptions.push(buttonsDisposable);
}

function deactivate() {}

module.exports = { activate, deactivate };