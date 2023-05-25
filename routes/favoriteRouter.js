const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite) {
            // array to hold campsiteIds not already existing / push into new array and also existing array
            const newCampsiteIds = [];
            req.body.forEach((campsite) => {
            if (!favorite.campsites.includes(campsite._id)) {
                newCampsiteIds.push(campsite._id);
                favorite.campsites.push(campsite._id);
          }
        });
        // if on the new array to msg campsite(s) got added else they are already existing
        if (newCampsiteIds.length > 0) {
          favorite.save()
            .then(() => {
              res.statusCode = 200;
              res.json({ message: "New campsite(s) added!" });
            })
            .catch((err) => next(err));
        } else {
          res.statusCode = 200;
          res.json({ message: 'Campsite(s) are already in your favorites' });
        }
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then((favorite) => {
                favorite.campsites.push(req.body._id);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch((err) => next(err));
        }
      }) 
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOneAndDelete({ campsite: req.params.campsiteId })
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (!favorite) {
            Favorite.create({ user: req.user._id, campsites: req.params.campsiteId})
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        } else {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({message: 'This campsite is already a favorite!'});
            } else {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err));
            }
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            const campsiteId = req.params.campsiteId;
            const index = favorite.campsites.indexOf(campsiteId);
            if (index !== -1) {
                favorite.campsites.splice(index, 1);
                return favorite.save();
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.json({message: "No favorite to delete"});
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;