$(document).ready(function() {
    $('.submit').click(function () {
        var title = $(this).parent().parent().find('#title').val();
        var url = $(this).parent().parent().find('#url').val();
        var category = $(this).parent().parent().find('#category').val();
        var content = $(this).parent().parent().find('#content').val();
        var id = $(this).parent().parent().find('#id').val();
        var converter = new Markdown.Converter();
        content = converter.makeHtml(content);
        $.post('/article/edit', {
            title: title,
            url: url,
            category: category,
            content: content,
            id: id
        }, function (msg) {
            window.location = '/article/' + url;
        });
        return false;
    });
});