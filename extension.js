const vscode = require('vscode');

function activate(context) {
    let config = vscode.workspace.getConfiguration('phpTagBreaker');
    let enabledLangs = config.get('enabledLanguages', ['php']);

    let debounceTimer;
    const updateContext = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(checkContext, 50);
    };

    function isInsidePhpBlock(text) {
        let open = 0, close = 0;
        
        // Считаем открывающие теги
        const opens = text.match(/<\?(php|=)?/gi);
        if (opens) open = opens.length;
        
        // Считаем закрывающие теги
        const closes = text.match(/\?>/g);
        if (closes) close = closes.length;
        
        return open > close;
    }

    const checkContext = () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !enabledLangs.includes(editor.document.languageId)) {
            vscode.commands.executeCommand('setContext', 'phpTagBreaker.isInsidePhpBlock', false);
            return;
        }

        const pos = editor.selection.active;
        // Берём только текст до курсора для максимальной производительности
        const textBeforeCursor = editor.document.getText(
            new vscode.Range(new vscode.Position(0, 0), pos)
        );

        const isInside = isInsidePhpBlock(textBeforeCursor);
        vscode.commands.executeCommand('setContext', 'phpTagBreaker.isInsidePhpBlock', isInside);
    };

    const selSub = vscode.window.onDidChangeTextEditorSelection(updateContext);
    const txtSub = vscode.workspace.onDidChangeTextDocument((e) => {
        if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
            updateContext();
        }
    });
    const cfgSub = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('phpTagBreaker.enabledLanguages')) {
            config = vscode.workspace.getConfiguration('phpTagBreaker');
            enabledLangs = config.get('enabledLanguages', ['php']);
            updateContext();
        }
    });

    context.subscriptions.push(selSub, txtSub, cfgSub);
    checkContext();
}

function deactivate() {}
module.exports = { activate, deactivate };