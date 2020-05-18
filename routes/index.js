var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//GET Pagrindinis puslapis
router.get("/", function(req, res){
	res.redirect("/courts");
});

//GET Registracijos forma
router.get("/register", function(req, res){
	res.render("register");
});

//POST Priregistruojamas vartotojas
router.post("/register", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password, function(e, user){
		if(e){
			req.flash("error", e.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Sveiki atvyke į KARIS "+ user.username);
			res.redirect("/courts");
		});
	});
});

//GET Prisijungimo forma
router.get("/login", function(req, res){
	res.render("login", {referer:req.headers.referer});
});

//POST Prjungiamas vartotojas
router.post("/login", passport.authenticate("local", 
	{
		failureRedirect: "/login",
		failureFlash: "Ivesti neteisingi duomenys arba vartotojas neregistruotas."
	}), function(req, res){
		if (req.body.referer && (req.body.referer !== undefined && req.body.referer.slice(-6) !== "/login")) {
        	res.redirect(req.body.referer);
    	} else {
        	res.redirect("/");
    	}
});

//GET Atjungiamas vartotojas
router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/courts");
});

module.exports = router;