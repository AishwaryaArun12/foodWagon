const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
  
passport.serializeUser((user , done) => {
    done(null , user);
})
passport.deserializeUser(function(user, done) {
    done(null, user);
});
  
passport.use(new GoogleStrategy({
    clientID:"102022415629-nmtt350gcl2lobust0m1vjbi7jsmo71c.apps.googleusercontent.com", // Your Credentials here.
    clientSecret:"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", // Your Credentials here.
    callbackURL:"https://www.foodwagon.online/auth/callback",
    passReqToCallback:true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
module.exports = passport;