const router = require('express').Router();
const { listUsers } = require('../controllers/userController');

router.get('/', listUsers);

module.exports = router;
