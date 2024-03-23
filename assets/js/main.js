function saveSettings(){
    var launchTimes = document.getElementById('launch-times').value;
    localStorage.setItem('launchTimes', launchTimes);
    alert(launchTimes);
}