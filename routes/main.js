const express = require('express');

const {main,menu,edit, filter} = require('../controllers/main');

const router = express.Router();

router.get('/',main);
router.get('/menu',menu);
router.get('/edit/:user/:id', edit);
router.get('/menu/:filterHead/:filter', filter);

module.exports = router;