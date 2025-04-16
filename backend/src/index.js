const path = require('path');

const express = require("express");
const app = express();

app.use(express.static('public'));

app.get("/api/qiuye", (req, res) => res.send("秋叶啊秋叶"));


app.get('/', (req, res) => {
    const currentFilePath = __filename;
    const currentDirPath = path.dirname(currentFilePath);
    const parentDirPath = path.resolve(currentDirPath, '..');

    res.sendFile(parentDirPath + '/public/index.html');
})


app.listen(3000, () => console.log("Server ready on port 3000."));

exports.app = app;
