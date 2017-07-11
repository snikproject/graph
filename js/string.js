/**Limit the input string to the maximum length. If it is longer, it will get cut and have two dots appended to exactly achieve the maximum length.  */
export function abbrv(s, maxLength=25)
{
  if(s.length<maxLength) {return s;}
  return s.substring(0,maxLength-2)+"..";
}
