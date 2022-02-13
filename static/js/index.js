//threejs stuff
import * as THREE from 'https://cdn.skypack.dev/three@0.128'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128/examples/jsm/controls/OrbitControls.js';
import {EffectComposer } from 'https://cdn.skypack.dev/three@0.128/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass }  from 'https://cdn.skypack.dev/three@0.128/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'https://cdn.skypack.dev/three@0.128/examples/jsm/postprocessing/BokehPass.js'
import {SSAOPass} from 'https://cdn.skypack.dev/three@0.128/examples/jsm/postprocessing/SSAOPass.js'
import { FXAAPass } from 'https://cdn.skypack.dev/three@0.128/examples/jsm/postprocessing/FXAAPass.js';

import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

const scene = new THREE.Scene();
const octokit = new Octokit({
    userAgent: 'Code-Is-Art v0.0.0',

    }
); //TODO: auth

//lets get to it!

let width = window.innerWidth;
let height = window.innerHeight;
//https://stackoverflow.com/questions/20290402/three-js-resizing-canvas
    //credit for resizable canvas
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    width = window.innerWidth;
    height = window.innerHeight;

}
// get camera set up
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
//renderer is set up
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.bg'),
    antialias: true,
    alpha: true
});

renderer.setClearColor( 0x000000, 0 ); // the default
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = -15
camera.position.x  = -15
camera.position.y = 15;
camera.lookAt(new THREE.Vector3(0,0,0))

//post-processing
const composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera );

const ssaoPass = new SSAOPass(scene, camera, {
    kernelRadius:24,
    minDistance:0.001,
    maxDistance:0.15,
});
const fxaaPass = new FXAAPass();



composer.addPass( renderPass );
composer.addPass( ssaoPass );
composer.addPass(fxaaPass );


//setup meshes, lights, helpers, etc...
let lightHelpers = [];
let lights = [];

//main
createFloor(0,0,0,7,3)

let stars = [];
addStars(stars);


//lights
const ambientLight = new THREE.AmbientLight(0xFFFFFF,0.1)
lights.push(ambientLight)
lights.map(x=> scene.add(x));

//setup orbit control
const controls = new OrbitControls(camera, renderer.domElement);

animate();

//animate function
function animate() {
    //animate here...

    //star drift, looks cool lol
    stars.map(star => {
        star.position.x += 0.01;
        if (star.position.x > 50) {
            star.position.x = -50
        }
    })
 
    //end of animation stuff
    requestAnimationFrame(animate);
    controls.update();
	composer.render();
    //renderer.render(scene,camera);
}


//https://stackoverflow.com/questions/42812861/three-js-pivot-point/4286733#4286733
    //rather than rotating an object on its own origin,
    //do it on a specified vector3
function rotateAboutPoint(obj, point, axis, theta) {
    obj.position.sub(point);
    obj.position.applyAxisAngle(axis, theta);
    obj.position.add(point);

    obj.rotateOnAxis(axis, theta);
}
function createCorner(x,y,z,roomSize) {

    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );

    const half = Math.floor(roomSize/2);
    const length = half * 2;
    const width = (roomSize-half) * 2;

    //walls
    const lengthGeometry = new THREE.BoxGeometry(length,5,1)
    const lengthMesh = new THREE.Mesh(lengthGeometry, material);
    lengthMesh.position.set(x,y+3,z+(width/2)-0.5)

    const widthMesh = lengthMesh.clone();
    rotateAboutPoint(widthMesh, new THREE.Vector3(x,y,z), new THREE.Vector3(0,1,0), THREE.Math.degToRad(90))
    widthMesh.position.set(x+(length/2)-0.5,y+3,z)
    
    scene.add(lengthMesh, widthMesh);

}

function createStairRoom(x,y,z,rotation=0) {
    //implementing an optional parameter above

    //in order to make use of rotation,
    //we need an array of meshes and then,
    //we need to iterate over the array and rotate each element
    let meshes = [];


    const roomSize = 10;
    const stairSize = 4;
    const half = (roomSize-stairSize)/2;

    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );

    const lengthGeometry = new THREE.BoxGeometry(half,5,1)
    //create 2 different meshes with same geometry and material,
    //and change their positions
    const lengthMesh = new THREE.Mesh(lengthGeometry, material);
    lengthMesh.position.set(x+roomSize*(0.25)+1,y+3,z+(roomSize/2)-0.5)

    const len2 = lengthMesh.clone();
    len2.position.set(x+roomSize*-0.25-1,y+3, z+(roomSize/2)-0.5)
    //actually creates stairs
    createStairs(x,y-0.5,z+(roomSize/2)-0.5, meshes);
    

    //rotating each mesh
    meshes.push( lengthMesh, len2);
    meshes.map(function(mesh) {
        rotateAboutPoint(mesh, new THREE.Vector3(x,y,z), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(rotation))
        scene.add(mesh)
    })

}
function createSide(x,y,z,numPaintings,length,rotation=0) {
    const increment = length/numPaintings
    let meshes = [];
    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );



    const wallGeometry = new THREE.BoxGeometry(1,5,length);
    const wall = new THREE.Mesh(wallGeometry, material);
    wall.position.set(x+4.5,y+3,z);


    //here, we actually add in the paintings;
    for (let i=-(length/2)+(increment/2);i<length/2;i+=increment) {
        createPainting(x+4,y+3,z+i,meshes);
    }
    meshes.push(wall);
    //rotating each mesh
    meshes.map(function(mesh) {
        rotateAboutPoint(mesh, new THREE.Vector3(x,y,z), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(rotation))
        scene.add(mesh)
    })
    const mainLight = new THREE.PointLight(0xFFFFFF,0.25,0);
    mainLight.position.set(x,y+5,z);
    lights.push(mainLight);
}
function createPainting(x,y,z,meshArray) {
    //2,3,0.5
    //create mesh, etc
    const wallItemMaterial = new THREE.MeshStandardMaterial({color: 0x2B2B2B})
    const wallItemGeometry = new THREE.BoxGeometry(0.5,3,2)
    
    const wallItemMesh = new THREE.Mesh(wallItemGeometry, wallItemMaterial)
    wallItemMesh.position.set(x,y,z)

    //add
    meshArray.push(wallItemMesh)
}
//helping function used to create stairs
function createStairs(x,y,z,meshArray) {
    //create material and geometries,
    //which will be used in recursion
    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );
    const segmentGeometry = new THREE.BoxGeometry(4,2,1)
    const wallGeometry = new THREE.BoxGeometry(1,5,1)

    for (let i =0; i< 5;i++) {
        //recursion to generate meshes and position them
        const segment = new THREE.Mesh(segmentGeometry, material);
        segment.position.set(x,y+(-i),z+i)
        const wall = new THREE.Mesh(wallGeometry, material);
        wall.position.set(x-2.5,y+(-i)+3.5, z+i)
        //due to the nature in which the function will be used,
        //it makes more sense to add them to a passed-in array of meshes
        //(see stair room function)
        meshArray.push(segment, wall);
    }
}


function createFloor(x,y,z,numFiles, numDirs) {

    //setting up a lot of values
    //TODO: simplify/??
    const sideLength = 10;
    const lengthFiles = Math.floor(numFiles/2);
    const widthFiles = numFiles - lengthFiles;

    const widthDirs = Math.floor(numDirs/2);
    const lengthDirs = numDirs - widthDirs;

    const lengthPaintingsPerRoom = Math.floor(lengthFiles / widthDirs);
    const createdFiles = widthDirs*lengthPaintingsPerRoom
    const remaining = lengthFiles - createdFiles;

    const widthPaintingsPerRoom = Math.floor(widthFiles / lengthDirs);
    const createdWidthFiles = lengthDirs*widthPaintingsPerRoom;
    const remainingWidthFiles = widthFiles - createdWidthFiles;

    const max = 20*lengthDirs;
    const widthMax = 20*widthDirs;
    const offsetZ = (remaining === 0) ? 0 : 5;
    const offsetX = (remainingWidthFiles === 0) ? 0: 5;
    const mainX = -max/2-offsetX;
    const mainZ = -widthMax/2-offsetZ;

    //floor geometry, mesh, for entire room
    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );
    const geometry = new THREE.BoxGeometry( (lengthDirs*20)+10+(offsetX*2) , 1, (widthDirs*20)+10+(offsetZ*2));
    //const geometry = new THREE.BoxGeometry( (lengthDirs*20)+10, 1, (widthDirs*20)+10);
    const floor = new THREE.Mesh( geometry, material );
    floor.position.set(x,y,z)
    scene.add(floor)

    x-=mainX 
    z-=mainZ
    createCorner(x,y,z,10);
    //use loops to create most files and directories
    for (let i = 1; i<= widthDirs; i++) {
        createStairRoom(x,y,z-(20*i)+sideLength,90);
        createSide(x,y,z-(20*i),lengthPaintingsPerRoom,sideLength,0);
    }
    for (let i = 1; i<= lengthDirs; i++) {
        createStairRoom(x-(20*i)+sideLength,y,z,0);
        createSide(x-(20*i),y,z,widthPaintingsPerRoom,sideLength,-90);

    }
    //if we have leftovers, create them here
    if (remainingWidthFiles>0) {
       createSide(x-max-10, y, z, remainingWidthFiles, 10, -90)
    }
    if (remaining>0) {
        createSide(x, y, z-widthMax-10, remaining, 10);
    }

}

//https://www.youtube.com/watch?v=Q7AOvWpIVHU&t=629s&ab_channel=Fireship
    //idea from Fireship on YT lmao
function addStars(starsArr) {
    function createStar(arr) {
        const geometry = new THREE.SphereGeometry(0.1,24,24);
        const material = new THREE.MeshStandardMaterial( { color: 0xffffff});
        const star = new THREE.Mesh( geometry, material );
        const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100))
        star.position.set(x,y,z);
        scene.add(star);
        arr.push(star);
    }

    for (let i =0; i< 300; i++) {
        createStar(stars);
    }
}