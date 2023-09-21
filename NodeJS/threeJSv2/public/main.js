/*** Main library ***/
import * as THREE from './threejs/three.module.js';

/*** Loaders import ***/
import {GLTFLoader} from "./threejs/loaders/GLTFLoader.js";

/*** Interaction with the User ***/
import {GUI} from './threejs/lib/dat.gui.module.js';
import {PointerLockControls} from './threejs/controls/PointerLockControls.js';

/*** Stats ***/


import * as FILES from './files.js';

/*** Global const variables
 * gui: for the expandable menu
 * gLoader: for the gltf objects
 * pLoader: for the ply objects
 * weights: for the text weight (array)
 * fonts: for the text font (array)
 * */
const gLoader = new GLTFLoader();
/** Text options*/
const fonts = [
    'helvetiker',
    'optimer',
    'gentilis',
    'droid/droid_sans'
];
const weights = [
    'regular',
    'bold'
];
let data = {
    text: "Japanese text is not supported!",
    size: 1.2,
    height: 1.2,
    curveSegments: 12,
    font: 'optimer',
    weight: 'regular',
    bevelEnabled: false,
    bevelThickness: 1,
    bevelSize: 0.5,
    visible: false
}


/**
 * Global variables for the PointLockControls
 * satDown is for the cinema only
 * */
let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let move = false;
let satDown = false;
// the movement check
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let fileNames = [], folderNames = [];


/**
 * Global variables for the the main parts of the project ex.:
 *  scene, camera, renderer
 * then: video things, and the GUI
 * */
let WIDTH, HEIGHT, aspectRatio;
let renderer;
let scene, camera;
let controls;
let skyboxes = [];

let cinema, chairsRight = [], chairsLeft = [];
let textMesh;
let cinemaVideo, videoTexture, movieMaterial, movieMesh, canPlay = false, isFullscreen = false;
let previewVideo, pVideoTexture, pMovieMaterial, pMovieMesh, previewChanged = false;
const listener = new THREE.AudioListener();
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

let requiredFolder, debugFolder;
let cubeRenderTarget, cubeCamera, mirrorMaterial, mirrorBall, mirrorBall2;
let setupDone = false;
let testGeometry, testMesh, testMaterial, door;

let previewPanel = [], showingPreviewPanel = [];

let selectedMovieId = 0, isMovieMenuOpen = false;
let materials = [];
let vector = new THREE.Vector3();
/**
 * Creating the global light obejcts
 * spotlight1-3 and cinemaPointLights are for the cinema
 * */
let spotLight1 = createSpotlight('#eea36d', false, 1.03, 1, 8.3, 1060);
let spotLight2 = createSpotlight('#f5a162', true, 0.8, 1, 0.6, 450);
let spotLight3 = createSpotlight('#f5a162', false, 1.03, .3, 8.3, 450);
let lightHelper1, lightHelper2, lightHelper3, pointHelper1;
const cinemaPointLight1 = new THREE.PointLight('#f5a162', 0.3);
cinemaPointLight1.castShadow = false;
const cinemaPointLight2 = new THREE.PointLight('#c3c3c3', 0.3);

let selectedChair = {
    side: 'l',
    i: 0,
    j: 0
};

let assets = {
    videoPath: "assets/video/",
    thumbnailPath: "assets/thumbnail/",
    background360Path: "assets/background/",
    videos: [],
    thumbnails: [],
    background360List: [],

}

let debugSettings = new function () {
    this.right = {
        startOffsetX: 0,
        startOffsetZ: 0,
        chairOffsetX: 0,
        chairOffsetZ: 0,
        rowOffsetX: 0,
        rowOffsetZ: 0
    }
    this.left = {
        startOffsetX: 0,
        startOffsetZ: 0,
        chairOffsetX: 0,
        chairOffsetZ: 0,
        rowOffsetX: 0,
        rowOffsetZ: 0
    }

    this.preview = {
        radius: 0,
        widthSegments: 0,
        heightSegments: 0,
        phiStart: 0,
        phiLength: 0,
        thetaStart: 0,
        thetaLength: 0
    }
    this.cinemaCanvas = {
        offsetX: 0,
        offsetY: 0,
        offsetZ: 0
    }
    this.testVector = {
        x: 0,
        y: 0,
        z: 0
    }
    this.angle = {
        property1: 0
    }
}

/**
 * The gui setting for the text
 * isEnabled, isRotate
 * */
let demoSettings = new function () {
    this.isEnabled = false;
    this.isRotate = false;
}

let previewUI = {
    offset: 0,
    firstPanel: 0,
    lastPanel: 3
};
/**
 * Holds all of the helper functions which are mostly called only once,
 * most of them are for code simplicity
 * */
let functionNamespace = {

        loadAssets: function loadAssets() {
        let php = document.createElement("script");
        php.setAttribute("src", "files.js");
        php.setAttribute("type", "module");
        document.body.appendChild(php);

        assets.videos = FILES.videos();
        assets.thumbnails = FILES.thumbnails();
        assets.background360List = FILES.panoramas();
        // alert(assets.thumbnails);
    },
    /***
     * A void function which loads the:
     * cinema
     * calls the 'mirrorSurfaces()' function
     * calls the 'addLights()' function
     * calls the 'videoSetup()' function
     * 'setupDone' will be true
     * */
    setupScene: function setUpScene() {

        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        aspectRatio = WIDTH / HEIGHT;

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.y = 10;

        let textureLoader = new THREE.TextureLoader();
        let skyMaterial1 = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: textureLoader.load(assets.background360Path + assets.background360List[2])
        });
        skyboxes.push(new THREE.Mesh(new THREE.SphereGeometry(700, 128, 128), skyMaterial1));
        skyboxes[0].receiveShadow = true;
        skyboxes[0].rotation.y = THREE.MathUtils.degToRad(34);
        scene.add(skyboxes[0]);
        skyboxes[0].position.set(0, -30, 0);

    },


    load3DObjects: function () {
        this.loadMirror();
        gLoader.load('assets/3D_Objects/cinema.glb', function (gltf) {
            cinema = gltf.scene.children.find((child) => child.name === "Cube");
            // cinema = gltf.scene;
            cinema.material = new THREE.MeshLambertMaterial({
                // color: 0x0ff00,
                wireframe: false,
                side: THREE.DoubleSide
            });

            // cinema.scale.multiplyScalar(60);
            cinema.scale.x = 620.0;
            cinema.scale.y = 80.0;
            cinema.scale.z = 620.0;

            let doorMaterial = new THREE.MeshBasicMaterial({color: '#000000'});
            let doorGeometry = new THREE.BoxGeometry(300, 300, 20);
            door = new THREE.Mesh(doorGeometry, doorMaterial);
            // cinema.scale.set(60,60,60);
            // cinema.scale.y.multiplyScalar(60);
            // cinema.scale.z.multiplyScalar(80);
            // cinema.castShadow = true;

            cinema.receiveShadow = true;
            cinema.rotation.y = THREE.MathUtils.degToRad(180);

            let box = new THREE.Box3().setFromObject( skyboxes[0] );
            let box2 = new THREE.Box3().setFromObject( cinema );
            // console.log( box2.min.x, box2.max.x, box2.getSize() );

            cinema.position.set(box.max.x + Math.abs(box2.min.x) / 1.8 , -80, 0);
            scene.add(cinema);
            camera.lookAt(cinema.position);
            door.rotation.y = THREE.MathUtils.degToRad(180);
            door.position.set(cinema.position.x - 460, cinema.position.y, cinema.position.z - 380);
            scene.add(door);
            door.visible = false;

            let startX = cinema.position.x;
            let startZ = cinema.position.z;
            let offsets = {
                startX: 100,
                startZ: 180,

                rowX: -20,
                rowZ: 85,

                chairX: -140,
                chairZ: -60,

                height: -154
            }

            let chairCount = 0;
            for (let i = 0; i < 3; i++) {
                let rowLeft = [];
                let rowRight = [];
                // console.log("StartLenght: " + rowRight.length);
                for (let j = 0; j < 3; j++) {
                    let currentChair = `Cube00${chairCount += 1}`;
                    // console.log("Chair: " + currentChair);
                    // console.log("Chair: " + `Cube0${chairCount + 9}`);
                    rowRight.push(gltf.scene.children.find((child) => child.name === currentChair));
                    rowLeft.push(gltf.scene.children.find((child) => child.name === `Cube0${chairCount + 9}`));

                    rowRight[j].rotation.y = cinema.rotation.y;
                    rowLeft[j].rotation.y = cinema.rotation.y;

                    rowRight[j].position.set(
                        startX + offsets.startX
                        + i * offsets.rowX
                        + j * offsets.chairX, offsets.height,
                        startZ + -offsets.startZ
                        + i * -offsets.rowZ
                        + j * -offsets.chairZ);

                    rowRight[j].material = new THREE.MeshLambertMaterial({
                        // color: 0x0ff00,
                        wireframe: false,
                        side: THREE.DoubleSide
                    });
                    rowRight[j].castShadow = true;
                    rowRight[j].scale.multiplyScalar(60);


                    rowLeft[j].position.set(
                        startX + offsets.startX
                        + i * offsets.rowX
                        + j * offsets.chairX, offsets.height,
                        startZ + offsets.startZ
                        + i * offsets.rowZ
                        + j * offsets.chairZ);
                    rowLeft[j].material = new THREE.MeshLambertMaterial({
                        // color: 0x0ff00,
                        wireframe: false,
                        side: THREE.DoubleSide
                    });
                    rowLeft[j].castShadow = true;
                    rowLeft[j].scale.multiplyScalar(60);
                }

                // console.log("EndLenght: " + rowRight.length);
                chairsRight.push(rowRight);
                chairsLeft.push(rowLeft);
            }


            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    scene.add(chairsRight[i][j]);
                    scene.add(chairsLeft[i][j]);
                }
            }

            functionNamespace.lights();
            functionNamespace.video();
            setupDone = true;
        });
    },


    /***
     * This is a function for the GUI setup
     * it contains the required folder which contains the text folder for the requirements
     * */
    guiControls: function addGUIControls() {
        const gui = new GUI();

        requiredFolder = gui.addFolder('Required');
        let textFolder = requiredFolder.addFolder('Text');

        textFolder.add(data, 'text').onChange(this.text);
        textFolder.add(data, 'size', 1, 2).onChange(this.text);
        textFolder.add(data, 'height', 1, 2).onChange(this.text);
        textFolder.add(data, 'curveSegments', 1, 20).onChange(this.text);
        textFolder.add(data, 'font', fonts).onChange(this.text);
        textFolder.add(data, 'weight', weights).onChange(this.text);
        textFolder.add(data, 'bevelEnabled').onChange(this.text);
        textFolder.add(data, 'bevelThickness', 0.1, 3).onChange(this.text);
        textFolder.add(data, 'bevelSize', 0.1, 3).onChange(this.text);

        requiredFolder.add(demoSettings, 'isEnabled').onChange(this.text);
        requiredFolder.add(demoSettings, 'isRotate').onChange();
        gui.close();

        let debug = gui.addFolder('Debug');

        // debug.add(debugSettings.testVector, "x", -1, 1).name("Test Vector X").onChange(debugFunction);
        // debug.add(debugSettings.testVector, "y",-2, 2).name("Test Vector Y").onChange(debugFunction);
        // debug.add(debugSettings.testVector, "z",-1, 1).name("Test Vector Z").onChange(debugFunction);
        //
        // debug.add(debugSettings.angle, "property1",0, 360).name("Angle").onChange(debugFunction);
        // debug.add(debugSettings.preview, "radius").name("Radius").onFinishChange(debugFunction);
        // debug.add(debugSettings.preview, "widthSegments").name("Width Segment").onFinishChange(debugFunction);
        // debug.add(debugSettings.preview, "heightSegments").name("Height Segment").onFinishChange(debugFunction);
        // debug.add(debugSettings.preview, "phiStart").name("Phi Start").onFinishChange(debugFunction);
        // debug.add(debugSettings.preview, "phiLength").name("Phi Length").onFinishChange(debugFunction);
        // debug.add(debugSettings.preview, "thetaStart").name("Theta Start").onFinishChange(debugFunction);
        // debug.add(debugSettings.preview, "thetaLength").name("Theta Length").onFinishChange(debugFunction);
        //
        // debug.add(debugSettings.cinemaCanvas, "offsetX").name("Canvas X").onFinishChange(debugFunction);
        // debug.add(debugSettings.cinemaCanvas, "offsetY").name("Canvas Y").onFinishChange(debugFunction);
        // debug.add(debugSettings.cinemaCanvas, "offsetZ").name("Canvas Z").onFinishChange(debugFunction);


        /*    debug.add(cinemaPointLight1, 'castShadow');
            debug.add(spotLight1, 'castShadow');
            debug.add(spotLight2, 'castShadow');
            debug.add(spotLight2, 'angle').onChange(debugFunction);
            debug.add(spotLight2, 'penumbra').onChange(debugFunction);
            debug.add(spotLight2, 'decay').onChange(debugFunction);
            debug.add(spotLight2, 'distance').onChange(debugFunction);*/

        debug.add(debugSettings.left, 'chairOffsetX').name("Left Chair Offset X").onChange(debugFunction);
        debug.add(debugSettings.left, 'chairOffsetZ').name("Left Chair Offset Z").onChange(debugFunction);
        debug.add(debugSettings.left, 'rowOffsetX').name("Left Row Offset X").onChange(debugFunction);
        debug.add(debugSettings.left, 'rowOffsetZ').name("Left Row Offset Z").onChange(debugFunction);
        debug.add(debugSettings.left, 'startOffsetX').name("Left Start Offset X").onChange(debugFunction);
        debug.add(debugSettings.left, 'startOffsetZ').name("Left Start Offset Z").onChange(debugFunction);

        debug.add(debugSettings.right, 'chairOffsetX').name("Right Chair Offset X").onChange(debugFunction);
        debug.add(debugSettings.right, 'chairOffsetZ').name("Right Chair Offset Z").onChange(debugFunction);
        debug.add(debugSettings.right, 'rowOffsetX').name("Right Row Offset X").onChange(debugFunction);
        debug.add(debugSettings.right, 'rowOffsetZ').name("Right Row Offset Z").onChange(debugFunction);
        debug.add(debugSettings.right, 'startOffsetX').name("Right Start Offset X").onChange(debugFunction);
        debug.add(debugSettings.right, 'startOffsetZ').name("Right Start Offset Z").onChange(debugFunction);

        gui.domElement.style.position = 'absolute';
        gui.domElement.style.top = '0px';
        gui.domElement.style.right = '2px';
        document.body.appendChild(gui.domElement);
    },


    /**
     * For code simplicity, I took out the mirror refreshing
     * this way, there is a fewer lines in the 'animate' function
     * */
    mirror: function renderMirror() {
        mirrorBall.visible = false;
        mirrorBall2.visible = false;
        cubeCamera.update(renderer, scene);
        mirrorBall.visible = true;
        mirrorBall2.visible = true;
    },

    /***
     * A separate void function for the mirror setup
     * there is two mirrors in the project
     * the mirrors are two spheres with 'CubeCamera' on them
     * */
    loadMirror: function mirrorSurfaces() {
        cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
            // encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
        });

        cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
        mirrorMaterial = new THREE.MeshBasicMaterial({
            envMap: cubeRenderTarget.texture,
            reflectivity: 1
        });

        mirrorBall = new THREE.Mesh(new THREE.IcosahedronGeometry(70, 8), mirrorMaterial);
        mirrorBall2 = new THREE.Mesh(new THREE.IcosahedronGeometry(30, 8), mirrorMaterial);
        mirrorBall.position.set(-85, 154, -415);
        mirrorBall2.position.set(-133, 72, 397);
        scene.add(mirrorBall);
        scene.add(mirrorBall2);
    },


    /**
     * A void function which renders the video plain, and sets up the movieMaterial
     * */
    video: function videoSetup() {
        let gGeometry = new THREE.PlaneGeometry(720, 405, 4, 4);

        cinemaVideo = document.getElementById('videoCinema');
        previewVideo = document.getElementById('videoPreview');

        cinemaVideo.src = assets.videoPath + assets.videos[0];
        cinemaVideo.crossOrigin = "anonymous";
        cinemaVideo.load();

        previewVideo.src = assets.videoPath + assets.videos[0];
        previewVideo.crossOrigin = "anonymous";
        previewVideo.load();

        videoTexture = new THREE.VideoTexture(cinemaVideo);
        // videoTexture.needsUpdate = true;
        movieMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            side: THREE.DoubleSide
        })

        movieMesh = new THREE.Mesh(gGeometry, movieMaterial);
        movieMesh.position.x = cinema.position.x + 483;
        movieMesh.position.z = cinema.position.z ;
        movieMesh.position.y = 50;
        movieMesh.rotation.y = -cinema.rotation.y / 2;
        scene.add(movieMesh);
    },


    /**
     * Adds sound for the footsteps
     * */
    audio: function audioSetup() {
        camera.add(listener);

        audioLoader.load('assets/audio/footstep.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
        });
    },


    /***
     * A separate void function for the light setup
     * for a clearer code
     * */
    lights: function addLights() {
        let ambient = new THREE.AmbientLight('#FFFFFF', 0.3);
        // scene.add(ambient);

        cinemaPointLight1.position.set(cinema.position.x, 50, cinema.position.z);
        pointHelper1 = new THREE.PointLightHelper(cinemaPointLight1);

        spotLight1.position.set(cinema.position.x + 100, 90, cinema.position.z + 330);
        spotLight2.position.set(cinema.position.x + 280, 90, cinema.position.z - 22);
        spotLight2.decay = 8.3;
        spotLight2.angle = 1.03;
        spotLight2.distance = 1060;

        spotLight3.position.set(spotLight3.position.x, 90, spotLight3.position.z);


        spotLight1.target.position.set(cinema.position.x - 47, -10, cinema.position.z + 116);
        spotLight2.target.position.set(cinema.position.x - 60, -10, cinema.position.z - 160);


        lightHelper1 = new THREE.SpotLightHelper(spotLight1);
        lightHelper2 = new THREE.SpotLightHelper(spotLight2);
        lightHelper3 = new THREE.SpotLightHelper(spotLight3);

        scene.add(spotLight1, spotLight2, cinemaPointLight1);
        // scene.add(lightHelper1, lightHelper2, lightHelper3, pointHelper1);
    },


    /**
     * Adds the eventHandler to the key press,
     * configuring the HTML divs with the instructions and the blocker*/
    controls: function setupControls() {
        controls = new PointerLockControls(camera, document.body);

        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');


        instructions.addEventListener('click', function () {

            controls.lock();

        });

        controls.addEventListener('lock', function () {

            instructions.style.display = 'none';
            blocker.style.display = 'none';

        });

        controls.addEventListener('unlock', function () {

            blocker.style.display = 'block';
            instructions.style.display = '';
        });

        scene.add(controls.getObject());

        const onKeyDown = function (event) {
            // console.log(camera.rotation);

            switch (event.code) {

                case 'KeyW':
                    moveForward = true;
                    move = true;
                    break;


                case 'KeyA':
                    moveLeft = true;
                    move = true;

                    break;


                case 'KeyS':
                    moveBackward = true;
                    move = true;

                    break;


                case 'KeyD':
                    moveRight = true;
                    move = true;

                    break;

                case 'Space':
                    if (canJump === true) velocity.y += 350;
                    canJump = false;
                    break;
            }

        };
        const onKeyUp = function (event) {
            // console.log(event.code);
            switch (event.code) {
                case 'Escape':
                    controls.unlock();
                    break;
                case 'Enter':
                    if (satDown)
                        selectMoveNamespace.selectVideo();
                    break;

                case 'KeyF':
                    if(!isFullscreen && satDown){
                        cinemaVideo.style.height = "100vh";
                        cinemaVideo.style.width = "100%";
                        cinemaVideo.style.display = "flex";
                        cinemaVideo.style.position = "fixed";

                        isFullscreen = true;
                    }
                    else
                    {
                        cinemaVideo.style.display = "none";
                        isFullscreen = false;
                    }
                    break;
                case 'KeyQ':
                    if(satDown){
                        previewChanged = false;
                        selectedMovieId++;
                        selectMoveNamespace.previewOverFlow()
                    }
                    break;
                case 'KeyE':
                    if(satDown){
                        previewChanged = false;
                        selectedMovieId--;
                        selectMoveNamespace.previewOverFlow()
                        console.log(`MovieID: ${selectedMovieId}`);
                    }
                    break;
                case 'KeyR':
                    selectMoveNamespace.hideNShowPreview(satDown);
                    break;

                case 'KeyW':
                    moveForward = false;
                    move = false;

                    break;


                case 'KeyA':
                    moveLeft = false;
                    move = false;

                    break;


                case 'KeyS':
                    moveBackward = false;
                    move = false;

                    break;


                case 'KeyD':
                    moveRight = false;
                    move = false;

                    break;
                case 'ControlLeft':

                    if (satDown) {
                        satDown = false;
                        return;
                    }
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            let posLX = chairsLeft[i][j].position.x;
                            let posLZ = chairsLeft[i][j].position.z;

                            let posRX = chairsRight[i][j].position.x;
                            let posRZ = chairsRight[i][j].position.z;

                            let diffX = Math.abs(posLX - camera.position.x);
                            let diffZ = Math.abs(posLZ - camera.position.z);

                            if (diffX < 20 && diffZ < 20) {
                                camera.position.x = posLX;
                                camera.position.Z = posLZ;
                                satDown = true;
                                selectedChair.i = i;
                                selectedChair.j = j;
                                selectedChair.side = 'l';
                                // console.log(`Difference Left X: ${diffX}\nDifference Left Z: ${diffZ}`);
                            } else {
                                diffX = Math.abs(posRX - camera.position.x);
                                diffZ = Math.abs(posRZ - camera.position.z);
                                // console.log(`Difference Right X: ${diffX}\nDifference Right Z: ${diffZ}`);

                                if (diffX < 20 && diffZ < 20) {
                                    camera.position.x = posRX;
                                    camera.position.Z = posRZ;
                                    satDown = true;
                                    selectedChair.i = i;
                                    selectedChair.j = j;
                                    selectedChair.side = 'r';

                                }
                            }
                        }
                    }
                    // satDown = canPlay && !satDown;

                    break;
                case 'ShiftLeft':
                    if (satDown) {
                        camera.position.set(600, 10, 414);
                        satDown = false;
                    }
                    break;
                case 'ShiftRight':
                    // camera.getWorldDirection(vector);

                    console.log("WorldDirectionX: " + vector.x);
                    console.log("WorldDirectionY: " + vector.y);
                    console.log("WorldDirectionZ: " + vector.z);
                    console.log("CameraRotation: " + camera.rotation.y);
                    for (let i = 0; i < 3; i++) {
                        showingPreviewPanel[i] = previewPanel[previewUI.firstPanel + i];
                        console.log(`Panel[${i}] Rotation: ${showingPreviewPanel[i].rotation.y}
                        \nCamera Rotation: ${camera.rotation.y}\nDifference: ${Math.abs(camera.rotation.y - showingPreviewPanel[i].rotation.y)}`);

                    }
                    // console.log("CameraAngle: " + getCameraAngle(camera.getWorldDirection()));

                    break;
            }

        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
    },


    /** Loads the required text if needed, by default, its not called
     * only when the 'isEnabled' is checked
     * */
    text: function generateTextGeometry() {
        let loader = new THREE.FontLoader();
        loader.load('./assets/fonts/' + data.font + '_' + data.weight + '.typeface.json', (font) => {//
            let geometry = new THREE.TextGeometry(data.text, {
                font: font,
                size: data.size,
                height: data.height,
                curveSegments: data.curveSegments,
                bevelEnabled: data.bevelEnabled,
                bevelThickness: data.bevelThickness,
                bevelSize: data.bevelSize
            });
            geometry.center();

            if (!textMesh) {
                let textMaterial = new THREE.MeshPhongMaterial({color: 0xcfcfcf, wireframe: false, transparent: false});//
                textMesh = new THREE.Mesh(geometry, textMaterial);
                scene.add(textMesh);
            } else {
                textMesh.geometry.dispose();
                textMesh.geometry = geometry;
            }
            textMesh.castShadow = true;
            textMesh.position.set(cinema.position.x, 20, cinema.position.z);
            textMesh.visible = demoSettings.isEnabled;


        })
    },

}


/**
 * Holds the functions for the Movie select things
 * */
let selectMoveNamespace = {

    /**
     * A method for creating the floating preview panel
     * It creates static three preview
     * */
    cretePreview: function cretePreview() {

        let textures = [];
        for (let i = 0; i < assets.thumbnails.length; i++) {
            textures.push(new THREE.TextureLoader().load(assets.thumbnailPath + assets.thumbnails[i]));
        }

        // testGeometry = new THREE.SphereGeometry(15, 16, 8, 0.5, 2, 1,1.2);
        testGeometry = new THREE.PlaneGeometry(8, 4);

        // scene.add(testMesh);
        for (let i = 0; i < assets.thumbnails.length; i++) {
            materials.push(new THREE.MeshBasicMaterial({map: textures[i], side: THREE.DoubleSide}))
            previewPanel.push(new THREE.Mesh(testGeometry, materials[i]));
            scene.add(previewPanel[i]);
            previewPanel[i].visible = false;
        }

        for (let i = 0; i < 3; i++) {
            showingPreviewPanel[i] = previewPanel[previewUI.firstPanel + i];
        }
        // alert(`Materials length: ${materials.length}\nTextures Length: ${textures.length}`)

    },


    /**
     * Method:
     *  shows the preview
     *  sets the selected panel's video preview
     *  */
    showPreview: function showPreview() {
        let offset = 0;
        camera.getWorldDirection(vector);

        for (let i = previewUI.firstPanel; i < previewUI.lastPanel; i++) {
            if (i === selectedMovieId) {
                offset = 2;
                if (!previewChanged) {
                    let vTexture = new THREE.VideoTexture(previewVideo);
                    // videoTexture.needsUpdate = true;
                    previewPanel[i].material = new THREE.MeshBasicMaterial({
                        map: vTexture,
                        side: THREE.DoubleSide
                    });
                    previewVideo.src = assets.videoPath + assets.videos[selectedMovieId];
                    previewVideo.crossOrigin = "anonymous";
                    previewVideo.load();
                    previewVideo.onloadeddata = function () {
                        console.log("canPlat");
                        previewVideo.play();
                    };
                    previewVideo.muted = true;
                    previewVideo.playbackRate = 3.0;
                    previewChanged = true;
                }
            } else {
                previewPanel[i].material = materials[i];
                offset = 0;
            }

            previewPanel[i].lookAt(camera.position.x, camera.position.y, camera.position.z);
            previewPanel[i].position.set(camera.position.x + (Math.sin(THREE.MathUtils.degToRad(getCameraAngle(vector) - 50 + i * 50 + previewUI.offset)) * 10),
                camera.position.y - 5 + offset,
                camera.position.z + (Math.cos(THREE.MathUtils.degToRad(getCameraAngle(vector) - 50 + i * 50 + previewUI.offset)) * 10));
            previewPanel[i].visible = true;

        }
    },

    previewLoaded: function () {
        previewVideo.play();
    },
    /**
     * Method: Hides the panel's mesh, and sets the 'isMovieOpen' to false
     * */
    hideNShowPreview: function hideNShowPreview(openTest) {
        if (isMovieMenuOpen) {
            for (let i = previewUI.firstPanel; i < previewUI.lastPanel; i++) {
                previewPanel[i].visible = false;
            }
            isMovieMenuOpen = false;
        } else {
            if (openTest) {
                for (let i = previewUI.firstPanel; i < previewUI.lastPanel; i++) {
                    previewPanel[i].visible = true;
                }
                isMovieMenuOpen = true;
            }
        }
    },

    jumpToPreviewStart: function jumpToStart() {
        previewUI.firstPanel = 0;
        previewUI.lastPanel = 3;
        previewUI.offset = 0;
        for (let i = previewUI.lastPanel; i < assets.thumbnails.length; i++)
            previewPanel[i].visible = false;

        for (let i = 0; i < previewUI.firstPanel; i++)
            previewPanel[i].visible = false;

    },
    jumpToPreviewEnd: function jumpToEnd() {
        previewUI.firstPanel = assets.thumbnails.length - 3
        previewUI.lastPanel = assets.thumbnails.length;
        previewUI.offset = 35 * assets.thumbnails.length * -1;
        for (let i = previewUI.lastPanel; i < assets.thumbnails.length; i++)
            previewPanel[i].visible = false;

        for (let i = 0; i < previewUI.firstPanel; i++)
            previewPanel[i].visible = false;
    },

    previewOverFlow: function previewOverFlow() {
        if (selectedMovieId > assets.thumbnails.length - 1) {
            selectedMovieId = 0;
            this.jumpToPreviewStart();
        }

        if (selectedMovieId < 0) {
            selectedMovieId = assets.thumbnails.length - 1;
            this.jumpToPreviewEnd();
        }

        if (previewUI.offset > 45) {
            this.jumpToPreviewEnd();
        }
        if (previewUI.offset < 35 * assets.thumbnails.length * -1) {
            this.jumpToPreviewStart();
        }


    },


    /**
     * Starts the selected video in the movie
     * */
    selectVideo: function selectVideo() {
        this.hideNShowPreview();
        cinemaVideo.src = assets.videoPath + assets.videos[selectedMovieId];
        cinemaVideo.load();
        cinemaVideo.play();
    }
}


/***
 * This is a class for changing the color of an object
 * */
class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }

    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }

    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

$(document).ready(function () {

    init();
    animate();

});


//Main part which does its job
function callback(files) {
    alert(files);
}


/***
 * The 'init' is for the initialization which:
 *  sets up the scene
 *  sets up the camera
 *  sets up the renderer
 *  creating the skybox
 * */
function init() {

    functionNamespace.loadAssets();
    functionNamespace.setupScene()
    functionNamespace.controls();
    functionNamespace.guiControls();
    functionNamespace.audio();
    functionNamespace.load3DObjects();

    selectMoveNamespace.cretePreview();

    addEventListener('wheel', checkScrollDirection);
    window.addEventListener('resize', onWindowResize);
}


/**
 * This function is responsible for the 'requestAnimationFrame( animate );'
 * and the control check
 * and the sitting down in the cinema*/


function animate() {
    if (isMovieMenuOpen) {
        selectMoveNamespace.showPreview()
    }
    if (setupDone) {
        if (satDown) {
            switch (selectedChair.side) {
                case "l":
                    camera.position.set(chairsLeft[selectedChair.i][selectedChair.j].position.x,
                        10,
                        chairsLeft[selectedChair.i][selectedChair.j].position.z);
                    break;
                case "r":
                    camera.position.set(chairsRight[selectedChair.i][selectedChair.j].position.x,
                        10,
                        chairsRight[selectedChair.i][selectedChair.j].position.z);
                    break;
            }
            cinemaPointLight1.visible = false;
            door.visible = true;
            cinemaVideo.play();

        } else {
            cinemaVideo.pause();
            cinemaPointLight1.visible = true;
            door.visible = false;
        }
    }

    if (demoSettings.isRotate) textMesh.rotation.y += 0.005;

    requestAnimationFrame(animate);

    const time = performance.now();

    if (demoSettings.isRotate === true) {
        textMesh.rotation.y += 0.02;
    }
    if (controls.isLocked === true) {

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;

        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        if ((moveForward || moveBackward || moveRight || moveLeft) && !sound.isPlaying)
            sound.play();
        else if (!(moveForward || moveBackward || moveRight || moveLeft))
            sound.pause();

        controls.moveRight(-velocity.x * delta * 2.5);
        controls.moveForward(-velocity.z * delta * 2.5);

        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 10) {

            velocity.y = 0;
            if (satDown)
                controls.getObject().position.y = 4;
            else
                controls.getObject().position.y = 10;
            canJump = true;
        }


    }

    prevTime = time;

    renderer.render(scene, camera);
    functionNamespace.mirror();

}


/***
 * A method which returns a spotlight with the color in the passed parameter
 * */
function createSpotlight(color, shadow, angle, penumbra, decay, distance) {

    const newObj = new THREE.SpotLight(color, 5);
    newObj.castShadow = shadow;
    newObj.angle = angle;
    newObj.penumbra = penumbra;
    newObj.decay = decay;
    newObj.distance = distance;
    return newObj;

}


function checkScrollDirection(event) {
    if (event.wheelDelta > 0) {

        previewUI.offset -= 1.5;
    } else {
        previewUI.offset += 1.5;

    }

    selectMoveNamespace.previewOverFlow();

    previewUI.firstPanel = Math.abs(Math.floor(Math.abs(previewUI.offset) / 45));
    previewUI.lastPanel = Math.abs(Math.floor(Math.abs(previewUI.offset) / 45)) + 3;

    if (previewUI.lastPanel > assets.thumbnails.length) {
        previewUI.firstPanel = assets.thumbnails.length - 3;
        previewUI.lastPanel = assets.thumbnails.length;
    }
    for (let i = previewUI.lastPanel; i < assets.thumbnails.length; i++)
        previewPanel[i].visible = false;

    for (let i = 0; i < previewUI.firstPanel; i++)
        previewPanel[i].visible = false;


    // console.log(`Offset: ${previewUI.offset}\nFirst Panel: ${previewUI.firstPanel}\nLast Panel: ${previewUI.lastPanel}`);

}


/**
 * The function speaks for itself, it handles the resize of the window
 * */
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    // controls.handleResize();
}


/**
 * !!! For deugging purposes only !!!
 * */
function debugFunction() {


    // previewPanel[0].position.set(camera.position.x - (Math.sin((THREE.MathUtils.degToRad(debugSettings.angle.property1))) * 10),
    //     -2,
    //     camera.position.z - (Math.cos((THREE.MathUtils.degToRad(debugSettings.angle.property1))) * 10));


    let startX = cinema.position.x;
    let startZ = cinema.position.z;
    let rightIterI = 2;
    let colors = [ ];
    let row = [ ];
    row.push(new THREE.MeshBasicMaterial({ color: '#fd5d5d'}));
    row.push(new THREE.MeshBasicMaterial({ color: '#f39247'}));
    row.push(new THREE.MeshBasicMaterial({ color: '#fdd55d'}));
    colors.push(row);
    row = [ ];

    row.push(new THREE.MeshBasicMaterial({ color: '#d2fd5d'}));
    row.push(new THREE.MeshBasicMaterial({ color: '#80fd5d'}));
    row.push(new THREE.MeshBasicMaterial({ color: '#5dfdaa'}));
    colors.push(row);
    row = [ ];

    row.push(new THREE.MeshBasicMaterial({ color: '#5df8fd'}));
    row.push(new THREE.MeshBasicMaterial({ color: '#5da5fd'}));
    row.push(new THREE.MeshBasicMaterial({ color: '#755dfd'}));
    colors.push(row);
    for (let i = 0; i < 3; i++) {
        let rightIterJ = 2;
        for (let j = 0; j < 3; j++) {
            chairsLeft[i][j].position.set(
                startX + debugSettings.left.startOffsetX
                + i * debugSettings.left.rowOffsetX
                + j * debugSettings.left.chairOffsetX, debugSettings.right.startOffsetX,

                startZ + debugSettings.left.startOffsetZ
                + i * debugSettings.left.rowOffsetZ
                + j * debugSettings.left.chairOffsetZ);

            chairsLeft[i][j].material = colors[i][j];
            chairsRight[i][j].material = colors[i][j];

            chairsRight[i][j].position.set(
                startX + debugSettings.left.startOffsetX
                + i * debugSettings.left.rowOffsetX
                + j * debugSettings.left.chairOffsetX, debugSettings.right.startOffsetX,

                startZ + -debugSettings.left.startOffsetZ
                + i * -debugSettings.left.rowOffsetZ
                + j * -debugSettings.left.chairOffsetZ);

            console.log(`J: ${j}\nRight Iter J: ${rightIterJ}`)
            rightIterJ -= 1;
        }
        console.log(`I: ${i}\nRight Iter I: ${rightIterI}`)

        rightIterI -= 1;

    }

    // testMesh.radius = debugSettings.preview.radius;
    // testMesh.widthSegments = debugSettings.preview.widthSegments;
    // testMesh.heightSegments = debugSettings.preview.heightSegments;
    // testMesh.phiStart = debugSettings.preview.phiStart;
    // testMesh.phiLength = debugSettings.preview.phiLength;
    // testMesh.thetaStart = debugSettings.preview.thetaStart;
    // testMesh.thetaLength = debugSettings.preview.thetaLength;
    // camera.lookAt(debugSettings.testVector.x, debugSettings.testVector.y, debugSettings.testVector.z);
    // let test = new THREE.Vector3(debugSettings.testVector.x, debugSettings.testVector.y, debugSettings.testVector.z);
    // camera.position.addScaledVector(test, 1);

    // movieMesh.position.set(cinema.position.x + debugSettings.cinemaCanvas.offsetX,
    //     debugSettings.cinemaCanvas.offsetY,
    //     cinema.position.z + debugSettings.cinemaCanvas.offsetZ);

}

function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

    if (pointIsWorld) {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT

}

function getCameraAngle(cameraVector) {
    return THREE.MathUtils.radToDeg(Math.atan2(cameraVector.x, cameraVector.z));
}

function getNames() {
    let files = document.querySelectorAll("a.icon.file");
    let folders = document.querySelectorAll("a.icon.dir");
    files.forEach(function (item) {
        fileNames.push(item.textContent)
    })
    folders.forEach(function (item) {
        folderNames.push(item.textContent.slice(0, -1))
    })
    console.log(fileNames);
    console.log(folderNames);
}