//in db.js we going to setup our js file
const { Sequelize }=require('sequelize');


const createDB=new Sequelize('test-db','user','pass',{
    dialect:'sqlite',
    host:'./config/db.sqlite',

})
const connectDB=()=>{
    createDB.sync().then((res)=>{
        console.log('connected to db');
    })
    .catch((e)=>{
        console.log('db connection failed',e);
    })
}
module.exports={createDB,connectDB};