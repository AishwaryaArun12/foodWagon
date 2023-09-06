const Seller = require('../models/seller');
const User = require('../models/users');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service : 'Gmail',
    auth : {
      user : 'foodmailerwagon@gmail.com',
      pass : 'sywiowzgrzajpjpa'
    }
  })

const admin = {
    name : 'Aishwarya Arun',
    email : 'aishwarya4arun@gmail.com',
    password : '1234'
  }
  
module.exports.login = async (req,res)=>{
    const seller = await Seller.find({status : 'pending'});
    const error = req.query;
    req.session.user = 'admin';
    if(req.cookies[req.session.email] || req.user){
        if(req.cookies[req.session.email] == req.session.password || req.user){
            res.redirect('/admin/home')
        }else{
            res.render('pages/login',{user : 'admin',error: error.error});
        }
    }else{
        res.render('pages/login',{user : 'admin',error: error.error});
    }
}


module.exports.loginAdmin = async (req,res)=>{
    console.log('admin...');    
        if(admin.name == req.body.name && admin.email == req.body.email && admin.password == req.body.password){
            res.cookie(req.body.email, req.body.password);
            req.session.password = req.body.password;
            req.session.email = req.body.email;
            req.session.login = true;
            req.session.user = admin;
            req.session.save();
            res.redirect('/admin/home')
        }else{
            res.redirect('/admin/?error=Entered password or username is not correct');
        }
    }

module.exports.home = async (req,res)=>{
    const sellers = await Seller.find({status : 'pending'});
    console.log(sellers);
    if(req.cookies[req.session.email] || req.user){
        if(req.cookies[req.session.email] == req.session.password || req.user){
            res.render('pages/adminHome',{sellers : sellers, user:'users', login :true});
        }else{
            res.redirect('/admin/?error=You are not an admin');
        }
    }else{
        console.log('hai..home');
        res.redirect('/admin/?error=You successfully logged out');
    }
    
}
    
module.exports.acceptSendMail =async (req,res)=>{
    const toEmail = req.params['address'];
    console.log('i am in accept route');
    const mailOptions = {
        from : 'foodmailerwagon@gmail.com',
        to : toEmail,
        subject : 'Approval of your company from foodwagon',
        html : '<p>Hai, </p><p> We are happy to add you as our business partner,Now you can login and kindly update your menu and relevent informations </p><p>with regards,</p><p> foodWagon</p>'
    }

    transporter.sendMail(mailOptions, (error, info)=>{
        if(error){
            console.error('Error sending mail : ',error);
            res.status(500).send('Error in sending email')
        }else{
            console.log('Email sent for approve:', info.response);
            res.status(200).send('Email send successfully');
        }
    });
    try {
        const updatedSeller = await Seller.findOneAndUpdate(
            { email: toEmail },
          { $set: { status: 'approve' } },
          { new: true } // Return the updated restaurant document
        );
    
        if (!updatedSeller) {
          console.log('error in update status');
        }else{
            console.log(updatedSeller);
        }
      } catch (error) {
        console.error('Error approving restaurant:', error);
      }
    };
    


module.exports.rejectSendMail = async (req,res)=>{
    const toEmail = req.params['address'];
    const reason = req.params['reason'];
    console.log(toEmail,reason,'rejection route');
    const mailOptions = {
        from : 'foodmailerwagon@gmail.com',
        to : toEmail,
        subject : 'Rejection of your company from foodwagon',
        html : `<p>Hai, </p><p>Sorry for the inconvinience.${reason}.Becouse of this reason we can't able to approve your company as our partner  </p><p>with regards,</p><p> foodWagon</p>`
    }

 transporter.sendMail(mailOptions, (error, info)=>{
        if(error){
            console.error('Error sending mail : ',error);
            res.status(500).send('Error in sending email . Check Email address.')
        }else{
            console.log('Email sent for rejection :', info.response);
            res.status(200).send('Email send successfully');
        }
    });
    const result = await Seller.deleteOne({ email: toEmail });
    console.log(result);
    return   
}
module.exports.adminUser = async(req,res)=>{
    if(req.cookies[req.session.email] || req.user){
        if(req.cookies[req.session.email] == req.session.password || req.user){
            const users = await User.find();
            res.render('pages/adminUser',{users : users,login :false,user:'admin'});
        }
    }
}