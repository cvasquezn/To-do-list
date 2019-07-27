//to simplify erased all code and file associated to date

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");//utility to work easly with string and other stuff
const favicon = require('serve-favicon');

const app = express();
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
//mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser:true }); // to work locally

const passMongoDB=process.env.passMongoDB; //to deploy on heroku
//const passMongoDB="<erased before git up on github>";//to test conection. Delete before deploy on heroku and save on github
const nameDB = "todolistDB";
const urlMongoDB = "mongodb+srv://admin-cvn:"+passMongoDB+"@cluster0-odrfg.mongodb.net/"+nameDB;

mongoose.connect(urlMongoDB, { useNewUrlParser:true }); //the url is get from mongoo atlas dashboard

const itemSchema = new mongoose.Schema({
	name: String,
	state: String
});
const Item = mongoose.model("Item",itemSchema);

var itemsWork = [];

const item1 = new Item({
	name:"Welcome to your todolist",
	state: "checked"
});

const item2 = new Item({
	name:"Hit the + button to add a new item",
	state: ""
});

const item3 = new Item({
	name:"<--hit this to delate an item",
	state: ""
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
	name:String,
	items:[itemSchema]
});

const List = mongoose.model("List", listSchema); //create a collection

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());//to work with data json send on a request: to update
app.set('view engine', 'ejs');
app.use(express.static("public"));// we have to say to the server what file to send to the client

app.get("/", function(req,res){

	Item.find({},function(err, foundItems){
	if(err){
		console.log("error trying cath data from db");
	}else{
		//verify there are not data in db, so I will add default data
		if(foundItems.length ===0){
			Item.insertMany(defaultItems, function(err){
					if(err){
						console.log(err);
					} else {
						console.log("Successfully saved dafault items to DB!")
					}
				});
			res.redirect("/");
		} else {
			console.log("data gotten");
			console.log(foundItems);
			res.render("list", { listTitle: "Today", items: foundItems }); //aca le digo que página mostrar. Por cada cambio que se haga se actualiza la pagina
		}

		
	}
})

});//fin get(/)


app.post("/delete", function(req, res){
	
	const checkedItemId = req.body.btnTrash;

		Item.findByIdAndRemove(checkedItemId, function(err){
			if(!err){
				console.log("Item successfully deleted")
			}
		})
		res.redirect("/");


});

app.post("/update", function(req, res){
	console.log("to update state");


	if(req.body.listTitle==="Today"){
		Item.updateOne({_id: req.body.id}, {state: req.body.state}, function(err){
		  if(err){
		    console.log(err);
		      //mongoose.connection.close();
		  } else {
		    console.log("Succesfully updated item's state");
		      //mongoose.connection.close();
		  }
		});
	}else{

		List.updateOne(
		  { "name" : req.body.listTitle, "items._id": req.body.id }, //el primer filtro es para buscar la lista por name. El segundo filtro es para buscar el item de esa lista usando el _id
		  { "$set": { "items.$.state": req.body.state  }}, //identificado el elemento se procede actualizar el valor del estado(state)
		  function(err, list) {
		    console.log(list)
		});

	}//end else


}); //end post update


app.post("/", function(req, res){
	console.log(req.body)

	const itemName = req.body.newItem; //catch the form's value associated to input newItem
	const listName = req.body.buttonAddItem; //catch the form's value associated to the button buttonAddItem, which has listTitle


	const item = new Item({
		name: itemName,
		state: ""
	})

	if(listName==="Today"){
		item.save(); //todos los item de item collection are about Today list
		res.redirect("/");
	}else{
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		});
	}
});

// app.get("/prueba8", function(req, res){
// 	console.log("prueba8"); the app recgonized that prrueba8 is not a param but its a specific path/url
// })

app.get("/:customListName", function(req,res){
	console.log("customlistname");


	const customListName = _.capitalize(req.params.customListName);
		console.log(customListName);

	List.findOne({name:customListName},function(err, foundList){
		if(!err){
			if(!foundList){ //si no existe
				//create a new list
				const list = new List({
					name: customListName,
					items: defaultItems
				});

				list.save().then(()=>{
					res.redirect("/"+customListName);
				}); //add a new document in the collection List
			} else {
			//show an existing list
			res.render("List", {listTitle: foundList.name, items: foundList.items});
			}
		} 
	}); //end findOne

});//end get /:customListName




// app.listen(3000, function(){ //use to work locally
// 	console.log("server is running on port 3000");
// });

let port = process.env.PORT;
if(port==null || port==""){
	port=3000;
}
app.listen(port);