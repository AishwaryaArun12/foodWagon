const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
 const MongoStore = require('connect-mongo');
const passport = require('./passport');

const nodemailer = require('nodemailer');
app.use(bodyParser.urlencoded({ extended : true}));
const User = require('./models/users');
const Seller = require('./models/seller');


const mainRoute = require('./routes/main');
const userRoutes = require('./routes/user')
const sellerRoutes = require('./routes/seller');
const deliveryRoutes = require('./routes/delivery_staff');
const adminRoutes = require('./routes/admin');
const {isLogin, isBlocked} = require('./middlewares/authMiddleware');
app.use(express.static('public'));
mongoose.connect(process.env.foodwagon).then(()=>{console.log('database connected..');})
app.set('view engine','ejs');



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

app.post('/logout',async (req,res)=>{
  let user;
  let seller;
  if(req.session.userId || req.user){
    if(req.session.userId){
      user = await User.findById(req.session.userId)
    }else {
      user = await User.find({email : req.user.email});
      user = user[0];
    }
  }else if(req.session.sellerId){
    seller = await Seller.findById(req.session.sellerId);
  }
  const email = req.session.email;
  res.clearCookie(email);
  req.session.destroy();
  if(user && user.blocked){
    res.redirect('/users/?error=Sorry, your access denied by admin')
    return;
  }else if(seller && seller.blocked){
    res.redirect('/users/?error=Sorry, your access denied by admin')
    return;
  }
  res.redirect('/users')
})

const isAuthenticated = (req, res, next) => {
  if (req.session.login) {
    // User is authenticated, redirect to their home page
    return res.redirect('/users/home');
  }
  // User is not authenticated, continue to the next middleware
  next();
};

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
app.get('/auth/callback/success' ,isBlocked, (req , res) => {
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
  res.redirect(`/${req.session.user}/?error=Google authentication failed`);
})
app.get('/error',(req,res)=>{
  res.render('pages/500',{user : req.session.user})
})


app.use((req, res) => {
  // Set the status to 404
  res.status(404);
  // Render a custom 404 page
  res.render('pages/page404', {user : req.session.user});
});


app.listen(3000,()=>{console.log('your app is running on port 3000....')})