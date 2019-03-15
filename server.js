const fs = require('fs');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const RedditStrategy = require('passport-reddit').Strategy;
const app = express();
const port = process.env.PORT;

const { subreddit } = require('yargs-parser')(process.argv.slice(2));

const getPosts = require('./lib/get-posts.js');

const { APP_ID, APP_SECRET } = process.env;

app.use(session({
  secret: 'pineapples',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('*', (req, res, next) => {
  console.log(req.method, req.originalUrl, req.headers, req.session);
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

  getPosts(accessToken, subreddit);

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

app.get('/', (req, res) => {
  fs.createReadStream('./index.html').pipe(res);
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
  res.redirect('/');
});

app.use('*', (req, res) => {
  console.log(req.method, req.originalUrl, 'NOT FOUND');

  res.end('response');
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
