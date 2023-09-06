const Delivery_staff = require('../models/delivery_staffs');

module.exports.login = (req,res)=>{
    req.session.user = 'delivery_staffs';
    if(req.cookies[req.session.email]){
        if(req.cookies[req.session.email] == req.session.password){
            res.render('pages/deliver_staffHome');
        }else{
            res.render('pages/login',{user : 'delivery_staffs'});
        }
    }else{
        res.render('pages/login',{user : 'delivery_staffs'});
    } 
}
module.exports.signUp = (req,res)=>{
    if(req.cookies[req.session.email]){
        if(req.cookies[req.session.email] == req.session.password){
            res.render('pages/deliver_staffHome');
        }else{
            res.render('pages/signUp');
        }
    }else{
        res.render('pages/signUp');
    }
}
module.exports.newDelivery_staff = async(req,res)=>{
    const newdelivery_staff = new Delivery_staff(req.body);
   try {
    const savedStaff = await newdelivery_staff.save();
    console.log(savedStaff);
    res.redirect('/')
   } catch (error) {
    res.status(500).send(error)
   };
};

module.exports.loginDelivery_staff = async(req,res)=>{
    // await Restuarent.deleteMany({}).then(result=>console.log(`${result.deletedCount} documents deleted`)).catch(err=>console.log(err))
    let delivery_staff = await Delivery_staff.find({name : req.body.name, email : req.body.email, password : req.body.password}); 
        if(delivery_staff.length){
            res.cookie(req.body.email, req.body.password);
            req.session.password = req.body.password;
            req.session.email = req.body.email;
            req.session.user = 'delivery_staffHome';
            req.session.save();
            res.redirect('/delivery_staffs/home')
        }else{
            res.redirect('/');
        }
};

module.exports.home = async(req,res)=>{
    console.log(req.cookies,req.session);
    if(req.cookies[req.session.email]){
        if(req.cookies[req.session.email] == req.session.password){
            res.render('pages/delivery_staffHome');
        }else{
            res.redirect('/');
        }
    }else{
        console.log('hai..');
        res.redirect('/');
    }
    
}