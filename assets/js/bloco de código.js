//Bloco de codigo
hljs.initHighlightingOnLoad();
hljs.initLineNumbersOnLoad();

$(document).ready(function() {
    $('code.hljs').each(function(i, block) {
        hljs.lineNumbersBlock(block);
    });
});
