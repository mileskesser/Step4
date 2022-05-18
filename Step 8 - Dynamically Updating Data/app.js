
// App.js

/*
    SETUP
*/
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
PORT        = 9637;                 // Set a port number at the top so it's easy to change in the future

// app.js
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

// Database
var db = require('./database/db-connector')

// app.js - SETUP section
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'));         // this is needed to allow for the form to use the ccs style sheet/javscript
    

// app.js

app.get('/', function(req, res)
{
    let query1;

    // If there is no query string, we just perform a basic SELECT
    if (req.query.name === undefined)
    {
        query1 = "SELECT * FROM Donors;";
    }

    // If there is a query string, we assume this is a search, and return desired results
    else
    {
        query1 = `SELECT * FROM Donors WHERE name LIKE "${req.query.name}%"`
    }
    db.pool.query(query1, function(error, rows, fields){
        res.render('index', {data: rows});
    })
});


app.post('/add-person-form', function(req, res){
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Capture NULL values
    let donated = parseInt(data['input-donated']);
    if (isNaN(donated))
    {
        donated = '0'
    }

    let email = parseInt(data['input-email']);
    if (isNaN(email))
    {
        email = 'NULL'
    }

    // Create the query and run it on the database
    query1 = `INSERT INTO Donors (name, email, total_donated) VALUES ('${data['input-name']}', '${data['input-email']}', ${donated})`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else
        {
            res.redirect('/');
        }
    })
});


app.delete('/delete-person-ajax/', function(req,res,next){                                                                
    let data = req.body;
    let personID = parseInt(data.donor_id);
    let deleteBsg_People= `DELETE FROM Donors WHERE donor_id = '${personID}'`;
        // Run the second query
        db.pool.query(deleteBsg_People, [personID], function(error, rows, fields) {
            if (error) {
                console.log(error);
                res.sendStatus(400);
            } else {
                res.sendStatus(204);
            }
        })
  });


  app.put('/put-person-ajax', function(req,res,next){
    let data = req.body;
  
    let homeworld = parseInt(data.homeworld);
    let person = parseInt(data.fullname);
  
    let queryUpdateWorld = `UPDATE bsg_people SET homeworld = ? WHERE bsg_people.id = ?`;
    let selectWorld = `SELECT * FROM bsg_planets WHERE id = ?`
  
          // Run the 1st query
          db.pool.query(queryUpdateWorld, [homeworld, person], function(error, rows, fields){
              if (error) {
  
              // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
              console.log(error);
              res.sendStatus(400);
              }
  
              // If there was no error, we run our second query and return that data so we can use it to update the people's
              // table on the front-end
              else
              {
                  // Run the second query
                  db.pool.query(selectWorld, [homeworld], function(error, rows, fields) {
  
                      if (error) {
                          console.log(error);
                          res.sendStatus(400);
                      } else {
                          res.send(rows);
                      }
                  })
              }
  })});


/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});



