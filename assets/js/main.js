function saveSettings() {
    launchTimes = document.getElementById('launch-times').value;

    localStorage.setItem('launchTimes', launchTimes);

    alert("Settings Saved!");

    console.log(launchTimes)
    console.log(localStorage.getItem('launchTimes'));

}
