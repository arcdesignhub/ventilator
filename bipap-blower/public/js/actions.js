window.addEventListener('DOMContentLoaded', (event) => {
    var sliders = document.getElementsByClassName("slider");
    var outputs = document.getElementsByClassName("output");

    for(let i = 0; i < sliders.length; i++) {
        outputs[i].innerHTML = sliders[i].value;
        sliders[i].oninput = function() {
            outputs[i].innerHTML = this.value;
        }
    }
});