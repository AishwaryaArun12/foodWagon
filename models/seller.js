const mongoose = require('mongoose');
const sellers = new mongoose.model('sellers',{
   name : {
    type : String,
    required : true
   },
   email : {
      type : String,
      required : true
   },
   password : {
      type : String,
      required : true
   },
   menu : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'menu',
   },
   discount : {
    type : Number,
    
   },
   blocked : {
      type : Boolean,
      default : false
   },
   location :{
    type : String,
    required : true
   },
   status : {
      type : String,
      default : 'pending'
   },
   orders : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'orders',
   }]
})
module.exports = sellers;