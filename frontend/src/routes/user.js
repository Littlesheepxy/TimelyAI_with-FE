const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // 查询数据库验证用户
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json({ success: true, message: '登录成功' });
        } else {
            res.json({ success: false, message: '用户名或密码错误' });
        }
    });
});

module.exports = router; 