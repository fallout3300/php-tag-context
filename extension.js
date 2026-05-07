const vscode = require('vscode');

function activate(context) {
    let config = vscode.workspace.getConfiguration('phpTagBreaker');
    let enabledLangs = config.get('enabledLanguages', ['php']);

    // Debounce для производительности
    let debounceTimer;
    const updateContext = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(checkContext, 50);
    };

    const checkContext = () => {
        const editor = vscode.window.activeTextEditor;
        // Если файл не в списке разрешённых → выключаем контекст
        if (!editor || !enabledLangs.includes(editor.document.languageId)) {
            vscode.commands.executeCommand('setContext', 'phpTagBreaker.isInsidePhpBlock', false);
            return;
        }

        const pos = editor.selection.active;
        const offset = editor.document.offsetAt(pos);
        const before = editor.document.getText().substring(0, offset);

        // Считаем <?php и <?= (игнорируем <? для безопасности)
        const opens  = (before.match(/<\?(php|=)?/gi) || []).length;
        const closes = (before.match(/\?>/g) || []).length;

        vscode.commands.executeCommand('setContext', 'phpTagBreaker.isInsidePhpBlock', opens > closes);
    };

    // Подписки на события
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
    checkContext(); // первичная проверка
}

function deactivate() {}
module.exports = { activate, deactivate };