const express = require("express");
const app = express();

app.use(express.static('public'));

app.get("/api/qiuye", (req, res) => res.send("秋叶啊秋叶"));


app.listen(3000, () => console.log("Server ready on port 3000."));

exports.app = app;
