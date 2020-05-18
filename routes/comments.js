var express = require("express");
var router = express.Router();
var Court = require("../models/court");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//GET Atidaroma krepšinio aikštelės įkėlimo anketa
router.get("/courts/:id/comments/new", middleware.isLoggedIn, function(req,res){
	Court.findById(req.params.id, function(e, court){
		if(e){
			console.log(e);
		}else{
				res.render("comments/new", {court: court});
		}
	});
});

//POST sukuriamas naujas komentaras pagal formą
router.post("/courts/:id/comments", middleware.isLoggedIn, function(req, res){
	Court.findById(req.params.id, function(e, court){
		if(e){
			console.log(e);
			res.redirect("/court");
		}else{
			Comment.create(req.body.comment, function(e, comment){
				if(e){
					console.log(e);
				}else{
					// add username and id
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					console.log(comment);
					//save comment
					court.comments.push(comment);
					court.save();
					req.flash("success", "Komentaras pridėtas");
					res.redirect("/courts/"+ court._id);
				}
			});
		}
	});
});

//GET Atidaroma komentaro duomenų naujinimo forma
router.get("/courts/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Court.findById(req.params.id, function(e, foundcourt){
		if(e || !foundcourt){
			req.flash("error", "Aikštelė nerasta");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(e, foundComment){
			if(e){
				res.redirect("back");
			}else{
				res.render("comments/edit", {court_id: req.params.id, comment: foundComment});
			}
		});
	});
});
	
//PUT Atnaujinti komentarą pagal komentaro redagavimo formą
router.put("/courts/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(e, updatedComment){
		if(e){
			res.redirect("back");
		}else{
			res.redirect("/courts/"+ req.params.id);
		}
	});
});

//DELETE Ištrinti komentarą
router.delete("/courts/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(e){
		req.flash("success", "The comment was deleted");
		res.redirect("/courts/"+ req.params.id);
	});
});

module.exports = router;