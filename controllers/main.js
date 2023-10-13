const Item = require('../models/items');
const Seller = require('../models/seller');
const User = require('../models/users');

module.exports.main = (req,res)=>{
   try {
     if(req.session.login){
         res.redirect('/users/home')
     }else{
         res.render('pages/userHome',{login:false,users : null});
     }
   } catch (error) {
    res.redirect('/error');
   }
}
let items =[];
let set =1;
let page = 1;
let item=[];
 
 
 async function fn(){
  items =await  Item.find({blocked : false})
 }
 fn();
module.exports.menu =async (req,res)=>{
   try {
     let sellers = [];
     let foodtype = [];
     let category = [];
   await  Item.distinct('seller')
   .then(async (sellerIds) => {
     try {
       sellers = await Item.find({blocked : false, seller: { $in: sellerIds } }, 'seller -_id').populate('seller');
       const sellerNames = sellers.map((item) => item.seller.name);
       sellers = [...new Set(sellerNames)];
     } catch (err) {
      res.redirect('/error');
      return;
     }
   })
   .catch((err) => {
    res.redirect('/error');
    return;
   });
  await Item.distinct('foodType')
   .then(async (foodTypes) => {
     try {
         foodtype = foodTypes;
       // Use the 'foodTypes' array as needed
     } catch (err) {
      res.redirect('/error');
      return
       // Handle any errors here
     }
   })
   .catch((err) => {
    res.redirect('/error');
    return;
     // Handle the error when getting distinct foodTypes
   });
  await Item.distinct('category')
   .then(async (categories) => {
     try {      
       category = categories;
     } catch (err) {
      res.redirect('/error');
      return;
     }
   })
   .catch((err) => {
    res.redirect('/error');
    return;
   });
   let length = items.length;
   
    item = items.slice((page-1)*4,((page-1)*4)+4);
     if(req.session.login || req.user){
       let users = await User.findById(req.session.userId);
       wish= users.wishlist;
          res.render('pages/menu',{length,set,page,users,item:item,login:true,sellers:sellers,foodtype:foodtype,category:category,wish});
     }else{
         res.render('pages/menu',{length,set,page,users : null,item:item,login:false,sellers:sellers,foodtype:foodtype,category:category});
     }
   } catch (error) {
    res.redirect('/error');
   }
}

module.exports.filter = async (req,res)=>{
   try {
     let filterHead = req.params.filterHead;
     let filter = req.params.filter;
     
     
     if(filterHead == 'sellers'){
         let seller = await Seller.findOne({ name: filter })
         items = items.filter(item => item.seller.toString() == seller._id.toString());
        
     }else if( filterHead == 'search'){
         const searchResults = items.filter(item => item.name.includes(filter)); 
         items = searchResults;
   }else if( filterHead == 'price'){
         if(filter == '1'){
             items = items.filter(i=>!i.blocked && i.price>=0&&i.price<500)
             // item = item.slice((page-1)*4);
             // item = item.slice(0,4);
             //await Item.find({blocked : false, price: { $gt: 0, $lt: 500 } }).skip((page-1)*4).limit(4)
         }else if(filter == '2'){
           items = items.filter(i=>!i.blocked && i.price>=500&&i.price<1000)
             // item = item.slice((page-1)*4);
             // item = item.slice(0,4);
           //  item = await Item.find({blocked : false, price: { $gte: 500, $lt: 1000 } }).skip((page-1)*4).limit(4)
         }else {
           items = items.filter(i=>!i.blocked && i.price>=1000&&i.price<5000)
             // item = item.slice((page-1)*4);
             // item = item.slice(0,4);
            // item = await Item.find({blocked : false, price: { $gte: 1000, $lt: 5000 } }).skip((page-1)*4).limit(4)
         }
   
   }else if(filterHead == 'foodType' || filterHead == 'category'){
     items = items.filter(i=>!i.blocked && i[filterHead]==filter)
     }else if( filterHead == 'pagination'){
       if(filter == 'front'){
           set = set+1;
           page = ((set-1)*5)+1
       }else if(filter == 'back'){
           set = set-1;
           page = ((set-1)*5)+1
          
       }else {
           page = filter;
          
       }
   }else if(filterHead == 'sort'){
       if(filter == '1'){
         for(let i=0;i<items.length-1;i++){
           for(let j=i+1;j<items.length;j++){
             if(items[i].price>items[j].price){
               let temp = items[i];
               items[i]=items[j];
               items[j]=temp;
             }
           }
         }
         
       }else{
         for(let i=0;i<items.length-1;i++){
           for(let j=i+1;j<items.length;j++){
             if(items[i].price<items[j].price){
               let temp = items[i];
               items[i]=items[j];
               items[j]=temp;
             }
           }
         }
         //item = await Item.find({blocked : false}).sort({ price: -1 }).skip((page-1)*4).limit(4)
       }
   }else{
     items = await Item.find({blocked : false}) //.skip((page-1)*4).limit(4);
     }
     res.redirect('/menu');
   } catch (error) {
    res.redirect('/error');
   }
}