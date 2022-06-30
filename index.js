const mysql = require("mysql");
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "shortlink",
});

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const randomid = require("randomid");
const fs = require("fs");

app.set("view engine", "ejs");
app.set("views", __dirname + "/Frontend");
// app.use(express.static(__dirname + "./Frontend"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs", { req: req });
});

app.post("/", (req, res) => {
    let rawdata = fs.readFileSync("blacklist.json");
    let blacklist = JSON.parse(rawdata);

    const getByValue = (value) => {
        for (let key of Object.keys(blacklist))
            if (blacklist[key] === value) return key;
    };

    req.body.link = req.body.link.replace(/\s/g, "");

    if (getByValue(req.body.link)) return res.redirect("/");
    if (req.body.link.includes("https://") == false)
        return res.redirect("/?code=2");
    if (req.body.link.includes("http://") == false)
        return res.redirect("/?code=2");

    var romid = "nt-" + randomid(10);
    db.query(
        `INSERT INTO links (link, id) VALUES ('${req.body.link}', '${romid}')`,
        function (err, result) {
            if (err) throw err;
            res.redirect(`/?code=1&id=${romid}`);
        }
    );
});

app.get("/link/:id", (req, res) => {
    db.query(
        `SELECT * FROM links WHERE id = '${req.params.id}'`,
        function (err, result) {
            if (err) throw err;
            var string = JSON.stringify(result);
            const result2 = JSON.parse(string);
            link = result2[0].link;
            if (
                link.includes("https://") == false ||
                link.includes("http://") == false
            ) {
                res.redirect(303, "/");
            } else {
                res.redirect(result2[0].link);
            }
        }
    );
});

app.listen(81, () => {
    console.log("Port Opened.");
});

app.get("/test", (req, res) => {});
