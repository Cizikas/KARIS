var mongoose = require("mongoose");
var Campground = require("./models/court");
var Comment = require("./models/comment");

var data = [
	{
		name: "Test 1", 
		image: "https://images.unsplash.com/photo-1494545261862-dadfb7e1c13d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
		description: "Nonsense"
	},
	{
		name: "Test 2", 
		image: "https://images.unsplash.com/photo-1494545261862-dadfb7e1c13d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
		description: "Nonsense"
	},
	{
		name: "Test 3", 
		image: "https://images.unsplash.com/photo-1494545261862-dadfb7e1c13d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
		description: "Nonsense"
	}
]

function seedDB(){
	//Ištrinamos visos salės
	Campground.deleteMany({}, function(e){
		if(e){
			console.log(e);
		}else{
			console.log("Removed courts!");
			//Pridedamos aikštelės
			data.forEach(function(seed){
				Campground.create(seed, function(e, court){
					if(e){
						console.log(e);
					}else{
						console.log("Added court");
						//Sukuriami komentarai
						Comment.create({
							text: "Best comment ever, thats is sane and rubbish at the same time",
							author: "Homer"
						}, function(e, comment){
							if(e){
								console.log(e);
							}else{
								court.comments.push(comment)
								court.save();
								console.log("Comment added!");
							}
						});
					}
				});
			});
		}
	});
}

module.exports = seedDB;