const express = require('express');

const {login,loginAdmin,home,acceptSendMail,rejectSendMail,adminUser} = require('../controllers/admin');

const router = express.Router();

router.get('/', login);
router.post('/login', loginAdmin);
router.get('/home', home);
router.post('/accept/sendMail/:address', acceptSendMail);
router.post('/reject/sendMail/:address/:reason', rejectSendMail);
router.get('/users', adminUser);

module.exports = router;