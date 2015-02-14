/*
 * (C) 2015 Seth Lakowske
 */

function handleDragStart(e) {
    this.style.opacity = '0.4';
}

var samples = document.querySelectorAll('.sample');

for (var i = 0 ; i < samples.length ; i++) {
    var el = samples[i];
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', function(e) {
        console.dir(e);
        //e.srcElement.classList.add("dragging");
        e.dataTransfer.setData('text/plain', 'this may be dragged');
    });
}

var categories = document.querySelectorAll('.category');
for (var i = 0 ; i < categories.length ; i++) {
    var el = categories[i];
    el.addEventListener('dragover', function(e) {
        console.dir(e);
        if (e.toElement) e.toElement.classList.add("dropover");
        if (e.target) e.target.classList.add("dropover");
    })

    el.addEventListener('dragleave', function(e) {
        if (e.toElement) e.toElement.classList.remove("dropover");
        if (e.target) e.target.classList.remove("dropover");
    })

}
