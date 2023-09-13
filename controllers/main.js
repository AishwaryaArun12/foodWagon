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
fn();
 async function fn(){
  item =await  Item.find()
 }
module.exports.menu =async (req,res)=>{
    let sellers = [];
    let foodtype = [];
    let category = [];
  await  Item.distinct('seller')
  .then(async (sellerIds) => {
    try {
      sellers = await Item.find({ seller: { $in: sellerIds } }, 'seller -_id').populate('seller');
      const sellerNames = sellers.map((item) => item.seller.name);
      console.log('Distinct Seller Names:', sellerNames);
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
      console.log('Distinct Food Types:', foodTypes);
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
         res.render('pages/menu',{item:item,login:true,sellers:sellers,foodtype:foodtype,category:category});
    }else{
        res.render('pages/menu',{item:item,login:false,sellers:sellers,foodtype:foodtype,category:category});
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
module.exports.filter = async (req,res)=>{
    let filterHead = req.params.filterHead;
    let filter = req.params.filter;
    console.log(filterHead,filter,'filter')
    if(filterHead == 'sellers'){
        let seller = await Seller.findOne({ name: filter })
        item = await Item.find({ seller: seller._id })
    }else if( filterHead == 'price'){
        if(filter == '1'){
            item = await Item.find({ price: { $gt: 0, $lt: 500 } })
        }else if(filter == '2'){
            item = await Item.find({ price: { $gte: 500, $lt: 1000 } })
        }else {
            item = await Item.find({ price: { $gte: 1000, $lt: 5000 } })
        }
    }else if(filterHead == 'foodType' || filterHead == 'category'){
        let filterObj = {};
        filterObj[filterHead] = filter;
        item = await Item.find(filterObj)
    }else{
        item = await Item.find();
    }
    res.redirect('/menu');
}