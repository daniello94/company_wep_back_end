require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const galleryAdd = require("./api");

app.use(cors({ origin: '*' }));

app.options('*', cors());

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use("/", galleryAdd);

app.get("/", function (req, res) {
    res.status(200).json("Hello from the server!");
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Server for the project is ready and listening on port ${port}`);
});
