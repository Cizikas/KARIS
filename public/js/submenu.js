if($('#aboutCourt').click(function(){
    if(!$(this).hasClass("active")){
    $('#aboutCourtHTML').css("display", "block");
    $('#courtPicturesHTML').css("display", "none");
    $('#courtPictures').toggleClass("active");
    $(this).toggleClass("active");
}
}));

if($('#courtPictures').click(function(){
    if(!$(this).hasClass("active")){
    $('#aboutCourtHTML').css("display", "none");
    $('#courtPicturesHTML').css("display", "block");
    $('#aboutCourt').toggleClass("active");
    $(this).toggleClass("active");
}
}));