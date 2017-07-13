'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');// libreria para encriptar contraseña
var User = require('../models/user');
var jwt = require('../services/jwt');

function pruebas(req, res){
	res.status(200).send({
		message: 'Probando una acción del controlador de usuario en el api'
	});
}

function saveUser(req, res){

	// crea un objeto usuario
	var user = new User();
	//recibe los parametros por POST
	var params = req.body;
	console.log(params);

	user.name = params.name;
	user.surname= params.surname;
	user.email = params.email;
	user.role = 'ROLE_USER';
	user.image = 'null';

	if(params.password){
		//Encriptar Contraseña y Guardar datos
		bcrypt.hash(params.password, null, null, function(err, hash){
			user.password = hash;
			if(user.name != null && user.surname != null && user.email != null){

				User.findOne({email: user.email.toLowerCase()},(err, us) =>{
					if(err){
						res.status(500).send({message: 'Error en la peticion'});
					}else{
						if(us){
							res.status(404).send({message: 'El usuario ya existe'});
						}else{
							// Guarda el usuario
							user.save((err, userStored)=>{
								if(err){
									// en caso de error
									res.status(500).send({message: 'Error al guardar el usuario'});
								}else{
									// si no almacena el usuario;
									if(!userStored){
										res.status(404).send({message: 'No se ha registrado el usuario'});
									}else{
										res.status(200).send({user: userStored});
									}
								}
							});
						}
					}
				});

			}else{
				res.status(500).send({message: 'Completa los datos'});
			}
		});
	}else{
		res.status(500).send({message: 'Introduce la Contraseña'});
	}
}

function loginUser(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email.toLowerCase()},(err, user) =>{
		if(err){
			res.status(500).send({message: 'Error en la peteicion'});
		}else{
			if(!user){
				res.status(404).send({message: 'El usuario no existe'});
			}else{
				// Comprobar la contraseña
				bcrypt.compare(password, user.password, function(err, check){
					if(check){
						// devolver los datos del usuario log
						if(params.gethash){
							//devolver un token de jwt
							res.status(200).send({
								token: jwt.createToken(user)
							});
						}else{
							res.status(200).send({user});
						}
					}else{
						res.status(404).send({message:'El usuario no ha podido hacer log'});
					}
				});
			}
		}
	});
}

function updateUser(req, res){
	var userId= req.params.id;
	var update =req.body;

	/*if(userId != req.user.sub){
		return res.status(500).send({message: 'No tienes la cabecera de autentificacion'});

	} */

	User.findByIdAndUpdate(userId, update, (err, userUpdated) =>{
		if(err){
			res.status(500).send({
				message: 'Error al actualizar el usuario'
			});
		}else{
			if(!userUpdated){
				res.status(404).send({
					message: 'No se ha podido actualizar el usuario'
				});
			}else{
				res.status(200).send({
					user: userUpdated
				});
			}
		}
	});
}

function uploadImage(req, res){
	var userId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.image.path;	
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext =='png' || file_ext == 'jpg' || file_ext == 'gif'){
			User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated)=>{
				if(!userUpdated){
				res.status(404).send({
					message: 'No se ha podido actualizar el usuario'
				});
			}else{
				res.status(200).send({
					image: file_name,
					user: userUpdated
				});
			}
			});
		}else{
			res.status(200).send({message :'Extension del archivo no valida'});
		}
		console.log(file_path);
		
	}else{
		res.status(200).send({
			message: 'No se ha subido imagen'
		});
	}

}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message:'No existe Imagen...'});
		}
	});
}
module.exports = {
	pruebas,
	saveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile
};