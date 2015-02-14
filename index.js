/*
 * (C) 2015 Seth Lakowske
 */

function handleDragStart(e) {
    this.style.opacity = '0.4';
}

var examples = document.querySelectorAll('.sample');
examples.foreach(function(example) {
    example.addEventListener('dragstart', handleDragStart, false);
})
