const path = require('path');

const express = require("express");
const axios = require("axios");
const multer = require("multer");
const bodyParser = require('body-parser')

const tempData = require('./tempData')

const multerIns = multer();
const app = express();

const currentFilePath = __filename;
const currentDirPath = path.dirname(currentFilePath);
const parentDirPath = path.resolve(currentDirPath, '..');

const baseUrl = 'https://wallpaper.soutushenqi.com'

app.use(bodyParser.json({limit: '1mb'}))
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static(parentDirPath + '/public'));


async function getAlltypes() {
    let data = new FormData()

    data.append('config_key', "stsq_web_image_feature_config")

    let result = await axios.post(baseUrl + '/v1/config/queryConfig', data, {})

    tempData.allTypes = result.data.data
}


function reqRedirect(url) {
    app.post(url, async (req, res) => {
        if (req.body.config_key === 'stsq_web_image_feature_config' && tempData.allTypes.length) {
            return res.send(tempData.allTypes)
        }

        if (req.body.config_key === 'stsq_web_computer_wallpaper_category_infos_01' && tempData.allPcTypes.length) {
            return res.send(tempData.allPcTypes)
        }


        let url = req.url.replace('/wallpaper', baseUrl)
        let data = new FormData()

        for (const key in req.body) {
            data.append(key, req.body[key])
        }

        let result = await axios.post(url, data, {})

        res.send(result.data.data)
    });
}

function reqRedirectGet(url) {
    app.get(url, async (req, res) => {
        let url = req.url.replace('/wallpaper', baseUrl)

        let result = await axios.get(url)

        res.send(result.data.data)
    });
}

getAlltypes()

reqRedirect("/wallpaper/v1/config/queryConfig")
reqRedirect("/wallpaper/v2/home/imageList")
reqRedirect("/wallpaper/v2/search/commonList")
reqRedirect("/wallpaper/v2/channel/queryByCategory")
reqRedirect("/wallpaper/v1/search/pcScreen")
reqRedirect("/wallpaper/v1/search/inSizeType")

reqRedirectGet("/wallpaper/api/v1/association/list")


app.listen(3000, () => console.log("Server ready on port 3000."));

exports.app = app;
