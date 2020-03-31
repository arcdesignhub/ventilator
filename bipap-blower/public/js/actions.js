// Add event listeners
window.addEventListener('DOMContentLoaded', (event) => {

    var sliders = document.getElementsByClassName("slider");
    var outputs = document.getElementsByClassName("output");

    // Set slider values
    for(let i = 0; i < sliders.length; i++) {
        outputs[i].innerHTML = sliders[i].value;
        sliders[i].oninput = function() {
            outputs[i].innerHTML = this.value;
            if(i == 0) {
                document.getElementById("max-pres").innerHTML = this.value;
            } else if (i == 1) {
                document.getElementById("min-pres").innerHTML = this.value;
            }
        }
    }

    // Set max and min pressure variables
    document.getElementById("max-pres").innerHTML = sliders[0].value;
    document.getElementById("min-pres").innerHTML = sliders[1].value;

    // Timer variables
    var manualTimer = {
        timerDisplay: document.querySelector('.timer'),
        startTime: 0,
        updatedTime: 0,
        difference: 0,
        tInterval: 0,
        savedTime: 0,
        paused: 0,
        running: 0
    };

    // Start timer if it is already on
    if(document.getElementById("on-off-switch").checked) {
        startTimer(manualTimer);
    }

    // Detect change for turning on/off
    document.getElementById("on-off-switch").addEventListener('change', function(event) {
        if(this.checked) {
            startTimer(manualTimer);
        } else {
            resetTimer(manualTimer);
        }
    });

});

/*----------------------------------------------------------*/
/* Manual Javascript timer */

// Start timer
function startTimer(timer){
    if(!timer.running){
        timer.startTime = new Date().getTime();
        timer.tInterval = setInterval(function() {
            getShowTime(timer)
        }, 1);
        timer.paused = 0;
        timer.running = 1;
    }
  }

// Reset timer
function resetTimer(timer){
    clearInterval(timer.tInterval);
    timer.savedTime = 0;
    timer.difference = 0;
    timer.paused = 0;
    timer.running = 0;
    timer.timerDisplay.innerHTML = "00:00:00:00";
}

// Get time
function getShowTime(timer){
    timer.updatedTime = new Date().getTime();
    if (timer.savedTime){
        timer.difference = (timer.updatedTime - timer.startTime) + timer.savedTime;
    } else {
        timer.difference =  timer.updatedTime - timer.startTime;
    }
    // var days = Math.floor(difference / (1000 * 60 * 60 * 24));
    var hours = Math.floor((timer.difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((timer.difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timer.difference % (1000 * 60)) / 1000);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    timer.timerDisplay.innerHTML = hours + ':' + minutes + ':' + seconds;
}