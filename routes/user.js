const express = require('express');
const User = require('../models/users');

const {login,signUp,newUser,loginUser,otp,otpVerification,forgot,resend,postforgot,resetEJS,resetPassword
    ,home,product,cart,addCart,remCart,profile,addAddress, editAddress,removeAddress,editProfile,changeQty,
checkout,order, orderDetails, eachOrder, orderReturn, wallet} = require('../controllers/user');
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
router.post('/order/:status/:id/:all' ,isAuthenticatedUser,isBlocked, orderReturn);
router.get('/wallet' , wallet);


module.exports = router;