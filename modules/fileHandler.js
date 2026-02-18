// modules/fileHandler.js
const fs = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "../employees.json");

async function read() {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("fileHandler.read error:", err.message);
    return []; // safe fallback
  }
}

async function write(data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("fileHandler.write error:", err.message);
  }
}

module.exports = { read, write };
