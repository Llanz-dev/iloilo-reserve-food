import express from 'express';
import { GETLoginPage, GETRegisterPage, POSTLoginPage, POSTRegisterPage, GETProfilePage, POSTUpdateProfile, GETLogout } from '../controllers/customerController.mjs';
import { requireAuthentication } from '../middleware/authenticationMiddleware.mjs';
const router = express.Router();

router.get('/login', GETLoginPage);
router.post('/login', POSTLoginPage);
router.get('/register', GETRegisterPage);
router.post('/register', POSTRegisterPage);
router.get('/profile', requireAuthentication, GETProfilePage);
router.post('/profile/:id', requireAuthentication, POSTUpdateProfile);
router.get('/logout', requireAuthentication, GETLogout);
    
export default router;
