var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

//reg
passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", isLoggedIN, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts');
  const posts = await postModel.find().populate('user');

  res.render("feed", { footer: true ,posts, user});
});

router.get("/profile", isLoggedIN, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts")

  res.render("profile", { footer: true, user });
});

router.get("/search", isLoggedIN, function (req, res) {
  res.render("search", { footer: true });
});

router.get("/like/post:id", isLoggedIN, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});

  if(post.likes.indexOf(user._id) == -1){
    post.likes.push(user._id);
  }else{
   post.likes.splice(post.likes.indexOf(user._id),1);
  }
  await post.save();
  res.redirect('/feed');
});

// searcing user form database
router.get("/username/:username", isLoggedIN, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`,'i');
 const users = await userModel.find({username: regex});
  res.json(users);
  // res.render("search", { footer: true });
});

router.get("/edit", isLoggedIN, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});

// set a multer and update the detauls
router.post(
  "/update",
  isLoggedIN,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOneAndUpdate(
      { username: req.session.passport.user },
      { username: req.body.username, name: req.body.name, bio: req.body.bio },
      { new: true }
    );

    if (req.file) {
      user.profileImage = req.file.fieldname;
    }
    await user.save();
    res.redirect("/profile");
  }
);

// reg
router.post("/register", (req, res, next) => {
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
      // res.redirect('/feed')
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res) {
    res.render("index", { footer: false });
  }
);

//logout
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});


router.post("/upload", isLoggedIN, upload.single("imagee"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('post');
  const post = await postModel.create({
    picture: req.file.filename,
    user: user._id,
    caption: req.body.caption
  })
      user.posts.push(post._id);
      await user.save();
      res.redirect('/feed');
});

//com
function isLoggedIN(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("login");
}

module.exports = router;
