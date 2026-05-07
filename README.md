# Short Description
This VS Code extension allows you to conveniently insert PHP tags, for example `<?php | ?>`, or if you are already inside, break them into `?> | <?php`, using the `alt+p` shortcut, or `alt+shift+p` for the version with line breaks.

# Examples
```php
// alt + p
<?php | ?>

// alt + shift + p
<?php
|
?>
```
```php
// Breaking a tag from inside PHP
<?php

// alt + p
?> | <?php

// alt + shift + p
?>
|
<?php

?>
```
### Wrapping also works when text is selected
```php
// alt + p
<?php echo Hello World;| ?>
```
```php
<?php

// alt + p
?> <h1>Hello World!</h1>| <?php

?>
```

## Why not just use regular snippets?
Basic insertion of `<?php | ?>` can be done with snippets, but you cannot determine whether you are inside or outside a PHP tag.
Therefore, the main purpose of this extension is to track the cursor position inside PHP tags. It creates a custom context `"phpTagBreaker.isInsidePhpBlock"`.

## Custom Snippets
Based on this `"phpTagBreaker.isInsidePhpBlock"`, you can configure any actions in `keybindings.json`.

### Example
```json
{
    "key": "alt+shift+p",
    "command": "editor.action.insertSnippet",
    "when": "editorTextFocus && phpTagBreaker.isInsidePhpBlock",
    "args": {
        "snippet": "?>\n${TM_SELECTED_TEXT}$0\n<?php"
    }
},
```
> This is an example from the extension itself. It checks if the cursor is inside a PHP tag, then wraps the selected text.

## Building
To build the extension, install Node.js (if you haven't already), download the repository, and run the command `npx @vscode/vsce package --no-dependencies` in the project root. This will create the `php-tag-context-0.2.0.vsix` file.

## Installing from a .vsix File
### Via Command Line
Simply run the command `code --install-extension php-tag-context-0.2.0.vsix` in the same terminal.

### Via VS Code
Then, in VS Code, open the Extensions panel, click the three dots in the top right corner, select `Install from VSIX...` at the bottom of the list, and choose your newly created `php-tag-context-0.2.0.vsix` file. Done!

---

> I don't know how to write extensions. I just vibecoded it with Qwen. It turned out better than I expected.