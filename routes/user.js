const express = require('express');
const User = require('../models/users');

const {login,signUp,newUser,loginUser,otp,otpVerification,forgot,resend,postforgot,resetEJS,resetPassword
    ,home,product,cart,addCart,remCart,profile,addAddress, editAddress,removeAddress,editProfile} = require('../controllers/user');
const { reset } = require('nodemon');
async function checkSession(req,res,next){
    if(req.session.userId){
        let user = await User.findById(req.session.userId);
    if(user.blocked){
        res.redirect('/logout');
        next();
    }else{
        next();
    }
    }else{
        next();
    }
}

const router = express.Router();
router.use(checkSession)
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
router.get('/home', home);
router.get('/product/:id', product)
router.get('/cart', cart);
router.get('/addCart/:id',addCart);
router.get('/remCart/:id',remCart);
router.get('/profile',profile);
router.post('/addAddress', addAddress);
router.post('/editAddress/:i' , editAddress) ;
router.get('/removeAddress/:i' ,removeAddress);
router.post('/editProfile', editProfile);

module.exports = router;