const express = require('express')
const routes = express.Router()
const multer = require('./app/middlewares/multer')
const adminRecipes = require('./app/controllers/adminRecipes')
const adminChefs = require('./app/controllers/adminChefs')
const user = require('./app/controllers/user')

//USER
routes.get('/', user.index) //index
routes.get('/recipes', user.recipes)//receitas
routes.get('/about', user.about)//sobre
routes.get('/recipe/:id', user.show) //detalhes receita
routes.get('/chefs', user.chefs)//chefs
routes.get('/recipes/busca',user.busca) //filtro


//ADMIN - RECIPES
routes.get("/admin", function(req,res){res.redirect("/admin/recipes")})
routes.get("/admin/recipes", adminRecipes.index); // LIST
routes.get("/admin/recipes/create", adminRecipes.create); // CREATE
routes.get("/admin/recipes/:id", adminRecipes.show); // SHOW
routes.get("/admin/recipes/:id/edit", adminRecipes.edit); // EDIT
routes.post("/admin/recipes", multer.array('photos',5) ,adminRecipes.post); // POST
routes.put("/admin/recipes/:id", multer.array('photos',5), adminRecipes.put); // PUT/ATT
routes.delete("/admin/recipes", adminRecipes.delete); // DELETE

//ADMIN - CHEFS
routes.get("/admin/chefs", adminChefs.index); // LIST
routes.get("/admin/chefs/create", adminChefs.create); // CREATE
routes.get("/admin/chefs/:id", adminChefs.show); // SHOW
routes.get("/admin/chefs/:id/edit", adminChefs.edit); // EDIT
routes.post("/admin/chefs", multer.array('photos',1) , adminChefs.post); // POST
routes.put("/admin/chefs/:id", multer.array('photos',1) , adminChefs.put); // PUT/ATT
routes.delete("/admin/chefs", adminChefs.delete); // DELETE


module.exports = routes