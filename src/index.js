const path = require('path');

const express = require("express");
const axios = require("axios");
const multer = require("multer");
const bodyParser = require('body-parser')

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


let allTypes = [{
    "id": 1,
    "featureName": "手机壁纸",
    "coverUrl": "https://web-assets.soutushenqi.com/upload/1730358016151.jpeg",
    "categoryConfigKey": "stsq_web_phone_wallpaper_category_infos",
    "webImageMinWidth": 170,
    "pcImageMinWidth": 220
}, {
    "id": 2,
    "featureName": "电脑壁纸",
    "coverUrl": "https://hbimg.huabanimg.com/53b34b8f3e6692626883e4e3ae8fb08b8745e1b524211f-BZojVa_fw658/format/webp",
    "categoryConfigKey": "stsq_web_computer_wallpaper_category_infos_01"
}, {
    "id": 10,
    "featureName": "动态壁纸",
    "coverUrl": "https://image.soutushenqi.com/upload_6e463c0346c7c2a373f1a656edd772bd.png",
    "requestParams": {},
    "isVipAtlas": true,
    "isHeatSort": true,
    "webImageMinWidth": 270
}, {
    "id": 3,
    "featureName": "美图专题",
    "coverUrl": "https://web-assets.soutushenqi.com/upload/1730357683330.jpeg",
    "categoryConfigKey": "stsq_web_beautiful_category_infos"
}, {
    "id": 4,
    "featureName": "配图专题",
    "coverUrl": "http://p5.qhimg.com/t012fea29b87ebb7965.png?w=1920&h=1200",
    "requestParams": {"sizeType": 25},
    "dataType": 101,
    "isVipAtlas": false,
    "isHeatSort": true
}, {
    "id": 5,
    "featureName": "海外专题",
    "coverUrl": "https://web-assets.soutushenqi.com/upload/1730358079496.jpeg",
    "categoryConfigKey": "stsq_web_site_wallpaper_category_infos"
}, {
    "id": 6,
    "featureName": "头像专题",
    "coverUrl": "https://hbimg.huabanimg.com/16316741cf3658d37503fa22ed742038df7446e9685c9-NqVJ4u_fw658/format/webp",
    "categoryConfigKey": "stsq_web_head_portrait_category_infos",
    "webImageMinWidth": 144,
    "pcImageMinWidth": 224
}, {
    "id": 7,
    "featureName": "表情专题",
    "coverUrl": "https://hbimg.huabanimg.com/07c29b97d5e7e65a513d3e6230152c47eb1d1bf374507-DQv2fF_fw658/format/webp",
    "categoryConfigKey": "stsq_web_expression_category_infos",
    "webImageMinWidth": 144,
    "pcImageMinWidth": 224
}, {
    "id": 8,
    "featureName": "设计专题",
    "coverUrl": "https://hbimg.huabanimg.com/c15f4f44e4a73f59c3ad555c5fc63500684bc550cb3e-9oWgMX_fw658/format/webp",
    "categoryConfigKey": "stsq_web_design_category_infos"
}, {
    "id": 9,
    "featureName": "搞笑专题",
    "coverUrl": "https://hbimg.huabanimg.com/1d7a13637ea38d6338141d992edf85e4a3e776d64f0ff-bOrB25_fw658/format/webp",
    "categoryConfigKey": "stsq_web_funny_category_infos"
}]


async function getAlltypes() {
    let data = new FormData()

    data.append('config_key', "stsq_web_image_feature_config")

    let result = await axios.post(baseUrl + '/v1/config/queryConfig', data, {})

    allTypes = result.data.data
}


function reqRedirect(url) {
    app.post(url, async (req, res) => {
        if (req.body.config_key === 'stsq_web_image_feature_config' && allTypes.length) {
            res.send(allTypes)
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
