const Seller = require('../models/seller');
const Menu = require('../models/menu');
const Item = require('../models/items');
const Jimp = require('jimp');

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
            res.render('pages/signUp',{user : 'sellers',error: '',user:'sellers',login:false});
        }
    }else{
        res.render('pages/signUp',{user : 'sellers',error: ''});
    }
}

module.exports.newSeller = async(req,res)=>{
    const seller =await Seller.findOne({email : req.body.email});
    if(seller){
        res.redirect('/sellers/?error=You already registered. Please login')
    }else{
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
    }
   
};

module.exports.loginSeller = async(req,res)=>{
   
    let seller = await Seller.findOne({name : req.body.name, email : req.body.email, password : req.body.password}); 
    console.log(seller,'login');
    if(!seller){
        res.redirect('/sellers/?error=Your are not registered. Please register')
    }
    else if(seller !=null && seller.status == 'approve'){
            
            res.cookie(req.body.email, req.body.password);
            req.session.password = req.body.password;
            req.session.email = req.body.email;
            req.session.sellerId = `${seller._id}`;
            req.session.login = true;
            req.session.user = 'sellerHome';
            req.session.menuId = `${seller.menu}`
            req.session.save();
            res.redirect('/sellers/home')
        }else if(seller.status == 'pending'){
            res.redirect('/sellers/?error=Your request is in pending stage');
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
        await Jimp.read(req.files.map((file)=>file.buffer));
       } catch (error) {
        res.redirect('/sellers/home?error=Image is not valid. Item not saved');
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