const bcrpytjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const express = require("express");
const router = express.Router();

const Users = require("../users/users-model");
const { jwtSecrets } = require("../../config/secrets");
const { isValid } = require("../users/users-service");

router.post("/register", (req, res) => {
  const credentials = req.body;

  if (isValid(credentials)) {
    const rounds = process.env.BCRYPT_ROUNDS || 8;

    //*hash of password occurs here
    const hash = bcrpytjs.hashSync(credentials.password, rounds);

    credentials.password = hash;

    //*adding to database
    Users.add(credentials)
      .then((user) => {
        res.status(201).json({ data: user });
      })
      .catch((err) => {
        res.status(500).json({ message: error.message });
      });
  } else {
    res.status(400).json({
      message:
        "please provide username and password and the password shoud be alphanumeric",
    });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (isValid(req.body)) {
    Users.findBy({ username: username })
      .then(([user]) => {
        if (user && bcrpytjs.compareSync(password, user.password)) {
          const token = makeToken(user);
          res
            .status(200)
            .json({ message: "Welcome to the API " + user.username, token });
        } else {
          res.status(401).json({ message: "Invalid credentials" });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } else {
    res.status(400).json({
      message:
        "please provide username and password and the password shoud be alphanumeric",
    });
  }
});

function makeToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role,
  };
  const options = {
    expiresIn: "25m",
  };
  return jwt.sign(payload, jwtSecrets, options);
}

router.get("/logout", (req, res) => {
  console.log("logout");
});

module.exports = router;
