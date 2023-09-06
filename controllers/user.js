const User = require('../models/users');
const Item = require('../models/items');
const Seller = require('../models/seller')
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const transporter = nodemailer.createTransport({
    service : 'Gmail',
    auth : {
      user : 'foodmailerwagon@gmail.com',
      pass : 'sywiowzgrzajpjpa'
    }
  })
let login = false;
module.exports.login = (req,res)=>{
    req.session.user = 'users';
    const error =  req.query; 
    if(req.cookies[req.session.email] || req.user){
        if(req.cookies[req.session.email] == req.session.password || req.user){
            console.log(req.session,'login to home')
            res.redirect('/users/home');
        }else{
            res.render('pages/login',{user : 'users',error:error.error,login:false});
        }
    }else{
        console.log(req.session);
        res.render('pages/login',{user : 'users',error : error.error,login : false});
    } 
    
}
module.exports.signUp = async (req,res)=>{
    const user = await User.findOne({email: req.session.email});
    const error = req.query;
    if(req.cookies[req.session.email]){
        if(req.cookies[req.session.email] == req.session.password && user.verified){
            res.redirect('/users/home');
        }else{
            res.render('pages/signUp',{user : 'users',error : error.error,login:login}); 
        }
    }else{
        res.render('pages/signUp', {user : 'users',error : error.error,login : login});
    }
}
module.exports.newUser =async (req,res)=>{
    const user = await User.findOne({email : req.body.email});
    if(user){
        req.session.email = user.email;
        const otp = otpGenerator.generate(6, { digits: true, alphabets: true, upperCase: true });

        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        await User.findOneAndUpdate({ email : req.body.email }, { otp, otpExpiration });

        //const toEmail =savedUser.email;
        const toEmail = 'jj4245888@gmail.com';
        const mailOptions = {
            from : 'foodmailerwagon@gmail.com',
            to : toEmail,
            subject : 'OTP for registeration in foodWagon',
            html : `<p>Hai, </p><p> this OTP only valid for 5 minutes </p><p>${otp}</p><p>with regards,</p><p> foodWagon</p>`
        }

        transporter.sendMail(mailOptions, (error, info)=>{
            if(error){
                console.error('Error sending mail : ',error);
                res.status(500).send('Error in sending email')
            }else{
                console.log('Email sent for OTP:', info.response);
                res.status(200).send('Email send successfully');
            }
        });
        res.redirect('/users/otp')
        
    }else{
        const newUser = new User(req.body);
   try {
    const savedUser = await newUser.save();
    console.log(savedUser);
    req.session.email = savedUser.email;
        const otp = otpGenerator.generate(6, { digits: true, alphabets: true, upperCase: true });

        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        await User.findOneAndUpdate({ email : req.body.email }, { otp, otpExpiration });

        //const toEmail =savedUser.email;
        const toEmail = 'jj4245888@gmail.com';
        const mailOptions = {
            from : 'foodmailerwagon@gmail.com',
            to : toEmail,
            subject : 'OTP for registeration in foodWagon',
            html : `<p>Hai, </p><p> this OTP only valid for 5 minutes </p><p>${otp}</p><p>with regards,</p><p> foodWagon</p>`
        }

        transporter.sendMail(mailOptions, (error, info)=>{
            if(error){
                console.error('Error sending mail : ',error);
                res.status(500).send('Error in sending email')
            }else{
                console.log('Email sent for OTP:', info.response);
                res.status(200).send('Email send successfully');
            }
        });
        res.redirect('/users/otp')
   } catch (error) {
    res.status(500).send(error)
   };
    }
   
}
module.exports.loginUser = async (req,res)=>{    
        let user = await User.find({name : req.body.name, email : req.body.email, password : req.body.password});
        if(!user){
            res.redirect('/users/?error=You are not registered. Please login')
        }
        
        if(user.length && user[0].verified){
            login = true;
            res.cookie(req.body.email, req.body.password);
            req.session.password = req.body.password;
            req.session.userId = user[0]._id;
            req.session.email = req.body.email;
            req.session.verified = 'true';
            req.session.login = true;
            req.session.save();
            res.redirect('/users/home');
        }else if(!user.length){
            res.redirect('../users/signUp/?error=You are a new customer. Please Register...');
        }else{
            const otp = otpGenerator.generate(6, { digits: true, alphabets: true, upperCase: true });

        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        await User.findOneAndUpdate({ email : req.body.email }, { otp, otpExpiration });

        //const toEmail =savedUser.email;
        const toEmail = 'jj4245888@gmail.com';
        const mailOptions = {
            from : 'foodmailerwagon@gmail.com',
            to : toEmail,
            subject : 'OTP for registeration in foodWagon',
            html : `<p>Hai, </p><p> this OTP only valid for 5 minutes </p><p>${otp}</p><p>with regards,</p><p> foodWagon</p>`
        }

        transporter.sendMail(mailOptions, (error, info)=>{
            if(error){
                console.error('Error sending mail : ',error);
                res.status(500).send('Error in sending email')
            }else{
                console.log('Email sent for OTP:', info.response);
                res.status(200).send('Email send successfully');
            }
        });
            res.redirect('../users/otp/?error=You are not verified.')
        }
    }
module.exports.otp = async (req,res)=>{
    const error = req.query;
    res.render('pages/otp',{user : 'users',error : error.error,login : false});
}
module.exports.otpVerification = async (req,res)=>{
    const email = req.session.email;
    const enteredOtp = req.body.otp;
    const user = await User.findOne({email : email});
    console.log(user.otp,enteredOtp,user.otpExpiration < new Date());
    if(!user){
        res.redirect('/users/?error=User not found')
    }else{
        if (user.otp === enteredOtp && user.otpExpiration > new Date()) {
            // Clear OTP and OTP expiration in the user's document
            await User.findOneAndUpdate({ email : email }, { otp: null, otpExpiration: null, verified: true });
            req.session.verified = 'true';
            res.redirect('/users');
        }else if(user.otpExpiration < new Date()){
            //await User.findOneAndUpdate({ email : email }, { otp: null, otpExpiration: null });
            //const result = await User.deleteOne({ email: user.email });
            res.redirect('/users/otp/?error=Invalid OTP. Try again ')
        }else{
            const result = await User.deleteOne({ email: user.email });
            res.redirect('/users/signUp/?error=Invalid OTP Register again')
        }
    }
}

module.exports.home = async (req,res)=>{
    const user = await User.findOne({email: req.session.email});
   // console.log(req.cookies[req.session.email],user.verified);
   if(!user && ! req.user){
    res.redirect(req.originalUrl+'/../?error=Please login...')
    }else if(user && ! req.user){
        if(!user.verified){
            res.redirect(req.originalUrl+'/../signUp/?error=You can not login. Please verify your email.')       
    }
    else if(req.cookies[req.session.email] || req.user ){
        if(req.cookies[req.session.email] == req.session.password || req.user){
            if(req.user){
                const user = User.find({email : req.user.email});
                req.user.userId = user._id;
                console.log(req.user.userId,'id in google');
                if(!user){
                    const newUser = new User({name: req.user.displayName, email : req.user.email});
                    req.session.email = req.user.email;
                    try {
                        const savedUser = await newUser.save();
                        req.session.userId = savedUser._id;
                        console.log(savedUser);
                    } catch (error) {
                        res.status(500).send(error)
                    };
                }
            }
            const items = await Item.find();
            
            res.render('pages/userHome',{items :items, login : true, user : 'users'});
        }else{
            res.redirect(req.originalUrl+'/../?error=Please login..');
        }
    }else{
        res.redirect(req.originalUrl+'/../?error=Please login..');
    }
    
}
}
module.exports.products = async(req,res)=>{
    const items = await Item.find();
     if(req.session.email){
        console.log(req.cookies);
        res.render('pages/userProducts',{user:'users',login : true, items:items})
        
     }
}
module.exports.cart = async(req,res)=>{
    if(req.session.login || req.user){
        let cartData='';
        try {
            console.log(req.session);
            const user = await User.findById(req.session.userId).populate({
                path: 'cart.itemId', // Populate the itemId field in the cart array
    populate: {
      path: 'seller', // Populate the seller field in the item details
      model: 'sellers', // Replace 'Seller' with the actual model name for sellers
    },
            });           
            // The 'user' object now contains the populated 'cart' field with 'Item' documents.
            //console.log(user.cart[0].itemId.seller,'cart'); // This will log the user's cart data.
            // You can access each cart item's associated 'Item' document like user.cart[0].itemId.
            cartData = user.cart;
          } catch (err) {
            console.error(err);
            // Handle any errors, e.g., send an error response.
            res.status(500).send('Internal Server Error');
          }
        res.render('pages/userCart',{user:'users',login :true,cartData});
    }else{
        res.send('<script>alert("Please login to view your cart."); window.location.href="/";</script>');

    }
}
    
module.exports.addCart = async(req,res)=>{
    const id = req.params.id;
    let userId = req.session.userId;
    const user = await User.findOne({ _id: userId, 'cart.itemId': id });
    if(user){
        res.send('<script>alert("Already added this product to cart."); window.location.href="/users/cart";</script>');  
    }else{
        await User.findByIdAndUpdate(
            userId,
            { $push: { cart: {itemId : id} } }, // Add the itemId to the cart array
            { new: true } // Return the updated user document
        );
        res.send('<script> window.location.href="/users/cart";alert("Product added to cart successfully,");</script>');
    }

}

module.exports.remCart = async(req,res)=>{
    const id = req.params.id;
    let userId = req.session.userId;
    try {
        const result = await User.updateOne(
          { _id: userId },
          { $pull: { cart: { itemId: id } } }
        );
      console.log(result);
        
        res.redirect(`../cart`)
      } catch (error) {
        console.error(error);
        // Handle the error
      }
}
