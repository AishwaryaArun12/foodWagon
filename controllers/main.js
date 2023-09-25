const Item = require('../models/items');
const Seller = require('../models/seller');
const User = require('../models/users');

module.exports.main = (req,res)=>{
    if(req.session.login){
        res.redirect('/users/home')
    }else{
        res.render('pages/userHome',{login:false});
    }
}
let item ='';

 
 let set = 1;
 let page = 1;
 async function fn(){
  item =await  Item.find({blocked : false},).skip((page-1)*4).limit(4)
 }
 fn();
module.exports.menu =async (req,res)=>{
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
      console.error(err);
    }
  })
  .catch((err) => {
    console.error(err);
  });
 await Item.distinct('foodType')
  .then(async (foodTypes) => {
    try {
        foodtype = foodTypes;
      // Use the 'foodTypes' array as needed
    } catch (err) {
      console.error(err);
      // Handle any errors here
    }
  })
  .catch((err) => {
    console.error(err);
    // Handle the error when getting distinct foodTypes
  });
 await Item.distinct('category')
  .then(async (categories) => {
    try {      
      category = categories;
    } catch (err) {
      console.error(err);
    }
  })
  .catch((err) => {
    console.error(err);
  });
  
    if(req.session.login || req.user){
         res.render('pages/menu',{item:item,login:true,sellers:sellers,foodtype:foodtype,category:category,set,page});
    }else{
        res.render('pages/menu',{item:item,login:false,sellers:sellers,foodtype:foodtype,category:category,set,page});
    }
}
// module.exports.edit = async (req,res)=>{
//     if(req.session.login || req.session.user == 'sellerHome'){
//         let user = req.params.user;
//         let userData = ''
//         const id = req.params.id;
//         if(user == 'Item'){
//             userData = await Item.findById(id);
//         }else if(user == 'Seller'){
//             userData = await Seller.findById(id);
//         }else if(user == 'User'){
//             userData = await User.findById(id);
//         }
//         res.render('pages/edit',{user,userData})
//     }else{
//         res.redirect("/users/?error=You can't edit before login")
//     }
// }
let prevFilterHead;
let prevFilter;
module.exports.filter = async (req,res)=>{
    let filterHead = req.params.filterHead;
    let filter = req.params.filter;
    if(filterHead!= 'pagination'){
        prevFilterHead = filterHead;
        prevFilter = filter;
       console.log(filterHead,filter,prevFilter,prevFilterHead,'filter')
    }
    
    if(filterHead == 'sellers'){
        let seller = await Seller.findOne({blocked : false, name: filter })
        item = await Item.find({blocked : false, seller: seller._id }).skip((page-1)*4).limit(4);
    }else if( filterHead == 'search'){
        const searchResults = await Item.find({blocked : false, name: { $regex: filter, $options: 'i' } }).skip((page-1)*4).limit(4); // Perform a case-insensitive search
        item = searchResults;
  }else if( filterHead == 'price'){
        if(filter == '1'){
            item = await Item.find({blocked : false, price: { $gt: 0, $lt: 500 } }).skip((page-1)*4).limit(4)
        }else if(filter == '2'){
            item = await Item.find({blocked : false, price: { $gte: 500, $lt: 1000 } }).skip((page-1)*4).limit(4)
        }else {
            item = await Item.find({blocked : false, price: { $gte: 1000, $lt: 5000 } }).skip((page-1)*4).limit(4)
        }
    }else if( filterHead == 'pagination'){
      if(filter == 'front'){
          set = set+1;
          page = ((set-1)*5)+1
          if(!filterHead){
            res.redirect('/menu/all/1');
          }else{
            res.redirect(`/menu/${prevFilterHead}/${prevFilter}`)
          }
          return;
      }else if(filter == 'back'){
          set = set-1;
          page = ((set-1)*5)+1
          if(!filterHead){
            res.redirect('/menu/all/1');
          }else{
            res.redirect(`/menu/${prevFilterHead}/${prevFilter}`)
          }
          return;
      }else {
          page = filter;
          if(!filterHead){
            res.redirect('/menu/all/1');
          }else{
            res.redirect(`/menu/${prevFilterHead}/${prevFilter}`)
          }
          return;
      }
  }else if(filterHead == 'foodType' || filterHead == 'category'){
        let filterObj = {blocked : false};
        filterObj[filterHead] = filter;
        item = await Item.find(filterObj).skip((page-1)*4).limit(4)
    }else if(filterHead == 'sort'){
      if(filter == '1'){
        item = await Item.find({blocked : false}).sort({ price: 1 }).skip((page-1)*4).limit(4)
      }else{
        item = await Item.find({blocked : false}).sort({ price: -1 }).skip((page-1)*4).limit(4)
      }
  }else{
    item = await Item.find({blocked : false}).skip((page-1)*4).limit(4);
    }
    res.redirect('/menu');
}