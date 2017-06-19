function progress(p)
{
  if(p<100)
  {
    $('body').addClass('waiting');
    $("#progressbar").show();
  }
  $("#progressbar").progressbar({value: false});
  if(p>=100)
  {
    $('body').removeClass('waiting');
    $("#progressbar").fadeOut("slow");
  }
}

export {progress};
