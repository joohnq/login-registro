const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

const User = require("./src/models/User");

const checkToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado" });
  }

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (error) {
    res.status(400).json({ msg: "Token Invalido" });
  }
};

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo à nossa API" });
});

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }

  res.status(200).json({ user });
});

app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = await req.body;

  if (!name) {
    return res.status(403).json({ msg: "O campo de NAME deve ser prenchidos" });
  }

  if (!email) {
    return res
      .status(403)
      .json({ msg: "O campo de EMAIL deve ser prenchidos" });
  }

  if (!password) {
    return res
      .status(403)
      .json({ msg: "O campo de SENHA deve ser prenchidos" });
  }

  if (password !== confirmpassword) {
    return res.status(403).json({ msg: "As senhas não conferem" });
  }

  //Validar se tem email já cadastrado no sistema
  const userExist = await User.findOne({ email: email });

  if (userExist) {
    return res
      .status(200)
      .json({ msg: "Por favor, cadastre um EMAIL diferente" });
  }

  //Criação de HASH da senha
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    return res.status(403).json({ msg: "Usuário criado com sucesso" });
  } catch (error) {
    return res.status(500).json({ msg: "Ocorreu um erro no servidor" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = await req.body;

  if (!email) {
    return res
      .status(422)
      .json({ msg: "O campo de EMAIL deve ser prenchidos" });
  }

  if (!password) {
    return res
      .status(422)
      .json({ msg: "O campo de SENHA deve ser prenchidos" });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "SENHA inválida" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "Autenticação feita com sucesso", token });
  } catch (error) {
    return res.status(500).json({ msg: "Ocorreu um erro no servidor" });
  }
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
