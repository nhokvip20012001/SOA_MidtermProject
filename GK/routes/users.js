var express = require('express');
var router = express.Router();
var Account = require('../models/AccountModel')

router.post('/login', async function (req, res) {
  let { username, password } = req.body

  await Account.findOne({ username: username, password: password })
    .then(acc => {
      if (!acc) {
        console.log(username, password, 'Login Failed!')
        return res.redirect('back')
      }
      else {
        req.session.user = {username: username, password: password, role: acc.role}
        req.session.isLogined = true
        console.log('Successfully Login', req.session.user)
        return res.redirect('back')
      }
    })
});
router.get('/logout', function (req, res) {
  delete req.session.user
  req.session.isLogined = false
  console.log(req.session)
  return res.redirect('../')
});
module.exports = router;
