const express = require('express');
const {login,signUp,newSeller,loginSeller,home,displayImage,displayVideo,addVideo,addItem,addFoodType,search,searchClose
    ,product , block,unblock,editProduct,itemEdit,editImage, editVideo,addImage,profile,editProfile} = require('../controllers/seller');
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage : storage})

const router = express.Router();

router.get('/', login);
router.get('/signUp', signUp);
router.post('/signUp', newSeller);
router.post('/login', loginSeller);
router.get('/home', home);
router.post('/addVideo', upload.single('video'), addVideo);
router.post('/addItem',upload.array('images',8) , addItem);
router.post('/addFoodType', addFoodType);
router.get('/getImage/:itemId/:i', displayImage);
router.get('/getVideo/:itemId', displayVideo);
router.get('/search', search);
router.get('/search/close', searchClose);
router.get('/product/:id', product);
router.get('/block/:user/:id', block);
router.get('/unblock/:user/:id', unblock)
router.get('/editItem/:id', editProduct);
router.post('/edit/:id', itemEdit);
router.post('/editImage/:id/:i', upload.single('image'), editImage)
router.post('/editVideo/:id' ,upload.single('video'), editVideo);
router.post('/addImage/:id', upload.single('image'), addImage)
router.get('/profile', profile)
router.post('/editProfile', editProfile);

module.exports = router;