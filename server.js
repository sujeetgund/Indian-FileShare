require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const mongoose = require("mongoose");
const File = require("./models/file");

const multer = require("multer");
const upload = multer({ dest: "uploads" });
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");
mongoose.connect(process.env.DATABASE_URL);

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/upload", upload.single("file"), async (req, res) => {
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname,
    };
    if (req.body.password !== null && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10);
    }

    const file = await File.create(fileData);
    res.render("index.ejs", {
        fileLink: `${req.headers.origin}/file/${file.id}`,
    });
    console.log(file);
});

app.route("/file/:id").get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
    const file = await File.findById(req.params.id);

    if (file.password !== null) {
        if (req.body.password == null) {
            res.render("password.ejs");
            return
        }

        // if checked password is correct
        if (!(await bcrypt.compare(req.body.password, file.password))) {
            res.render("password.ejs", { error: true });
            return
        }
    }
    file.downloadCount++;
    await file.save();
    console.log(file.downloadCount);

    res.download(file.path, file.originalName);
}

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
