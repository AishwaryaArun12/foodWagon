const Seller = require('../models/seller');
const Menu = require('../models/menu');
const Item = require('../models/items');
const Jimp = require('jimp');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const Orders = require('../models/orders');
const Coupon = require('../models/coupon');
const User = require('../models/users');
const { defaultData, updateDefaultData } = require('../models/defaultMenu');
const { orderDetails } = require('./user');
const puppeteer = require('puppeteer-core');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const ejs = require('ejs');
const { error } = require('console');
const chromeLauncher = require('chrome-launcher');

module.exports.login = (req,res)=>{
    try {
      const error = req.query;
      req.session.user = 'sellers';
      if(req.cookies[req.session.email]){
          if(req.cookies[req.session.email] == req.session.password){
              res.redirect('/sellers/home');
          }else{
              res.render('pages/login',{user : 'sellers',error: error.error,user: 'sellers',login : false});
          }
      }else{
          res.render('pages/login',{user : 'sellers',error: error.error,user: 'sellers',login : false});
      } 
    } catch (error) {
      res.redirect('/error');
    }
}
module.exports.signUp = (req,res)=>{
   try {
     if(req.cookies[req.session.email]){
         if(req.cookies[req.session.email] == req.session.password){
             res.redirect('/sellers/home');
         }else{
             res.render('pages/signUp',{user : 'sellers',error: '',login:false});
         }
     }else{
         res.render('pages/signUp',{user : 'sellers',error: '', login: false});
     }
   } catch (error) {
    res.redirect('/error');
   }
}

module.exports.newSeller = async(req,res)=>{
    try {
      const seller =await Seller.findOne({email : req.body.email});
      if(seller){
          res.redirect('/sellers/?error=You already registered. Please login')
      }else{
          bcrypt.hash(req.body.password, saltRounds,async (err, hash) => {
              if (err) {
                res.redirect('/error');
                return;
              } else {
                req.body.password = hash;
                  const newSeller = new Seller(req.body);
          try {
           const savedSeller = await newSeller.save();
           const newMenu = new Menu(defaultData);
           const savedMenu = await newMenu.save();
           savedSeller.menu = savedMenu._id;
           await savedSeller.save();
           res.redirect('/sellers')
          } catch (error) {
            res.redirect('/error');
            return;
          };
              }})
          
      }
    } catch (error) {
      res.redirect('/error');
    }
};

module.exports.loginSeller = async(req,res)=>{
    let seller = await Seller.findOne({email : req.body.email});
   try {
     if(seller){
         bcrypt.compare(req.body.password, seller.password,async (err, result) => {
             if (err) {
              
             } else if (result) {
                 if(seller.status == 'approve'){
                     res.cookie(req.body.email, req.body.password);
                     req.session.password = req.body.password;
                     req.session.email = req.body.email;
                     req.session.sellerId = `${seller._id}`;
                     req.session.login = true;
                     req.session.user = 'sellerHome';
                     req.session.menuId = `${seller.menu}`
                     req.session.save();
                     res.redirect('/sellers/home')
                 return;
                 }else if(seller.status == 'pending'){
                     res.redirect('/sellers/?error=Your request is in pending stage');
                     return;
                 }
                 
             }else{
                 res.redirect('/sellers/?error=Password not matching')
                 return;
             }
         })
         
     }else if(!seller){
         res.redirect('/sellers/?error=Your are not registered. Please register')
         return;
     }
   } catch (error) {
    res.redirect('/error');
   }
    
};
let sDate = new Date(2023,8,2);
let eDate = new Date();
let file;
module.exports.home = async(req,res)=>{
   try {
     let error = req.query.error
    
     if(req.cookies[req.session.email]){
         if(req.cookies[req.session.email] == req.session.password){
           const salesData = await Orders.find({
             ordered_on: { $gte: sDate, $lte: eDate },seller : req.session.sellerId
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
           res.render('pages/sellerDashboard',{categories,orders, user:'sellers', login :true,file,salesData,totalRevenue,sDate,eDate});
         }else{
             res.redirect('/sellers');
         }
     }else{
         res.redirect('/sellers');
     }
   } catch (error) {
    res.redirect('/error');
   }
    }
    module.exports.addFoodType = async (req, res) => {
        const newFoodType = req.body.newFoodType;
        const menu = await Menu.findOne({ _id: req.session.menuId });
        try {
            if (!menu.menu.find(foodType => foodType.name === newFoodType)) {
                
                menu.menu.push({ name: newFoodType, category: [] });
                await menu.save();
                
            }
        } catch (error) {
          res.redirect('/error');
        }
    }
   
    let videoFile = '';
    module.exports.addVideo = (req,res) => {
       try {
         videoFile = req.file.filename;
       } catch (error) {
        res.redirect('/error',{error:error.error});
       }
    }
    module.exports.addItem = async (req, res) => {
     try {
         let { foodType, category, itemName, description, discount, price, qty, tasteOrcapacity, stock } = req.body;
         const imageFileNames = req.files.map(file => `/img/${file.filename}`);
         try {
          const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
          const fileExtensions = req.files.map(file => path.extname(file.originalname).toLowerCase())
          fileExtensions.forEach(fileExtension=>{
            if (!allowedImageExtensions.includes(fileExtension)) {
              throw new error('image validation failed');
            }
          })
             
        } catch (error) {
         res.redirect('/sellers/products?error=Image is not valid. Item not saved');
         return;
        }
         const newItem = new Item({
             name: itemName,
             images: imageFileNames,
             video : videoFile,
             discount: discount,
             description : description,
             price: price,
             qty : qty,
             tasteOrcapacity : tasteOrcapacity,
             stock: stock,
             seller : req.session.sellerId,
             foodType : foodType,
             category : category
         });
         
         category = category.trim().toLowerCase();
         
         const savedItem = await newItem.save();
         videoBuffer = '';
         const menuQuery = { _id: req.session.menuId };
         const categoryQuery = { 'menu.category.name': category };
         
         const menuDocument = await Menu.findOne({
             _id: req.session.menuId,
             'menu.name': foodType
         });
         
         if (menuDocument) {
             const categoryIndex = menuDocument.menu.findIndex(cat => cat.name === foodType);
         
             if (categoryIndex !== -1) {
                 const categoryDocument = menuDocument.menu[categoryIndex]?.category.find(cat => cat.name === category);
         
                 if (categoryDocument) {
                     // Category exists, push savedItem._id into items array
                     categoryDocument.items.push({ item: savedItem._id });
                     await menuDocument.save();
                 } else {
                     // Category doesn't exist, create a new category
                     menuDocument.menu[categoryIndex].category.push({
                         name: category,
                         items: [{ item: savedItem._id }]
                     });
                     await menuDocument.save();
                 }
             } else {
                 // Food type doesn't exist, handle accordingly
             }
         }
     
         res.redirect('../sellers/products');
     } catch (error) {
      console.log(error.message);
      res.redirect('/error',{error:error.error});
     }
    }
    let search = "";
    module.exports.search = async (req,res)=>{
        const searchTerm = req.query.q; // Get the value of the 'q' query parameter       
        try {
        const searchResults = await Item.find({ name: { $regex: searchTerm, $options: 'i' } }); // Perform a case-insensitive search
        search = searchResults;
        res.redirect('../sellers/home')
        } catch (error) {
          res.redirect('/error');
        }
    }
    module.exports.searchClose = async (req,res)=>{
        search = "";
        res.redirect('/../sellers/home');
    }
    module.exports.product = async (req,res)=>{
       try {
         let id = req.params.id;
         let products='';
         if(id != 'style.css'){
              try {
                 products = await Item.findById(id)
              } catch (error) {
                 console.error(error)
              }
         }
         res.render('pages/sellerProduct',{products, user : 'sellers',login : true});
       } catch (error) {
        res.redirect('/error');
       }
    }
    module.exports.block = async(req,res)=>{
      try {
          const id = req.params.id;
          const user = req.params.user;
          if(user == 'item'){
              const update = await Item.updateOne({_id : id},{$set :{blocked : true}})
              res.redirect('/sellers/products');
          }else {
              const matchingDocument = await Menu.findOne({
                  _id: id
                });
                
                const menu = matchingDocument.menu;
        
        // Find the index of the menu element containing the matching category
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
       await Menu.updateOne(
          { _id: id },
          updateQuery,
          {
            arrayFilters,
            upsert: false
          }
        );
              res.redirect(`/sellers/home`);
          }
          
      } catch (error) {
        res.redirect('/error');
      }
    }
    module.exports.unblock = async (req,res)=>{
     try {
         const id = req.params.id;
         const user = req.params.user;
         if(user == 'item'){
             await Item.updateOne({_id : id},{$set :{blocked : false}})
             res.redirect('/sellers/products');
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
       await Menu.updateOne(
         { _id: id },
         updateQuery,
         {
           arrayFilters,
           upsert: false
         }
       );
     
               res.redirect(`/sellers/home`);
     }
     } catch (error) {
      res.redirect('/error');
     }
    }
    module.exports.editProduct = async(req,res)=>{
       try {
         if(req.session.login){
             const id = req.params.id;
             const item = await Item.findById(id);
             res.render('pages/sellerProductEdit',{login : true, user : 'sellers',products:item})
         }
       } catch (error) {
        res.redirect('/error');
       }
    }
    module.exports.itemEdit = async(req,res)=>{
      try {
          if(req.session.login){
              const id = req.params.id;
              let updatedItem= await  Item.findOneAndUpdate(
                  { _id: id }, // Filter the user by ID
                  { $set: req.body }, // Set the new name and email
                  { new: true })
                  if(req.session.user == 'sellerHome'){
                      res.redirect(`/sellers/product/${id}`);   
                  }else{
                      res.redirect(`/admin/allProducts`)
                  }
                  
          }else{
              res.redirect('/sellers/?error=Please login..')
          }
      } catch (error) {
        res.redirect('/error');
      }
    }
    module.exports.editImage = async(req,res)=>{
      
       try {
         if(req.session.login){
             const id = req.params.id;
             const i = req.params.i;
             const imagePath = `img/${req.file.filename}`;
             const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];

             try {
              const fileExtension = path.extname(req.file.originalname).toLowerCase();
              if (!allowedImageExtensions.includes(fileExtension)) {
                throw new error('image validation failed');
              }
 
             } catch (error) {
                if(req.session.user == 'sellerHome'){
                 res.redirect(`/sellers/product/${id}/?error=image validation faliled`);   
             }else{
                 res.redirect(`/admin/allProducts/?error=image validation failed`)
             }
              return;  
             }
             const item = await Item.findById(id);
             item.images[i] = imagePath;
             await item.save();
            
               if(req.session.user == 'sellerHome'){
                 res.redirect(`/sellers/product/${id}`);   
             }else{
                 res.redirect(`/admin/allProducts`)
             }
         }else{
             res.redirect('/sellers/?error=Please login')
         }
       } catch (error) {
        console.log(error.message);
        res.redirect('/error');
       }
    }
    module.exports.deleteImage = async(req,res)=>{
        const id = req.params.id;
        const i = req.params.i;
        try {
            let updatedItem = await Item.updateOne({ _id: id }, { $unset: { [`images.${i}`]: 1 } });
             updatedItem = await Item.updateOne({ _id: id }, { $pull: { images: null } });
            if (updatedItem) {
             
            } else {
              console.error('Failed to delete image: Image not found');
            }
          } catch (error) {
            res.redirect('/error');
          }
          if(req.session.user == 'sellerHome'){
            res.json({data:`/sellers/product/${id}`});   
        }else{
            res.json({data : `/admin/allProducts`});
        }
    }
    module.exports.editVideo = async(req,res)=>{
       try {
         if(req.session.login){
             const id = req.params.id;
             const videoFile  =  `/img/${req.file.filename}`;
               await Item.findOneAndUpdate(
                 { _id: id },
                 { $set: { video: videoFile } },
                 { new: true }
               );
               if(req.session.user == 'sellerHome'){
                 res.redirect(`/sellers/product/${id}`);   
             }else{
                 res.redirect(`/admin/allProducts`)
             }
         }else{
             res.redirect('/sellers/?error=Please login')
         }
       } catch (error) {
        res.redirect('/error');
       }
    }
    module.exports.addImage = async(req,res)=>{
        try {
          if(req.session.login){
              const id = req.params.id;
              const imageFile  =  `img/${req.file.filename}`;
              const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
              try {
                const fileExtension = path.extname(req.file.originalname).toLowerCase();
                if (!allowedImageExtensions.includes(fileExtension)) {
                  throw new error('image validation failed');
                }
  
              } catch (error) {
                console.log(error.message);
                res.redirect('/error');
                 return;
              }
                 await Item.findOneAndUpdate(
                  { _id: id },
                  { $push: { [`images`]: imageFile } },
                  { new: true }
                );
                if(req.session.user == 'sellerHome'){
                  res.redirect(`/sellers/product/${id}`);   
              }else{
                  res.redirect(`/admin/allProducts`)
              }
          }else{
              res.redirect('/sellers/?error=Please login')
          }
        } catch (error) {
          console.log(error.message);
          res.redirect('/error');
        }
    }
    module.exports.profile = async(req,res)=>{
       try {
         if(req.session.login){
             const id = req.session.sellerId;
             const userData = await Seller.findById(id);
             res.render('pages/sellerProfile',{user : 'sellers',login: true,userData});
         }else{
             res.redirect('/sellers/?error=Please login');
         }
       } catch (error) {
        res.redirect('/error');
       }
    }
    module.exports.editProfile = async(req,res)=>{
     try {
         const id = req.session.sellerId;
         if(req.session.login ){
             const name = req.body.name;
             const email = req.body.email;
             const location = req.body.location
             if(!req.body.password){
               let user= await  Seller.findOneAndUpdate(
                     { _id: id }, // Filter the user by ID
                     { $set: { name: name, email: email, location: location} }, // Set the new name and email
                     { new: true })
                     res.redirect('/sellers/profile')
             }else{
                 let password = req.body.password
                 bcrypt.hash(password, 10,async (err, hash) => {
                     if (err) {
                      res.redirect('/error');
                      return;
                     } else {
                       let user= await  Seller.findOneAndUpdate(
                         { _id: id }, // Filter the user by ID
                         { $set: { name: name, email: email, password : hash, location :location } }, // Set the new name and email
                         { new: true }) 
                         res.redirect('/sellers/profile')
                                       }
             })
         }
     }
     } catch (error) {
      res.redirect('/error');
     }
}
module.exports.order = async(req,res)=>{
   try {
     if(req.session.login){
         const id = req.session.sellerId;
         const orders = await Orders.find({seller : id}).populate({
             path: 'items',
             populate: {
               path: 'itemId', // Replace 'itemId' with the actual field name in the item schema
               model: 'Item'
             },
           }).populate('customer').sort({ordered_on : -1});
         
         res.render('pages/sellerOrder',{orders,login : true, user : 'sellers'})
     }else{
         res.redirect('/sellers/?error=Please login first')
     }
   } catch (error) {
    res.redirect('/error');
   }
}
module.exports.orderAction = async (req,res)=>{
    try {
      if(req.session.login){
          const action = req.body.action;
          const id = req.params.id;
          if(req.body.itemId){
              const itemId = req.body.itemId;
              
                const order = await Orders.findById(id);
                if(order.couponId){
                  let coupon = await Coupon.findById(order.couponId)
                  
                  order.items.forEach(async (i) => {
                      if(i.itemId == itemId){
                          if(action == 'Cancelled' || action == 'Returned'){
                            if(i.status == 'Return requested' || i.status == 'Cancel requested'){
                              if(coupon.min<=(order.amount - i.amount)){
                                try {
                                    // 1. Find the user by their user ID
                                    const user = await User.findById(order.customer);
                                    const seller = await Seller.findById(req.session.sellerId);
                                    if (!user) {
                                      console.error('User not found');
  
                                      return; // Handle the case where the user is not found
                                    }
                                    const item = await Item.findById(i.itemId);
                                    let amount = order.amount >3000 ? i.amount * 100/110 : i.amount * 100/105
                                    // 2. Calculate the refund amount and create a wallet transaction record
                                    const refundTransaction = {
                                      amount: Math.round(amount),
                                      description : 'Credited for Order return',
                                      sellerName: seller.name, // Replace with the actual seller name
                                      orderDetails: [
                                        {
                                          name: item.name, // Replace with the actual order name
                                          amount: i.amount,
                                        },
                                      ],
                                      date: new Date(),
                                    };
                                    let walletBalance = user.walletBalance+i.amount;
                                    await User.findOneAndUpdate({_id : order.customer},{$set : {walletBalance : walletBalance}},{new : true});
                                    // 3. Update the user's wallet balance and transaction history
                                    user.wallet.push(refundTransaction);
                                    await user.save();
                            
                                    // Wallet updated successfully
                                  } catch (error) {
                                    console.error('Error updating user wallet:', error);
                                    // Handle the error appropriately
                                  }
                                }else{
                                    try {
                                        // 1. Find the user by their user ID
                                        const user = await User.findById(order.customer);
                                        const seller = await Seller.findById(req.session.sellerId);
                                        if (!user) {
                                          console.error('User not found');
                                          return; // Handle the case where the user is not found
                                        }
                                        const item = await Item.findById(i.itemId);
                                        let amount = order.amount >3000 ? i.amount * 100/110 : i.amount * 100/105
                                        // 2. Calculate the refund amount and create a wallet transaction record
                                        const refundTransaction = {
                                          amount: i.amount-(order.amount*((100+order.couponDiscount)/100))-order.amount,
                                          description : 'Credited for Order return',
                                          sellerName: seller.name, // Replace with the actual seller name
                                          orderDetails: [
                                            {
                                              name: item.name, // Replace with the actual order name
                                              amount: Math.round(amount)+1,
                                            },
                                          ],
                                          date: new Date(),
                                        };
                                        let walletBalance = user.walletBalance+i.amount;
                                    await User.findOneAndUpdate({_id : order.customer},{$set : {walletBalance : walletBalance}},{new : true});
                                    
                                        // 3. Update the user's wallet balance and transaction history
                                        user.wallet.push(refundTransaction);
                                        await user.save();
                                    
                                        // Wallet updated successfully
                                      } catch (error) {
                                        console.error('Error updating user wallet:', error);
                                        // Handle the error appropriately
                                      }
                                }
                            }
                          }
                          }
                      })
                  }else{
                  
                      order.items.forEach(async (i) => {
                          if(i.itemId == itemId){
                                  try {
                                      // 1. Find the user by their user ID
                                      const user = await User.findById(order.customer);
                                      const seller = await Seller.findById(req.session.sellerId);
                                      if (!user) {
                                        console.error('User not found');
                                        return; // Handle the case where the user is not found
                                      }
                                      const item = await Item.findById(i.itemId);
                                      let amount = order.amount >3000 ? i.amount * 100/110 : i.amount * 100/105
                                      // 2. Calculate the refund amount and create a wallet transaction record
                                      const refundTransaction = {
                                        amount: i.amount,
                                        sellerName: seller.name, // Replace with the actual seller name
                                        description : 'Credited for Order return',
                                        orderDetails: [
                                          {
                                            name: item.name, // Replace with the actual order name
                                            amount: Math.round(amount),
                                          },
                                        ],
                                        date: new Date(),
                                      };
                                  
                                      // 3. Update the user's wallet balance and transaction history
                                      user.wallet.push(refundTransaction);
                                      await user.save();
                                      let walletBalance = user.walletBalance+i.amount;
                                      await User.findOneAndUpdate({_id : order.customer},{$set : {walletBalance : walletBalance}},{new : true});
                                    
                                      // Wallet updated successfully
                                    } catch (error) {
                                      console.error('Error updating user wallet:', error);
                                      // Handle the error appropriately
                                    }
                                  
                  }
              })
              }
              const update = await Orders.findOneAndUpdate(
                { _id: id, "items.itemId": itemId },
                { $set: { "items.$.status": action } },{new : true}
              );
            }else{
              
                const order = await Orders.findById(id);
                              try {
                                  // 1. Find the user by their user ID
                                  const user = await User.findById(order.customer);
                                  const seller = await Seller.findById(req.session.sellerId);
                                  if (!user) {
                                    console.error('User not found');
                                    return; // Handle the case where the user is not found
                                  }
                                  if(action == 'Cancelled' || action == 'Returned'){
                                    const orderItemDetails = await Promise.all(
                                      order.items.map(async (i) => {
                                        if (
                                          i.status != 'Cancelled' &&
                                          i.status != 'Returned' 
                                        ) {
                                          const item = await Item.findById(i.itemId);
                                          return { name: item.name, amount: i.amount };
                                        }
                                        return null; // If the condition is not met, return null
                                      })
                                    );
                                  let amount = order.amount >3000 ? order.amount*100/110 : order.amount*100/105
                                  // 2. Calculate the refund amount and create a wallet transaction record
                                  const refundTransaction = {
                                      amount: Math.round(amount),
                                      description : 'Credited for Order return',
                                      sellerName: seller.name,
                                      orderDetails: orderItemDetails.filter((item) => item !== null), // Remove null values
                                      date: new Date(),
                                    };
                              
                                  // 3. Update the user's wallet balance and transaction history
                                  user.wallet.push(refundTransaction);
                                  await user.save();
                              
                                  let walletBalance = user.walletBalance+amount;
                                    await User.findOneAndUpdate({_id : order.customer},{$set : {walletBalance : walletBalance}},{new : true});
  
                                  }                                
                                  const updatedOrder = await Orders.findOneAndUpdate(
                                      { _id: id },
                                      {
                                        $set: {
                                          'items.$[elem].status': action, status : action,
                                        }
                                       
                                      },
                                      {
                                        arrayFilters: [{ 'elem.status': { $nin: ['Cancelled', 'Returned'] } }],
                                        new: true, // Return the updated document
                                      }
                                    );
                                  // Wallet updated successfully
                                } catch (error) {
                                  console.error('Error updating user wallet:', error);
                                  // Handle the error appropriately
                                }
                                
          }
          const order = await Orders.findById(id);
          if(order.status == 'Delivered'){
              if(order.mode == 'Cash on delevery'){
                  const updated = await Orders.findOneAndUpdate(
                      { _id: id },
                      {
                        $set: {
                          paymentStatus : 'Paid',
                        }
                       
                      },
                      {
                        new: true, // Return the updated document
                      }
                    );
              }
          }
          let flag = true;
          order.items.forEach(i=>{
            if(i.status != 'Returned' && i.status != 'Cancelled' && i.status != 'Cancel requested' && i.status != 'Return requested'){
              flag = false;
            }
          })
          if(flag){
            await Orders.findByIdAndUpdate(id,{status : order.status == 'Delivered'?'Returned' : 'Cancelled',reason : order.items[0].reason});
          }
          
              res.redirect('/sellers/orders');
            
      }else{
          res.redirect('/sellers/?error=Please login first')
      }
    } catch (error) {
      res.redirect('/error');
    }
}
module.exports.cancelOrder = async (req,res)=>{
  try {
      const id = req.params.id;
      const orderDetail = await Orders.findById(id).populate({
        path: 'items',
        populate: {
          path: 'itemId', // Replace 'itemId' with the actual field name in the item schema
          model: 'Item'
        },
      }).populate('seller');
      const customer = await User.findById(orderDetail.customer);
      if(req.session.user == 'sellerHome'){
           let update = await Orders.findOneAndUpdate({ _id: id },
              {
                $set: {
                  'items.$[elem].status': 'Cancelled by seller', status : 'Cancelled by seller',
                }
               
              },
              {
                arrayFilters: [{ 'elem.status': { $nin: ['Cancelled', 'Returned'] } }],
                new: true, // Return the updated document
              })
              if(update && update.paymentStatus == 'Paid'){
                let detail = orderDetail.items.map(i=>{return {name : i.itemId.name, amount : i.amount}})
                let wallet = {
                  amount : orderDetail.amount,
                  sellerName : orderDetail.seller.name,
                  description : 'Credited for cancelled order',
                  date : new Date(),
                  orderDetails : detail
                }
                let newBalance = orderDetail.amount + customer.walletBalance;
                await User.findOneAndUpdate({_id : orderDetails.customer},{$set : {walletBalance : newBalance},$push : {wallet : wallet}},{new : true})
                  res.json({'data' : '/sellers/orders'})
              }
      }else{
           let update = await Orders.findOneAndUpdate({ _id: id },
              {
                $set: {
                  'items.$[elem].status': 'Cancelled by admin', status : 'Cancelled by admin',
                }
               
              },
              {
                arrayFilters: [{ 'elem.status': { $nin: ['Cancelled', 'Returned'] } }],
                new: true, // Return the updated document
              })
              if(update && update.paymentStatus == 'Paid'){
                let detail = orderDetail.items.map(i=>{return {name : i.itemId.name, amount : i.amount}})
                let wallet = {
                  amount : orderDetail.amount,
                  sellerName : orderDetail.seller.name,
                  description : 'Credited for cancelled order',
                  date : new Date(),
                  orderDetails : detail
                }
                let newBalance = orderDetail.amount + customer.walletBalance;
                await User.findOneAndUpdate({_id : orderDetails.customer},{$set : {walletBalance : newBalance},$push : {wallet : wallet}},{new : true})
                  res.json({'data' : '/admin/orders'})
              }
      }
  } catch (error) {
    res.redirect('/error');
  }
    
}
module.exports.products = async(req,res)=>{
 try {
   const error = req.query.error;
   const menu = await Menu.find({ _id: req.session.menuId });
   const menus = await Menu.findById(req.session.menuId).populate({
       path: 'menu.category.items.item',
       model: 'Item'  // Make sure the model name matches the one you defined for items
     });
   const category = menu[0].menu.map(i => {
       return i.category.map(i=>i.name);
     });
     const foodType = menu[0].menu.map(foodType =>foodType.name);
     res.render('pages/sellerHome',{error,foodType : foodType,category, menus : menus, search :search,user:'sellers', login:true});
 } catch (error) {
  res.redirect('/error');
 }
}
module.exports.salesPdf = async (req, res) => {
 try {
   const start = req.body.start_date;
   const end = req.body.end_date;
   const salesData = await Orders.find({
     ordered_on: { $gte: start, $lte: end },seller : req.session.sellerId
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
     let filename = `sellersReport_${uuidv4()}.pdf`
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
     res.redirect('/sellers/home');
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
   res.redirect('/sellers/home');
 } catch (error) {
  res.redirect('/error');
 }
}