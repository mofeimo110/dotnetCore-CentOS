/* 
   Simple JQuery Accordion menu.
   HTML structure to use:

   <ul id="menu">
     <li><a href="#">Sub menu heading</a>
     <ul>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       ...
       ...
     </ul>
     <li><a href="#">Sub menu heading</a>
     <ul>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       ...
       ...
     </ul>
     ...
     ...
   </ul>

Copyright 2007 by Marco van Hylckama Vlieg

web: http://www.i-marco.nl/weblog/
email: marco@i-marco.nl

Free for non-commercial use
*/

function initMenu() {
    $('div.accmenu ul ul').hide();
    var $current = $('div.accmenu li.current');
    if (!$current.parent().is("div.accmenu ul ul"))
        $current = $("ul", $current);
    else
        $current = $current.parent();
    if ($current.length == 0)
        $current = $('div.accmenu ul ul:first');
    $current.show();
    $('div.accmenu ul li a').click(
    function () {
        var checkElement = $(this).next();
        if ((checkElement.is('ul')) && (checkElement.is(':visible'))) {
            return;
        }
        if ((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
            $('div.accmenu ul ul:visible').slideUp('normal');
            checkElement.slideDown('normal');
            return;
        }
    }
    );
  }
$(document).ready(function() {initMenu();});