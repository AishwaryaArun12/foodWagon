const express = require('express');
const {login,signUp,newSeller,loginSeller,home,displayImage,displayVideo,addVideo,addItem,addFoodType,search,searchClose
    ,product , block,unblock,editProduct,itemEdit,editImage, editVideo,addImage,profile,editProfile,order, orderAction
    ,deleteImage,cancelOrder,products,salesPdf,changeDate} = require('../controllers/seller');
const multer  = require('multer');
const {isBlocked,isLogin} = require('../controllers/authMiddleware')
const storage = multer.memoryStorage();
const upload = multer({ storage : storage})

const router = express.Router();

router.get('/', login);
router.get('/signUp', signUp);
router.post('/signUp', newSeller);
router.post('/login', loginSeller);
router.get('/home',isBlocked,isLogin, home);
router.post('/addVideo',isBlocked,isLogin, upload.single('video'), addVideo);
router.post('/addItem',upload.array('images',8) ,isBlocked ,isLogin, addItem);
router.post('/addFoodType',isBlocked, isLogin, addFoodType);
router.get('/getImage/:itemId/:i',isBlocked,isLogin, displayImage);
router.get('/getVideo/:itemId',isBlocked,isLogin, displayVideo);
router.get('/search',isBlocked,isLogin, search);
router.get('/search/close',isBlocked,isLogin, searchClose);
router.get('/product/:id',isBlocked,isLogin, product);
router.get('/block/:user/:id',isBlocked,isLogin, block);
router.get('/unblock/:user/:id',isBlocked,isLogin, unblock)
router.get('/editItem/:id', isBlocked,isLogin,editProduct);
router.post('/edit/:id',isBlocked,isLogin, itemEdit);
router.post('/editImage/:id/:i', upload.single('image'),isBlocked,isLogin, editImage)
router.get('/deleteImage/:id/:i', isBlocked,isLogin, deleteImage)
router.post('/editVideo/:id' ,upload.single('video'),isBlocked,isLogin, editVideo);
router.post('/addImage/:id', upload.single('image'), isLogin, isBlocked, addImage)
router.get('/profile', isBlocked,isLogin, profile)
router.post('/editProfile',isBlocked,isLogin, editProfile);
router.get('/orders',isBlocked,isLogin, order);
router.post('/orderAction/:id', isBlocked,isLogin, orderAction);
router.get('/cancelOrder/:id' , cancelOrder);
router.get('/products', isBlocked,isLogin, products)
router.post('/salesReport', salesPdf)
router.post('/changeDate/:date', changeDate);


module.exports = router;