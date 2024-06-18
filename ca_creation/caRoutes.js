// backend/routes/caRoutes.js
const express = require('express');
const { addCertificateAuthority, getCertificateAuthorities } = require('../controllers/caController');
const router = express.Router();

router.post('/add', addCertificateAuthority);
router.get('/', getCertificateAuthorities);

module.exports = router;
