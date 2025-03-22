import mongoose from "mongoose";

const conn = async ()=>{

    mongoose.connection.on('connected', ()=>console.log('Database Connected'))

    await mongoose.connect(`${process.env.mongodb_url}/myreactfullstack`)
}

export default conn