function saveSettings() {
    launchTimes = document.getElementById('launch-times').value;

    localStorage.setItem('launchTimes', launchTimes);

    alert("Settings Saved!");

    console.log(launchTimes)
    console.log(localStorage.getItem('launchTimes'));

}

console.log("testing");
if (window.ipcRenderer) {
  console.log("adding handlers");
  window.ipcRenderer.on("update-progress", (message) => {
    console.log("Object recived", message);
    requestAnimationFrame(() => {
    document.getElementById("msgUpdater").innerText = message;
    })
  });
}
