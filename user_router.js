const express = require('express');
const router = express.Router();

const {signup,login,refreshToken,logout,deleteMyAccount,updateMyAccount} = require('./user.js');

router.post('/user/signup', signup )
router.post('/user/login', login )
router.post('/user/refreshToken', refreshToken )
router.delete('/user/logout', logout )
router.delete('/user/deleteMyAccount', deleteMyAccount )
router.delete('/user/updateMyAccount', updateMyAccount )

module.exports = router;
