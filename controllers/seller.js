const Seller = require('../models/seller');
const Menu = require('../models/menu');
const Item = require('../models/items');
const Jimp = require('jimp');
const bcrypt = require('bcrypt');
const saltRounds = 10; 

module.exports.login = (req,res)=>{
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
}
module.exports.signUp = (req,res)=>{
    if(req.cookies[req.session.email]){
        if(req.cookies[req.session.email] == req.session.password){
            res.redirect('/sellers/home');
        }else{
            res.render('pages/signUp',{user : 'sellers',error: '',login:false});
        }
    }else{
        res.render('pages/signUp',{user : 'sellers',error: '', login: false});
    }
}

module.exports.newSeller = async(req,res)=>{
    const seller =await Seller.findOne({email : req.body.email});
    if(seller){
        res.redirect('/sellers/?error=You already registered. Please login')
    }else{
        bcrypt.hash(req.body.password, saltRounds,async (err, hash) => {
            if (err) {
                console.log(err);
            } else {
              req.body.password = hash;
                console.log(req.body.password, hash);
                const newSeller = new Seller(req.body);
        try {
         const savedSeller = await newSeller.save();
         const newMenu = new Menu();
         const savedMenu = await newMenu.save();
         savedSeller.menu = savedMenu._id;
         await savedSeller.save();
         console.log(savedMenu);
         console.log(savedSeller);
         res.redirect('/sellers')
        } catch (error) {
         res.status(500).send(error)
        };
            }})
        
    }
};

module.exports.loginSeller = async(req,res)=>{
    let seller = await Seller.findOne({email : req.body.email,name: req.body.name});
    
    bcrypt.compare(req.body.password, seller.password,async (err, result) => {
        if (err) {
          console.log(err,'err');
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
    
    console.log(seller,'login');
    if(!seller){
        res.redirect('/sellers/?error=Your are not registered. Please register')
        return;
    }
    
};

module.exports.home = async(req,res)=>{
    let error = req.query.error
    console.log(req.cookies,req.session);
    if(req.cookies[req.session.email]){
        if(req.cookies[req.session.email] == req.session.password){
            const menu = await Menu.find({ _id: req.session.menuId });
            const menus = await Menu.findById(req.session.menuId).populate({
                path: 'menu.category.items.item',
                model: 'Item'  // Make sure the model name matches the one you defined for items
              });
              
              const foodType = menu[0].menu.map(foodType =>foodType.name);
              res.render('pages/sellerHome',{error,foodType : foodType, menus : menus, search :search,user:'sellers', login:true});
        }else{
            res.redirect('/sellers');
        }
    }else{
        console.log('hai..');
        res.redirect('/sellers');
    }
    }
    module.exports.addFoodType = async (req, res) => {
        const newFoodType = req.body.newFoodType;
        const menu = await Menu.findOne({ _id: req.session.menuId });
        try {
            if (!menu.menu.find(foodType => foodType.name === newFoodType)) {
                console.log('menu',menu);
                menu.menu.push({ name: newFoodType, category: [] });
                await menu.save();
                console.log('new foodType saved..');
            }
        } catch (error) {
            console.log(error);
        }
    }
    module.exports.displayImage = async (req,res) => { 
        try {
            const itemId = req.params.itemId;
            const i = req.params.i;
            const item = await Item.findById(itemId);
            
            // if (!item || !item.image) {
            //     return res.status(404).send('Image not found');
            // }
    
            if(item.images){
                res.set('Content-Type', 'image/jpeg'); // Set the appropriate content type
                res.send(item.images[i]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error');
        }
    
    }
    module.exports.displayVideo = async (req,res)=>{
        try {
            const itemId = req.params.itemId;
            const item = await Item.findById(itemId);
            res.setHeader('Content-Type', 'video/mp4');
            
            res.send(item.video);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error');
        }
    }
    let videoBuffer = '';
    module.exports.addVideo = (req,res) => {
        videoBuffer = req.file.buffer;
        console.log(videoBuffer);
    }
    module.exports.addItem = async (req, res) => {
        let { foodType, category, itemName, description, discount, price, qty, tasteOrcapacity, stock } = req.body;
       try {
        const imageBuffers = req.files.map(file => file.buffer);
  
            for (const buffer of imageBuffers) {
                await Jimp.read(buffer);
                // Process each image if reading is successful
            }
       } catch (error) {
        res.redirect('/sellers/home?error=Image is not valid. Item not saved');
        return;
       }
        const newItem = new Item({
            name: itemName,
            images: req.files.map((file)=>file.buffer),
            video : videoBuffer,
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
    
        res.redirect('../sellers/home');
    }
    let search = "";
    module.exports.search = async (req,res)=>{
        const searchTerm = req.query.q; // Get the value of the 'q' query parameter       
        try {
        const searchResults = await Item.find({ name: { $regex: searchTerm, $options: 'i' } }); // Perform a case-insensitive search
        search = searchResults;
        res.redirect('../sellers/home')
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while searching for items.' });
        }
    }
    module.exports.searchClose = async (req,res)=>{
        search = "";
        res.redirect('/../sellers/home');
    }
    module.exports.product = async (req,res)=>{
        let id = req.params.id;
        console.log(req.params,id,'hai')
        let products='';
        if(id != 'style.css'){
             try {
                products = await Item.findById(id)
             } catch (error) {
                console.error(error)
             }
        }
        res.render('pages/sellerProduct',{products, user : 'sellers',login : true});
    }
    module.exports.block = async(req,res)=>{
        console.log(req.path);
        const id = req.params.id;
        const user = req.params.user;
        if(user == 'item'){
            const update = await Item.updateOne({_id : id},{$set :{blocked : true}})
            res.redirect('/sellers/home');
        }else {
            const matchingDocument = await Menu.findOne({
                _id: id
              });
              console.log(matchingDocument,'menu');
              const menu = matchingDocument.menu;
      
      // Find the index of the menu element containing the matching category
        const matchingCategory = menu.filter(category => {
           category= category.category.filter(element => {
            console.log(element.name,'xd');
           return element.name == user; 
        })
        return category.length != 0;
    });
    console.log(matchingCategory,'menu');
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
            res.redirect(`/sellers/home`);
        }
        
    }
    module.exports.unblock = async (req,res)=>{
        const id = req.params.id;
        const user = req.params.user;
        if(user == 'item'){
            const update = await Item.updateOne({_id : id},{$set :{blocked : false}})
            res.redirect('/sellers/home');
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
    
              res.redirect(`/sellers/home`);
    }
    }
    module.exports.editProduct = async(req,res)=>{
        if(req.session.login){
            const id = req.params.id;
            const item = await Item.findById(id);
            res.render('pages/sellerProductEdit',{login : true, user : 'sellers',products:item})
        }
    }
    module.exports.itemEdit = async(req,res)=>{
        if(req.session.login){
            const id = req.params.id;
            let updatedItem= await  Item.findOneAndUpdate(
                { _id: id }, // Filter the user by ID
                { $set: req.body }, // Set the new name and email
                { new: true })
                res.redirect(`/sellers/product/${id}`);
                
        }else{
            res.redirect('/sellers/?error=Please login..')
        }
    }
    module.exports.editImage = async(req,res)=>{
        if(req.session.login){
            const id = req.params.id;
            const i = req.params.i;
            const imageBuffer  = req.file.buffer;
            try {
                await Jimp.read(imageBuffer);

            } catch (error) {
               console.log(error);
               
            }
            const update = await Item.findOneAndUpdate(
                { _id: id },
                { $set: { [`images.${i}`]: imageBuffer } },
                { new: true }
              );
             res.redirect(`/sellers/product/${id}`);
        }else{
            res.redirect('/sellers/?error=Please login')
        }
    }
    module.exports.editVideo = async(req,res)=>{
        if(req.session.login){
            const id = req.params.id;
            const videoBuffer  = req.file.buffer;
            const update = await Item.findOneAndUpdate(
                { _id: id },
                { $set: { video: videoBuffer } },
                { new: true }
              );
             res.redirect(`/sellers/product/${id}`);
        }else{
            res.redirect('/sellers/?error=Please login')
        }
    }
    module.exports.addImage = async(req,res)=>{
        if(req.session.login){
            const id = req.params.id;
            const imageBuffer  = req.file.buffer;
            try {
                await Jimp.read(imageBuffer);

            } catch (error) {
               console.log(error);
               
            }
            const update = await Item.findOneAndUpdate(
                { _id: id },
                { $push: { [`images`]: imageBuffer } },
                { new: true }
              );
             res.redirect(`/sellers/product/${id}`);
        }else{
            res.redirect('/sellers/?error=Please login')
        }
    }
    module.exports.profile = async(req,res)=>{
        if(req.session.login){
            const id = req.session.sellerId;
            const userData = await Seller.findById(id);
            res.render('pages/sellerProfile',{user : 'sellers',login: true,userData});
        }else{
            res.redirect('/sellers/?error=Please login');
        }
    }
    module.exports.editProfile = async(req,res)=>{
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
                        console.log(err);
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
}