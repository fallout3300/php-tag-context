const vscode = require('vscode');

function activate(context) {
    // Инициализируем контекст
    vscode.commands.executeCommand('setContext', 'phpTagBreaker.isInsidePhpBlock', false);

    const checkContext = () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'php') {
            vscode.commands.executeCommand('setContext', 'phpTagBreaker.isInsidePhpBlock', false);
            return;
        }

        const pos = editor.selection.active;
        const offset = editor.document.offsetAt(pos);
        const before = editor.document.getText().substring(0, offset);

        // Считаем <?php и <?=
        const opens  = (before.match(/<\?(php|=)?/gi) || []).length;
        const closes = (before.match(/\?>/g) || []).length;

        vscode.commands.executeCommand('setContext', 'phpTagBreaker.isInsidePhpBlock', opens > closes);
    };

    // Обновляем при движении курсора и изменении текста
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(checkContext),
        vscode.workspace.onDidChangeTextDocument(() => {
            if (vscode.window.activeTextEditor) checkContext();
        })
    );

    // Первичная проверка при открытии файла
    checkContext();
}

function deactivate() {}
module.exports = { activate, deactivate };