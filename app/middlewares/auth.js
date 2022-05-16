module.exports = function(req, res, next) {
  if (req.query.token) {
      req.session.tokens = (req.session.tokens || [])
      console.log(req.session.tokens)
      console.log(req.query.token)
      for(i=0; i<req.session.tokens.length; i++){
          if(req.session.tokens[i].token == req.query.token){
              req.permission = req.session.tokens[i].id
              next()
              return;
          }
      }
      res.status(401).json({status: 401, message: "Unathorized"})
  } else {
    res.status(401).json({status: 401, message: "Unathorized"})
  }
}
