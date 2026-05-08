const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { generateTokenSchema, updateTokenStatusSchema } = require('../validators/tokenValidators');

router.use(authenticate);

router.post('/generate', validate(generateTokenSchema), tokenController.generateToken);
router.get('/', tokenController.getTokensByDate);
router.get('/queue/:doctorId', tokenController.getQueue);
router.get('/:id', tokenController.getTokenById);
router.put('/status/:id', validate(updateTokenStatusSchema), tokenController.updateTokenStatus);

module.exports = router;
