var scene,camera,renderer,mesh,floor; // the all powerful objects that are needed to render objects and set view in three js
var keyboard = {};
var player ={ height: 3.8 , depth : -6}
var textureLoader;
var textures = {};
var meshes = {};

var missile = {};
missile.fireInterval_default = 100
missile.fireInterval = missile.fireInterval_default;
missile.isAlive = false; // frames to make a shoot // changes for different levels
missile.objects = [];


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
	
	addFloor();
	setCamera();
	animate();
	console.log(camera);
	console.log(renderer.domElement)

}

function deg2Rad(value){
	return value * Math.PI / 180
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
	missileTraversal.velocity = missileTraversal.velocity.divideScalar(100); // the more this value the slower the object moves
	console.log("traversal " ,missileTraversal)
	return missileTraversal;
}




function addMissiles(){

	//creating a new missile

	textureLoader = new THREE.TextureLoader();

	var textureRand = Math.floor(Math.random() * 10); // for different rocks
	textures.floorTexture = new textureLoader.load("textures/rocks/rock"+textureRand+".jpg",function(texture){
	var missileSize = Math.random() + 0.2;	missileSize = (missileSize > 0.4)?0.4:Math.random();
	missile.objects[missile.objects.length] = new THREE.Mesh(
		new THREE.SphereGeometry(missileSize,32,32),
		new THREE.MeshBasicMaterial({ map: texture,  wireframe: false})
	)
	//after creating a new missile
	var currentMissile = missile.objects[missile.objects.length -1 ]
	currentMissile.traversal = getRandomMissileTraversal();
	var positionTemp = currentMissile.traversal.start
	currentMissile.position.set(positionTemp.x,positionTemp.y,positionTemp.z)
	console.log()
	scene.add(currentMissile);

	});



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
		meshes.sky.position.z = 5;
		meshes.sky.position.y = 9;
		meshes.sky.rotation.z = -Math.PI ;
		meshes.sky.rotation.x =  Math.PI ;
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

	var position = [0,-1];
	textureLoader = new THREE.TextureLoader()
	textures.missileBlasterTexture = new textureLoader.load("textures/missile.jpg")

	meshes.missileBlaster = new THREE.Mesh(
		new THREE.SphereGeometry( 1, 3, 3, 0 , Math.PI, 0, Math.PI *2),
		new THREE.MeshBasicMaterial({ color: 0xffffff, map: textures.missileBlasterTexture, wireframe: false})
	)
	meshes.missileBlaster.material.side = THREE.DoubleSide;
	meshes.missileBlaster.position.x = position[0]
	meshes.missileBlaster.position.z = position[1]
	meshes.missileBlaster.position.y = 1.3
	scene.add(meshes.missileBlaster)


}

function addBuildings(){

	var positions = [[-6,1],[-5,0],[-4,1],[-3,0],[-2,1],[-1,0],[0,1],[1,0],[2,1],[3,0],[4,1],[5,0],[6,1],
		[-6,-1],[-4,-1],[-2,-1],[2,-1],[4,-1],[6,-1]]; // x and y positions
	var texturesArray = ["building_1.jpg","building_2.jpg","building_3.jpg","building_4.jpg","building_5.jpg","building_6.jpg"];
	var counter = 0;
	positions.forEach(function(position){
	textureLoader = new THREE.TextureLoader()
	textures.buildingTexture = new textureLoader.load("textures/"+texturesArray[counter])
	counter = (counter + 1) % texturesArray.length // for changing the textures for each building
	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1.6,0.4),
		new THREE.MeshBasicMaterial({ color: 0xffffff, map: textures.buildingTexture, wireframe: false})
	)
	
	mesh.position.x = position[0];
	mesh.position.z = position[1];
	mesh.position.y = 1;
	scene.add(mesh)
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
	 console.log("fov",camera.fov)
	 camera.X_LIMIT = Math.tan(deg2Rad(camera.fov / 2 )) * 2;
	 renderer.aspect_r  = renderer.domElement.width
	 camera.Y_LIMIT = camera.X_LIMIT / renderer.aspect_r;
	 camera.Z_LIMIT = 0

	camera.position.set(0,player.height, player.depth); // since the objects by default appears at 0,0,0
	camera.lookAt(new THREE.Vector3(0,3.8,0))



}

function launchMissile(){

	addMissiles();
	var currentMissile = missile.objects[missile.objects.length -1 ]
	currentMissile.isAlive = true;
	
}

function animateMissiles(){

	missile.objects.forEach(function(missile_object,index){
		missile_object.position.add(missile_object.traversal.velocity)
		missile_object.rotation.x+=0.1;
		missile_object.rotation.y+=0.1;
		missile_object.rotation.z+=0.1;
		if (missile_object.position.y <=0)
		{
			missile.isAlive = false;
			scene.remove(missile_object)
			missile.objects.splice(index,1)
		}
	});

}

function animate(){
	requestAnimationFrame(animate)

	// Animate Missiles

	animateMissiles();


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


	if(missile.fireInterval < 0 & !missile.isAlive)
	{
		missile.fireInterval = missile.fireInterval_default 
		launchMissile();
	}
	 missile.fireInterval--; // for each frame

	renderer.render(scene,camera)

}


window.addEventListener('keydown',function(){
	keyboard[event.keyCode] = true
})

window.addEventListener('keyup',function(){
	keyboard[event.keyCode] = false
})


window.onload = init




