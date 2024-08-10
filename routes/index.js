var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const upload = require("./multer");
const cartItem = require("./cart");
const mongoose = require('mongoose');
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));



router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', {error: req.flash("error")});
});

router.get('/cartscreen',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate("posts")

  res.render('carts',{user});
});

router.get('/contacts',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate("posts")

  res.render('contacts',{user});
});
router.get('/abouts',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate("posts")

  res.render('abouts',{user});
});
router.post('/upload',isLoggedIn, upload.single("file"), async function(req, res, next) {
  if(!req.file){
    return res.status(400).send("No files were uploaded.");
  }
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id 
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});
router.post('/addtocart',isLoggedIn, async (req, res) => {
 
  try {
      // Find the current user and update their cart
      const user = await userModel.findOne({username: req.session.passport.user});
      const cart = await cartItem.create({
        user: user._id,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        image: req.body.image
        
      })
      user.posts.push(cart._id);
      await user.save();
      req.flash('success', 'Item added to cart');
      res.redirect('/cartscreen');
  } catch (err) {
      console.error('Error adding item to cart', err);
      req.flash('error', 'Failed to add item to cart');
      res.redirect('/cartscreen');
  }
});
router.post('/removefromcart/:id', isLoggedIn, async (req, res) => {
  try {
    // Find the current user
    const user = await userModel.findOne({ username: req.session.passport.user });

    // Remove the item from the user's cart
    const itemId = req.params.id;
    const index = user.posts.indexOf(itemId);
    if (index > -1) {
      user.posts.splice(index, 1);
    }

    await user.save();

    req.flash('success', 'Item removed from cart');
    res.redirect('/cartscreen');
  } catch (err) {
    console.error('Error removing item from cart', err);
    req.flash('error', 'Failed to remove item from cart');
    res.redirect('/cartscreen');
  }
});

router.get('/profile',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  }).populate("posts")

  res.render("profile", {user});
});

router.post("/register", function(req,res){
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname
  });

  userModel.register(userData,req.body.password).then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })

});

router.post("/login",passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function(req,res){
});

router.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
};

module.exports = router;