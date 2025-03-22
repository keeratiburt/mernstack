import bcrypt from 'bcryptjs' /* 8 */
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import transporter from '../config/nodemailer.js'


export const register = async (req, res)=>{ /* 1 */
    const {name, email, password} = req.body /* 2 */

    /* if any data missing */
    if(!name || !email || !password){ /* 3 */
        return res.json({success: false, message: 'Missing Details'}) /* 4 */
    }
    try{ /* 5 */

        // ตรวจสอบว่ามี user นี้อยู่แล้วหรือไม่
        const existingUser = await userModel.findOne({email}) /* 10 เช็คว่าอีเมล์ซ้ำหรือไม่*/

        if(existingUser){ /* 11 */
            return res.json({ success: false, message: "User already exists"})
        }
        
        // แปลง password เป็น hash
        const hashedPassword = await bcrypt.hash(password, 10) /* 9 เข้ารหัส password*/

        // สร้าง user
        const user = new userModel({name, email, password: hashedPassword}) /* 12 */
        await user.save() /* 13 บันทึกข้อมูล user ลง database MongoDB */

        // สร้าง token สำหรับ user ที่ลงทะเบียน และเก็บไว้ใน cookie ของ user นั้นๆ
        const token = jwt.sign({id: user._id}, process.env.jwt_secret, { expiresIn: '7d'}) /* 14 บันทึก user id */

        res.cookie('token', token, { /* add token ใน cookie */
            httpOnly: true,
            secure: process.env.node_env === 'production',
            sameSite: process.env.node_env === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000 /* 7 วัน/ 24ชม/ 60นาที/ 60วินาที/ 1000มิลิวินาที */
        })

        // ส่งอีเมล์ยืนยันการสมัคร
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'ยินดีต้อนรับสู่เว็บไซต์ของเรา',
            text: `บัญชีของคุณได้ถูกสร้างขึ้นด้วยอีเมล์: ${email}`
        }

        await transporter.sendMail(mailOptions) /* ส่งอีเมล์*/

        return res.json({success: true})

    }
    catch(error) { /* 6 */
        res.json({success: false, message: error.message}) /* 7 */
    }
}

export const login = async (req, res) =>{
    const {email, password} = req.body

    if(!email || !password){
        return res.json({success: false, message: 'กรุณากรอกอีเมล์และรหัสผ่าน'})
    }
    try{
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success: false, message: 'อีเมล์ผิด'})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        
        if(!isMatch){
            return res.json({success: false, message: 'รหัสผ่านผิด'})
        }

        const token = jwt.sign({id: user._id}, process.env.jwt_secret, { expiresIn: '7d'})

        res.cookie('token', token, { /* add token ใน cookie */
            httpOnly: true,
            secure: process.env.node_env === 'production',
            sameSite: process.env.node_env === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000 /* 7 วัน/ 24ชม/ 60นาที/ 60วินาที/ 1000มิลิวินาที */
        })

        return res.json({success: true})


    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const logout = async(req, res) =>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.node_env === 'production',
            sameSite: process.env.node_env === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: "Logged Out"})
    } catch (error){
        return res.json({success: false, message: error.message})
    }
}