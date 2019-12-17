const db = require('./authModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const secret = require("../config/secrets");

router.post('/register', (req, res) => {
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 8);
  creds.password = hash;
  db.addUser(creds)
    .then(id => {
      res.status(201).json(id);
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'Unable to add user' });
    });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.findBy({ username })
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        let token = generateToken(user);
        res
          .status(200)
          .json({
            message: `Welcome ${username}`,
            token: token
          });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Error logging in' });
    });
});

const generateToken = user => {
  const payload = {
    userid: user.id,
    username: user.username
  };

  const options = {
    expiresIn: "1h"
  };

  const token = jwt.sign(payload, secret.jwtSecrets, options);

  return token;
};

module.exports = router;