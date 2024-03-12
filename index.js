require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const galleryAdd = require("./api");

const config = {
    origin: "http://" + process.env.DB_HOST
};
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use("/gallery", galleryAdd)
app.get("/", cors(config), function (req, res) {
    res.status(219).json("Hello");
});

app.listen(process.env.PORT, function () {
    console.log(`Server for the project on port ${process.env.PORT} is ready`);
})