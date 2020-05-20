var express = require('express');
var router = express.Router();
var Court = require('../models/court');
var Comment = require('../models/comment');
var middleware = require('../middleware');
var multer = require('multer');
var cloudinary = require('cloudinary');
var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function(req, file, cb) {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Tik img tipo failai yra leistini!'), false);
	}
	cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

cloudinary.config({
	cloud_name: 'ddba8zzzr',
	api_key: 223794717535125,
	api_secret: 'R57VAz8NeXmBE8j_LExlhpjPTKI'
});

//GET Visos krepsinio aikštelės
router.get('/courts', function(req, res) {
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Court.find(
			{ $or: [{ name: regex }, { description: regex }, { city: regex }, { street: regex }] },
			function(e, allCourts) {
				if (e) {
					console.log(e);
				} else {
					res.render('courts/index', { courts: allCourts, currentUser: req.user });
				}
			}
		);
	} else {
		Court.find({}, function(e, allCourts) {
			if (e) {
				console.log(e);
			} else {
				res.render('courts/index', { courts: allCourts, currentUser: req.user });
			}
		});
	}
});

//GET Naujos krepsinio aikštelės forma
router.get('/courts/new', middleware.isLoggedIn, function(req, res) {
	res.render('courts/new');
});

//CREATE Nauja krepšinio aikštelė i db
router.post('/courts', middleware.isLoggedIn, upload.single('image'), function(req, res) {
	cloudinary.v2.uploader.upload(req.file.path, function(e, result) {
		if (e) {
			req.flash('error', 'Nepavyko pridėti krepšinio aikštelės, bandykite dar kartą');
			return res.redirect('back');
		}
		req.body.court.image = result.secure_url;
		req.body.court.imageId = result.public_id;
		req.body.court.author = {
			id: req.user._id,
			username: req.user.username
		};
		Court.create(req.body.court, function(e, newlyCreated) {
			if (e) {
				req.flash(
					'error',
					'Nepavyko pridėti krepšinio aikštelės, patikrinkite įvestus duomenis ir bandykite dar kartą.'
				);
				res.redirect('back');
			} else {
				req.flash('success', 'Krepšinio aikštelė pridėta');
				res.redirect('/courts');
			}
		});
	});
});

//SHOW Rodoma konkreti krepsinio aikštelė
router.get('/courts/:id', function(req, res) {
	Court.findById(req.params.id)
		.populate('comments')
		.exec(function(e, foundCourt) {
			if (e || !foundCourt) {
				req.flash('error', 'Aikštelė nesrasta');
				res.redirect('back');
			} else {
				res.render('courts/show', { court: foundCourt });
			}
		});
});

//GET Krepsinio aikštelių redagavimo forma
router.get('/courts/:id/edit', middleware.checkCourtOwnership, function(req, res) {
	Court.findById(req.params.id, function(e, foundCourt) {
		res.render('courts/edit', { court: foundCourt });
	});
});

//PUT Konkrecios krepsinio aikštelės duomenu atnaujinimas
router.put('/courts/:id', middleware.checkCourtOwnership, upload.single('image'), function(
	req,
	res
) {
	Court.findById(req.params.id, async function(e, court) {
		if (e) {
			req.flash('error', 'Aikštelė nerasta');
			res.redirect('back');
		} else {
			if (req.file) {
				try {
					await cloudinary.v2.uploader.destroy(court.imageId);
					var result = await cloudinary.v2.uploader.upload(req.file.path);
					court.imageId = result.public_id;
					court.image = result.secure_url;
				} catch (e) {
					console.log(e);
					req.flash('error', 'Nepavyko atnaujinti duomenų, bandykite vėliau');
					return res.redirect('back');
				}
			}
			court.name = req.body.court.name;
			court.price = req.body.court.price;
			court.description = req.body.court.description;
			court.telnumber = req.body.court.telnumber;
			court.city = req.body.court.city;
			court.street = req.body.court.street;
			court.mainURL = req.body.court.mainURL;
			court.save();
			req.flash('success', 'Aikštelės duomenys buvo atnaujinti');
			res.redirect("/courts/"+ court._id);
		}
	});
});

//DELETE Konkrecios krepsinio aikštelės trinimas
router.delete('/courts/:id', middleware.checkCourtOwnership, function(req, res) {
	Court.findByIdAndRemove(req.params.id, function(e, removeCourt) {
		if (e) {
			console.log(e);
			res.redirect('/courts');
		} else {
			Comment.deleteMany({ _id: { $in: removeCourt.comments } }, function(e) {
				if (e) {
					console.log(e);
				}
				res.redirect('/courts');
			});
		}
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;