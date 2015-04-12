var express = require("express"),
	http = require("http"),
	redis = require("redis"),
	MongoClient = require('mongodb').MongoClient,
	app = express(),
	outcome = "",
	newUrl,
	link,
	genUrl,
	redirect,
	testUrl,
	view,
	data,
	found = 0,
	myJson = '{}';

app.use(express.static(__dirname + "/client"));

http.createServer(app).listen(3000);

app.get("/results.json", function (req, res) {
	res.json(myJson);
});

app.get("/listdb", function (req, res) {
	//iterating the DB

    MongoClient.connect("mongodb://localhost:27017/linksDb", function(err, db) {
  		if(!err) if(err) { return console.dir(err); }
    
  	
  		var collection = db.collection('links');
  	
  		collection.find().sort({views:-1}).toArray(function(err, items) { res.json(items); });
	});
});

app.get("/:urlLink", function (req, res) {
	//need to also increment the view, client.incr(shorturl)
	link = req.params.urlLink;

	MongoClient.connect("mongodb://localhost:27017/linksDb", function(err, db) {
  		if(!err) if(err) { return console.dir(err); }
  	
  		var collection = db.collection('links');
		
    	collection.findOne({shorturl:"" + link + ""},{_id:0}, function(err, item) { 
    		//update the views 
    		view = item.views + 1;
    		collection.update({shorturl:"" + link + ""}, {$set:{views:+view}}, {w:1}, function(err, result) {});
    		//redirect to the external URL
      		res.writeHead(301,{Location: 'http://' + item.longurl});
      		res.end();
      		view = 0;
    	});
	});
});

app.post("/:url", function (req, res) {
	newUrl = req.params.url;
	newUrl = newUrl.replace("-slashie-","/");
	newUrl = newUrl.replace("localhost:3000/","");

	processURL();
	//once done, return the JSON object back to the page
	setTimeout(function(){
		res.json(myJson);
	},1000);
});

//create a client to connect to redis
//client = redis.createClient();




function processURL() {
	genUrl = (Math.floor(Math.random() * 9) + 0)+""+(Math.floor(Math.random() * 9) + 0)+""+(Math.floor(Math.random() * 9) + 0)+""+(Math.floor(Math.random() * 9) + 0)+""+(Math.floor(Math.random() * 9) + 0);
    var exists = false;
    var shortExists = false;

	//enter the new URL in the mongodb
	MongoClient.connect("mongodb://localhost:27017/linksDb", function(err, db) {
  		if(!err) if(err) { return console.dir(err); }
    
    	console.log("We are connected and DB is created");
  	
  		var collection = db.collection('links');
		var newJson = [{shorturl:"" + genUrl + "",longurl:"" + newUrl + "",views:0}];

		//strip the localhost from the entered URL if it exists
		newURL = newUrl.replace(/localhost:3000\//g,"");

		//check to see if it's a short URL that exists
		collection.findOne({shorturl:"" + newUrl + ""},{_id:0}, function(err, item) {
			if (item != null) {
				console.log("found it: "+newUrl+" and the longurl is " + item.longurl);
				shortExists = true;
				myJson = '{"shortURL": "'+item.longurl+'"}';
			} else {
				//check to see if a long url exists
				collection.findOne({longurl:"" + newUrl + ""},{_id:0}, function(err, item) {
					if (item != null) {
						console.log("This long url is already in the DB");
						exists = true;
					}
				
					if (exists === false) {
						collection.insert(newJson, {w:1}, function(err, result) {
	    					myJson = '{"shortURL": "localhost:3000/'+genUrl+'"}';
						});
					} else {
						//display what is in the db already
						myJson = '{"shortURL": "localhost:3000/'+item.shorturl+'"}';
					}
				});
			}
		});

		
		

		//use the below command to clear the DB
		//collection.remove();
	});

	

};
