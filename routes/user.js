const express = require('express');
const User = require('../models/users');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/img/'); // Save files to the 'uploads' directory
    },
    filename: (req, file, cb) => {
      const uniqueFileName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueFileName);
    },
  });
  
  const upload = multer({ storage });
  
const {login,signUp,newUser,loginUser,otp,otpVerification,forgot,resend,postforgot,resetEJS,resetPassword
    ,home,product,cart,addCart,remCart,profile,addAddress, editAddress,removeAddress,editProfile,changeQty,
checkout,order, orderDetails, eachOrder, orderReturn, wallet,applyCoupon,addWish,removeWish,wishlist,razorPost,
 addAddressCheckout,orderInvoice,changeProfileImage,rating} = require('../controllers/user');
const {isAuthenticatedUser,isBlocked} = require('../controllers/authMiddleware');
const { reset } = require('nodemon');


const router = express.Router();

router.get('/', login);
router.get('/signUp', signUp);
router.post('/signUp', newUser);
router.post('/login', loginUser)
router.get('/otp', otp);
router.post('/otpVerification', otpVerification);
router.get('/forgotPassWord',forgot)
router.post('/forgot', postforgot);
router.get('/resend', resend);
router.get('/reset', resetEJS);
router.post('/resetPassword', resetPassword);
router.get('/home',isAuthenticatedUser, home);
router.get('/product/:id', product)
router.get('/cart',isAuthenticatedUser, isBlocked, cart);
router.get('/addCart/:id', isAuthenticatedUser, isBlocked, addCart);
router.get('/remCart/:id', isAuthenticatedUser, isBlocked,remCart);
router.get('/profile',isAuthenticatedUser,isBlocked, profile);
router.post('/addAddress', isAuthenticatedUser,isBlocked, addAddress);
router.post('/editAddress/:i' ,isAuthenticatedUser,isBlocked, editAddress) ;
router.get('/removeAddress/:i' , isAuthenticatedUser,isBlocked,removeAddress);
router.post('/editProfile', isAuthenticatedUser,isBlocked,editProfile);
router.get('/changeQty/:id/:newValue',isAuthenticatedUser,isBlocked, changeQty);
router.get('/checkout',isAuthenticatedUser,isBlocked, checkout);
router.post('/order',isAuthenticatedUser,isBlocked, order);
router.get('/orders',isAuthenticatedUser,isBlocked, orderDetails)
router.get('/orderDetails/:id',isAuthenticatedUser,isBlocked, eachOrder);
router.get('/invoice/:id',isAuthenticatedUser,isBlocked, orderInvoice);
router.post('/order/:status/:id/:all' ,isAuthenticatedUser,isBlocked, orderReturn);
router.get('/wallet' ,isAuthenticatedUser,isBlocked, wallet);
router.get('/applyCoupon/:code', isAuthenticatedUser,isBlocked, applyCoupon);
router.get('/addWish/:id',isAuthenticatedUser,isBlocked, addWish);
router.get('/removeWish/:id',isAuthenticatedUser,isBlocked, removeWish);
router.get('/wishlist',isAuthenticatedUser,isBlocked, wishlist);
router.get('/razorPost/:amount', isAuthenticatedUser, isBlocked , razorPost);
router.post('/addAddressCheckout', isAuthenticatedUser,isBlocked, addAddressCheckout)
router.post('/upload_profileImage',upload.single('file'), isAuthenticatedUser,isBlocked,changeProfileImage);
router.post('/rating/:action/:id', isAuthenticatedUser,isBlocked,rating);

module.exports = router;