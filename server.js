/*
 * LICENSE
 * McDebug
 * -------------
 * Copyright (C) 2021 - 2022 BlueTree242
 * -------------
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public
 *  License along with this program.  If not, see
 *  <http://www.gnu.org/licenses/gpl-3.0.html>.
 *  END
 *
 */

var express = require('express');
const db = require('quick.db');
const fs = require("fs")
const ejs = require("ejs")
const app = express()
const multer = require('multer');
require('dotenv').config({
    path: "./.env"
})
const port = process.env["port"];
app.use("/img", express.static("views/img"));
app.use("/css", express.static("views/css"));
app.use("/js", express.static("views/js"));
app.use(express.static("public"))
app.set("view engine", "ejs");


class RandomKeyGenerator {

    // Initialize a new generator with the given keySpace
    constructor(options = {}) {
        this.keyspace = options.keyspace || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }

    // Generate a key of the given length
    createKey(keyLength) {
        var text = '';

        for (var i = 0; i < keyLength; i++) {
            const index = Math.floor(Math.random() * this.keyspace.length);
            text += this.keyspace.charAt(index);
        }

        return text;
    }

};

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function generateDebugId() {
        const id = new RandomKeyGenerator().createKey(5)
        return id;

}


async function createDebug(data) {
    const id = generateDebugId()
    db.push("debugs", {id:id, CreationTime:Date.now()})
    fs.writeFileSync("./debugs/" + id + ".txt", data, 'UTF8')
    return id;
}
async function getDebugData(id) {
    return new String(fs.readFileSync("./debugs/" + id + ".txt"))
}
app.post("/api/v1/createDebug",multer().none(), async function (req, res) {
    var body = req.body
    res.setHeader('content-type', 'application/json');
    if (body === undefined || body.data === undefined) {
        const json = {}
        json.error = "No data param in body"
        res.status(400)
        res.send(JSON.stringify(json))
        return;
    }
    const id = await createDebug(body.data)
    const json = {}
    json.id = id;
    res.send(JSON.stringify(json))
})
app.get("/api/v1/getDebug/:id",multer().none(), async function (req, res) {
    var body = req.body
    res.setHeader('content-type', 'application/json');
    const json = {}
    try {
        const data = await getDebugData(req.params.id)

        json.data = data;

    } catch (err) {
            res.status(404)
            json.error = "debug not found";
    }

    res.send(JSON.stringify(json))

})

app.use(function(req, res, next) {
    if (req.path.startsWith("/api")){
        const err = new Error("Endpoint not found");
        err.status = 404
        next(err);
        return
    }
    res.render('index')
});

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    const json = {}
    json.message = err.message;
    json.error = res.locals.error;
    res.send(JSON.stringify(json));
});
app.listen(port, () => console.log(`Express app listening on port ${port}!`));

