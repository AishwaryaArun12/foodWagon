const express = require('express');

const {login,signUp,newUser,loginUser,otp,otpVerification,home,products,cart,addCart,remCart} = require('../controllers/user');

const router = express.Router();
router.get('/', login);
router.get('/signUp', signUp);
router.post('/signUp', newUser);
router.post('/login', loginUser)
router.get('/otp', otp);
router.post('/otpVerification', otpVerification);
router.get('/home', home);
router.get('/products', products)
router.get('/cart', cart);
router.get('/addCart/:id',addCart);
router.get('/remCart/:id',remCart);


module.exports = router;