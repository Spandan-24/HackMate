const router = require('express').Router();
const auth = require('../middleware/auth');
const { createTeam, listTeams } = require('../controllers/teamController');

router.post('/', auth, createTeam);
router.get('/', listTeams);

module.exports = router;
