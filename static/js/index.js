//setup camera and scene, etc...
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

//setup meshes, lights, helpers, etc...
var lightHelpers = [];
var lights = [];



function createRoom(x,y,z,numPaintings) {


    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );


    const half = Math.floor(numPaintings/2);
    const length = half * 2;
    const width = (numPaintings-half) * 2;

    //now that we have some randomly generated values,
    //we can actually get to work

    //floor geometry and mesh
    const geometry = new THREE.BoxGeometry( length, 1, width );
    const floor = new THREE.Mesh( geometry, material );
    floor.position.set(x,y,z)
    //walls
    const lengthGeometry = new THREE.BoxGeometry(length,5,1)
    const lengthMesh = new THREE.Mesh(lengthGeometry, material);
    lengthMesh.position.set(x,y+3,z+(width/2)-0.5)
    
    const widthGeometry = new THREE.BoxGeometry(1,5,width)
    const widthMesh = new THREE.Mesh(widthGeometry, material);
    widthMesh.position.set(x+(length/2)-0.5,y+3,0)
    
    //main room light
    const mainLight = new THREE.PointLight(0xFFFFFF,0.25,0);
    mainLight.position.set(x,y+Math.min(length, width)/2,z);
    console.log(lengthMesh.position)
    //helpers
    const lightHelper = new THREE.PointLightHelper(mainLight)
    //add everything
    lights.push(mainLight);
    lightHelpers.push(lightHelper);
    scene.add(floor, lengthMesh, widthMesh);

}
function createStairRoom(x,y,z, roomSize) {
    const stairSize = 4;
    const half = (roomSize-stairSize)/2;

    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );

    //floor geometry, mesh
    const geometry = new THREE.BoxGeometry( roomSize, 1, roomSize);
    const floor = new THREE.Mesh( geometry, material );
    floor.position.set(x,y,z)


    const lengthGeometry = new THREE.BoxGeometry(half,5,1)

    const lengthMesh = new THREE.Mesh(lengthGeometry, material);
    lengthMesh.position.set(roomSize*(0.25)+1,y+3,z+(roomSize/2)-0.5)
    //create 2 different meshes with same geometry and material,
    //and change their positions
    const len2 = new THREE.Mesh(lengthGeometry, material);
    len2.position.set(roomSize*-0.25-1,y+3, z+(roomSize/2)-0.5)
    scene.add(floor, lengthMesh, len2);
    //TODO: create stair mesh and position it
}



function createPainting(x,y,z,) {
    //2,3,0.5
    //create mesh, etc
    const wallItemMaterial = new THREE.MeshStandardMaterial({color: 0x2B2B2B})
    const wallItemGeometry = new THREE.BoxGeometry(2,3,0.5)
    
    const wallItemMesh = new THREE.Mesh(wallItemGeometry, wallItemMaterial)
    wallItemMesh.position.set(x,y,z)

    //add
    scene.add(wallItemMesh)
}

//main
//createRoom(0,0,0,13);

createStairRoom(0,0,0, 20);

//lights
const ambientLight = new THREE.AmbientLight(0xFFFFFF,0.1)
lights.push(ambientLight)


//helpers
const gridHelper = new THREE.GridHelper(200,50);


//add lights and helpers, and meshes
lights.map(x=> scene.add(x));
//lightHelpers.map(x => scene.add(x));
scene.add(gridHelper);

//setup orbit control
const controls = new OrbitControls(camera, renderer.domElement);
//animate function
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}
animate();

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
function generateRandom(min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}