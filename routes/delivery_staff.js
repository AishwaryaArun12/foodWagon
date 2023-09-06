const express = require('express');
const {login,signUp,newDelivery_staff,loginDelivery_staff,home} = require('../controllers/delivery_staff');

const router = express.Router();
router.get('/', login);
router.get('/signUp', signUp);
router.post('/signUp', newDelivery_staff);
router.post('/login', loginDelivery_staff);
router.get('/home', home);

module.exports = router;