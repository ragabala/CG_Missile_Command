var scene,camera,renderer,mesh,floor; // the all powerful objects that are needed to render objects and set view in three js
var keyboard = {};
var player = { 
	height: 3.8 ,
    depth : 6 ,
    
}
var textureLoader;
var textures = {};
var meshes = {};

var missile = {
	fireInterval_default : 100,
	fireInterval : 100,
	objects :[],
	missileSlowRate : 500,
};

var antiMissile = {
	fireInterval_default : 10,
	fireInterval : 10,
	objects :[],
	missileSlowRate : 20,
	model :  new THREE.Mesh(
		new THREE.SphereGeometry(0.1,32,32),
		new THREE.MeshBasicMaterial({ color : 0xff0000,  wireframe: false})
	)

};

var COLLISION_ACCURACY = 1;

var buildings = {
	objects : [],
	model : new THREE.Mesh(
		new THREE.BoxGeometry(1,1.6,0.4)
	)
}
var explosions = {
	objects :[],
	model : new THREE.Mesh(
		new THREE.PlaneGeometry(2,2,2,2)
	),
	diminishSpeed : 0.95,
	explosionSpeed : 1.1
}

var mouse ;


function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight,0.1,1000)
	renderer = new THREE.WebGLRenderer(); // the renderer object dynamically creates the canvas element for rendering the scene, we include this in the HTML DOM element
	//renderer.alpha = true
	renderer.setClearColor( 0x000000, 0 );
	renderer.setSize(window.innerWidth,window.innerHeight);
	$('body').append(renderer.domElement)
	console.log(renderer)
	addBackground();
	addBuildings();
	addMissileBlaster();
	showGrid();
	addFloor();
	setCamera();
	setCrossHair();
	animate();
	console.log(camera);
	console.log(renderer.domElement)


}

function deg2Rad(value){
	return value * Math.PI / 180
}

function setCrossHair(){
	mouse = new THREE.Vector2();
	textureLoader = new THREE.TextureLoader();
	textures.crossHair = new textureLoader.load("textures/crossHair.png",function(texture){
	meshes.crossHair = new THREE.Mesh(
		new THREE.PlaneGeometry(2,2,2,2),
		new THREE.MeshBasicMaterial({  map: texture,transparent: true, wireframe: false})
	)
	meshes.crossHair.material.side = THREE.DoubleSide;
	meshes.crossHair.position.y = 3;
	meshes.crossHair.position.z = 1;
	meshes.crossHair.rotation.x =  Math.PI ;

	scene.add(meshes.crossHair)
		
	});

}



function getScreenPositionForMouseEvent(event){
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	// getting the position in terms of the real co-ordinates
	var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	return camera.position.clone().add( dir.multiplyScalar( distance ))
}


function moveCrossHair(event){

	var pos = getScreenPositionForMouseEvent(event)
	if(pos.y >= 0)
	{
	meshes.crossHair.position.copy(pos)
	meshes.missileBlaster.lookAt(pos)
	}

	//making missile blaster look at cross hair
}

function getRandomMissileTraversal(){

 // since we will be shooting only at z = 0 

//starting location of missile
// for the current game the X ranges from [-11,11] and y [1,11]

	var missileTraversal = {}; // contains start,end,velocity
	var start = [];
	var random = Math.random() * 22
	start[0] = Math.ceil(11 - random )
	start[1] = 11
	start[2] = 0 // since we will be having Z coordinate set
	missileTraversal.start = new THREE.Vector3( start[0], start[1], start[2] );

	var end = [];

	var random = Math.random() * 22 ; // ensuring the bombs are within resonable X limit for destination
	end[0] = Math.ceil(11 - random )
	end[1] = 0 // so that the bombs reach the ground
	end[2] = 0 // so that it is in middle of Z
	missileTraversal.end =  new THREE.Vector3( end[0], end[1], end[2] );
	missileTraversal.velocity = new THREE.Vector3(0,0,0).add(missileTraversal.end)
	missileTraversal.velocity.sub(missileTraversal.start);
	missileTraversal.velocity = missileTraversal.velocity.divideScalar(missile.missileSlowRate); // the more this value the slower the object moves
	console.log("traversal " ,missileTraversal)
	return missileTraversal;
}




function addMissiles(){

	//creating a new missile

	textureLoader = new THREE.TextureLoader();
	var textureRand = Math.floor(Math.random() * 10); // for different rocks
	textures.missileTexture = new textureLoader.load("textures/rocks/rock"+textureRand+".jpg",function(texture){
	var missileSize = Math.random() + 0.2;	
	missileSize = (missileSize > 0.4)?0.4: missileSize;
	mesh = new THREE.Mesh(
		new THREE.SphereGeometry(missileSize,32,32),
		new THREE.MeshBasicMaterial({ map: texture,  wireframe: false})
	)
	mesh.traversal = getRandomMissileTraversal();
	var positionTemp = mesh.traversal.start
	mesh.position.set(positionTemp.x,positionTemp.y,positionTemp.z)
	mesh.spin = Math.floor(Math.random() * 3) // to make all missiles different in spins
	scene.add(mesh);
	missile.objects.push(mesh)
	});
}

function launchAntiMissiles(event){
	if(antiMissile.fireInterval >= 0) return; // 
	antiMissile.fireInterval = 24; //resetting back
	var destination = getScreenPositionForMouseEvent(event)
	console.log("clicked at ,",destination)
	addAntiMissile(destination);

}


function addAntiMissile(destination){

	var antiMissileTemp = antiMissile.model.clone();

	var currentMissile = antiMissileTemp
	currentMissile.position = meshes.missileBlaster.position
	var missileTraversal = {}
	missileTraversal.start = currentMissile.position
	missileTraversal.end = destination
	missileTraversal.velocity = new THREE.Vector3(0,0,0).add(missileTraversal.end)
	missileTraversal.velocity.sub(missileTraversal.start);
	missileTraversal.velocity = missileTraversal.velocity.divideScalar(antiMissile.missileSlowRate);
	currentMissile.traversal = missileTraversal
	scene.add(currentMissile)
	antiMissile.objects.push(currentMissile)

}

function showGrid(){
	var grid = new THREE.GridHelper(30, 30, "white", "white");
	grid.rotation.x = Math.PI / 2;
	scene.add(grid);
}

function addBackground(){
	//adding a box
	textureLoader = new THREE.TextureLoader()
	textures.floorTexture = new textureLoader.load("textures/sky1.jpg",function(texture){
	/*	texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.offset.set( 0, 0 );
	    texture.repeat.set( 10, 10 );*/
		meshes.sky = new THREE.Mesh(
			new THREE.PlaneGeometry(50,20,30,30),
			new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, wireframe: false})
		)
		meshes.sky.material.side = THREE.DoubleSide;
		meshes.sky.position.z = -5;
		meshes.sky.position.y = 9;
		meshes.sky.rotation.z =  Math.PI ;
		meshes.sky.rotation.x =  -Math.PI ;
		scene.add(meshes.sky)
		
	});


}

function addCity(){
//adding a box
	textureLoader = new THREE.TextureLoader()
	textures.floorTexture = new textureLoader.load("textures/floor.png")
	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshBasicMaterial({ color: 0xffffff, map: textures.floorTexture, wireframe: false})
	)
	mesh.position.y += 1;
	scene.add(mesh)

}

function addMissileBlaster(){

	textureLoader = new THREE.TextureLoader()
	textures.missileBlasterTexture = new textureLoader.load("textures/missile.jpg")
	var coneGeom = new THREE.ConeGeometry(0.75, 2, 10);
	coneGeom.translate(0, 1.3, 0);
	coneGeom.rotateX(Math.PI / 2);
	var coneMat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: textures.missileBlasterTexture, wireframe: false})

	meshes.missileBlaster = new THREE.Mesh(coneGeom, coneMat);
	meshes.missileBlaster.lookAt(new THREE.Vector3(0, 1, 0));

	//meshes.missileBlaster.lookAt(new THREE.Vector3(position[0], 2, position[1]));
	scene.add(meshes.missileBlaster)


}

function addBuildings(){

	var positions = [[-6,1],[-5,0],[-4,1],[-3,0],[-2,1],[0,-1],[2,1],[3,0],[4,1],[5,0],[6,1],
		[-6,-1],[-4,-1],[-2,-1],[2,-1],[4,-1],[6,-1]]; // x and y positions
	var texturesArray = ["building_1.jpg","building_2.jpg","building_3.jpg","building_4.jpg","building_5.jpg","building_6.jpg"];
	var counter = 0;
	positions.forEach(function(position){
	textureLoader = new THREE.TextureLoader()
	textures.buildingTexture = new textureLoader.load("textures/"+texturesArray[counter])
	counter = (counter + 1) % texturesArray.length // for changing the textures for each building
	mesh = buildings.model.clone()
	mesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: textures.buildingTexture, wireframe: false});
	console.log

	mesh.position.x = position[0];
	mesh.position.z = position[1];
	mesh.position.y = 1;
	scene.add(mesh)
	buildings.objects.push(mesh)
	});

}

function addFloor(){
//adding a plane floor
	textureLoader = new THREE.TextureLoader()
	textures.floorTexture = new textureLoader.load("textures/floor.png",function(texture){
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.offset.set( 0, 0 );
    texture.repeat.set( 10, 10 );
	floor = new THREE.Mesh(
		new THREE.PlaneGeometry(40,7,10,10),
		new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, wireframe: false})
	);
	floor.rotation.x = Math.PI /2; // to make the floor in the xz plane
	floor.material.side = THREE.DoubleSide;
	scene.add(floor)
	})


}

function setCamera(){
// setting the camera away from the origin and at the height of the player
// these values are useful in setting missile positions to FOV

	camera.position.set(0,player.height, player.depth); // since the objects by default appears at 0,0,0
	camera.lookAt(new THREE.Vector3(0,3.8,0))



}


function launchMissile(){

	addMissiles();
	var currentMissile = missile.objects[missile.objects.length -1 ]
}

function disposeObject(object){

	object.material.dispose();
	object.geometry.dispose();
	scene.remove(object);

}

function animateMissiles(){

	missile.objects.forEach(function(missile_object,index){
		missile_object.position.add(missile_object.traversal.velocity)
		if(missile_object.spin == 0)
		missile_object.rotation.x+=0.1;
		else if(missile_object.spin == 1)
		missile_object.rotation.y+=0.1;
		else if(missile_object.spin == 2)
		missile_object.rotation.z+=0.1;
		if (missile_object.position.y <=0)
		{
			disposeObject(missile_object)
			missile.objects.splice(index,1)
		}
	}); //end of foreach missile

	antiMissile.objects.forEach(function(missile_object,index){
		missile_object.position.add(missile_object.traversal.velocity)
		if (missile_object.position.distanceTo(missile_object.traversal.end) < 0.2)
		{
			disposeObject(missile_object)
			antiMissile.objects.splice(index,1)
		}
	}); //end of foreach antimissile
 
	// reduce explosion size for each passing frames
	explosions.objects.forEach(function(explosion,index){
		if(explosion.scale.x < 0.3 ){
			disposeObject(explosion)
			explosions.objects.splice(index,1)
		}
		else if (explosion.scale.x < 2 && explosion.justCreated)
			explosion.scale.multiplyScalar(explosions.explosionSpeed)
		else {
				explosion.scale.multiplyScalar(explosions.diminishSpeed)
				explosion.justCreated = false
			}
		});

}


function collisionDeduction(){


	var positionTemp;

	missile.objects.forEach(function(missile_object,index){
		antiMissile.objects.forEach(function(anti_missile_object,index1){
			if (missile_object.position.distanceTo(anti_missile_object.position) < COLLISION_ACCURACY)
			{
				console.log("Missile HIT")
				positionTemp = new THREE.Vector3(0,0,0).copy(missile_object.position)
				console.log(missile_object.position)
				disposeObject(missile_object)
				disposeObject(anti_missile_object)
				missile.objects.splice(index,1)
				antiMissile.objects.splice(index1,1)
				createExplosion("missile",positionTemp)
			}
		})
		buildings.objects.forEach(function(buildingTemp,index1){
			if (missile_object.position.distanceTo(buildingTemp.position) < COLLISION_ACCURACY)
			{
				console.log("BUILDING HIT")
				positionTemp = new THREE.Vector3(0,0,0).copy(missile_object.position)
				disposeObject(missile_object)
				disposeObject(buildingTemp)
				missile.objects.splice(index,1)
				buildings.objects.splice(index1,1)
				createExplosion("building",positionTemp)
			}
		})

	

	})
	// make missiles move by a frame after checking whether they collided
	animateMissiles();


}


function createExplosion(type,positionVal){
	var texture = "textures/explosions/";
	if(type == 'building')
		texture+= 'building_explosion.png';
	else
		texture+= "explosion"+Math.ceil(Math.random()*3)+".png";

	textureLoader = new THREE.TextureLoader();
	textures.explosion = new textureLoader.load(texture,function(texture){
		mesh = explosions.model.clone();
		mesh.material = new THREE.MeshBasicMaterial({ map: texture,transparent: true, wireframe: false, side : THREE.DoubleSide});
		mesh.position.copy(positionVal)
		if(type == 'building') mesh.position.y-=1 // to make it more aligned with ground
		scene.add(mesh)
		console.log("explosions : ",mesh)
		mesh.justCreated = true
		explosions.objects.push(mesh)
	});

	//setTimeout(function(){ scene.remove(mesh) }, 500);


}

function getClone(object){
	return JSON.parse(JSON.stringify(object));
}


function animate(){
	requestAnimationFrame(animate)

	// Animate Missiles

	collisionDeduction();
	



/*	mesh = missile.objects[missile.objects.length -1 ]
	
	if(keyboard[37])
	mesh.rotation.y += 0.01
	if(keyboard[39])
	mesh.rotation.y -= 0.01
	if(keyboard[38])
	mesh.rotation.x += 0.01
	if(keyboard[40])
	mesh.rotation.x -= 0.01

	if(keyboard[87])
	mesh.position.y += 0.1
	if(keyboard[83])
		mesh.position.y -= 0.1
	if(keyboard[65])
		mesh.position.x += 0.1
	if(keyboard[68])
		mesh.position.x -= 0.1*/
	if(missile.fireInterval < 0)
	{
		missile.fireInterval = missile.fireInterval_default 
		launchMissile();
	}
	missile.fireInterval--; // for each frame
	antiMissile.fireInterval--;
 	renderer.render(scene,camera)

}





var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersectPoint = new THREE.Vector3();


window.addEventListener('keydown',function(){
	keyboard[event.keyCode] = true
})

window.addEventListener('keyup',function(){
	keyboard[event.keyCode] = false
})

window.addEventListener('mousemove',function(event){
	console.log("Mouse Moves")
	moveCrossHair(event)
});


window.addEventListener('mousedown',function(event){
	console.log("mouse clicked")
	launchAntiMissiles(event);
});


window.onload = init