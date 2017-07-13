// sirve para usar los nuevos estandares de js
'use strict'

// libreria o modulo que sirve para conectar con la base de datos
var mongoose = require('mongoose');
var app = require('./app');

//puerto del servidor backend;
var port = process.env.PORT || 3977;

// url de la base de datos
mongoose.connect('mongodb://localhost:27017/spoty',(err, res) =>{

	if(err){
		throw err;
	}else{
		// mensaje de confirmacion de coneccion con la base de datos
		console.log("La base de datos esta corriendo correctamente...")

		app.listen(port, function(){
			console.log("Servidor del api rest musica escuchando en http://localhost:"+port);
		})
	}
});