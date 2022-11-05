const express = require("express");
const mongoose = require("mongoose");
const bscript = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

app.get("/", (req, res) => {
  //   res.send("Hello World!");
  res.status(200).json({ msg: "Bem vindo à nossa API" });
});

mongoose
  .connect(
    `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.yf075ra.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000, () => console.log(`Rodando na porta 3000!`));
    console.log("Conectado ao banco de dados");
  })
  .catch((error) => console.log(error));
