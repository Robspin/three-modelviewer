import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// const gui = new dat.GUI()

const arrowLeft = document.getElementById('arrowLeft')
const arrowRight = document.getElementById('arrowRight')
const loadingDiv = document.querySelector('.loading-div')
const loadingBar = document.querySelector('.loading-bar')
const musicSvg = document.querySelector('.music-path')
const musicButton = document.querySelector('.music-container')
const canvas = document.querySelector('canvas.webgl')

const music = new Audio('Flashworx - Futurisma.mp3')
music.volume = 0.3
music.loop = true

const ToggleMusic = () => {
    if (music.paused) {
        music.play()
    } else {
        music.pause()
    }
}

const scene = new THREE.Scene()

const loadingManager = new THREE.LoadingManager(
    () => {
        window.setTimeout(() => {
            loadingBar.classList.add('ended');
            loadingBar.style.transform = '';
        }, 500);
        window.setTimeout(() => {
            loadingDiv.classList.add('ended');
        }, 1800);
    },
    (_, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        loadingBar.style.transform = `scaleX(${progressRatio})`;
    }
);


const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

const textureLoader = new THREE.TextureLoader(loadingManager)

let mixer = null


const removeExistingModel = (gltf) => {
    if (currentModel) {
        scene.remove(currentModel)
    }
    currentModel = gltf.scene
}

const models = [
    {
        url: '/models/LittleTokyo/scene.gltf',
        onLoad: (gltf) => {
            removeExistingModel(gltf)
            gltf.scene.position.y = 1.1
            gltf.scene.scale.set(0.005, 0.005, 0.005)
            scene.add(gltf.scene)

            // Animation
            mixer = new THREE.AnimationMixer(gltf.scene)
            const action = mixer.clipAction(gltf.animations[0])
            action.play()
        }
    },
    {   url: '/models/Plane/scene.gltf',
        onLoad: (gltf) => {
            removeExistingModel(gltf)
            gltf.scene.position.y = 0.5
            gltf.scene.scale.set(2, 2, 2)
            scene.add(gltf.scene)

            // Animation
            mixer = new THREE.AnimationMixer(gltf.scene)
            const action = mixer.clipAction(gltf.animations[0])
            action.play()
        }
    },
    {   url: '/models/VaporwaveSunset/scene.gltf',
        onLoad: (gltf) => {
            removeExistingModel(gltf)
            camera.position.set(2, 2, 2)
            gltf.scene.rotation.y = 0.8
            gltf.scene.scale.set(0.1, 0.1, 0.1)
            scene.add(gltf.scene)

            // Animation
            mixer = new THREE.AnimationMixer(gltf.scene)
            const action = mixer.clipAction(gltf.animations[0])
            action.play()
        }
    },
    {   url: '/models/Fox/glTF/Fox.gltf',
        onLoad: (gltf) => {
            removeExistingModel(gltf)
            gltf.scene.scale.set(0.015, 0.015, 0.015)
            scene.add(gltf.scene)

            // Animation
            mixer = new THREE.AnimationMixer(gltf.scene)
            const action = mixer.clipAction(gltf.animations[2])
            action.play()
        }
    },
    {
        url: '/models/KanedaBike/scene.gltf',
        onLoad: (gltf) => {
            removeExistingModel(gltf)
            gltf.scene.position.y = 2.3
            gltf.scene.scale.set(1, 1, 1)
            scene.add(gltf.scene)
        }
    },
    {
        url: '/models/Bicycle/scene.gltf',
        onLoad: (gltf) => {
            removeExistingModel(gltf)
            gltf.scene.position.y = 0.2
            gltf.scene.scale.set(0.05, 0.05, 0.05)
            scene.add(gltf.scene)
        }
    }
]

let currentIndex = 2
let currentModel = null

const loadModel = (i) => {
    loadingBar.classList.remove('ended')
    loadingDiv.classList.remove('ended')

    gltfLoader.load(
        models[i].url,
        models[i].onLoad
    )
}

loadModel(currentIndex)

const grass = new THREE.MeshBasicMaterial()
textureLoader.load('/grass.png', (texture) => {
    grass.map = texture
    grass.needsUpdate = true
})

const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5, 100),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)

floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(- 5, 5, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if (currentModel && currentModel.name !== 'Sketchfab_Scene_Vaporwave') {
        currentModel.rotation.y += 0.001
    }

    // Model animation
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

arrowLeft.addEventListener('click', () => {
    currentIndex = currentIndex < 1 ? models.length - 1 : currentIndex - 1
    loadModel(currentIndex)
})

arrowRight.addEventListener('click', () => {
    currentIndex = currentIndex > models.length - 2 ? 0 : currentIndex + 1
    loadModel(currentIndex)
})

musicButton.addEventListener('click', () => {
    musicSvg.classList.toggle('music-playing')
    ToggleMusic()
})

tick()
