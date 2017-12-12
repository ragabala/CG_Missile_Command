var scene, camera, renderer, mesh, floor, listener; // the all powerful objects that are needed to render objects and set view in three js
var keyboard = {};
var player = {
    height: 3.8,
    depth: 6,

}
var textureLoader;
var texture;
var textures = {};
var meshes = {};

var missile = {
    fireInterval_default: 100,
    fireInterval: 100,
    objects: [],
    missileSlowRate: 800, // more the value , slower the game
    missileSlowRateDefault: 500,
    missileLevelUp: 50,
    model: new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false })
    ),
    isAlive: false,
    cloneCheck: true, // allows missile to be cloned at random
    splitProbability: 500 // means one in every 5 missiles will split - probability
};

var antiMissile = {
    fireInterval_default: 10,
    fireInterval: 10,
    objects: [],
    missileSlowRate: 20,
    missileSlowRateDefault: 20,
    missileLevelUp: 2,
    model: new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false })
    ),
    isAlive: false

};

var score = {
    points: 0,
    level: 1,
    destroyedObjects: 0,
    levelUp: 10,
    pointsUp: 5,
}

var game = {
    restart: false,
}

var COLLISION_ACCURACY = 1;

var buildings = {
    objects: [],
    model: new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.6, 0.4)
    )
}
var explosions = {
    objects: [],
    model: new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2, 2, 2)
    ),
    diminishSpeed: 0.95,
    explosionSpeed: 1.1
}

var mouse;

var spaceShips = {
    mesh: new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.5),
        new THREE.MeshBasicMaterial({ color: 0xffffff, map: new THREE.TextureLoader().load("textures/spaceship.jpg"), wireframe: false }),
    ),
    probability: 50,
    currentObject: null,
    spaceShipSlowRate: 500,
    isAlive: true,
    launch: Math.ceil(Math.random() * 9) // when to launch

}


var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(90, innerWidth / innerHeight, 0.1, 100),
    box: new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.5, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x4444ff })
    )
};
var loadingManager = null;
var RESOURCES_LOADED = false;


function init() {
    console.log("launch code ", spaceShips.launch)
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000)
    renderer = new THREE.WebGLRenderer(); // the renderer object dynamically creates the canvas element for rendering the scene, we include this in the HTML DOM element
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    $('body').append(renderer.domElement)
    setLoader();
    startGame();
    addBackground();
    addSound();
    addBuildings();
    //addSpaceShips();
    addMissileBlaster();
    //showGrid();
    addFloor();
    setCamera();
    addCrossHair();
    animate();
}


function startGame() {
    $("#info").html("Loading");
    $("#info").show();
}

function setLoader() {
    loadingScreen.box.position.set(0, 0, 5);
    loadingScreen.box.material.side = THREE.DoubleSide;
    loadingScreen.box.rotation.x = Math.PI;
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);

    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };
    loadingManager.onLoad = function() {
        console.log("loaded all resources");
        RESOURCES_LOADED = true;
        $("#info").html("<u>Click Here to START</u>");
    };

}

function addBackground() {
    //adding a box
    textureLoader = new THREE.TextureLoader(loadingManager)
    textures.skyTexture = textureLoader.load("textures/sky1.jpg")
    meshes.sky = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 20, 30, 30),
        new THREE.MeshBasicMaterial({ color: 0xffffff, map: textures.skyTexture, wireframe: false })
    )
    meshes.sky.material.side = THREE.DoubleSide;
    meshes.sky.position.z = -5;
    meshes.sky.position.y = 9;
    meshes.sky.rotation.z = Math.PI;
    meshes.sky.rotation.x = -Math.PI;
    scene.add(meshes.sky)
}


function addSound() {
    listener = new THREE.AudioListener();
    camera.add(listener);
    // create an Audio source
    // BGM 
    var sound = new THREE.Audio(listener);
    var audioLoader = new THREE.AudioLoader(loadingManager);
    //Load a sound and set it as the Audio object's buffer
    audioLoader.load('Sounds/bgm.ogg', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });

    // create an Audio source
    // AntiMissile 
    var sound1 = new THREE.Audio(listener);
    var audioLoader1 = new THREE.AudioLoader(loadingManager);
    //Load a sound and set it as the Audio object's buffer
    audioLoader1.load('Sounds/missileLaunch.ogg', function(buffer) {
        sound1.setBuffer(buffer);
        sound1.setLoop(false);
    });

    antiMissile.sound = sound1;

    // create an Audio source
    // AntiMissile 
    var sound2 = new THREE.Audio(listener);
    var audioLoader2 = new THREE.AudioLoader(loadingManager);
    //Load a sound and set it as the Audio object's buffer
    audioLoader2.load('Sounds/explosion.ogg', function(buffer) {
        sound2.setBuffer(buffer);
        sound2.setLoop(false);
    });

    explosions.sound = sound2;

    // create an Audio source
    // LevelUpSound 
    var sound3 = new THREE.Audio(listener);
    var audioLoader3 = new THREE.AudioLoader(loadingManager);
    //Load a sound and set it as the Audio object's buffer
    audioLoader3.load('Sounds/levelUp.wav', function(buffer) {
        sound3.setBuffer(buffer);
        sound3.setLoop(false);
    });

    score.sound = sound3;

}


function addBuildings() {

    var positions = [
        [-6, 1],
        [-5, 0],
        [-4, 1],
        [-3, 0],
        [-2, 1],
        [0, -1],
        [2, 1],
        [3, 0],
        [4, 1],
        [5, 0],
        [6, 1],
        [-6, -1],
        [-4, -1],
        [-2, -1],
        [2, -1],
        [4, -1],
        [6, -1]
    ]; // x and y positions
    var texturesArray = ["building_1.jpg", "building_2.jpg", "building_3.jpg", "building_4.jpg", "building_5.jpg", "building_6.jpg"];
    var counter = 0;
    positions.forEach(function(position) {
        textureLoader = new THREE.TextureLoader(loadingManager)
        textures.buildingTexture = textureLoader.load("textures/" + texturesArray[counter])
        counter = (counter + 1) % texturesArray.length // for changing the textures for each building
        mesh = buildings.model.clone()
        mesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: textures.buildingTexture, wireframe: false });
        mesh.position.x = position[0];
        mesh.position.z = position[1];
        mesh.position.y = 1;
        scene.add(mesh)
        buildings.objects.push(mesh)
    });

}

function addSpaceShips() {
    var currentNumber = score.destroyedObjects % score.levelUp
    if (spaceShips.isAlive && spaceShips.launch == currentNumber && spaceShips.currentObject==null) {
        console.log("spaceship loaded")
        spaceShips.isAlive = false
        var traversal = {}
        var dir = 1;
        if (Math.random() > 0.5)
            dir = -1

        var y = 6 + (Math.random() * 3) // that is from 4 to 7
        traversal.start = new THREE.Vector3(-13 * dir, y, 0) // from either side 
        traversal.end = new THREE.Vector3(13 * dir, y, 0)
        traversal.velocity = new THREE.Vector3(0, 0, 0).copy(traversal.end)
        traversal.velocity.sub(traversal.start)
        traversal.velocity.divideScalar(spaceShips.spaceShipSlowRate)

        textureLoader = new THREE.TextureLoader(loadingManager)
        meshes.spaceship = spaceShips.mesh.clone()
        meshes.spaceship.traversal = traversal
        meshes.spaceship.position.copy(traversal.start)
        scene.add(meshes.spaceship)
        spaceShips.currentObject = meshes.spaceship
    }
}

function addMissileBlaster() {
    textureLoader = new THREE.TextureLoader(loadingManager)
    texture = textureLoader.load("textures/missile.jpg")
    var coneGeom = new THREE.ConeGeometry(0.75, 2, 10);
    coneGeom.translate(0, 1.3, 0);
    coneGeom.rotateX(Math.PI / 2);
    var coneMat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, wireframe: false })
    meshes.missileBlaster = new THREE.Mesh(coneGeom, coneMat);
    meshes.missileBlaster.lookAt(new THREE.Vector3(0, 1, 0));
    scene.add(meshes.missileBlaster)
}



function addFloor() {
    //adding a plane floor
    textureLoader = new THREE.TextureLoader(loadingManager)
    texture = textureLoader.load("textures/floor.png")
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(10, 10);
    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 7, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, wireframe: false })
    );
    floor.rotation.x = Math.PI / 2; // to make the floor in the xz plane
    floor.material.side = THREE.DoubleSide;
    scene.add(floor)
}


function addCrossHair() {
    mouse = new THREE.Vector2();
    textureLoader = new THREE.TextureLoader(loadingManager);
    texture = textureLoader.load("textures/crossHair.png")
    meshes.crossHair = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2, 2, 2),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, wireframe: false })
    )
    meshes.crossHair.material.side = THREE.DoubleSide;
    meshes.crossHair.position.y = 3;
    meshes.crossHair.position.z = 1;
    meshes.crossHair.rotation.x = Math.PI;
    scene.add(meshes.crossHair)
}


function setCamera() {
    // setting the camera away from the origin and at the height of the player
    // these values are useful in setting missile positions to FOV
    camera.position.set(0, player.height, player.depth); // since the objects by default appears at 0,0,0
    camera.lookAt(new THREE.Vector3(0, 3.8, 0))
}

$("#info").click(function(event) {
    $("#info").hide();
    missile.isAlive = true
    antiMissile.isAlive = true
    if (game.restart)
        assembleDestroyed();

})

function assembleDestroyed() {
    //console.log("assembleDestroyed")
    buildings.objects.forEach(function(building, index) {
        building.visible = true
    });
    meshes.missileBlaster.visible = true
}

function endGame() {

    missile.objects.forEach(function(missile, index) {
        disposeObject(missile)
    });

    missile.objects = []

    $("#info").html("<p> GameOver <br/> <span style='font-size:60px'> Your Score : " + score.points + " <br/>Click here to restart Game</span></p>");
    resetGameValues();
    $("#info").show();
    missile.isAlive = false
    antiMissile.isAlive = false
    game.restart = true


}

function resetGameValues() {
    score.points = 0
    score.level = 1
    score.destroyedObjects = 0
    missile.cloneCheck = true
    missile.missileSlowRate = missile.missileSlowRateDefault
    antiMissile.missileSlowRate = antiMissile.missileSlowRateDefault
    $("#scoreDom").html(score.points)
    $("#levelDom").html(score.level)

}

function deg2Rad(value) {
    return value * Math.PI / 180
}



function levelUp() {
    playSound(score.sound);
    $("#levelDom").css("color", "red")
    $("#levelDom").animate({ fontSize: "90px" }, 3000);
    $("#levelDom").css("color", "white")
    $("#levelDom").animate({ fontSize: "20px" }, 1000);
    if (missile.missileSlowRate > 100) // maximum speed
        missile.missileSlowRate -= missile.missileLevelUp
    if (antiMissile.missileSlowRate > 5) // maximum speed
        antiMissile.missileSlowRate -= antiMissile.missileLevelUp
    missile.cloneCheck = true;
    spaceShips.isAlive = true;
    spaceShips.launch = Math.ceil(Math.random() * 9) // when to launch
}



function getScreenPositionForMouseEvent(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // getting the position in terms of the real co-ordinates
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance))
}


function moveCrossHair(event) {

    var pos = getScreenPositionForMouseEvent(event)
    if (pos.y >= 0) {
        meshes.crossHair.position.copy(pos)
        meshes.missileBlaster.lookAt(pos)
    }

    //making missile blaster look at cross hair
}

function getRandomMissileTraversal() {

    /* since we will be shooting only at z = 0 
    starting location of missile
    for the current game the X ranges from [-11,11] and y [1,11]*/

    var missileTraversal = {}; // contains start,end,velocity
    var start = [];
    var random = Math.random() * 22
    start[0] = Math.ceil(11 - random)
    start[1] = 11
    start[2] = 0 // since we will be having Z coordinate set
    missileTraversal.start = new THREE.Vector3(start[0], start[1], start[2]);

    var end = [];

    var random = Math.random() * 22; // ensuring the bombs are within resonable X limit for destination
    end[0] = Math.ceil(11 - random)
    end[1] = 0 // so that the bombs reach the ground
    end[2] = 0 // so that it is in middle of Z
    missileTraversal.end = new THREE.Vector3(end[0], end[1], end[2]);
    missileTraversal.velocity = new THREE.Vector3(0, 0, 0).add(missileTraversal.end)
    missileTraversal.velocity.sub(missileTraversal.start);
    missileTraversal.velocity = missileTraversal.velocity.divideScalar(missile.missileSlowRate); // the more this value the slower the object moves
    //console.log("traversal " ,missileTraversal)
    return missileTraversal;
}




function addMissile() {
    //creating a new missile
    textureLoader = new THREE.TextureLoader();
    var textureRand = Math.floor(Math.random() * 10); // for different rocks
    mesh = missile.model.clone();
    textures.missileTexture = textureLoader.load("textures/rocks/rock" + textureRand + ".jpg");
    mesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: textures.missileTexture, wireframe: false })
    mesh.traversal = getRandomMissileTraversal();
    var positionTemp = mesh.traversal.start
    mesh.position.set(positionTemp.x, positionTemp.y, positionTemp.z)
    mesh.spin = Math.floor(Math.random() * 3) // to make all missiles different in spins
    mesh.isClone = true
    scene.add(mesh);
    missile.objects.push(mesh)
    return mesh;
}

function cloneMissile(missileObject) {
    console.log("cloned");
    var cloneMissile = missileObject.clone();
    var tempTraversal = getRandomMissileTraversal();
    tempTraversal.start = cloneMissile.position;
    // since screen is from -11 to 11 we are displacing the clone to 5 units apart from source
    var tempEnd = tempTraversal.end.x + 11; //normalizing
    tempEnd = (tempEnd + 5) % 23;
    tempEnd -= 11; //normalizing back
    tempTraversal.end.x = tempEnd
    tempTraversal.velocity = new THREE.Vector3(0, 0, 0).add(tempTraversal.end)
    tempTraversal.velocity.sub(tempTraversal.start);
    tempTraversal.velocity = tempTraversal.velocity.divideScalar(missile.missileSlowRate);
    cloneMissile.traversal = tempTraversal
    scene.add(cloneMissile);
    missile.objects.push(cloneMissile)

}

function setCloneMissile(missileObj) {
    var launchPosition = missileObj.position.y
    if ((launchPosition >= 8.95 && launchPosition < 9)) {
        //console.log(launchPosition)
        if (Math.ceil(Math.random() * missile.splitProbability ) == missile.splitProbability && missileObj.isClone) // all missiles will split with probability of 1/5
        {
            //missile.cloneCheck = false;
            missileObj.isClone = false;
            cloneMissile(missileObj); // will split the missile into two 

        }
    }


}

function launchAntiMissiles(event) {
    if (antiMissile.fireInterval >= 0 || !antiMissile.isAlive) return; // 
    antiMissile.fireInterval = 24; //resetting back
    var destination = getScreenPositionForMouseEvent(event)
    addAntiMissile(destination);
    playSound(antiMissile.sound)


}


function addAntiMissile(destination) {

    var currentMissile = antiMissile.model.clone();
    currentMissile.position = meshes.missileBlaster.position
    var missileTraversal = {}
    missileTraversal.start = currentMissile.position
    missileTraversal.end = destination
    missileTraversal.velocity = new THREE.Vector3(0, 0, 0).add(missileTraversal.end)
    missileTraversal.velocity.sub(missileTraversal.start);
    missileTraversal.velocity = missileTraversal.velocity.divideScalar(antiMissile.missileSlowRate);
    currentMissile.traversal = missileTraversal
    scene.add(currentMissile)
    antiMissile.objects.push(currentMissile)
}

function showGrid() {
    var grid = new THREE.GridHelper(22, 22, "white", "white");
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);
}

function updateScore(type) {
    if (type == 'missile') {
        score.destroyedObjects++;
        if (score.destroyedObjects % score.levelUp == 0) {
            score.level++;
            levelUp();
        }
        score.points += (score.level * score.pointsUp)
    } else {
        score.points += (score.level * score.pointsUp * 2)
    }


    $("#scoreDom").html(score.points)
    $("#levelDom").html(score.level)
}


function playSound(sound) {
    if (sound.isPlaying)
        sound.stop()
    sound.play()
}

function disposeObject(object) {

    object.material.dispose();
    object.geometry.dispose();
    scene.remove(object);

}

function animateMissiles() {

    addSpaceShips();
    missile.objects.forEach(function(missile_object, index) {
        missile_object.position.add(missile_object.traversal.velocity)
        if (missile_object.spin == 0)
            missile_object.rotation.x += 0.1;
        else if (missile_object.spin == 1)
            missile_object.rotation.y += 0.1;
        else if (missile_object.spin == 2)
            missile_object.rotation.z += 0.1;
        setCloneMissile(missile_object);
        if (missile_object.position.y <= 0) {
            disposeObject(missile_object)
            missile.objects.splice(index, 1)
            createExplosion("building", missile_object.position)
            endGame();
        }
    }); //end of foreach missile

    antiMissile.objects.forEach(function(missile_object, index) {
        missile_object.position.add(missile_object.traversal.velocity)
        if (missile_object.position.distanceTo(missile_object.traversal.end) < 0.2) {
            disposeObject(missile_object)
            antiMissile.objects.splice(index, 1)
        }
    }); //end of foreach antimissile

    // reduce explosion size for each passing frames
    explosions.objects.forEach(function(explosion, index) {
        if (explosion.scale.x < 0.3) {
            disposeObject(explosion)
            explosions.objects.splice(index, 1)
        } else if (explosion.scale.x < 2 && explosion.justCreated)
            explosion.scale.multiplyScalar(explosions.explosionSpeed)
        else {
            explosion.scale.multiplyScalar(explosions.diminishSpeed)
            explosion.justCreated = false
        }
    });

    if (spaceShips.currentObject != null) {
        spaceShips.currentObject.position.add(spaceShips.currentObject.traversal.velocity)
        if (Math.abs(spaceShips.currentObject.position.x - spaceShips.currentObject.traversal.end.x) < 1) {
            disposeObject(spaceShips.currentObject)
            spaceShips.currentObject = null
        }
    }
}


function collisionDeduction() {


    var positionTemp;

    missile.objects.forEach(function(missile_object, index) {
        antiMissile.objects.forEach(function(anti_missile_object, index1) {
            if (missile_object.position.distanceTo(anti_missile_object.position) < COLLISION_ACCURACY) {
                //console.log("Missile HIT")
                positionTemp = new THREE.Vector3(0, 0, 0).copy(missile_object.position)
                //console.log(missile_object.position)
                disposeObject(missile_object)
                disposeObject(anti_missile_object)
                missile.objects.splice(index, 1)
                antiMissile.objects.splice(index1, 1)
                createExplosion("missile", positionTemp)
                updateScore("missile");
            }


        })




        buildings.objects.forEach(function(buildingTemp, index1) {
            if (missile_object.position.distanceTo(buildingTemp.position) < COLLISION_ACCURACY) {
                //console.log("BUILDING HIT")
                positionTemp = new THREE.Vector3(0, 0, 0).copy(missile_object.position)
                disposeObject(missile_object)
                buildingTemp.visible = false
                missile.objects.splice(index, 1)
                createExplosion("building", positionTemp)
                endGame();

            }
        })

        //for deduction missile blaster hit
        if (missile_object.position.distanceTo(meshes.missileBlaster.position) < 2) {
            //console.log("MISSILE BLASTER HIT")
            positionTemp = new THREE.Vector3(0, 0, 0).copy(missile_object.position)
            disposeObject(missile_object)
            missile.objects.splice(index, 1)
            meshes.missileBlaster.visible = false
            createExplosion("building", positionTemp)
            endGame();

        }






    })
    // make missiles move by a frame after checking whether they collided


    if (spaceShips.currentObject != null) {
        antiMissile.objects.forEach(function(anti_missile_object, index1) {
            if (spaceShips.currentObject.position.distanceTo(anti_missile_object.position) < COLLISION_ACCURACY) {
                positionTemp = new THREE.Vector3(0, 0, 0).copy(anti_missile_object.position)
                disposeObject(anti_missile_object)
                disposeObject(spaceShips.currentObject)
                spaceShips.currentObject = null
                antiMissile.objects.splice(index1, 1)
                createExplosion("missile", positionTemp)
                updateScore("spaceship");
            }
        })
    }


    animateMissiles();


}


function createExplosion(type, positionVal) {
    var texture = "textures/explosions/";
    if (type == 'building')
        texture += 'building_explosion.png';
    else
        texture += "explosion" + Math.ceil(Math.random() * 3) + ".png";

    textureLoader = new THREE.TextureLoader();
    textures.explosion = textureLoader.load(texture, function(texture) {
        mesh = explosions.model.clone();
        mesh.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, wireframe: false, side: THREE.DoubleSide });
        mesh.position.copy(positionVal)
        if (type == 'building') mesh.position.y -= 1 // to make it more aligned with ground
        scene.add(mesh)
        //console.log("explosions : ",mesh)
        mesh.justCreated = true
        playSound(explosions.sound)
        explosions.objects.push(mesh)
    });

    //setTimeout(function(){ scene.remove(mesh) }, 500);


}

function getClone(object) {
    return JSON.parse(JSON.stringify(object));
}


function animate() {
    if (RESOURCES_LOADED == false) {
        requestAnimationFrame(animate);
        loadingScreen.box.position.x -= 0.05;
        if (loadingScreen.box.position.x < -3) loadingScreen.box.position.x = 3;
        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }


    requestAnimationFrame(animate)
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
    if (missile.fireInterval < 0 && missile.isAlive) {
        missile.fireInterval = missile.fireInterval_default
        addMissile();
    }
    if (missile.isAlive)
        missile.fireInterval--; // for each frame
    if (antiMissile.isAlive)
        antiMissile.fireInterval--;

    renderer.render(scene, camera)

}





var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersectPoint = new THREE.Vector3();


window.addEventListener('keydown', function() {
    keyboard[event.keyCode] = true
})

window.addEventListener('keyup', function() {
    keyboard[event.keyCode] = false
})

window.addEventListener('mousemove', function(event) {
    //console.log("Mouse Moves")
    moveCrossHair(event)
});


window.addEventListener('mousedown', function(event) {
    //console.log("mouse clicked")
    launchAntiMissiles(event);
});


window.onload = init