$(function(){
    //put description of the choiced role
    $('.choicer').on('click', 'label', function() {
        $('.roleHint').html(
            $(this).data('role-description')
        ).css('visibility', 'visible');
    });



    //go to action page, if social button clicked
    $('.socialButtons').on('click','button',function(){
        var link = $(this).data('loginurl');
        window.location.href = link;

        return false;
    });

});