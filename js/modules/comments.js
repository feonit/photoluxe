(function(){
    var $form = $('form#new_comment'),
        $boxComments = $('.b-comments');


    function getTime () {
        var date = new Date,
            YYYY = date.getFullYear().toString(),
            MM = (date.getMonth()+1).toString(), // getMonth() is zero-based
            DD  = date.getDate().toString(),
            hh = date.getHours(),
            mm = date.getMinutes(),
            ss = date.getSeconds();

        return YYYY + '-' + (MM[1]?MM:'0'+MM) + '-' + (DD[1]?DD:"0"+DD[0]) + ' ' + hh + ':' + (mm[1]?mm:'0'+mm) + ':' + ss;
    }

    function submitFn(event) {
        var url = $form.attr('action'),
            comment = $form.serialize();
        $.post(url, comment, function (results) {
        });
        appendCommit();
        event.preventDefault();
    }

    function appendCommit() {
        var data = {},
            html;

        data['author'] = $form.find('.author-comment').attr('value');
        data['msg'] = $form.find('.text-comment').attr('value');
        data['date'] = getTime();
        html = _.template(strCommit, data);
        $boxComments.append(html);
    }

    var strCommit =
        "<div class='comment'>" +
            "<div class='b-author-name'>" +
                "<a class='author-name' href='#'><%- author %></a>" +
            "</div>" +
            "<div class='b-msg-text'>" +
                "<span class='msg-text'><%- msg %></span>" +
            "</div>" +
            "<div class='b-date'>" +
                "<span class='date'><%- date %></span>" +
            "</div>" +
        "</div>";

    $form.on('submit', submitFn);

}());