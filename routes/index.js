var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel=require('./users')
const localStrategy = require('passport-local');
const upload= require('./multer');
const postModel=require('./post')
passport.use(new localStrategy(userModel.authenticate()));



router.get('/', function(req, res) {
  res.render('index');
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.post('/fileupload',isLoggedIn, upload.single('image'),async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile')
});

router.post('/createpost',isLoggedIn, upload.single("uploadedImage"),async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const post= await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    Image:req.file.filename,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile')
});

router.get('/add',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  res.render("add")
});

router.post('/register', function(req, res) {
  const data=new userModel({
    username:req.body.username,
    email:req.body.email,
    fullname:req.body.fullname
  });
  userModel.register(data,req.body.password)
  .then(function (registereduser){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile')
    })
  })
});

router.get('/profile',isLoggedIn,async function(req,res){
  const user = 
  await userModel
          .findOne({username:req.session.passport.user})
          .populate("posts");
  res.render("profile",{user})
});

router.get('/show/posts',isLoggedIn,async function(req,res){
  const user = 
  await userModel
          .findOne({username:req.session.passport.user})
          .populate("posts");
  res.render("show",{user})
});


router.get('/feed',isLoggedIn,async function(req,res){
  const user = 
  await userModel
          .findOne({username:req.session.passport.user});
  const posts = 
          await postModel
                  .find().populate("user");
  res.render('feed',{user,posts})
});

router.post('/login',passport.authenticate('local',{
  successRedirect:"/profile",
  failureRedirect:"/"
}),function(req,res){

});

router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if (err){
      return next(err);
    }
    res.redirect('/')
  })
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/')
}
module.exports = router;
