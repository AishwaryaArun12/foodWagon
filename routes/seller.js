const express = require('express');
const {login,signUp,newSeller,loginSeller,home,displayImage,displayVideo,addVideo,addItem,addFoodType,search,searchClose
    ,product} = require('../controllers/seller');
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

module.exports = router;