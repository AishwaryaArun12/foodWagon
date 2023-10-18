const express = require('express');

const {main,menu,edit, filter} = require('../controllers/main');
const {isBlocked} = require('../middlewares/authMiddleware')

const router = express.Router();

router.get('/', isBlocked, main);
router.get('/menu',isBlocked,menu);
router.get('/menu/:filterHead/:filter', isBlocked, filter);

module.exports = router;