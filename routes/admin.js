const express = require('express');

const {login,loginAdmin,home,acceptSendMail,rejectSendMail,adminUser,block,unblock,adminSeller,adminMenu,search,
    searchUser,searchClose,adminAllUser, adminAllSeller} = require('../controllers/admin');

const router = express.Router();

router.get('/', login);
router.post('/login', loginAdmin);
router.get('/home', home);
router.post('/accept/sendMail/:address', acceptSendMail);
router.post('/reject/sendMail/:address/:reason', rejectSendMail);
router.get('/users', adminUser);
router.get('/allUser' , adminAllUser)
router.get('/sellers', adminSeller);
router.get('/allSeller' ,adminAllSeller);
router.get('/block/:user/:id', block);
router.get('/unblock/:user/:id', unblock)
router.get('/menu/:id', adminMenu);
router.get('/search/:id', search);
router.get('/search/close/:id' , searchClose);
router.post('/search/:user', searchUser)
module.exports = router;