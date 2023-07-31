document.addEventListener('DOMContentLoaded', function() {
    var startButton = document.getElementById('startButton');
    startButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {msg: 'start'}, function(response) {
          console.log("started!")
        });
      });
    });

    var stopButton = document.getElementById('stopButton');
    stopButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {msg: 'stop'}, function(response) {
          console.log("stopped!")
        });
      });
    });

  });