const express = require('express');

const {login,loginAdmin,home,acceptSendMail,rejectSendMail,adminUser,block,unblock,adminSeller,adminMenu,search,
    searchUser,searchClose,adminAllUser, adminAllSeller,products, allProducts,category,newFoodType,newCategory,
    blockFoodType,blockCategory,unblockFoodType,unblockCategory,editCategory, editFoodType, order,coupon, addCoupon,
    editCoupon,deleteCoupon, salesPdf, changeDate, } = require('../controllers/admin');
// const { order } = require('../controllers/user');

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
router.get('/products', products);
router.get('/allProducts', allProducts);
router.get('/category', category);
router.post('/newFoodType', newFoodType); 
router.post('/newCategory', newCategory);
router.get('/blockFoodType/:foodType', blockFoodType);
router.get('/unblockFoodType/:foodType', unblockFoodType);
router.get('/blockCategory/:foodType/:category', blockCategory);
router.get('/unblockCategory/:foodType/:category', unblockCategory);
router.post('/editCategory/:foodType/:category', editCategory);
router.post('/editFoodType/:foodType', editFoodType);
router.get('/orders', order)
router.get('/coupon', coupon);
router.post('/addCoupon', addCoupon);
router.post('/editCoupon/:id', editCoupon);
router.get('/delCoupon/:id', deleteCoupon);
router.post('/salesReport', salesPdf)
router.post('/changeDate/:date', changeDate);

module.exports = router;