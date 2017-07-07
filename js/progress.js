function progress(p)
{
  if(p<100)
  {
    document.body.classList.add('waiting');
    //document.getElementById("progressbar").show();
  }
  //document.getElementById("progressbar").progressbar({value: false});
  if(p>=100)
  {
    document.body.classList.remove('waiting');
    //document.getElementById("progressbar").fadeOut("slow");
  }
}

export {progress};
