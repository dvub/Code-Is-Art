//this code has been minimally refactored,
//it may not be very easy to read, i'm sorry

//threejs stuff
import * as THREE from 'https://cdn.skypack.dev/three@0.128'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128/examples/jsm/controls/OrbitControls.js';
import {EffectComposer } from 'https://cdn.skypack.dev/three@0.128/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass }  from 'https://cdn.skypack.dev/three@0.128/examples/jsm/postprocessing/RenderPass.js';
import {SSAOPass} from 'https://cdn.skypack.dev/three@0.128/examples/jsm/postprocessing/SSAOPass.js'
//octokit import
import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
const octokit = new Octokit( { userAgent: 'Code-Is-Art v0.0.0' } );

//declare variables that need to be used in both init, and animate functions, (as well as others)
let scene;
let controls;
let lights = [];
let composer;
//type=module allows top-level async
//init must be called before anything else
await init();
animate();

//functions below
async function init() {
    //lets get to it!
    scene = new THREE.Scene();
    let width = window.innerWidth;
    let height = window.innerHeight;

    //renderer is set up
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('.bg'),
        antialias: true,
        alpha: true
    });
    renderer.setClearColor( 0x000000, 0 ); // the default
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // get camera set up
    const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
    );
    camera.position.z = -15
    camera.position.x  = -15
    camera.position.y = 15;
    camera.lookAt(new THREE.Vector3(0,0,0))

    
    //https://stackoverflow.com/questions/20290402/three-js-resizing-canvas
        //credit for resizable canvas
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize(){
        width = window.innerWidth;
        height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize( width, height );


    }
    //post-processing
    //post-processing is partially implemented as of now.
    composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );

    const ssaoPass = new SSAOPass(scene, camera, {
        kernelRadius:24,
        minDistance:0.001,
        maxDistance:0.15,
    });
    composer.addPass( renderPass );
    composer.addPass( ssaoPass );
    //end post-processing

    //main
    await generateDir(new THREE.Vector3(0,0,0),"https://github.com/dvub/Code-Is-Art/static");
    //end of main


    //lights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF,0.1)
    lights.push(ambientLight)
    lights.map(x=> scene.add(x));

    //setup orbit control
    //will not be in final product
    controls = new OrbitControls(camera, renderer.domElement);
}
//animate function
function animate() {
    //animate here...
 
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
function createCorner(pos) {

    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );

    const length = 10
    const width = 10

    //walls
    const lengthGeometry = new THREE.BoxGeometry(length,5,1)
    const lengthMesh = new THREE.Mesh(lengthGeometry, material);
    lengthMesh.position.set(pos.x,pos.y+3,pos.z+(width/2)-0.5)

    const widthMesh = lengthMesh.clone();
    rotateAboutPoint(widthMesh, pos, new THREE.Vector3(0,1,0), THREE.Math.degToRad(90))
    widthMesh.position.set(pos.x+(length/2)-0.5,pos.y+3,pos.z)
    
    scene.add(lengthMesh, widthMesh);

}

function createStairRoom(pos,rotation=0) {
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
    lengthMesh.position.set(pos.x+roomSize*(0.25)+1,pos.y+3,pos.z+(roomSize/2)-0.5)

    const len2 = lengthMesh.clone();
    len2.position.set(pos.x+roomSize*-0.25-1,pos.y+3, pos.z+(roomSize/2)-0.5)
    //actually creates stairs
    createStairs(new THREE.Vector3(pos.x,pos.y-0.5,pos.z+(roomSize/2)-0.5), meshes);
    

    //rotating each mesh
    meshes.push( lengthMesh, len2);
    meshes.map(function(mesh) {
        rotateAboutPoint(mesh, pos, new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(rotation))
        scene.add(mesh)
    })

}
function createSide(pos,numPaintings,length,rotation=0) {
    const increment = length/numPaintings
    let meshes = [];
    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );



    const wallGeometry = new THREE.BoxGeometry(1,5,length);
    const wall = new THREE.Mesh(wallGeometry, material);
    wall.position.set(pos.x+4.5,pos.y+3,pos.z);


    //here, we actually add in the paintings;
    for (let i=-(length/2)+(increment/2);i<length/2;i+=increment) {
        createPainting(new THREE.Vector3(pos.x+4,pos.y+3,pos.z+i),meshes);
    }
    meshes.push(wall);
    //rotating each mesh
    meshes.map(function(mesh) {
        rotateAboutPoint(mesh, pos, new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(rotation))
        scene.add(mesh)
    })
    const mainLight = new THREE.PointLight(0xFFFFFF,0.25,0);
    mainLight.position.set(pos.x,pos.y+5,pos.z);
    lights.push(mainLight);
}
function createPainting(pos,meshArray) {
    //2,3,0.5
    //create mesh, etc
    const wallItemMaterial = new THREE.MeshStandardMaterial({color: 0x2B2B2B})
    const wallItemGeometry = new THREE.BoxGeometry(0.5,3,2)
    
    const wallItemMesh = new THREE.Mesh(wallItemGeometry, wallItemMaterial)
    wallItemMesh.position.set(pos.x,pos.y,pos.z)

    //add
    meshArray.push(wallItemMesh)
}

//helping function used to create stairs
function createStairs(pos,meshArray) {
    //create material and geometries,
    //which will be used in recursion
    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );
    const segmentGeometry = new THREE.BoxGeometry(4,2,1)
    const wallGeometry = new THREE.BoxGeometry(1,5,1)
    //i controls the number of steps
    for (let i =0; i< 5;i++) {
        //recursion to generate meshes and position them
        const segment = new THREE.Mesh(segmentGeometry, material);
        segment.position.set(pos.x,pos.y+(-i),pos.z+i)
        const wall = new THREE.Mesh(wallGeometry, material);
        wall.position.set(pos.x-2.5,pos.y+(-i)+3.5, pos.z+i)
        //due to the nature in which the function will be used,
        //it makes more sense to add them to a passed-in array of meshes
        //(see stair room function)
        meshArray.push(segment, wall);
    }
}

function createFloor(pos, numFiles, numDirs) {

    //setting up a lot of values
    //2x values will exist for the 2 walls to be created,
    //thus the code is slightly inefficient.
    //sorry :/
    const lengthFiles = Math.floor(numFiles/2);
    const widthFiles = numFiles - lengthFiles;

    const widthDirs = Math.floor(numDirs/2);
    const lengthDirs = numDirs - widthDirs;

    const lengthPaintingsPerRoom = Math.floor(lengthFiles / widthDirs);
    const remaining = lengthFiles - widthDirs*lengthPaintingsPerRoom;

    const widthPaintingsPerRoom = Math.floor(widthFiles / lengthDirs);
    const remainingWidthFiles = widthFiles - (lengthDirs*widthPaintingsPerRoom);

    const max = 20*lengthDirs;
    const widthMax = 20*widthDirs;

    const offsetZ = (remaining === 0) ? 0 : 5;
    const offsetX = (remainingWidthFiles === 0) ? 0: 5;

    //floor geometry, mesh, for entire room
    const material = new THREE.MeshStandardMaterial( {color: 0xE75E41} );
    const geometry = new THREE.BoxGeometry( (lengthDirs*20)+10+(offsetX*2) , 1, (widthDirs*20)+10+(offsetZ*2));
    const floor = new THREE.Mesh( geometry, material );
    floor.position.set(pos.x-(max/2-offsetX),pos.y,pos.z-(widthMax/2-offsetZ))
    scene.add(floor)

    createCorner(pos);
    //use loops to create most files and directories
    for (let i = 1; i<= widthDirs; i++) {
        createStairRoom(new THREE.Vector3(pos.x,pos.y,pos.z-(20*i)+10),90);
        createSide(new THREE.Vector3(pos.x,pos.y,pos.z-(20*i)),lengthPaintingsPerRoom,10,0);
    }
    for (let i = 1; i<= lengthDirs; i++) {
        createStairRoom(new THREE.Vector3(pos.x-(20*i)+10,pos.y,pos.z),0);
        createSide(new THREE.Vector3(pos.x-(20*i),pos.y,pos.z),widthPaintingsPerRoom,10,-90);

    }
    //if we have leftovers, create them here
    if (remainingWidthFiles>0) {
       createSide(new THREE.Vector3(pos.x-max-10, pos.y, pos.z), remainingWidthFiles, 10, -90)
    }
    if (remaining>0) {
        createSide(new THREE.Vector3(pos.x, pos.y, pos.z-widthMax-10), remaining, 10);
    }

}
async function generateDir(pos, path) {
    //try catch in case the user gives bad input, etc...
    try {
        //get necessary information from the path string
        const fullPath = path.substring(19, path.length).split('/')
        const _owner = fullPath[0];
        const _repo = fullPath[1];
        const _path = fullPath.slice(2).reduce((last, curr) => last + '/' + curr);
        //make the request with octokit,
        //later, axios will be used to get data from urls
        let result = await octokit.rest.repos.getContent({
            owner: _owner,
            repo: _repo,
            // '' will just give the base / top-level of the repo
            path: _path
        });
        let fileCnt = 0;
        let dirCnt = 0;
        //calculate the number of files/dirs that exist
        result.data.map(x => {
        if (x.type === 'file') fileCnt++;
        if (x.type === 'dir') dirCnt++;
        })
        //call to generate the whole thing
        createFloor(pos, fileCnt, dirCnt);
    
    } catch (e) {
        console.log(e);
    }
}