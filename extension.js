const vscode = require('vscode');

function activate(context) {
    let config = vscode.workspace.getConfiguration('phpTagBreaker');
    let enabledLangs = config.get('enabledLanguages', ['php']);

    let debounceTimer;
    const updateContext = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(checkContext, 50);
    };

    /**
     * Лёгкий парсер: считает <?php, <?=, <? и ?>
     * Игнорирует теги внутри строк, комментариев и экранированных символов
     */
    function isInsidePhpBlock(text) {
        let open = 0, close = 0;
        let i = 0;
        const len = text.length;
        let state = 0; // 0: normal, 1: line comment, 2: block comment, 3: double quote, 4: single quote, 5: backtick

        while (i < len) {
            const c = text[i];

            if (state === 0) {
                // Комментарии
                if (text.startsWith('//', i)) { state = 1; i += 2; continue; }
                if (c === '#' && !text.startsWith('#!', i)) { state = 1; i++; continue; }
                if (text.startsWith('/*', i)) { state = 2; i += 2; continue; }

                // Строки
                if (c === '"') { state = 3; i++; continue; }
                if (c === "'") { state = 4; i++; continue; }
                if (c === '`') { state = 5; i++; continue; }

                // PHP теги
                if (text.startsWith('<?php', i)) { open++; i += 5; continue; }
                if (text.startsWith('<?=', i)) { open++; i += 3; continue; }
                if (text.startsWith('<?', i)) { open++; i += 2; continue; } // <? (short tag)
                if (text.startsWith('?>', i)) { close++; i += 2; continue; }

            } else if (state === 1) { // Line comment
                if (c === '\n' || c === '\r') state = 0;
            } else if (state === 2) { // Block comment
                if (text.startsWith('*/', i)) { state = 0; i += 2; continue; }
            } else if (state >= 3 && state <= 5) { // Quotes / Backticks
                if (c === '\\' && i + 1 < len) { i++; continue; } // Пропускаем экранированный символ
                if ((state === 3 && c === '"') || (state === 4 && c === "'") || (state === 5 && c === '`')) {
                    state = 0;
                }
            }
            i++;
        }
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