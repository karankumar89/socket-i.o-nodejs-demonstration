// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */
var express = require("express"),
    http = require("http"),
    // import the mongoose library
    mongoose = require("mongoose"),
    app = express();


app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

//http.createServer(app).listen(3000);
var server = app.listen(3000)
var io = require('socket.io').listen(server); // this tells socket.io to use our express server
var client_counter = 1;

io.on('connection', function (socket) {
    console.log('A new user connected! id:'+client_counter);
    socket.on("add", function(data) {
        io.sockets.emit("newToDO", data);
    });
    client_counter++;
});

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    console.log(req.body);
    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
	if (err !== null) {
	    // the element did not get saved!
	    console.log(err);
	    res.send("ERROR");
	} else {
	    // our client expects *all* of the todo items to be returned, so we'll do
	    // an additional request to maintain compatibility
	    ToDo.find({}, function (err, result) {
		if (err !== null) {
		    // the element did not get saved!
		    res.send("ERROR");
		}
		res.json(result);
	    });
	}
    });
});



/*io.on("connection", function(newToDOocket) {
    console.log("User connected");
    socket.on("add", function(data) {
        // sending back to every user and the sender too
console.log("Broadcast Emit");
        io.sockets.emit("newToDO", data);
    });
});*/