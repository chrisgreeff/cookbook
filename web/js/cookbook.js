var cookbookNode = $('#cookbook');

cookbookNode.wysiwyg();

cookbookNode.on('keydown', function (event) {
    if (event.keyCode === 13) {
        if (event.shiftKey) {
            event.preventDefault();
            document.execCommand('insertUnorderedList');
            document.execCommand('insertText', false, '\n\n');
        } else if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            document.execCommand('insertUnorderedList');
            document.execCommand('insertHTML', false, '<input type="checkbox"/>');
            document.execCommand('insertText', false, '\n\n');
        }
    }
});
