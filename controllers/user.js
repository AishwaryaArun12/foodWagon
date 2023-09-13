const User = require('../models/users');
const Item = require('../models/items');
const Seller = require('../models/seller')
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
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
        let {name,email,password,location} = req.body;
       bcrypt.hash(password, saltRounds,async (err, hash) => {
            if (err) {
                console.log(err);
            } else {
                password = hash;
                console.log(password, hash);
              const newUser = new User({ name, password, email, location });
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
        });
         
       }
   
}
module.exports.loginUser = async (req,res)=>{    
        let user = await User.find({email : req.body.email});
        if(!user){
            res.redirect('/users/?error=You are not registered. Please login')
        }
        const password = req.body.password;
        const hashedPassword = user[0].password
        
        bcrypt.compare(password, hashedPassword,async (err, result) => {
            if (err) {
              console.log(err,'err');
            } else if (result) {
                if(user.length!=0 && user[0].verified){
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
        
                const otpExpiration = new Date(Date.now() + 1 * 60 * 1000); // 1 minutes from now
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
                    res.redirect('../users/otp/?error=Please verify your email by submitting the OTP which we already sent in your email')
                }
            } else {
              res.redirect('../users/?error=Password does not match')
            }
          });      
    }


module.exports.otp = async (req,res)=>{
    const error = req.query;
    res.render('pages/otp',{user : 'users',error : error.error,login : false});
}

module.exports.otpVerification = async (req,res)=>{
    const email = req.session.email;
    const enteredOtp = req.body.otp;
    const user = await User.findOne({email : email});
    if(!email){
        const name = req.session.name;
        const user = await User.findOne({name : name});
    }
    console.log(user,user.otp===enteredOtp,user.otpExpiration > new Date());
    if(!user){
        res.redirect('/users/?error=User not found')
    }else{
        if (user.otp === enteredOtp && user.otpExpiration > new Date()) {
            // Clear OTP and OTP expiration in the user's document
            let update = await User.findOneAndUpdate({ email : email }, { otp: null, otpExpiration: null, verified: true });
            console.log(update,'here');
            req.session.verified = 'true';
            if(req.session.forgot){
                res.redirect('/users/reset');
            }else{
                res.redirect('/users');
            }
            
        }else if(user.otpExpiration < new Date()){
            //await User.findOneAndUpdate({ email : email }, { otp: null, otpExpiration: null });
            //const result = await User.deleteOne({ email: user.email });
            res.redirect('/users/otp/?error=Invalid OTP. Try again ')
        }else{
            res.redirect('/users/otp/?error=Your OTP expired. Please click resend OTP ')
        }
    }
}

module.exports.forgot =  (req,res)=>{
    let error = req.query.error;
  res.render('pages/forgot.ejs' , {user: 'users',login:false, error : error})
}
module.exports.resend = async (req,res) =>{
    const otp = otpGenerator.generate(6, { digits: true, alphabets: true, upperCase: true });
        
    const otpExpiration = new Date(Date.now() + 1 * 60 * 1000); // 1 minutes from now
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
            res.redirect('/users/otp');
        }
    });
}
module.exports.postforgot = async (req,res)=>{
    let name = req.body.name;
    let email = req.body.email;
    let user ;
    if(email){
        req.session.email = email;
        user = await User.findOne({email : email})
    }else if(name){
        req.session.name = name;
        user = await User.findOne({name : name});
        req.session.email = user.email;
    }
       
    if(user){
        req.session.forgot = true;
        const otp = otpGenerator.generate(6, { digits: true, alphabets: true, upperCase: true });

        const otpExpiration = new Date(Date.now() + 1 * 60 * 1000); // 1 minutes from now
        let update = await User.findOneAndUpdate({ email : req.session.email }, { otp, otpExpiration });
        
        //const toEmail =user.email;
        const toEmail = 'jj4245888@gmail.com';
        const mailOptions = {
            from : 'foodmailerwagon@gmail.com',
            to : toEmail,
            subject : 'OTP for registeration in foodWagon',
            html : `<p>Hai, </p><p> this OTP only valid for 5 minutes </p><p>${otp}</p><p>with regards,</p><p> foodWagon</p>`
        }

        await transporter.sendMail(mailOptions, (error, info)=>{
            if(error){
                console.error('Error sending mail : ',error);
                res.status(500).send('Error in sending email')
            }else{
                console.log('Email sent for OTP:', info.response);
                res.status(200).send('Email send successfully');
            }
        });
        res.redirect('../users/otp/?error=We send an email with OTP, Please enter that OTP')
    }else{
        res.redirect('../users/forgotPassword/?error=Name or Email does not match any registered user');
    }

}
module.exports.resetEJS = async (req,res) =>{
    if(req.session.forgot){
        res.render('pages/reset',{user:'users',login : false,error : null})
    }else{
        res.redirect('/users');
    }
}
module.exports.resetPassword = async (req,res)=>{
    const email = req.session.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if(password == confirmPassword){
        const update=await User.findOneAndUpdate({ email : email }, { password : password });
        req.session.forgot = false;
        res.redirect('/users')
    }
}
module.exports.home = async (req,res)=>{
    const user = await User.findOne({email: req.session.email});
   if(!user && ! req.user){
    res.redirect(req.originalUrl+'/../?error=Please login...')
    return;
    }else if(user && ! req.user){
        
        if(!user.verified){
            console.log('here');
            res.redirect(req.originalUrl+'/../signUp/?error=You can not login. Please verify your email.')       
    }
  }
   if(req.cookies[req.session.email] || req.user ){
        if(req.cookies[req.session.email] == req.session.password || req.user){
            if(req.user){
                const user = await User.findOne({email : req.user.email});
                req.session.userId = user._id;
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

module.exports.product = async(req,res)=>{
    console.log(req.session.email);
    const id = req.params.id;
    const items = await Item.findOne({_id : id});
        console.log(req.cookies);
        res.render('pages/userProduct',{user:'users',login : true, products:items})
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
    let q = 1;
    if(req.query.q){
         q=req.query.q;
    }
    const id = req.params.id;
    let userId = req.session.userId;
    const user = await User.findOne({ _id: userId, 'cart.itemId': id });
    if(user){
        res.send('<script>alert("Already added this product to cart."); window.location.href="/users/cart";</script>');  
    }else{
        let user = await User.findByIdAndUpdate(
            userId,
            { $push: { cart: {itemId : id,quantity : q} } }, // Add the itemId to the cart array
            { new: true } // Return the updated user document
        );
        console.log(user);
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
module.exports.profile = async (req,res)=>{
    const id = req.session.userId;
    if(req.session.login || req.user){
        const user = await User.findOne({_id : id})
        res.render('pages/userProfile',{user:'users',login:true ,userData : user})
    }
}
module.exports.addAddress = async (req,res)=>{
    const id = req.session.userId;
const formData = {
 houseName: req.body.houseName, // Replace with the submitted house name
  landmark: req.body.lMark, // Replace with the submitted landmark
  mobile: req.body.mobile, // Replace with the submitted mobile number
  zipcode: req.body.pin, // Replace with the submitted ZIP code
  district: req.body.dist, // Replace with the submitted district
  state: req.body.state, // Replace with the submitted state
};

// Create a new address object with only the filled fields
const newAddress = {};

  newAddress.HouseName = formData.houseName;
if (formData.landmark) {
  newAddress.Landmark = formData.landmark;
}

  newAddress.Mobile = formData.mobile;

  newAddress.Zipcode = formData.zipcode;

if (formData.district) {
  newAddress.District = formData.district;
}

if (formData.state) {
  newAddress.State = formData.state;
}

const updatedUser = await User.findByIdAndUpdate(
    id,
    { $push: { address: newAddress } },
    { new: true }
  );

console.log('update',updatedUser);
res.redirect('/users/profile');
}
module.exports.editAddress = async(req,res)=>{
    console.log('hai')
    const i = req.params.i
    const id = req.session.userId; 
const updatedAddress = {
    HouseName: req.body.houseName, 
    Landmark: req.body.lMark, 
    Mobile: req.body.mobile, 
    zipcode: req.body.pin, 
    District: req.body.dist,
    State: req.body.state,
};

const update = await User.findOneAndUpdate(
    { _id: id },
    { $set: { [`address.${i}`]: updatedAddress } },
    { new: true }
  );
 res.redirect('../profile');
}
module.exports.removeAddress = async(req,res)=>{
 const id = req.session.userId;
 const i = req.params.i; // Assuming you have the index to remove

 try {
   const updatedUser = await User.findOne(
     { _id: id },
     
   )
 
   if (!updatedUser) {
     return res.status(404).json({ error: 'User not found' });
   }
 console.log(updatedUser.address.length);
   // Check if the index is valid
   if (i >= 0 && i < updatedUser.address.length) {
     updatedUser.address.splice(i, 1); // Remove the i-th element
     await updatedUser.save(); // Save the updated document
     return res.redirect('/users/profile');
   } else {
     return res.status(400).json({ error: 'Invalid index' });
   }
 } catch (error) {
   return res.status(500).json({ error: 'Internal server error' });
 }
}
module.exports.editProfile = async(req,res)=>{
    const id = req.session.userId;
    if(req.session.login || req.user){
        console.log('hai');
        const name = req.body.name;
        const email = req.body.email;
        if(!req.body.password){
          let user= await  User.findOneAndUpdate(
                { _id: id }, // Filter the user by ID
                { $set: { name: name, email: email } }, // Set the new name and email
                { new: true })
                res.redirect('/users/profile')
        }else{
            let password = req.body.password
            bcrypt.hash(password, 10,async (err, hash) => {
                if (err) {
                    console.log(err);
                } else {
                  
                  let user= await  User.findOneAndUpdate(
                    { _id: id }, // Filter the user by ID
                    { $set: { name: name, email: email, password : hash } }, // Set the new name and email
                    { new: true }) 
                    res.redirect('/users/profile')
                                  }
        })
    }
}
}