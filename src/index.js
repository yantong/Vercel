const path = require('path');

const express = require("express");
const axios = require("axios");
const multer = require("multer");

const multerIns = multer();
const app = express();

const currentFilePath = __filename;
const currentDirPath = path.dirname(currentFilePath);
const parentDirPath = path.resolve(currentDirPath, '..');

const baseUrl = 'https://wallpaper.soutushenqi.com'

app.use(express.static(parentDirPath + '/public'));

function reqRedirect(url) {
    app.post(url, multerIns.none(), async (req, res) => {
        let url = req.url.replace('/wallpaper', baseUrl)
        let data = new FormData()

        for (const key in req.body) {
            data.append(key, req.body[key])
        }

        let result = await axios.post(url, data)


        res.send(result.data.data)
    });
}

reqRedirect("/wallpaper/v1/config/queryConfig")

app.listen(3000, () => console.log("Server ready on port 3000."));

exports.app = app;
