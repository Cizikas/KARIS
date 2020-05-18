var express = require("express");
var router = express.Router();
var Court = require("../models/court");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//GET Visos krepsinio aikštelės
router.get("/courts", function(req, res){
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), "gi");
	Court.find({$or:[{name: regex}, {description: regex}, {city: regex}, {street: regex}]}, function(e, allCourts){
		if(e){
			console.log(e);
		}else{
			res.render("courts/index", {courts: allCourts, currentUser: req.user});
		}
	});
	}else{
	Court.find({}, function(e, allCourts){
		if(e){
			console.log(e);
		}else{
			res.render("courts/index", {courts: allCourts, currentUser: req.user});
		}
	});
	}
});

//GET Naujos krepsinio aikštelės forma
router.get("/courts/new", middleware.isLoggedIn, function(req, res){
	res.render("courts/new");
});


//CREATE Nauja krepsinio aikštelė i db
router.post("/courts", middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var price = req.body.price;
	var telNumber = req.body.telnumber;
	var city = req.body.city;
	var street = req.body.street
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCourt = {name: name, image: image, description: description, price: price, telnumber: telNumber, author: author, city: city, street: street};
	Court.create(newCourt, function(e, newlyCreated){
		if(e){
			req.flash("error", "Nepavyko pridėti krepšinio aikštelės, patikrinkite įvestus duomenis ir bandykite dar kartą.")
			res.redirect("back");
		}else{
			req.flash("success", "Krepšinio aikštelė pridėta");
			res.redirect("/courts");
		}
	});
});

//SHOW Rodoma konkreti krepsinio aikštelė
router.get("/courts/:id", function(req, res){
	Court.findById(req.params.id).populate("comments").exec(function(e, foundCourt){
		if(e || !foundCourt){
			req.flash("error", "Aikštelė nesrasta");
			res.redirect("back");
		}else{
			res.render("courts/show", {court: foundCourt});
		}
	});
});

//GET Krepsinio aikštelių redagavimo forma
router.get("/courts/:id/edit", middleware.checkCourtOwnership, function(req, res){
	Court.findById(req.params.id, function(e, foundCourt){
		res.render("courts/edit", {court: foundCourt});
	});
});

//PUT Konkrecios krepsinio aikštelės duomenu atnaujinimas
router.put("/courts/:id", middleware.checkCourtOwnership, function(req, res){
	Court.findByIdAndUpdate(req.params.id, req.body.court, function(e, updatedCamp){
		if(e){
			console.log(e);
			res.redirect("/courts");
		}else{
			res.redirect("/courts/"+ req.params.id);
		}
	});
});

//DELETE Konkrecios krepsinio aikštelės trinimas
router.delete("/courts/:id", middleware.checkCourtOwnership, function(req, res){
	Court.findByIdAndRemove(req.params.id, function(e, removeCourt){
		if(e){
			console.log(e);
			res.redirect("/courts");
		}else{
			Comment.deleteMany({_id : { $in: removeCourt.comments}}, function(e){
				if(e){
					console.log(e);
				}
				res.redirect("/courts");
			});
		}
	});
});

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;