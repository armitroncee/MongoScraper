var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");

// mongoose.Promise = Promise;

var port = process.env.PORT || 3000

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

var databaseUri = "mongodb://localhost/MongoScraper";

// if (process.env.MONGODB_URI) {
//   mongoose.connect(process.env.MONGODB_URI)
// } else {
//   mongoose.connect(databaseUri)
// }

mongoose.connect("mongodb://heroku_kk2fhcbx:hhh222@ds151028.mlab.com:51028/heroku_kk2fhcbx")

var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.get("/", function(req, res) {
  Article.find({}, function(error, data) {

    res.render("home", {article: data});
  });
});

app.get("/saved", function(req, res) {
  Article.find({},function(error, data) {
    
    res.render("saved", {article: data});
  });
});


app.get("/scrape", function(req, res) {

  request("https://www.nytimes.com/", function(error, response, html) {

    var $ = cheerio.load(html);

    $("article").each(function(i, element) {

      var result = {};

      result.headline = $(this).children("h2").text();
      result.summary = $(this).children("p.summary").text();
      result.link = $(this).children("h2").children("a").attr("href");

      if(result.summary && result.headline) {
      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });
    }
  });
      res.end()
  });
});

app.get("/articles", function(req, res) {

  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.put("/articles/:id", function(req,res){
  Article.findOneAndUpdate({_id: req.params.id}, {saved: true}, function(error,data){
    if (error) {
      console.log(error)
    } else {
      res.json(data)
    }
  })
})

app.put("/article/:id", function(req,res){
  Article.findOneAndUpdate({_id: req.params.id}, {saved: false}, function(error,data){
    if (error) {
      console.log(error)
    } else {
      res.json(data)
    }
  })
})

app.get("/notes/:id", function(req, res) {

  Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/notes/:id", function(req, res) {

  Note.create(req.body)
    .then(function(dbNote) {
      return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });

});

app.listen(port, function() {
  console.log("App running on port " + port);
});