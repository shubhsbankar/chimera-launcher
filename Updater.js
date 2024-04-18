const fs = require('fs');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { net } = require('electron');

class Updater {
  constructor({ versionUrl, patchUrl, localVersionFile, splash, createMainWindow }) {
    this.versionUrl = versionUrl;
    this.patchUrl = patchUrl;
    this.localVersionFile = localVersionFile;
    this.splash = splash;
    this.createMainWindow = createMainWindow;
  }

  async checkAndUpdate() {
    try {
      const remoteVersionResponse = await axios.get(this.versionUrl);
      const remoteVersion = String(remoteVersionResponse.data).trim();
      const localVersion = fs.existsSync(this.localVersionFile)
        ? fs.readFileSync(this.localVersionFile, "utf8").trim()
        : "0.0";

      console.log(`Local version: ${localVersion}, Remote version: ${remoteVersion}`);

      if (localVersion !== remoteVersion) {
        console.log("Update available. Downloading update...");
        this.downloadAndExtractUpdate(remoteVersion);
      } else {
        console.log("Your application is up to date.");
        this.createMainWindow();
      }
    } catch (error) {
      console.error("Failed to update:", error);
    }
  }

  extractFile(remoteVersion) {
    console.log("Starting to extract the file...");
    const zip = new AdmZip("patch.zip");
    zip.extractAllTo("./", true);
    console.log("File extracted successfully to 'extracted_files' folder.");
    
    fs.unlink("patch.zip", (err) => {
      if (err) {
        console.error("Failed to delete the file:", err);
      } else {
        console.log("patch.zip file deleted successfully.");
        this.updateLocalVersionFile(remoteVersion);
      }
    });
  }

  downloadAndExtractUpdate(remoteVersion) {
    console.log("requested for the response");
    let request = net.request(this.patchUrl);
    let downloadedBytes = 0;
    let startTime = Date.now();

    request.on("response", (response) => {
      const totalBytes = Number(response.headers['content-length']) || 0;

      response.on("data", (chunk) => {
        downloadedBytes += chunk.length;
        const now = Date.now();
        const duration = (now - startTime) / 1000; // Convert to seconds
        const speedKbPerSec = (downloadedBytes / 1024) / duration; // Convert bytes per second to kilobytes per second
        const percent = ((downloadedBytes / totalBytes) * 100).toFixed(2);
        this.splash.webContents.send('update-progress', `Update downloading... ${speedKbPerSec.toFixed(2)} KB/s, ${percent}%`);

        console.log(`Update downloading... ${speedKbPerSec.toFixed(2)} KB/s, ${percent}%`);
        fs.appendFileSync("patch.zip", chunk);
      });

      response.on("end", () => {
        console.log("File downloaded successfully.");
        this.extractFile(remoteVersion);
        console.log("update completed");
        this.createMainWindow();
      });
    });

    request.end();
  }


  updateLocalVersionFile(remoteVersion) {
    fs.writeFile(this.localVersionFile, remoteVersion, (err) => {
      if (err) {
        console.error("Failed to update local version file:", err);
      } else {
        console.log(`Local version file updated to version ${remoteVersion}.`);
      }
    });
  }
}

module.exports = Updater;
