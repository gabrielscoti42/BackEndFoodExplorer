const { Router } = require("express") 

const routes = Router()

//Rotas 
const usersRouter = require("./users.routes")
const dishesRouter = require("./dishes.routes")
const sessionsRouter = require("./sessions.routes")
const adminDishesRouter = require("./adminDishes.routes")

//Direcionamento para as rotas
routes.use("/users", usersRouter)
routes.use("/dishes", dishesRouter)
routes.use("/adminDishes", adminDishesRouter)
routes.use("/sessions", sessionsRouter)

module.exports = routes;