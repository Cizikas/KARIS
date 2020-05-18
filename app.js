var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Court = require("./models/court");
var seedDB = require("./seeds");
var User = require("./models/user");
var Comment = require("./models/comment");
var methodOverride = require("method-override");
var flash = require("connect-flash");

var commentRoutes = require("./routes/comments");
var courtRoutes = require("./routes/court");
var indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/KARS",  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //Naudoti duomenys ankstyvoje prototipo versijoje

//PASSPORT CFG
app.use(require("express-session")({
	secret: "Naujas hashas, kad uzkoduoti slaptazodzius",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error= req.flash("error");
	res.locals.success= req.flash("success");
	next();
});

app.use(indexRoutes);
app.use(commentRoutes);
app.use(courtRoutes);

app.listen(3000, process.env.IP, function(){
	console.log("Connected");
});