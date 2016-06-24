var express = require('express');
var app = express();
var debug = require('debug')('cli-app');
//var ejs = require('ejs');
var bodyParser = require('body-parser');
var urlencodedBodyParser = bodyParser.urlencoded({
	extended: false
});
//var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.database('website.db');
//var methodOverride = require('method-override');

app.set('port', process.env.PORT || 2222); 

app.use(urlencodedBodyParser);
app.set('view_engine', 'ejs');
//app.use(methodOverride('_method'));
app.use(express.static('public'));

app.get('/', function (req, res) {
	res.render('index.html.ejs')
})

var server = app.listen(app.get('port'), function() {
	console.log('Listening on port ' + server.address().port)
	debug('Express server listening on port ' +  server.address().port);
});

//var listener = app.listen(8888, function(){
//	console.log('Listening on port ' + listener.address().port); //Listening on port 8888
//});

//app.listen(80, function(err){
//	console.log('listening on port 3000');
//})
