import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GUI } from 'dat.gui'
import gsap from 'gsap'

const gui = new dat.GUI()
const world ={
  plane :{
    width:  400,
    height: 400,
    widthSegment: 50,
    heightSegment: 50

  }
}

gui.add(world.plane, 'width', 1, world.plane.width*2).onChange(generatePlane)
gui.add(world.plane, 'height', 1, world.plane.height*2).onChange(generatePlane)
gui.add(world.plane, 'widthSegment', 1, world.plane.widthSegment*2).onChange(generatePlane)
gui.add(world.plane, 'heightSegment', 1, world.plane.heightSegment*2).onChange(generatePlane)

// generates plane constantly with random verticies and the correct color
function generatePlane(){
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegment, world.plane.heightSegment)

  //vertical position randomisation
const {array} = planeMesh.geometry.attributes.position
const randomValues = []
for (let i = 0; i < array.length; i ++){

  if (i % 3 ==0){
    const x = array[i]
    const y = array[i+1]
    const z = array[i+2]

    array [i] = x + (Math.random()-0.5)*3
    array [i+1] = y + (Math.random()-0.5)*3
    array [i+2] = z + (Math.random()-0.5)*6
  }

  randomValues.push(Math.random()* Math.PI*2)
}

planeMesh.geometry.attributes.position.randomValues = randomValues 
planeMesh.geometry.attributes.position.origionalPosition = planeMesh.geometry.attributes.position.array 
 
  
  const colors = []
  for(let i = 0; i < planeMesh.geometry.attributes.position.count; i++){
    colors.push(0,0.19,0.4 )
  }
  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute( new Float32Array(colors), 3))

  
}

const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera (75, innerWidth/innerHeight, 0.1, 1000)
const renderer =  new THREE.WebGLRenderer()


renderer.setSize(innerWidth,innerHeight)
renderer.setPixelRatio(devicePixelRatio) 
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement )

camera.position.z = 50

const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegment, world.plane.heightSegment)
const planeMaterial = new THREE.MeshPhongMaterial ({ side: THREE.DoubleSide, flatShading: THREE.FlatShading, vertexColors: true})
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(planeMesh) 
generatePlane()

console.log(planeMesh.geometry.attributes.position)
  
const light = new THREE.DirectionalLight(0xffffff, 1)
const backLight = new THREE.DirectionalLight(0xffffff, 1)

light.position.set(0,-1,1)
backLight.position.set(0,0,-1)
scene.add(light)
scene.add(backLight)

const mouse = {
  x: undefined,
  y: undefined
} 

let frame = 0
function animate(){
  requestAnimationFrame(animate)
  renderer.render(scene, camera)   
  //planeMesh.rotation.x += 0.02
  raycaster.setFromCamera(mouse, camera)
  frame +=0.01

  const {array, origionalPosition, randomValues} = planeMesh.geometry.attributes.position

  for (let i = 0; i < array.length; i+=3){
    //x
    array[i] = origionalPosition[i]+ Math.cos(frame + randomValues[i])*0.001
    //y
    array[i+1] = origionalPosition[i+1]+ Math.sin(frame + randomValues[i])*0.001
   // array[i+2] = origionalPosition[i+2]+ Math.tan(frame + randomValues[i])*0.01

   }

   planeMesh.geometry.attributes.position.needsUpdate = true
 
  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length > 0){
    const {color} = intersects[0].object.geometry.attributes
    
    //colour for vertcie 1
    color.setX(intersects[0].face.a,0.1)
    color.setY(intersects[0].face.a,0.5)
    color.setZ(intersects[0].face.a,1)
    
    //colour for vertcie 2
    color.setX(intersects[0].face.b,0.1) 
    color.setY(intersects[0].face.b,0.5)
    color.setZ(intersects[0].face.b,1)
    
    //colour for verticie 3
    color.setX(intersects[0].face.c,0.1)
    color.setY(intersects[0].face.c,0.5)
    color.setZ(intersects[0].face.c,1)

    color.needsUpdate = true
    const initialcolor = {
      r: 0,
      g: 0.19,
      b: 0.4 
    }

    const hovercolor = {
      r: 0.1,
      g: 0.5,
      b: 1 
    }
    gsap.to(hovercolor, {
      r: initialcolor.r,
      g: initialcolor.g,
      b: initialcolor.b,
      duration: 1,
      onUpdate: () => {
        color.setX(intersects[0].face.a,hovercolor.r)
        color.setY(intersects[0].face.a,hovercolor.g)
        color.setZ(intersects[0].face.a,hovercolor.b)
        
        color.setX(intersects[0].face.b,hovercolor.r) 
        color.setY(intersects[0].face.b,hovercolor.g)
        color.setZ(intersects[0].face.b,hovercolor.b)
        
        color.setX(intersects[0].face.c,hovercolor.r)
        color.setY(intersects[0].face.c,hovercolor.g)
        color.setZ(intersects[0].face.c,hovercolor.b)
        color.needsUpdate = true
      }
    })
  }
}


animate()


addEventListener('mousemove', (event)=>{
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = -(event.clientY / innerHeight) * 2 + 1
})