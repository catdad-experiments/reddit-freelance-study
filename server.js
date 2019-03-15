const fs = require('fs-extra');
const lodash = require('lodash');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const RedditStrategy = require('passport-reddit').Strategy;
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT;

const getPosts = require('./lib/get-posts.js');
const breakoutPosts = require('./lib/breakout-posts.js');

const { APP_ID, APP_SECRET } = process.env;

app.use(session({
  secret: 'pineapples',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use('*', (req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

passport.use(new RedditStrategy({
  clientID: APP_ID,
  clientSecret: APP_SECRET,
  callbackURL: `http://127.0.0.1:${port}/auth/reddit/callback`
}, (accessToken, refreshToken, profile, done) => {
  console.log('----------------------------------------------');
  console.log('accessToken:', accessToken);
  console.log('refreshToken:', refreshToken);
  console.log('profile name:', profile.name);
  console.log('----------------------------------------------');


  done(null, {
    accessToken,
    refreshToken,
    id: profile.id,
    name: profile.name
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/', async (req, res) => {
  const accessToken = req.cookies.accessToken || '';
  const index = await fs.readFile('./index.html');
  const response = lodash.template(index)({ accessToken });

  res.end(response);
});

app.post('/api/get-posts/:subreddit', (req, res) => {
  const accessToken = req.cookies.accessToken || '';
  const { subreddit } = req.params;

  getPosts({ accessToken, subreddit }).then(() => {
    res.end('all done');
  }).catch(err => {
    res.writeHead(500);
    res.end(err.toString());
  });
});
app.post('/api/breakout-posts/:subreddit', (req, res) => {
  const accessToken = req.cookies.accessToken || '';
  const { subreddit } = req.params;

  breakoutPosts({ accessToken, subreddit }).then(() => {
    res.end('all done');
  }).catch(err => {
    res.writeHead(500);
    res.end(err.toString());
  });
});

app.get('/auth/reddit', (req, res, next) => {
  // reddit reject auth requests without state
  req.session.state = Math.random().toString(36).slice(2);
  passport.authenticate('reddit', {
    state: req.session.state,
    scope: 'identity read'
  })(req, res, next);
});
app.get('/auth/reddit/callback', passport.authenticate('reddit', { failureRedirect: '/login' }), (req, res) => {
  console.log('callback request', req.user);

  res.cookie('accessToken', req.user.accessToken, { maxAge: 900000, httpOnly: true });
  res.cookie('name', req.user.name, { maxAge: 900000, httpOnly: true });

  res.redirect('/');
});

app.use('*', (req, res) => {
  console.log(req.method, req.originalUrl, 'NOT FOUND');

  res.end('response');
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
