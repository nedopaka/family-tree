const userApi = require('express').Router({ mergeParams: true });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv/config');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

const secretOrKey = process.env.JWT_SECRET_OR_KEY || 'secret2';

module.exports = userApi;

userApi.get('/logout', (req, res) => {
  res.clearCookie('login').send(200);

  const cookie = req.header.cookie.split(';');
  let cookieVal = null;
  cookie.forEach((element) => {
    if (element.split('=')[0].trim() === 'login') {
      cookieVal = decodeURIComponent(element.split('=')[1].trim());
    }
  });

  req.context.models.UserSession.destroy({
    where: {
      cookieVal,
    },
  })
    .then(() => {
      console.log('cookie cleared');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

userApi.post('/login', (req, res) => {
  let message = '';

  if (!req.body.user) {
    message = 'Request\'s body is empty';
    res.status(500).json({ res: 0, action: 'login', message });
    return;
  }

  const { errors, isValid } = validateLoginInput(req.body.user);

  if (!isValid) {
    res.status(400).json(errors);
    return;
  }

  const { email, password } = req.body.user;

  req.context.models.User.findOne({
    email,
  })
    .then((user) => {
      if (!user) {
        message = 'There is no user with that email';
        res.status(404).json({
          res: 0, user: false, email: message,
        });
        return;
      }
      bcrypt.compare(password, user.password)
        .then((isMatch) => {
          if (!isMatch) {
            message = 'Incorrect password';
            res.status(400).json({
              res: 0, user: false, password: message,
            });
            return;
          }

          const payload = {
            id: user.id,
            name: user.name,
          };

          jwt.sign(
            payload,
            secretOrKey,
            {
              expiresIn: 31556926, // 1 year in seconds
            },
            (err, token) => {
              message = `Welcome back, ${user.name}!`;
              res.json({
                res: 1,
                user: true,
                token: `Bearer ${token}`,
                message,
              });
            },
          );
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

userApi.post('/register', (req, res) => {
  let message = '';

  if (!req.body.user) {
    message = 'Request\'s body is empty';
    res.status(500).json({ res: 0, action: 'signin', message });
    return;
  }

  const { errors, isValid } = validateRegisterInput(req.body.user);
  if (!isValid) {
    res.status(400).json(errors);
    return;
  }

  const { email, name, password } = req.body.user;

  req.context.models.User.findOne({
    email,
  })
    .then((data) => {
      if (data) {
        message = 'User with provided email already exists';
        res.status(400).json({
          res: 0, user: false, message, email: message,
        });
        return;
      }
      bcrypt.hash(password, 10)
        .then((hash) => {
          req.context.models.User.create({
            name,
            email,
            password: hash,
          })
            .then((user) => {
              console.log(`${new Date()} - user added: ${JSON.stringify(user)}`);
              res.json({ res: 1, action: 'signin', user });
            });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});
