var mongoose = require("mongoose");

var courtSchema = new mongoose.Schema({
	name: String,
	image: String,
	imageId: String,
	mainURL: String,
	price: String,
	description: String,
	telnumber: String,
	city: String,
	street: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User" 	
		},
		username: String,
	},
	comments: [
		{
			type:mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Court", courtSchema);