const User = require('../models/users');
const Seller = require('../models/seller');


    // Middleware to check if the user is authenticated
    module.exports.isAuthenticatedUser =  (req, res, next) => {
        if(req.cookies[req.session.email] || req.user){
          if(req.cookies[req.session.email] == req.session.password || req.user){
           return next();
            }
            
      }
      res.redirect('/users');
    }
    module.exports.isLogin = (req, res, next) => {
        if(req.session.login || req.user){
          return next();
           
        }
        res.redirect('/users');
    }
  
    module.exports.isAdmin = (req, res, next) => {
      // Assuming you have a property in your user object or session that indicates admin status
      if (req.user.email == 'aishwarya4arun@gmail.com' || req.session.user == 'admin') {
        return next();
      }
      res.status(403).send('Access forbidden. You must be an admin.'); // Customize the error message and status code
    }

    module.exports.isBlocked = async (req,res,next)=>{
        if(req.user && req.user.email != 'aishwarya4arun@gmail.com' || req.session.user == 'user' ){
            let user;
            if(req.session.userId){
                user = await User.findById(req.session.userId);
            }else if(req.user){
                user = await User.find({email : req.user.email});
                user = user[0];
            }
        if(user.blocked){
            res.redirect('/logout');
        }
           return next();
        
        }else if(req.session.user == 'sellerHome'){
            let seller = await Seller.findById(req.session.sellerId);
            if(seller.blocked){
                res.redirect('/logout');
            }
               return next();
        }
            next();
        
    }