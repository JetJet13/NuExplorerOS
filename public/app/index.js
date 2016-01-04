var express = require('express');
var router = express.Router();

/* GET home page. */
/*
router.get('/', function(req, res) {
  
  res.sendfile('/jade/layout');

});
*/
module.exports = function (req, res) {
  res.status(200).render('/jade/layout');
};

//module.exports = router;
