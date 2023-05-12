const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
//sessions methods below 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());