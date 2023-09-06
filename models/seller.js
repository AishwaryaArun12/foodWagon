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
   location :{
    type : String,
    required : true
   },
   current_status : {
    type : String,
    default : 'opening'
   },
   status : {
      type : String,
      default : 'pending'
   }
})
module.exports = sellers;