import express from "express";

// import {getRegister} from '../controllers/user'
// import getRe
import * as userController from "../controllers/user";

export const userRoutes = express.Router()


userRoutes.route('/signup')
.post(userController.register)

userRoutes.route('/login')
.post(userController.login)

// module.exports = router