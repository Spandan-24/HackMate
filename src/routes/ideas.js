const router = require('express').Router();
const auth = require('../middleware/auth');
const { createIdea, listIdeas } = require('../controllers/ideaController');

router.post('/', auth, createIdea);
router.get('/', listIdeas);

module.exports = router;
