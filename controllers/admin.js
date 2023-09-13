const Seller = require('../models/seller');
const User = require('../models/users');
const Menu = require('../models/menu');
const Item = require('../models/items');
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
            res.render('pages/login',{user : 'admin',error: error.error ,login:false});
        }
    }else{
        res.render('pages/login',{user : 'admin',error: error.error, login : false});
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
    if(req.cookies[req.session.email] || req.user){
        if(req.cookies[req.session.email] == req.session.password || req.user){
            if(req.user){
                res.cookie(req.user.email, '1234');
                req.session.password = '1234';
                req.session.email = req.user.email;
                req.session.login = true;
                req.session.user = admin;
                req.session.save();
            }
            console.log(sellers);
            res.render('pages/adminHome',{sellers : sellers, user:'admin', login :true});
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
let users =null;
module.exports.adminAllUser = async(req,res)=>{
    users = await User.find();
    res.redirect('/admin/users');
}
module.exports.adminUser = async(req,res)=>{
    if(req.cookies[req.session.email] || req.user){
        if(req.cookies[req.session.email] == req.session.password || req.user){ 
            console.log(users);
            res.render('pages/adminUser',{users : users,login :true,user:'admin'});
        }
    }
}
module.exports.adminAllSeller = async(req,res)=>{
     sellers =await Seller.find();
     res.redirect('/admin/sellers')
}
 let sellers = null;
module.exports.adminSeller = async(req,res)=>{
    if(req.cookies['aishwarya4arun@gmail.com'] || req.user){
        if(req.cookies[req.session.email] == req.session.password || req.user){
            res.render('pages/adminSeller',{sellers : sellers,login :true,user:'admin'});
        }
    }
}
search = ''
module.exports.adminMenu = async(req,res)=>{
    let error = req.query.error
    const id = req.params.id;
    if(req.cookies[req.session.email] ){
        if(req.cookies[req.session.email] == req.session.password){
            const menu = await Menu.find({ _id: id});
            console.log(menu);
            const menus = await Menu.findById(id).populate({
                path: 'menu.category.items.item',
                model: 'Item'  // Make sure the model name matches the one you defined for items
              });
              
            const foodType = menu[0].menu.map(foodType =>foodType.name);
            res.render('pages/adminMenu',{error,foodType : foodType, menus : menus, search :search,user:'admin', login:true});
        }else{
            res.redirect('/admin');
        }
    }else{
        console.log('hai..');
        res.redirect('/admin');
    }
}
module.exports.search = async (req,res)=>{
    const id = req.params.id;
    const searchTerm = req.query.q; // Get the value of the 'q' query parameter       
    console.log(searchTerm);
    try {
    const searchResults = await Item.find({ name: { $regex: searchTerm, $options: 'i' } }); // Perform a case-insensitive search
    search = searchResults;
    res.redirect(`/admin/menu/${id}`);
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while searching for items.' });
    }
}
module.exports.searchClose = async (req,res)=>{
    const id = req.params.id;
    search = "";
    res.redirect(`/admin/menu/${id}`);
}
module.exports.block = async (req,res)=>{
    const id = req.params.id;
    const user = req.params.user;
    if(user == 'user'){
        const update = await User.updateOne({_id : id},{$set :{blocked : true}});
        res.redirect('/admin/allUser');
    }else if(user == 'seller'){
        const update = await Seller.updateOne({_id : id},{$set :{blocked : true}})
        res.redirect('/admin/sellers');
    }else if(user == 'item'){
        const update = await Item.updateOne({_id : id},{$set :{blocked : true}})
        res.redirect('/admin/sellers');
    }else {
        const matchingDocument = await Menu.findOne({
            _id: id,
            'menu.category.name': user
          });
          const menu = matchingDocument.menu;
  
  // Find the index of the menu element containing the matching category
  let menuIndex ;
    const matchingCategory = menu.filter(category => {
       category= category.category.filter(element => {
        console.log(element.name,'xd');
       return element.name == user; 
    })
    return category.length != 0;
});
 
  const updateQuery = {
    $set: { 'menu.$[menuElem].category.$[categoryElem].blocked': true }
  };

  const arrayFilters = [
    { 'menuElem.name': matchingCategory[0].name },
    { 'categoryElem.name': user }
  ];

  // Update the document in the database
  const update = await Menu.updateOne(
    { _id: id },
    updateQuery,
    {
      arrayFilters,
      upsert: false
    }
  );
        res.redirect(`/admin/menu/${id}`);
    }
    
}
module.exports.unblock = async (req,res)=>{
    const id = req.params.id;
    const user = req.params.user;
    if(user == 'user'){
        const update = await User.updateOne({_id : id},{$set :{blocked : false}})
        res.redirect('/admin/allUser');
    }else if(user == 'seller'){
        const update = await Seller.updateOne({_id : id},{$set :{blocked : false}})
        res.redirect('/admin/sellers');
    }else if(user == 'item'){
        const update = await Item.updateOne({_id : id},{$set :{blocked : false}})
        res.redirect('/admin/sellers');
    }else {
        
        const matchingDocument = await Menu.findOne({
            _id: id,
            'menu.category.name': user
          });
          const menu = matchingDocument.menu;
  
  // Find the index of the menu element containing the matching category
  let menuIndex ;
    const matchingCategory = menu.filter(category => {
       category= category.category.filter(element => {
        console.log(element.name,'xd');
       return element.name == user; 
    })
    return category.length != 0;
});
    
   
  
  console.log(matchingCategory,"hr");
  const updateQuery = {
    $set: { 'menu.$[menuElem].category.$[categoryElem].blocked': false }
  };

  const arrayFilters = [
    { 'menuElem.name': matchingCategory[0].name },
    { 'categoryElem.name': user }
  ];

  // Update the document in the database
  const update = await Menu.updateOne(
    { _id: id },
    updateQuery,
    {
      arrayFilters,
      upsert: false
    }
  );

          res.redirect(`/admin/menu/${id}`);
}}
module.exports.searchUser = async (req,res)=>{
    let user = req.params.user;
    const searchTerm = req.body.q; // Get the value of the 'q' query parameter       
    try {
    if(user == 'user'){
        const searchResults = await User.find({ name: { $regex: searchTerm, $options: 'i' } }); // Perform a case-insensitive search
        users = searchResults;
        res.redirect('../users')
    }else if(user=='seller'){
        const searchResults = await Seller.find({ name: { $regex: searchTerm, $options: 'i' } }); // Perform a case-insensitive search
        sellers = searchResults;
        res.redirect('../sellers');
    }
    
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while searching for items.' });
    }
}
module.exports.adminProduct = async (req,res)=>{
    if(req.session.login || req.user){
        const items = await Item.find();
        res.render('pages/adminProducts',{login:true,user:'admin',})
    }
}