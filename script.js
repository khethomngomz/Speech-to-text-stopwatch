let startTime, updatedTime, difference, tInterval, running = false;
let recognition, alarmRecognition;
let alarmTimer, countdownInterval;
let alarmTimeRemaining;

// Start/Stop Button Logic
function startStop() {
    if (!running) {
        startStopwatch();
        startTranscription();
    } else {
        stopStopwatch();
        stopTranscription();
    }
}

// Stopwatch Functions
function startStopwatch() {
    running = true;
    startTime = new Date().getTime();
    tInterval = setInterval(showTime, 1000); // Update every second
    document.getElementById("startStopBtn").innerHTML = "Stop Stopwatch & Transcription";
}

function stopStopwatch() {
    running = false;
    clearInterval(tInterval);
    document.getElementById("startStopBtn").innerHTML = "Start Stopwatch & Transcription";
}

function showTime() {
    updatedTime = new Date().getTime();
    difference = updatedTime - startTime;

    let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Display stopwatch
    document.getElementById("stopwatch").innerHTML = 
        (hours < 10 ? "0" + hours : hours) + ":" +
        (minutes < 10 ? "0" + minutes : minutes) + ":" +
        (seconds < 10 ? "0" + seconds : seconds);
}

// Speech Recognition Functions
function startTranscription() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser doesn't support speech recognition.");
        return;
    }

    recognition = new webkitSpeechRecognition();  // Create the recognition object
    recognition.continuous = true;  // Keep recognizing in real-time
    recognition.interimResults = true;  // Display results as they're being said
    recognition.lang = 'en-US';  // Set language

    recognition.onresult = function(event) {
        let interim_transcript = '';
        let final_transcript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        // Display the transcribed text
        document.getElementById("transcriptionText").innerHTML = final_transcript + '<br>' + '<em>' + interim_transcript + '</em>';
    };

    recognition.start();
}

function stopTranscription() {
    if (recognition) {
        recognition.stop();
    }
}

// Alarm Setting Functions
function startAlarmSetting() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser doesn't support speech recognition.");
        return;
    }

    alarmRecognition = new webkitSpeechRecognition();
    alarmRecognition.interimResults = false;
    alarmRecognition.lang = 'en-US';

    alarmRecognition.onresult = function(event) {
        let alarmTime = event.results[0][0].transcript;
        document.getElementById("alarmText").innerHTML = "Setting alarm for: " + alarmTime;

        // Parse the spoken time and set the alarm
        let timeInMillis = parseSpokenTime(alarmTime);
        if (timeInMillis > 0) {
            setAlarm(timeInMillis);
        } else {
            document.getElementById("alarmText").innerHTML = "Invalid time format.";
        }
    };

    alarmRecognition.start();
}

function parseSpokenTime(spokenTime) {
    let minutes = 0, seconds = 0;

    // Use regex to capture spoken time like "2 minutes 30 seconds" or "1 minute and 20 seconds"
    let minuteMatch = spokenTime.match(/(\d+)\s*(minute|minutes)/);
    let secondMatch = spokenTime.match(/(\d+)\s*(second|seconds)/);

    // If minutes were spoken, capture them
    if (minuteMatch) {
        minutes = parseInt(minuteMatch[1], 10);
    }

    // If seconds were spoken, capture them
    if (secondMatch) {
        seconds = parseInt(secondMatch[1], 10);
    }

    // If both minutes and seconds are zero, it means no valid time was captured
    if (minutes === 0 && seconds === 0) {
        return -1;  // Invalid time
    }

    // Convert total time into milliseconds
    return (minutes * 60 + seconds) * 1000;
}

function setAlarm(timeInMillis) {
    clearTimeout(alarmTimer);  // Clear any existing alarm
    clearInterval(countdownInterval);  // Clear any previous countdowns

    alarmTimeRemaining = timeInMillis;
    countdownInterval = setInterval(updateCountdown, 1000);  // Update countdown every second

    alarmTimer = setTimeout(() => {
        triggerAlarm();
    }, timeInMillis);

    document.getElementById("alarmText").innerHTML += `<br>Alarm set for ${timeInMillis / 1000} seconds.`;
}

// Countdown Timer for Alarm
function updateCountdown() {
    alarmTimeRemaining -= 1000;

    let minutes = Math.floor((alarmTimeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((alarmTimeRemaining % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = 
        "Countdown: " + (minutes < 10 ? "0" + minutes : minutes) + ":" +
        (seconds < 10 ? "0" + seconds : seconds);

    // Check if time is up
    if (alarmTimeRemaining <= 0) {
        clearInterval(timerInterval); // Clear the interval when the countdown reaches 0
        document.getElementById("countdown").innerHTML = "Time's up!";
    }
}

    // Stop countdown when the time
