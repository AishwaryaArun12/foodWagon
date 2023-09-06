const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
 const MongoStore = require('connect-mongo');
const passport = require('./passport');
//const cookieSession = require('cookie-session');
const nodemailer = require('nodemailer');
//require('./passport');


const mainRoute = require('./routes/main');
const userRoutes = require('./routes/user')
const sellerRoutes = require('./routes/seller');
const deliveryRoutes = require('./routes/delivery_staff');
const adminRoutes = require('./routes/admin');
app.use(express.static('public'));
mongoose.connect(process.env.foodwagon).then(()=>{console.log('database connected..');})
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended : true}));

app.use(session({
  secret: 'SECRET KEY',
  resave: false,
  saveUninitialized: true,
   store: MongoStore.create({
       mongoUrl: process.env.foodwagon,
   })
}));
 
  app.use(cookieParser());
 
  const noCacheMiddleware = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    next();
  };
  
  app.use(noCacheMiddleware);
 // app.use(cookieSession({
//     name: 'google-auth-session',
//     keys: ['key1', 'key2']
// }));
app.use(passport.initialize());
app.use(passport.session());

const transporter = nodemailer.createTransport({
  service : 'Gmail',
  auth : {
    user : 'aishwarya4arun@gmail.com',
    pass : 'lthf583a*1234'
  }
})

app.use('/users', userRoutes);
app.use('/sellers', sellerRoutes);
app.use('/delivery_staffs', deliveryRoutes);
app.use('/admin', adminRoutes);
app.use('/', mainRoute);

app.get('/logout', (req,res)=>{
  console.log('logout...');
  const email = req.session.email;
  res.clearCookie(email);
  req.session.destroy(); 
  res.redirect('/users')
})
app.get('/auth' , passport.authenticate('google', { scope:
  [ 'email', 'profile' ]
}));

// Auth Callback
app.get( '/auth/callback',
  passport.authenticate( 'google', {
      successRedirect: '/auth/callback/success',
      failureRedirect: '/auth/callback/failure'
}));

// Success 
app.get('/auth/callback/success' , (req , res) => {
  console.log(req.session);
  if(!req.user){
      res.redirect('/auth/callback/failure');
  }else if(req.user.displayName == 'Aishwarya Arun' && req.user.email == 'aishwarya4arun@gmail.com'){
    res.redirect('../../admin/home');
  }else{
  res.redirect('../../users/home');
  }
});

// failure
app.get('/auth/callback/failure' , (req , res) => {
  res.redirect(`${req.session.user}/login?error=Google authentication failed`);
})

app.listen(3000,()=>{console.log('your app is running on port 3000....')})