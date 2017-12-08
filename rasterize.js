var scene,camera,renderer,mesh,floor; // the all powerful objects that are needed to render objects and set view in three js
var keyboard = {};
var player ={ height: 3.8}
var textureLoader;
var textures = {};
var meshes = {};


function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight,0.1,1000)
	renderer = new THREE.WebGLRenderer(); // the renderer object dynamically creates the canvas element for rendering the scene, we include this in the HTML DOM element
	//renderer.alpha = true
	renderer.setClearColor( 0x000000, 0 );
	renderer.setSize(window.innerWidth,window.innerHeight);
	$('body').append(renderer.domElement)
	addBackground();
	addBuildings();
	addMissileBlaster();
	addFloor();
	setCamera();

	animate();
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
	meshes.missileBlaster.position.y = 1
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
	camera.position.set(0,player.height,-5); // since the objects by default appears at 0,0,0
	camera.lookAt(new THREE.Vector3(0,player.height,0))


}

function animate(){
	mesh = meshes.missileBlaster
	requestAnimationFrame(animate)
	if(keyboard[37])
	mesh.rotation.y += 0.01
	if(keyboard[39])
	mesh.rotation.y -= 0.01
	if(keyboard[38])
	mesh.rotation.x += 0.01
	if(keyboard[40])
	mesh.rotation.x -= 0.01

	renderer.render(scene,camera)

}


window.addEventListener('keydown',function(){
	keyboard[event.keyCode] = true
})

window.addEventListener('keyup',function(){
	keyboard[event.keyCode] = false
})



window.onload = init




