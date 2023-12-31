const express = require('express'); //Express.js for creating the web application
const mongoose = require('mongoose');
const Models= require('./models'); // imports model.js 
const app = express(); // Create an instance of the Express application
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const morgan = require('morgan');
const bodyParser = require('body-parser'); // For parsing request bodies
const uuid = require('uuid'); // UUID for generating unique identifiers
const fs = require('fs'); // import built in node modules fs and path 
const path = require('path'); // Path for working with file paths
require('dotenv').config();  // Configure environment variables using Dotenv

// server-side validator
const {check, validationResult}= require('express-validator'); 

// Import and use the CORS module to enable Cross-Origin Resource Sharing
const cors = require('cors');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// these model represents data for movies collection
const Movies= Models.Movie;
const Genres = Models.Genre;
const Directors = Models.Director;
const Actors = Models.Actor;
const Users = Models.User;

// let allowedOrigins = [
//   "http://localhost:8080",
//   "https://user-movies-b3ba594615fa.herokuapp.com",
//   "http://localhost:1234",
//   "https://gomyflix.netlify.app",
//   "http://localhost:4200",
//   ""
// ];

app.use(cors(
//   {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
//       let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
//       return callback(new Error(message), false);
//     }
//     return callback(null, true);
//   }
// }
));
// Import authentication modules and configure authentication
require('./auth')(app);
const passport=require('passport');
require('./passport'); // Import and configure Passport.js

// const mongoURL = process.env.CONNECTION_URI
// connected mongodb or integrated b/w REST API to data layer
// mongoose.connect('mongodb://127.0.0.1:27017/myFlix', {useNewUrlParser: true, useUnifiedTopology: true});

// to connect the heroku API to online database (mongoDB Atlas)
// mongoose.connect(mongoURL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});




// setup logging

 const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
 app.use(morgan('combined', {stream: accessLogStream}));  // enable morgan logging to 'log.txt'

// setup app routing
app.use(express.static('public'));



app.get('/', (req, res) => {
	res.send('Welcome to myFlix app.');
});

// add a movie
/**
 * @method POST
 * @param {string} endpoint - /movie
 * @param {function} callback
 * @returns {object} response - Returns a movie object
 * @description Adds a new movie
 * @example body {
 * Title: 'movie1',
 * Description: 'movie1 description',
 * Genres: {name: 'genre1', description: 'genre1 description'},
 * Directors: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'},
 * Ratings: 8,
 * Release_Date: '2022-09-12',
 * imageURL: 'imageURL',
 * Featured: true
 * }
 * @example response {
 * _id: 123456789,
 * Title: 'movie1',
 * description: 'movie1 description',
 * Genres: {name: 'genre1', description: 'genre1 description'},
 * Directors: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'},
 * Ratings: 7,
 * Release_Date: '1999-09-01',
 * imageURL: 'imageURL',
 * Featured: true
 * }
 * @throws Will throw an error if the movie already exists
 * @throws Will throw an error if the genre is not found
 * @throws Will throw an error if the director is not found
 */
app.post('/movie', passport.authenticate('jwt', {session: false}), async(req, res)=>{
  await Movies.findOne({Title: req.body.Title})  // Search to see if a user with the requested username already exists
 .then((movie)=>{    //If the user is found, send a response that it already exists
   if(movie){
     return res.status(400).send(req.body.Title + ' already exists');
   }else{
     Movies.create({
       Title: req.body.Title,
       Description : req.body.Description,
       Genres : req.body.Genres,
       Directors : req.body.Directors,
       Actors: req.body.Actors,
       Release_Date: req.body.Release_Date,
       Ratings: req.body.Ratings,
       imgaeURL: req.body.imgaeURL,
       Featured: req.body.Featured
      
     }).then((movie)=>{
       res.status(201).json(movie);
     }).catch((err)=>{
       console.error(err);
       res.status(500).send('Error : ' + err);
     })
   }
 })
})


// app.post("/api/movies", async (req, res) => {
//   try {
//     const newMovieData = req.body;
//     const newMovie = new Movies(newMovieData);
//     const savedMovie = await newMovie.save();
//     res.status(201).json(savedMovie);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// add a genre
app.post('/genre', passport.authenticate('jwt', {session: false}), async(req, res)=>{
  Genres.findOne({name: req.body.name})
  .then((genre)=>{
    if(genre){
      return res.status(400).send(req.body.name + 'already exists')
    }else{
      Genres.create({
        name: req.body.name,
        description: req.body.description
      }).then((genre)=>{
        res.status(201).json(genre);
      }).catch((err)=>{
        console.error(err);
        res.status(500).send('Error : ' +err);
      })
    }
  })
})

// add a director
app.post('/director', passport.authenticate('jwt', {session: false}), async(req, res)=>{
  Directors.findOne({name: req.body.name})
  .then((director)=>{
    if(director){
      return res.status(400).send(req.body.name + 'already exists')
    }else{
      Directors.create({
        name: req.body.name,
        bio: req.body.bio,
        birth_year: req.body.birth_year,
        death_year: req.body.death_year
      }).then((director)=>{
        res.status(201).json(director);
      }).catch((err)=>{
        console.error(err);
        res.status(500).send('Error : ' +err);
      })
    }
  })
})

// add a actor
app.post('/actor', passport.authenticate('jwt', {session: false}), async(req, res)=>{
  Actors.findOne({name: req.body.name})
  .then((actor)=>{
    if(actor){
      return res.status(400).send(req.body.name + 'already exists')
    }else{
      Actors.create({
        name: req.body.name,
        birth_date: req.body.birth_date,
        
      }).then((actor)=>{
        res.status(201).json(actor);
      }).catch((err)=>{
        console.error(err);
        res.status(500).send('Error : ' +err);
      })
    }
  })
})

/**
 * @method GET
 * @param {string} endpoint - /movies
 * @param {function} callback 
 * @returns {object} response - Returns a list of all movies
 * @description Returns a list of all movies
 * @example response [
 * {
 * _id: 123456789, 
 * Title: 'movie1', 
 * Description: 'movie1 description', 
 * Genres: {name: 'genre1', description: 'genre1 description'}, 
 * Directors: {name: 'director1', bio: 'director1 bio', birth_year: '01/01/2000', death_year: '01/01/2000'}, 
 * Actors: {name: 'actor1', birth_date: ''},
 * Ratings: 8,
 * Release_Date: 2021-04-18,
 * imageURL: 'imageURL', 
 * Featured: true
 * }, [] ]
 * @throws Will throw an error if something goes wrong
 */

app.get('/movies', passport.authenticate('jwt', {session: false}), (req,res)=>{
  Movies.find()
  .populate('Genres')
  .populate('Directors')
  .populate('Actors')
  .then((movies)=>{
    res.status(200).json(movies);
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error : ' + err)
  })
})

// Get all directors

app.get('/directors', passport.authenticate('jwt', {session: false}), (req,res)=>{
  Directors.find()
  .then((director)=>{
    res.status(200).json(director);
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error : ' + err)
  })
})


// Get a movie by title
/**
 * @method GET
 * @param {string} endpoint - /movies/:title
 * @param {function} callback
 * @returns {object} response - Returns a movie object
 * @description Returns a movie object
 * @example response {
 * _id: 123456789,
 * Title: 'movie1',
 * Description: 'movie1 description',
 * Genres: {name: 'genre1', description: 'genre1 description'},
 * Directors: {name: 'director1', bio: 'director1 bio', birth: '01/01/2000', death: '01/01/2000'},
 * imageURL: 'imageURL',
 * Ratings: 7,
 * Release_Date: 2023-09-12,
 * featured: true
 * }
 * @throws Will throw an error if the movie is not found
 */
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
	Movies.findOne({ Title: req.params.title })
  .populate('Genres')
  .populate('Directors')
  .populate('Actors')
		.then((movie) => {
			if (!movie) {
				return res.status(404).send('Error: ' + req.params.Title + ' was not found');
			}
			res.status(200).json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * @method GET
 * @param {string} endpoint - /movies/genre/:genreName
 * @param {function} callback
 * @returns {object} response - Returns a genre object
 * @description Returns a genre object
 * @example response {
 * name: 'genre1',
 * description: 'genre1 description'
 * }
 * @throws Will throw an error if the genre is not found
 */
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false}), (req, res) => {
	Genres.find({'name': req.params.genreName })
  
		.then((genre) => {
			if (genre.length === 0) {
				return res.status(404).send('Error: no genre found with the ' + req.params.name + ' genre type.');
			} else {
				res.status(200).json(genre);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// get director info by name
/**
 * @method GET
 * @param {string} endpoint - /movies/director/:directorName
 * @param {function} callback
 * @returns {object} response - Returns a director object
 * @description Returns a director object
 * @example response {
 * name: 'director1',
 * bio: 'director1 bio'
 * birth_year: '01/01/2000'
 * death_year: '01/01/2000'
 * }
 * @throws Will throw an error if the director is not found
 */
app.get('/movies/director/:directorName', passport.authenticate('jwt', {session: false}), (req, res) => {
	Directors.find({'name': req.params.directorName })
		.then((director) => {
			if (director.length === 0) {
				return res.status(404).send('Error: no director found with the ' + req.params.name + 'name.');
			} else {
				res.status(200).json(director);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// get actor info by name
/**
 * @method GET
 * @param {string} endpoint - /movies/actor/:actorName
 * @param {function} callback
 * @returns {object} response - Returns a director object
 * @description Returns a director object
 * @example response {
 * name: 'director1',
 * birth_date: '1998-09-12'
 * }
 * @throws Will throw an error if the director is not found
 */
app.get('/movies/actor/:actorName', passport.authenticate('jwt', {session: false}), (req, res) => {
	Actors.find({'name': req.params.actorName })
		.then((actor) => {
			if (actor.length === 0) {
				return res.status(404).send('Error: no actor found with the ' + req.params.name + 'name.');
			} else {
				res.status(200).json(actor);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});


/**
 * @method POST
 * @param {string} endpoint - /users
 * @param {function} callback
 * @returns {object} response - Returns a user object
 * @description Adds a new user
 * @example body {
 * username: 'user1',
 * password: 'password',
 * email: '',
 * birth_date: '01/01/2000'
 * }
 * @example response {
 * _id: 123456789,
 * username: 'user1',
 * password: 'password',
 * email: '',
 * birth_date: '01/01/2000',
 * favorite_movies: [123456789, 123456789]
 * }
 * @throws Will throw an error if the user already exists
 * @throws Will throw an error if the username contains non alphanumric characters
 * @throws Will throw an error if the username is less than 5 characters
 * @throws Will throw an error if the email is not valid
 * @throws Will throw an error if the password is empty
 * @throws Will throw an error if the birthday is not a date
 * @throws Will throw an error if the birthday is not in the past
 */
app.post('/users',
// Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed 
[
  check('username', 'Username is required').isLength({min: 5}),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be valid').isEmail()
],  
  async (req, res)=>{
    //check the validation object for errors
    let errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({errors: errors.array()});
    }
  let hashPassword = Users.hashPassword(req.body.password);   // hash any password by user when registering before storing in mongoDB
  await Users.findOne({username: req.body.username})  // Search to see if a user with the requested username already exists
 .then((user)=>{    //If the user is found, send a response that it already exists
   if(user){
     return res.status(400).send(req.body.username + ' already exists');
   }else{
     Users.create({
       username: req.body.username,
       password : hashPassword,
       email : req.body.email,
       birth_date : req.body.birth_date,
      //  favorite_movies: req.body.favorite_movies
     }).then((user)=>{
       res.status(201).json(user);
     }).catch((err)=>{
       console.error(err);
       res.status(500).send('Error : ' + err);
     })
   }
 }).catch((err)=>{
   console.error(err);
   res.status(500).send('Error : ' + err);
})
})


// update user's info
/**
 * @method PUT 
 * @param {string} endpoint - /users/:username
 * @param {function} callback
 * @returns {object} response - Returns a user object
 * @description Updates a user
 * @example body {
 * username: 'user1',
 * password: 'password',
 * email: '',
 * birth_date: '01/01/2000'
 * }
 * @example response {
 * _id: 123456789,
 * username: 'user1',
 * password: 'password',
 * email: '',
 * birth_date: '01/01/2000',
 * favorite_movies: [123456789, 123456789]
 * }
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the user is not the same as the user being updated
 */
app.put('/users/:username', passport.authenticate('jwt', { session: false }),
[
  check('username', 'Username is required').isLength({min: 5}),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be valid').isEmail()
],
 async (req, res) => {
  // CONDITION TO CHECK ADDED HERE
  if(req.user.username !== req.params.username){
      return res.status(400).send('Permission denied');
  }
  // CONDITION ENDS
  let hashPassword = Users.hashPassword(req.body.password); 
  await Users.findOneAndUpdate({ username: req.params.username }, {
      $set:
      {
          username: req.body.username,
          password: hashPassword,
          email: req.body.email,
          birth_date : req.body.birth_date
      }
  },
      { new: true }) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
          res.json(updatedUser);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send('Error: ' + err);
      })
});



// get all user
/**
 * @method GET
 * @param {string} endpoint - /users
 * @param {function} callback
 * @returns {object} response - Returns a list of all users 
 * @description Returns a list of all users   
 * @example response [
 * {
 * _id: 123456789,
 * username: 'user1',
 * password: 'password',
 * email: '',
 * birth_date: '01/01/2000',
 * favorite_movies: [123456789, 123456789]
 *  }, [] ]
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the user is not the same as the user being updated
 */
app.get('/users', (req, res) => {
  Users.find()
  // .populate('Movies')
   .then((users) => {
     res.status(200).json(users);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
   });
});



// Get a user by username
/**
 * @method GET
 * @param {string} endpoint - /movies/user/:username
 * @param {function} callback
 * @returns {object} response - Returns a director object
 * @description Returns a director object
 * @example response {
 * _id: 123456789,
 * username: 'user1',
 * password: 'password',
 * email: '',
 * birth_date: '01/01/2000',
 * favorite_movies: [123456789, 123456789]
 * @throws Will throw an error if the user is not found
 */
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ username: req.params.username })
  // .populate('Movies', 'Title')
   .then((user) => {
     res.json(user);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
   });
});



// Add a movie to a user's list of favorites
/**
 * @method POST 
 * @param {string} endpoint - /users/:username/movies/:movieId
 * @param {function} callback
 * @returns {object} response - Returns a user object
 * @description Adds a movie to users array
 * @example response {
 * _id: 123456789,
 * username: 'user1',
 * password: 'password',
 * email: '',
 * birth_date: '01/01/2000',
 * favorite_movies: [123456789]  
 * }
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the movie is not found
 * @throws Will throw an error if the movie is already in the users array
 */
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, {
    $push: { favorite_movies: req.params.movieId }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
   if (!updatedUser) {
     return res.status(404).send('Error: User was not found');
   } else {
     res.json(updatedUser);
   }
 })
 .catch((error) => {
   console.error(error);
   res.status(500).send('Error: ' + error);
 });
});


// remove movie from user's favorite list by username
/** 
 * @method DELETE
 * @param {string} endpoint - /users/:username/movies/:movieId
 * @param {function} callback
 * @returns {object} response - Returns a user object
 * @description Deletes a movie from users array
 * @example response {
 * _id: 123456789,
 * name: 'user1',
 * password: 'password',
 * email: '',
 * birth_date: '01/01/2000',
 * favorite_movies: []
 * }
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the movie is not found
 * @throws Will throw an error if the movie is not in the users array
 */
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
 Users.findOneAndUpdate({ username: req.params.username }, {
   $pull: { favorite_movies: req.params.movieId }
 },
 { new: true }) // This line makes sure that the updated document is returned
 .then((updatedUser) => {
   if (!updatedUser) {
     return res.status(404).send('Error: User not found');
   } else {
    //  res.send('MovieId : ' +req.params.id + 'was deleted.').json(updatedUser);
      res.json(updatedUser);
   }
 })
 .catch((error) => {
   console.error(error);
   res.status(500).send('Error: ' + error);
 });
});


// Delete a user by username
/**
 * @method DELETE
 * @param {string} endpoint - /users/:username
 * @param {function} callback
 * @returns {string} response - Returns a string
 * @description Deletes a user
 * @example response 'user1 was deleted'
 * @throws Will throw an error if the user is not found
 * @throws Will throw an error if the user has movies in their favoriteMovies array
 */
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ username: req.params.username })
   .then((user) => {
     if (!user) {
       res.status(400).send(req.params.username + ' was not found');
     } else {
       res.status(200).send(req.params.username + ' was deleted.');
     }
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
   });
});


// set up error handling
app.use((err, req, res, next)=>{
  console.error(err.stack);
  res.status(500).send('Something broke!');

})
// listen for requests
const port = process.env.PORT || 8080;
app.listen(port,'0.0.0.0',()=>{
  console.log("Listening on port " + port);
});

























































// ================================================== 2.8 =====================================

// create a user
// app.post('/users',  async (req, res)=>{
//   await Users.findOne({username: req.body.username}) // Search to see if a user with the requested username already exists
//  .then((user)=>{
//    if(user){    //If the user is found, send a response that it already exists
//      return res.status(400).send(req.body.username + ' already exists');
//    }else{
//      Users.create({
//        username: req.body.username,
//        password : req.body.password,
//        email : req.body.email,
//        birth_date : req.body.birth_date,
//        favorite_movies: req.body.favorite_movies
//      }).then((user)=>{
//        res.status(201).json(user);
//      }).catch((err)=>{
//        console.error(err);
//        res.status(500).send('Error : ' + err);
//      })
//    }
//  }).catch((err)=>{
//    console.error(err);
//    res.status(500).send('Error : ' + err);
// })
// })

// ========================================  2.8  ======================================================

// // Get all movies
// app.get('/movies', (req, res) => {
// 	Movies.find()
// 		.then((movies) => {
// 			res.status(200).json(movies);
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 			res.status(500).send('Error: ' + err);
// 		});
// });

// // Get movie by title
// app.get('/movies/:Title', (req, res) => {
// 	Movies.findOne({ Title: req.params.Title })
// 		.then((movie) => {
// 			if (!movie) {
// 				return res.status(404).send('Error: ' + req.params.Title + ' was not found');
// 			}
// 			res.status(200).json(movie);
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 			res.status(500).send('Error: ' + err);
// 		});
// });




// // get Genre info for specific Genre
// app.get('/genre/:name', (req, res) => {
// 	Genres.find({'name': req.params.name })
// 		.then((genre) => {
// 			if (genre.length == 0) {
// 				return res.status(404).send('Error: no genre found with the ' + req.params.name + ' genre type.');
// 			} else {
// 				res.status(200).json(genre);
// 			}
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 			res.status(500).send('Error: ' + err);
// 		});
// });

// // get director info by name
// app.get('/director/:name', (req, res) => {
// 	Directors.find({'name': req.params.name })
// 		.then((director) => {
// 			if (director.length == 0) {
// 				return res.status(404).send('Error: no director found with the ' + req.params.name + ' name.');
// 			} else {
// 				res.status(200).json(director);
// 			}
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 			res.status(500).send('Error: ' + err);
// 		});
// });


// // Get movies by genre name
// app.get('/movies/genre/:name', (req, res) => {
// 	Movies.find({'Genres.name': req.params.name })
// 		.then((movies) => {
// 			if (movies.length == 0) {
// 				return res.status(404).send('Error: no movies found with the ' + req.params.Genres + ' genre type.');
// 			} else {
// 				res.status(200).json(movies);
// 			}
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 			res.status(500).send('Error: ' + err);
// 		});
// });

// // Get movies by director name
// app.get('/movies/directors/:id', (req, res) => {
// 	Movies.find({ 'Directors.id': req.params.id })
// 		.then((movies) => {
// 			if (movies.length == 0) {
// 				return res.status(404).send('Error: no movies found with the director ' + req.params.id + ' name');
// 			} else {
// 				res.status(200).json(movies);
// 			}
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 			res.status(500).send('Error: ' + err);
// 		});
// });


// // create a user
// app.post('/users', (req, res)=>{
//    Users.findOne({username: req.body.username})
//   .then((user)=>{
//     if(user){
//       return res.status(400).send(req.body.username + ' already exists');
//     }else{
//       Users.create({
//         username: req.body.username,
//         password : req.body.password,
//         email : req.body.email,
//         birth_date : req.body.birth_date
//         // favorite_movies: req.body.favorite_movies
//       }).then((user)=>{
//         res.status(201).json(user);
//       }).catch((err)=>{
//         console.error(err);
//         res.status(500).send('Error : ' + err);
//       })
//     }
//   }).catch((err)=>{
//     console.error(err);
//     res.status(500).send('Error : ' + err);
// })
// })



// // get all user
// app.get('/users',  (req, res) => {
//    Users.find()
//     .then((users) => {
//       res.status(201).json(users);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });



// // Get a user by username
// app.get('/users/:username',  (req, res) => {
//    Users.findOne({ username: req.params.username })
//     .then((user) => {
//       res.json(user);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });

// // Update a user's info, by username
// app.put('/users/:username',  (req, res) => {
//    Users.findOneAndUpdate({ username: req.params.username }, 
//     { 
//       $set:
//       {
//       username: req.body.username,
//       password : req.body.password,
//       email : req.body.email,
//       birth_date : req.body.birth_date
//      }
//   },
//   { new: true }) // This line makes sure that the updated document is returned
//   .then((user) => {
//     if (!user) {
//       return res.status(404).send('Error: No user was found');
//     } else {
//       res.json(user);
//     }
//   })
//   .catch((err) => {
//     console.error(err);
//     res.status(500).send('Error: ' + err);
//   });
// });

// // Add a movie to a user's list of favorites
// app.post('/users/:username/movies/:id',  (req, res) => {
//    Users.findOneAndUpdate({ username: req.params.username }, {
//      $push: { favorite_movies: req.params.id }
//    },
//    { new: true }) // This line makes sure that the updated document is returned
//    .then((updatedUser) => {
//     if (!updatedUser) {
//       return res.status(404).send('Error: User was not found');
//     } else {
//       res.json(updatedUser);
//     }
//   })
//   .catch((error) => {
//     console.error(error);
//     res.status(500).send('Error: ' + error);
//   });
// });

// // remove movie from user's favorite list by username
// app.delete('/users/:username/movies/:id',  (req, res) => {
//   Users.findOneAndUpdate({ username: req.params.username }, {
//     $pull: { favorite_movies: req.params.id }
//   },
//   { new: true }) // This line makes sure that the updated document is returned
//   .then((updatedUser) => {
//     if (!updatedUser) {
//       return res.status(404).send('Error: User not found');
//     } else {
//       res.json(updatedUser);
//     }
//   })
//   .catch((error) => {
//     console.error(error);
//     res.status(500).send('Error: ' + error);
//   });
// });


// // Delete a user by username
// app.delete('/users/:username',  (req, res) => {
//    Users.findOneAndRemove({ username: req.params.username })
//     .then((user) => {
//       if (!user) {
//         res.status(400).send(req.params.username + ' was not found');
//       } else {
//         res.status(200).send(req.params.username + ' was deleted.');
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });



// ================================================================


// list of 5 movies
// let movies = [

//         {
              // "movieId" : "m1",
//           "Title" : "The Godfather",
//           "Description": "The patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
//           "Genres": 
//             {
//               "Name" :"Crime",
//               "Description": "Movies in this genre explore criminal activities, their consequences, and the moral dilemmas faced by the characters.",
//             },
          
          
//           "Directors":
//             {
//               "Name": "Francis Ford Coppola",
//               "Bio" : "Francis Ford Coppola is an American film director, producer, and screenwriter. He is best known for directing the critically acclaimed 'The Godfather trilogy' and the Vietnam War epic Apocalypse Now. Coppola has won multiple Academy Awards during his career and is considered one of the most influential filmmakers in the history of cinema.",
//               "DOB" : "April 7, 1939",
              
//             },
          
//           "Actors": [
//               {
//                 "Name": "Marlon Brando",
//                 "DOB": "April 3, 1924",
//               },
//               {
//                 "Name": "Al Pacino",
//                 "DOB": "April 25, 1940",
//               },
//             ],
//           "Release_date": 1972,
//           "Rating": 9.2,
//           "imageURL": "https://www.imdb.com/title/tt0068646/mediaviewer/rm746868224/?ref_=tt_ov_i",
//           "Featured": false,
//         },

//         {
              // "movieId" : "m2",            
//           "Title" : "Inception",
//           "Description": "A thief, who enters people's dreams to steal their secrets, is given a final job where he must implant an idea into someone's mind.",
//           "Genres":
//             {
//               "Name" :"Science Fiction",
//               "Description": "Sci-Fi films combine futuristic or scientific concepts with intense action sequences, often set in space, the future, or with advanced technology.",
//             },
            
            
//           "Directors":
//             {
//               "Name": "Christopher Nolan",
//               "Bio" : "Christopher Nolan is a British-American film director, producer, and screenwriter known for his work on films such as 'Inception', 'The Dark Knight Trilogy', 'Interstellar, and Dunkirk. Nolan is known for his innovative storytelling and contributions to the science fiction and superhero genres.",
//               "DOB" : "July 30, 1970",
              
//             },
          
//           "Actors": [
//               {
//                 "Name": " Leonardo DiCaprio",
//                 "DOB": "November 11, 1974" ,
//               },
//               {
//                 "Name": " Joseph Gordon-Levitt",
//                 "DOB": "February 17, 1981",
//               },
//               {
//                 "Name": "Ellen Page",
//                 "DOB": "February 21, 1987",
//               },
               
//             ],
//           "Release_date": 2010 ,
//           "Rating": 8.8,
//           "imageURL": "https://www.imdb.com/title/tt1375666/mediaviewer/rm3426651392/?ref_=tt_ov_i",
//           "Featured": true,
//           },
        
//         {
          
              // "movieId" : "m3",
//           "Title" : "The Shawshank Redemption",
//           "Description": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
//           "Genres":
//              {
//             "Name" :"Drama",
//             "Description": "Drama films portray realistic and emotional stories focusing on the characters' personal development and life challenges.",
//           },
          
            
//           "Directors":
//             {
//               "Name": "Frank Darabont",
//               "Bio" : "Frank Darabont is an American filmmaker, screenwriter, and director. He is renowned for his work in adapting Stephen King's stories into successful films, including 'The Shawshank Redemption' and 'The Green Mile.' Darabont is known for his skill in creating emotionally powerful and character-driven narratives.",
//               "DOB" : "January 28, 1959",
              
//             },
         
//           "Actors": [
//               {
//                 "Name": "Tim Robbins",
//                 "DOB": "October 16, 1958" ,
//               },
//               {
//                 "Name": "Morgan Freeman",
//                 "DOB": "June 1, 1937",
//               },
//             ],
//           "Release_date": 1994 ,
//           "Rating": 9.3 ,
//           "imageURL": "https://www.imdb.com/title/tt0111161/mediaviewer/rm1690056449/?ref_=tt_ov_i",
//           "Featured": false,
//           },
         
//             {
              // "movieId" : "m4",
//           "Title" : "The Dark Knight",
//           "Description": "When the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
//           "Genres":
//             {
//               "Name" :"Action",
//               "Description": "Action movies feature characters with extraordinary abilities who engage in thrilling action sequences, typically battling supervillains to save the world.",
//             },
          
//           "Directors":
//             {
//               "Name": "Christopher Nolan",
//               "Bio" : "Christopher Nolan is a British-American film director, producer, and screenwriter known for his work on films such as 'Inception', 'The Dark Knight Trilogy', 'Interstellar, and Dunkirk. Nolan is known for his innovative storytelling and contributions to the science fiction and superhero genres.",
//               "DOB" : "July 30, 1970",
//             },
      
//           "Actors": [
//               {
//                 "Name": "Christian Bale",
//                 "DOB": "January 30, 1974",
//               },
//               {
//                 "Name": "Heath Ledger",
//                 "DOB": "April 4, 1979",
//                 "Death": "January 22, 2008"
//               },
//             ],
//           "Release_date": 2008 ,
//           "Rating": 9.0 ,
//           "imageURL": "https://www.imdb.com/title/tt0468569/mediaviewer/rm4023877632/?ref_=tt_ov_i/",
//           "Featured": true,
//           },

//           {   
              // "movieId" : "m5",
//           "Title" : "Forrest Gump",
//           "Description": "Through three decades of U.S. history, a man with a low IQ witnesses and unwittingly influences several defining historical events in the 20th century United States.",
//           "Genres":
            
//             {
//               "Name" :"Romance",
//               "Description": "Romance films incorporate song and dance numbers to tell romantic stories, where music and choreography play a significant role in the narrative",
//             },
          
//           "Directors":
//             {
//               "Name": "Robert Zemeckis",
//               "Bio" : "Robert Zemeckis is an American filmmaker, screenwriter, and producer. He is famous for directing and co-writing the 'Back to the Future' trilogy, 'Forrest Gump,' 'Cast Away,' and 'Who Framed Roger Rabbit.' Zemeckis is known for his innovative use of visual effects and storytelling techniques in his films.",
//               "DOB" : "May 14, 1951",
              
//             },
        
//           "Actors": [
//               {
//                 "Name": "Tom Hanks",
//                 "DOB": "July 9, 1956" ,
//               },
//               {
//                 "Name": "Robin WrightT",
//                 "DOB":  "April 8, 1966",
//               },
//             ],
//           "Release_date": 1994,
//           "Rating": 8.8,
//           "imageURL": "https://www.imdb.com/title/tt0109830/mediaviewer/rm1954748672/?ref_=tt_ov_i",
//           "Featured": false
//           },

//       ];

//       let users = [
//         {
//           "id": 1,
//           "Name": "Kim",
//           "Password": "kim@123",
//           "Email": "kim@gmail.com",
//           "DOB": "September 23, 1998",
//           "favoriteMovies": ["The God Father"]
//         },
//         {
//           "id": 2,
//           "Name": "Jow",
//           "Password": "joe@123",
//           "Email": "joe@gmail.com",
//           "DOB": "Septemver 30, 1988",
//           "favoriteMovies": [] 
//         },
//         {
//           "id": 3,
//           "Name": "Rony",
//           "Password": "rony@123",
//           "Email": "rony@gmail.com",
//           "DOB": "Septemver 12, 1978",
//           "favoriteMovies": ["Inception"] 
//         },
//         {
//           "id": 4,
//           "Name": "Krish",
//           "Password": "k@123",
//           "Email": "k@gmail.com",
//           "DOB": "July 12, 1994",
//           "favoriteMovies": []
//         },
//         {
//           "id": 6,
//           "Name": "Rubi",
//           "Password": "rubi@123",
//           "Email": "rubi@gmail.com",
//           "DOB": "June 12, 1994",
//           "favoriteMovies": ["The God Father"]
//         },

        
//         ];


// //  GET all movie list

//   app.get('/movies', (req, res)=>{
//     res.status(200).json(movies);
//   });


//   //  get about a single movie by title

//   app.get('/movies/:title', (req, res)=>{
//     const  {title} = req.params;
//     const movie = movies.find(movie => movie.Title === title); 
     
//     if(movie){
//       res.status(200).json(movie);
//     }else{
//       res.status(400).send('no such movie');
//     }
//   })

//   // get about a movie by genre name

//   app.get('/movies/genre/:genreName', (req, res)=>{
//     const  {genreName} = req.params;
//     const genre = movies.find(movie => movie.Genres.Name === genreName).Genres; 
     
//     if(genre){
//       res.status(200).json(genre);
//     }else{
//       res.status(400).send('no such genre');
//     }
//   })

//   // get  about a director by name
//   app.get('/movies/director/:directorName', (req, res)=>{
//     const  {directorName} = req.params;
//     const director = movies.find(movie => movie.Directors.Name === directorName).Directors; 
     
//     if(director){
//       res.status(200).json(director);
//     }else{
//       res.status(400).send('no such director');
//     }
//   });


  // create  a new user by name
  // app.post('/users', (req, res)=>{
  //   const  newUser = req.body;
  //   if(newUser.Name){
  //     newUser.id = uuid.v4();
  //     users.push(newUser);
  //     res.status(200).json(newUser);
  //   }else{
  //     res.status(400).send('User needs name');
  //   }
    
//   // });

//   // update user info

//   app.put('/users/:id', (req, res)=>{
//     const {id} = req.params;
//     const  updateUser = req.body;
//     let user = users.find(user => user.id == id);
//     if (user){
//       user.Name = updateUser.Name;
//       user.Password= updateUser.Password;
//       user.Email= updateUser.Email;
//       user.DOB= updateUser.DOB;
//       user.favoriteMovies= updateUser.favoriteMovies;
//       res.status(200).json(user);
//     }else{
//       res.status(400).send('User does not found.')
//     }
//   })

//   //add a movie to user favorites list

//   app.post('/users/:id/:movieId', (req, res)=>{
//     const {id, movieId} = req.params;
    
//     let user = users.find(user => user.id == id);
//     if (user){
      
//       user.favoriteMovies.push(movieId);
//       res.status(200).send(`${movieId} has been added to user ${id}'s array.`);
//     }else{
//       res.status(400).send('no such user');
//     }
//   })

//   // remove a movie from user favorites list

//   app.delete('/users/:id/:movieId', (req, res)=>{
//     const {id, movieId} = req.params;
    
//     let user = users.find(user => user.id == id);
//     if (user){
      
//       user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieId);
//       res.status(200).send(`${movieId} has been removed to user ${id}'s array.`);
//     }else{
//       res.status(400).send('no such user');
//     }
//   })

//   // delete existing users 

//   app.delete('/users/:id', (req, res)=>{
//     const {id} = req.params;
    
//     let user = users.find(user => user.id == id);
//     if (user){
      
//       users = users.filter(user => user.id != id);
//       // res.json(users);
//       res.status(200).send(`User ${id} has been deleted.`);
//     }else{
//       res.status(400).send('no such user');
//     }
//   })


//   app.get('/documentation.html', (req, res)=>{
//     res.sendFile('public/documentation.html', {root: __dirname});
//   });
// app.get('/movies', (req, res)=>{
//   res.json(topMovies);
// });





// =====================================   Exercise : 2.4 =============================================================

// const express = require('express'),
//  morgan = require('morgan'),
// fs = require('fs'), // import built in node modules fs and path 
// path = require('path');
// const app = express();


// let topMovies = [
//     {
//     title: 'Harry Potter and the Sorcerer\'s Stone',
//     author: 'J.K. Rowling',
//     year: 2001
//   },
//   {
//     title: 'Lord of the Rings',
//     author: 'J.R.R. Tolkien',
//     year: 2001
//   },
//   {
//     title: 'Twilight',
//     author: 'Stephanie Meyer',
//     year: 2008
//   },
//   {
//     title: 'Inception',
//     author: 'Christopher Nolan',
//     year: 2010
//   },
//   {
//     title: 'Interstellar',
//     author: ['Jonathan Nolan','Christopher Nolan'],
//     year: 2014
//   },
//   {
//     title: 'Lord of War',
//     author: 'Andrew Niccol',
//     year: 2005
//   },
//   {
//     title: 'Dilwale Dulhania Le Jayenge',
//     author: 'Aditya Chopra',
//     year: 1995
//   },
//   {
//     title: '3 Idiots',
//     author: 'Chetan Bhagat',
//     year: 2009
//   },
//   {
//     title: 'Queen',
//     author: 'Anvita Dutt Guptan',
//     year: 2014
//   },
//   {
//     title: 'Lagaan',
//     author: 'Ashutosh Gowariker',
//     year: 2001
//   },
  
//   ];

//  // setup logging

//  const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
//  app.use(morgan('combined', {stream: accessLogStream}));  // enable morgan logging to 'log.txt'

// // setup app routing
// app.use(express.static('public'));

// // GET request
//   app.get('/', (req, res)=>{
//     res.send('Welcome to myFlix application!');
//   });
//   app.get('/documentation.html', (req, res)=>{
//     res.sendFile('public/documentation.html', {root: __dirname});
//   });
// app.get('/movies', (req, res)=>{
//   res.json(topMovies);
// });


// // set up error handling
// app.use((err, req, res, next)=>{
//   console.error(err.stack);
//   res.status(500).send('Something broke!');

// })
// // listen for requests

// app.listen(8080,()=>{
//   console.log("My server is running on port 8080.");
// });


// --------------------------------------------------------------------------------------------------------------




























//---------------------------------------------------------------------------------------------------

// fs = require('fs'), // import built in node modules fs and path 
// path = require('path');
// fs.createWriteStream create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory and path.join appends it to a ‘log.txt’ file. 
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
// // setup the logger
// app.use(morgan('combined', {stream: accessLogStream}));

// app.get('/', (req, res) => {
//   res.send('Welcome to my app!');
// });

// app.get('/secreturl', (req, res) => {
//   res.send('This is a secret url with super top-secret content.');
// });




//?--------------using morgan   ----------------------
// app.use(morgan('common'));
// app.get('/', (req, res) => {
//   res.send('Welcome to my app!');
// });

// app.get('/secreturl', (req, res) => {
//   res.send('This is a secret url with super top-secret content.');
// });


// ---------------------------------------




//? ------ with timestamp -----------------------------

// myLogger() is used to log the request URL to the terminal.
// let myLogger = (req, res, next) => {
//   console.log(req.url);
//   next();
// };

// let requestTime = (req, res, next)=>{
//   req.requestTime = Date.now();
//   next();
// }

// app.use(myLogger);
// app.use(requestTime);


// app.get('/', (req, res) => {
//   let responseText ='Welcome to my app!';
//   responseText += 'Requested at :' + req.requestTime;
//   res.send(responseText);
// });

// app.get('/secreturl', (req, res) => {
//   let responseText ='This is a secret url with super top-secret content.';
//   responseText += 'Requested at :' + req.requestTime;
//   res.send(responseText);
// });

// -------------------------------------------------------------




//? ----------------------

// let topBooks = [
//   {
//   title: 'Harry Potter and the Sorcerer\'s Stone',
//   author: 'J.K. Rowling',
//   year: 2001
// },
// {
//   title: 'Lord of the Rings',
//   author: 'J.R.R. Tolkien',
//   year: 2001
// },
// {
//   title: 'Twilight',
//   author: 'Stephanie Meyer',
//   year: 2008
// },
// {
//   title: 'Inception',
//   author: 'Christopher Nolan',
//   year: 2010
// },
// {
//   title: 'Interstellar',
//   author: ['Jonathan Nolan','Christopher Nolan'],
//   year: 2014
// },
// {
//   title: 'Lord of War',
//   author: 'Andrew Niccol',
//   year: 2005
// },
// {
//   title: 'Dilwale Dulhania Le Jayenge',
//   author: 'Aditya Chopra',
//   year: 1995
// },
// {
//   title: '3 Idiots',
//   author: 'Chetan Bhagat',
//   year: 2009
// },
// {
//   title: 'Queen',
//   author: 'Anvita Dutt Guptan',
//   year: 2014
// },
// {
//   title: 'Lagaan',
//   author: 'Ashutosh Gowariker',
//   year: 2002
// },

// ]


// app.get('/', (req, res)=>{
//   res.send('Welcome to myBook movies club');

// })
// app.get('/documentation', (req, res)=>{
//   res.sendFile('public/documentation.html', {root: __dirname});
// })
// app.get('/books', (req, res)=>{
//   res.json(topBooks);
// });
// ----------------------------------------------------

































// const http = require('http');
// const fs = require('fs');
// const url = require('url');

// const statuscode = 200;
// const setHeader = {'Content Type ' : 'text/html' };
//  const hostname = 'localhost';
//  const port = 8080;

//  let server = http.createServer((req, res)=>{
//   let requestUrl = url.parse(req.url, true);
//   if(requestUrl.pathname == '/documentation.html'){
//     res.setHeader;
//     res.end("Documentation on Book API\n");
//   }else{
//     res.setHeader;
//     res.end('Welcome to myBook club....')
//   }
//   // res.statusCode;
//   // res.setHeader;
//   // res.end('Welcome to myBook club!!!!');
//  })
//  server.listen(port, hostname, ()=>{
//   console.log("My server is running in 8080 port");
//  })



























//! Notes:
//response.writeHead(200, {'Content-Type': 'text/plain'});

//the Content-Type of the HTTP response as text/plain.


// app.METHOD(PATH, HANDLER)
// The app here is an instance of express()
// “METHOD,” refers to an HTTP request method.
// “PATH” refers to a path on the server—in other words, the endpoint URL the request is targeting. 
// “HANDLER,” on the other hand, is the function to be executed when the route is matched. this is the callback function that’s executed when the route (or URL endpoint) is matched. It tells the server what kind of response to return in response to the request and takes the following format:

// (req, res) => {
  //logic here to send a response
// }
// The two parameters req and res contain data about the HTTP request (req) and allow you to control the HTTP response (res) respectively.


//? app.use((err, req, res, next) => {
// Information about the current error would be logged to the terminal using err.stack