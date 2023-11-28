const Seller = require('../models/seller');
const User = require('../models/users');
const Menu = require('../models/menu');
const Item = require('../models/items');
const nodemailer = require('nodemailer');
const Orders = require('../models/orders')
const Coupons = require('../models/coupon');
const fs = require('fs');
const puppeteer = require('puppeteer-core');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const path = require('path');
//const html2pdf = require('html2pdf.js');
const ejs = require('ejs');
const chromeLauncher = require('chrome-launcher');
//app.set('view engine', 'ejs');

const { defaultData, updateDefaultData } = require('../models/defaultMenu');

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
   try {
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
   } catch (error) {
    res.redirect('error');
   }
}


module.exports.loginAdmin = async (req,res)=>{
       try {
         if(admin.name == req.body.name && admin.email == req.body.email && admin.password == req.body.password){
             res.cookie(req.body.email, req.body.password);
             req.session.password = req.body.password;
             req.session.email = req.body.email;
             req.session.login = true;
             req.session.user = 'admin';
             req.session.save();
             res.redirect('/admin/home')
         }else{
             res.redirect('/admin/?error=Entered password or username is not correct');
         }
       } catch (error) {
        res.redirect('/error');
       }
    }
let sDate = new Date(2023,8,2);
let eDate = new Date();
module.exports.home = async (req,res)=>{
   try {
    const sellers = await Seller.find({status : 'approve'})
     if(req.cookies[req.session.email] || req.user){
         if(req.cookies[req.session.email] == req.session.password || req.user){
             if(req.user){
                 res.cookie(req.user.email, '1234');
                 req.session.password = '1234';
                 req.session.email = req.user.email;
                 req.session.login = true;
                 req.session.user = "admin";
                 req.session.save();
                 
             }
             const userCount = await User.countDocuments();
             const salesData = await Orders.find({
               ordered_on: { $gte: sDate, $lte: eDate },
             })
             .populate({
               path: 'items',
               populate: {
                 path: 'itemId', // Replace 'itemId' with the actual field name in the item schema
                 model: 'Item'
               },
             }).populate('customer')
             .populate('seller');
             const categories = [];
 
                 // Extract category data from orders
                 salesData.forEach((order) => {
                    
                  order.items.forEach(i=>{
                   if (i.itemId && i.itemId.category) {
                     categories.push(i.itemId.category);
                   }
                  })
                 });
                 
             let totalRevenue = salesData.reduce((total, sale) => total + sale.items.reduce((total, sale) => total + sale.amount, 0), 0);
             let orders = await Orders.find();
             res.render('pages/adminDashBoard',{userCount,categories,orders,sellers : sellers, user:'admin', login :true,file,salesData,totalRevenue,sDate,eDate});
         }else{
             res.redirect('/admin/?error=You are not an admin');
         }
     }else{
         res.redirect('/admin/?error=You successfully logged out');
     }
     
   } catch (error) {
    res.redirect('/error');
   }
}
    
module.exports.acceptSendMail =async (req,res)=>{
    try {
      const toEmail = 'jj4245888@gmail.com'//req.params['address'];
      const mailOptions = {
          from : 'foodmailerwagon@gmail.com',
          to : toEmail,
          subject : 'Approval of your company from foodwagon',
          html : '<p>Hai, </p><p> We are happy to add you as our business partner,Now you can login and kindly update your menu and relevent informations </p><p>with regards,</p><p> foodWagon</p>'
      }
  
      transporter.sendMail(mailOptions, (error, info)=>{
          if(error){
              res.redirect('/error');
              return;
          }else{
              res.status(200).send('Email send successfully');
          }
      });
      try {
          await Seller.findOneAndUpdate(
              { email: req.params['address'] },
            { $set: { status: 'approve' } },
            { new: true } // Return the updated restaurant document
          );
      
          
        } catch (error) {
          res.redirect('/error');
          return;
        }
    } catch (error) {
      res.redirect('/error');
    }
    };
    


module.exports.rejectSendMail = async (req,res)=>{
   try {
     const toEmail = 'jj4245888@gmail.com'//req.params['address'];
     const reason = req.params['reason'];
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
             res.status(200).send('Email send successfully');
         }
     });
     const result = await Seller.deleteOne({ email: req.params['address'] });   
   } catch (error) {
    res.redirect('/error');
    
   }
}
let users =null;
module.exports.adminAllUser = async(req,res)=>{
    users = await User.find();
    res.redirect('/admin/users');
}
module.exports.adminUser = async(req,res)=>{
   try {
     if(req.cookies[req.session.email] || req.user){
         if(req.cookies[req.session.email] == req.session.password || req.user){ 
             res.render('pages/adminUser',{users : users,login :true,user:'admin'});
         }
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.adminAllSeller = async(req,res)=>{
    try {
       sellers =await Seller.find();
       res.redirect('/admin/sellers')
    } catch (error) {
      res.redirect('/error');
    }
}
 let sellers = null;
module.exports.adminSeller = async(req,res)=>{
    try {
      const pendingSellers = await Seller.find({status : 'pending'})
      if(req.cookies['aishwarya4arun@gmail.com'] || req.user){
          if(req.cookies[req.session.email] == req.session.password || req.user){
              res.render('pages/adminSeller',{sellers : sellers,login :true,user:'admin',pendingSellers});
          }
      }
    } catch (error) {
      res.redirect('/error');
    }
}
search = ''
module.exports.adminMenu = async(req,res)=>{
   try {
     let error = req.query.error
     const id = req.params.id;
     if(req.cookies[req.session.email] ){
         if(req.cookies[req.session.email] == req.session.password){
             const menu = await Menu.find({ _id: id});
            
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
         res.redirect('/admin');
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.search = async (req,res)=>{
    const id = req.params.id;
    const searchTerm = req.query.q; // Get the value of the 'q' query parameter       
    try {
    const searchResults = await Item.find({ name: { $regex: searchTerm, $options: 'i' } }); // Perform a case-insensitive search
    search = searchResults;
    res.redirect(`/admin/menu/${id}`);
    } catch (error) {
      res.redirect('/error');
    }
}
module.exports.searchClose = async (req,res)=>{
    try {
      const id = req.params.id;
      search = "";
      res.redirect(`/admin/menu/${id}`);
    } catch (error) {
      res.redirect('/error');
    }
}
module.exports.block = async (req,res)=>{
    try {
      const id = req.params.id;
      const user = req.params.user;
      if(user == 'user'){
          const update = await User.updateOne({_id : id},{$set :{blocked : true}});
          res.redirect('/admin/allUser');
      }else if(user == 'seller'){
          const update = await Seller.updateOne({_id : id},{$set :{blocked : true}})
          res.redirect('/admin/allSeller');
      }else if(user == 'item'){
          const update = await Item.updateOne({_id : id},{$set :{blocked : true}})
          res.redirect('/admin/allProducts');
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
    } catch (error) {
      res.redirect('/error');
    }
    
}
module.exports.unblock = async (req,res)=>{
  try {
      const id = req.params.id;
      const user = req.params.user;
      if(user == 'user'){
          const update = await User.updateOne({_id : id},{$set :{blocked : false}})
          res.redirect('/admin/allUser');
      }else if(user == 'seller'){
          const update = await Seller.updateOne({_id : id},{$set :{blocked : false}})
          res.redirect('/admin/allSeller');
      }else if(user == 'item'){
          const update = await Item.updateOne({_id : id},{$set :{blocked : false}})
          res.redirect('/admin/allProducts');
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
         return element.name == user; 
      })
      return category.length != 0;
  });
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
  }
  } catch (error) {
    res.redirect('/error');
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
    }else if(user == 'item'){
        const searchResults = await Item.find({ name: { $regex: searchTerm, $options: 'i' } }); // Perform a case-insensitive search
        items = searchResults;
        res.redirect('/admin/products');
    }
    
    } catch (error) {
      res.redirect('/error');
    }
}
let items = null;
module.exports.allProducts = async (req,res)=>{
    try {
      items = await Item.find();
      res.redirect('/admin/products')
    } catch (error) {
      res.redirect('/error');
    }
}
module.exports.products = async (req,res)=>{
   try {
     if(req.session.login || req.user){
         res.render('pages/adminProducts',{login:true,user:'admin', items})
     }else{
         res.redirect('/users')
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.category = async (req,res)=>{
   try {
     
     let data = req.query.data;
     let error = req.query.error;
     if(req.session.login || req.user){
         res.render('pages/category',{user : 'admin',login :true, defaultData,data,error})
     }else{
         res.redirect('/users');
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.newFoodType = async (req,res)=>{
   try {
    console.log('foodType');
     if(req.session.login || req.user){
         const { foodType } = req.body;
         
         const existingFoodType = defaultData.menu.find((menu) => menu.name.toLowerCase() === foodType.toLowerCase());
       
         if (!existingFoodType) {
           // Create a new food type
           const newFoodType = {
             name: req.body.foodType,
             blocked: false,
             category: [],
           };
 
 
           // Add the new food type to the menu
           defaultData.menu.push(newFoodType);
       
           // Update the default data
           updateDefaultData(defaultData);
           const menuId = await Menu.find();
           menuId.forEach(async menuId => {
             await Menu.findByIdAndUpdate(
                 menuId,
                 {
                   $push: { 'menu': newFoodType},
                 },
                 { new: true, useFindAndModify: false }
               );
           });
       
           res.redirect('/admin/category/?data=New food type added successfully')
         } else {
           // Food type already exists, send a response indicating that
           res.redirect('/admin/category/?error=You entered food type already added.')
         }
     }else{
         res.redirect('/admin')
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.newCategory = async (req,res)=>{
  
  try {
      if(req.session.login || req.user){
          const { foodType,category } = req.body;
          console.log('category');
          const existingCategory = ()=>{          
            for (const menu of defaultData.menu) {
              if(menu.name === foodType ){
                for (const cat of menu.category) {
                  if (cat.name.toLowerCase() === category.toLowerCase()) {
                    return true;
                  }
                }
              }
            }
            return false;
          }

          if (!existingCategory()) {

            // Create a new food type
            const newCategory = {
              name: category,
              status : 'Active',
              blocked: false,
              items: [],
            };
  
  
            // Add the new food type to the menu
            for(let i=0;i<defaultData.menu.length;i++){
              if(defaultData.menu[i].name==foodType){
                  defaultData.menu[i].category.push(newCategory);
                  break;
              }
            }
            // Update the default data
            updateDefaultData(defaultData);
            const menuId = await Menu.find();
              await Menu.updateMany(
                  {
                    menu: {
                      $elemMatch: { name: foodType }
                    }
                  },
                  {
                    $push: {
                      'menu.$.category': newCategory
                    }
                  })
        
            res.redirect(`/admin/category/?data=New category ${category} added successfully`)
          } else {
            // Food type already exists, send a response indicating that
            res.redirect(`/admin/category/?error=You entered category ${category} already added.`)
          }
      }else{
          res.redirect('/admin')
      }
  } catch (error) {
    res.redirect('/error');
  }
}
module.exports.blockFoodType = async (req,res)=>{
   try {
     if(req.session.login || req.user ){
         const foodType = req.params.foodType;
         defaultData.menu.forEach(element=>{
            if( element.name == foodType){
             element.blocked = true;
            }
         });
         updateDefaultData(defaultData);
         await Item.updateMany(
             {
               foodType : foodType
             },
             {
               $set: {
                 'blocked': true
               }
             })
             res.redirect(`/admin/category/?data=${foodType} food type blocked`)
     }else{
         req.redirect('/admin/?error = Please login...')
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.unblockFoodType = async (req,res)=>{
   try {
     if(req.session.login || req.user ){
         const foodType = req.params.foodType;
         defaultData.menu.forEach(element=>{
            if( element.name == foodType){
             element.blocked = false;
            }
         });
         updateDefaultData(defaultData);
         await Item.updateMany(
             {
               foodType : foodType
             },
             {
               $set: {
                 'blocked': false
               }
             })
             res.redirect(`/admin/category/?data=${foodType} type foods are active now`)
     }else{
         req.redirect('/admin/?error = Please login...')
     } 
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.blockCategory = async (req,res)=>{
   try {
     if(req.session.login || req.user){
         const foodType = req.params.foodType;
         const category = req.params.category;
         
           // Add the new food type to the menu
           for(let i=0;i<defaultData.menu.length;i++){
             if(defaultData.menu[i].name==foodType){
                 defaultData.menu[i].category.forEach(element => {
                     if(element.name == category){
                         element.blocked = true;
                     }
                 });
                 break;
             }
           }
          
           updateDefaultData(defaultData);
           const menuId = await Menu.find();
             await Item.updateMany(
                 {
                   category : category
                 },
                 {
                   $set: {
                     'blocked': true
                   }
                 })
       
           res.redirect(`/admin/category/?data=Category ${category} blocked successfully`)
        
     }else{
         res.redirect('/admin/?error= Please login')
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.unblockCategory = async (req,res)=>{
    try {
      if(req.session.login || req.user){
          const foodType = req.params.foodType;
          const category = req.params.category;
          
            // Add the new food type to the menu
            for(let i=0;i<defaultData.menu.length;i++){
              if(defaultData.menu[i].name==foodType){
                  defaultData.menu[i].category.forEach(element => {
                      if(element.name == category){
                          element.blocked = false;
                      }
                  });
                  break;
              }
            }
            // Update the default data
            updateDefaultData(defaultData);
            const menuId = await Menu.find();
              await Item.updateMany(
                  {
                    category : category
                  },
                  {
                    $set: {
                      'blocked': false
                    }
                  })
        
            res.redirect(`/admin/category/?data=Category ${category} is active now`)
         
      }else{
          res.redirect('/admin/?error= Please login...')
      }
    } catch (error) {
      res.redirect('/error');
    }
}
module.exports.editCategory = async (req,res)=>{
   try {
     if(req.session.login || req.user){
         const foodType = req.params.foodType;
         const oldCategory = req.params.category;
         const newCategory = req.body.category
         
           // Add the new food type to the menu
           for(let i=0;i<defaultData.menu.length;i++){
             if(defaultData.menu[i].name==foodType){
                 defaultData.menu[i].category.forEach(element => {
                     if(element.name == oldCategory){
                         element.name = newCategory;
                     }
                 });
                 break;
             }
           }
           // Update the default data
           updateDefaultData(defaultData);
             await Item.updateMany(
                 {
                   category : oldCategory
                 },
                 {
                   $set: {
                     'category': newCategory
                   }
                 })
                 try {
                     // Find the seller's menu document by sellerId and foodType
                     const menu = await Menu.find({'menu.name': foodType });
             
                     // Find the index of the category in the menu's categories array
                     
                      menu.forEach(async (menu)=>{
                         
                         let categoryIndex;
                          menu.menu.forEach(menu=>{
                             
                             if(menu.name == foodType){
                                 
                                 categoryIndex=menu.category.findIndex(category => 
                         category.name == oldCategory)
                             }
                          })
                         if(categoryIndex != -1){
                             menu.menu[0].category[categoryIndex].name = newCategory;
                             await menu.save();
                         }
                     })
  
                 } catch (error) {
                  res.redirect('/error');
                  return;
                 }
             
           res.redirect(`/admin/category/?data=Category ${oldCategory} changed to ${newCategory} successfully.`)
        
     }else{
         res.redirect('/admin/?error= Please login...')
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.editFoodType = async (req,res)=>{
   try {
     if(req.session.login || req.user){
         const foodType = req.params.foodType;
         const newFoodType = req.body.foodType
         
           // Add the new food type to the menu
           for(let i=0;i<defaultData.menu.length;i++){
             if(defaultData.menu[i].name==foodType){
                 defaultData.menu[i].name = newFoodType;
                 break;
             }
           }
           // Update the default data
           updateDefaultData(defaultData);
             await Item.updateMany(
                 {
                   foodType : foodType
                 },
                 {
                   $set: {
                     'foodType': newFoodType
                   }
                 })
                 try {
                     // Find the seller's menu document by sellerId and foodType
                     const menu = await Menu.find({'menu.name': foodType });
             
                     // Find the index of the category in the menu's categories array
                     
                      menu.forEach(async (menu)=>{
                         
                          menu.menu.forEach(menu=>{
                             
                             if(menu.name == foodType){
                                 
                             menu.name = newFoodType;
                             }
                          })                       
                             await menu.save();                
                     })
  
                 } catch (error) {
                  res.redirect('/error');
                  return;
                 }
             
           res.redirect(`/admin/category/?data=Food type ${foodType} changed to ${newFoodType} successfully`)
        
     }else{
         res.redirect('/admin/?error= Please login...')
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.order = async(req,res)=>{
 try {
   if(req.session.user == 'admin'|| req.user){
     
       const orders = await Orders.find().populate({
           path: 'items',
           populate: {
             path: 'itemId', // Replace 'itemId' with the actual field name in the item schema
             model: 'Item'
           },
         }).populate('customer')
         .populate('seller').sort({ordered_on : -1});
        
       res.render('pages/adminOrder',{orders ,login : true, user : 'admin'})
   }else{
    
       res.redirect('/admin/?error=Please login first')
   }
 } catch (error) {
  res.redirect('/error');
 }
}
module.exports.coupon = async(req,res)=>{
 try {
   const coupons = await Coupons.find();
   res.render('pages/adminCoupon',{login : true, user : 'admin', coupons});
 } catch (error) {
  res.redirect('/error');
 }
}
module.exports.addCoupon = async(req,res)=>{
 try {
   const newCoupon = new Coupons(req.body);
   const savedCoupon = await newCoupon.save();
   res.redirect('/admin/coupon')
 } catch (error) {
  res.redirect('/error');
 }
};
module.exports.editCoupon = async(req,res)=>{
 try {
   const id = req.params.id;
   const update = await Coupons.findByIdAndUpdate({_id : id},{$set : req.body},{new: true});
   res.redirect('/admin/coupon');
 } catch (error) {
  res.redirect('/error');
 }
}
module.exports.deleteCoupon = async(req,res)=>{
 try {
   const id = req.params.id;
    await Coupons.deleteOne({ _id: id});
   res.json({data : '/admin/coupon'})
 } catch (error) {
  res.redirect('/error');
 }
}
let file;
module.exports.salesPdf = async (req, res) => {
  try {
    const start = req.body.start_date;
    const end = req.body.end_date;
    const salesData = await Orders.find({
      ordered_on: { $gte: start, $lte: end },
    })
    .populate({
      path: 'items',
      populate: {
        path: 'itemId', // Replace 'itemId' with the actual field name in the item schema
        model: 'Item'
      },
    }).populate('customer')
    .populate('seller')
    let totalRevenue = salesData.reduce((total, sale) => total + sale.items.reduce((total, sale) => total + sale.amount, 0), 0);
    let orderData = salesData;
  
    // Render the EJS template with data
    ejs.renderFile('views/pages/adminReport.ejs', { orderData, totalRevenue }, async (err, html) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error rendering EJS template');
      }
      let filename = `adminReport_${uuidv4()}.pdf`
      const pdfFilePath =   path.join(__dirname, '../public/pdf_reports', filename);
      file = `/pdf_reports/${filename}`;
     async function getChromePath() {
        try {
          const chrome = await chromeLauncher.launch();
          console.log('Chrome Executable Path:', chrome.executablePath);
          await chrome.kill();
          return chrome.executablePath;
        } catch (error) {
          console.error('Error getting Chrome path:', error);
          return null;
        }
      }

      
      try {
        getChromePath()
  .then(async(chromePath) => {
    // Use chromePath as needed in your application
 
        const browser = await puppeteer.launch({  headless: false,
        executablePath: chromePath, });
        const page = await browser.newPage();
  
        // Set the HTML content of the page
        await page.setContent(html);
  
        // Generate PDF from the page
        await page.pdf({
          path: pdfFilePath,
          format: 'A4',
          margin: {
            top: '20px',
            bottom: '20px',
            left: '20px',
            right: '20px',
          },
        });
  
        await browser.close();
      })
      .catch((error) => {
        // Handle the error
      });
      } catch (error) {
        console.log(error,'sssssssss');
        res.redirect('/error');
        return;
      } 
      res.redirect('/admin/home');
    });
  } catch (error) {
    res.redirect('/error');
  }
};


module.exports.changeDate = (req,res)=>{
  try {
    const date = req.params.date;
    if(date == 'start'){
      sDate = new Date(req.body.sDate);
    }else{
      eDate =  new Date(req.body.eDate);
    }
    res.redirect('/admin/home');
  } catch (error) {
    res.redirect('/error');
  }
}