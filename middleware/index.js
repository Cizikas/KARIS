var Court = require("../models/court");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCourtOwnership = function(req, res, next) {
	if(req.isAuthenticated()){
		Court.findById(req.params.id, function(e, foundCourt){
			if(e || !foundCourt){
				console.log(e);
				req.flash("error", "Aikštelė nerasta");
				res.redirect("back");
			}else{
				if(foundCourt.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}else{
					req.flash("error", "Jūs neturite reikiamų teisių šiam veiksmui.");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "You need to be Logged In to do that")
		res.redirect("back");
	}
};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(e, foundComment){
			if(e || !foundComment){
				console.log(e);
				req.flash("error", "Komentaras nerastas.");
				res.redirect("back");
			}else{
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}else{
					req.flash("error", "Jūs neturite reikiamų teisių šiam veiksmui.");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "Reikia būti prisijungus norint atlikti šį veiksmą.")
		res.redirect("back");
	}
};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Reikia būti prisijungus norint atlikti šį veiksmą.");
	res.redirect("/login");
};

module.exports = middlewareObj;