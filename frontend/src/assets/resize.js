function resize()
{
    var container = document.getElementById('container');
    var header = document.getElementById('header');
    var footer = document.getElementById('footer');

    var contentHeight = container.clientHeight - header.clientHeight - footer.clientHeight - 2;

    var resizeable = document.getElementsByClassName('auto-resize');
    for (i=0; i<resizeable.length; i++) {
        resizeable[i].style.height = contentHeight +'px';
    }
}
