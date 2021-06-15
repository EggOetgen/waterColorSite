var gui = new dat.GUI({name: 'My GUI'});
let c  = 0;
let net;

let t = 0;
// Add a string controller.
var displaceControls = {
    midPoint: 0.5,
    weight: 0.05,
    mixAmt:0.01,

};

let hasLoaded = false;
var noiseControls = {
    speed:0.00,
    scale: 10,
    damp: 2,
    amp: 1.0,
    offset: 0.3,
    oct: 3
}


var slopeControls = {
    xSpeed: 0.,
    ySpeed: 0.,
    strength: 1.0,
    sampleStep: 0.01,
}

var mixControls = {
    mixAmount:0.01,
    mult: 1,

}

var bodyPixControls = {
    multiplier:0.5,
    
}
var sources =  {
    A: 0,
    B: 0
}
var modulator =  {
    Source: 0,
    
}
var outputSource =  {
    Source: 0,
    
}
let cam = false;
let mod = false;



//                              uniformsMix.tex0.value = textureCam;                 
//                              uniformsMixMask.tex0.value = textureCam;     

   

// var sources = { source:()=>{ cam = !cam
//                          if(cam){
//                              uniformsFeedback.tex0.value = textureCam;    
//                              uniformsMix.tex0.value = textureCam;                 
//                              uniformsMixMask.tex0.value = textureCam;                 

//                          }else{
//                              uniformsFeedback.tex0.value = noiseTexture.texture
//                              uniformsMix.tex0.value = noiseTexture.texture
//                              uniformsMixMask.tex0.value = noiseTexture.texture

//                         }},
//                 modulator:()=>{ mod = !mod
//                             if(mod){
//                                uniformsBlend.tex0.value = textureCam;
//                                uniformsMix.tex0.value = textureCam;
//                                uniformsMixMask.tex0.value = textureCam;

//                             }else{
//                                uniformsBlend.tex0.value = noiseTexture.texture;
//                                uniformsMix.tex0.value = noiseTexture.texture
//                                uniformsMixMask.tex0.value = noiseTexture.texture

//                            }}
//                     };
var text =  {
                speed: 'someName'
            }
          
                                        
// gui.add(sources,'source');
// gui.add(sources,'modulator');
gui.add(mixControls, 'mixAmount', 0.00000001,3.0 );
gui.add(mixControls, 'mult', -1, 10,1 );

gui.add(displaceControls, 'weight', -.01, .2 );
gui.add(displaceControls, 'mixAmt', 0., 1.0 );

// gui.add(displaceControls, 'midPoint', 0., 1.0 );
gui.add(noiseControls, 'speed', -0.01, 0.01 );

gui.add(noiseControls, 'scale', 1, 100 );
gui.add(noiseControls, 'damp', 0, 3, 1 );
gui.add(noiseControls, 'amp', 0., 1.0 );
gui.add(noiseControls, 'offset', 0., 1.0 );
gui.add(noiseControls, 'oct', 1., 20. );
gui.add(slopeControls, 'xSpeed', -0.5, 0.5);
gui.add(slopeControls, 'ySpeed', -0.5, 0.5 );
gui.add(slopeControls, 'strength', 0.1, 10. );
gui.add(slopeControls, 'sampleStep', -0.01, 0.01 );

gui.add(bodyPixControls, 'multiplier', 0.0, 1. );

var container;
var camera, scene, rtScene, renderer, rtScene2;
var uniforms;
 let noiseTexture;
 let feedback;
 let displace;
 let slopeTexture;
 let blend;
 let blendScene;
 let mixScene;
let mix;
//  var materialSlope
let mesh ;
var meshB;
var meshBlend;
var mesh2 ;
 let mouseX = 0;
 let mouseY = 2;
 const videoEl = document.getElementById('video');
 const bodyPixCanv = document.getElementById('bodyPixCanv');

init();
animate();
function init() {
 
    // var c = document.getElementById("textCanvas");
    // var ctx = c.getContext("2d");
        // ctx.moveTo(0, 0);
        // ctx.lineTo(200, 100);
        // ctx.stroke();

//   textureCam = new THREE.CanvasTexture(c);
    textureCam = new THREE.VideoTexture(videoEl);

   maskTexture = new THREE.CanvasTexture(bodyPixCanv);

  
getWebcam();
    stats = createStats();
document.body.appendChild(stats.domElement);

    container = document.getElementById( 'container' );

    camera = new THREE.Camera();
    camera.position.z = 1;

    sceneOut = new THREE.Scene();
    rtScene = new THREE.Scene();
    rtScene2 = new THREE.Scene();
    rtScene3 = new THREE.Scene();
    rtScene4 = new THREE.Scene();
    blendScene = new THREE.Scene();
    mixScene = new THREE.Scene();


    noiseTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    slopeTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    feedback = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    displace = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    blend = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    mix = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);

    var geometry = new THREE.PlaneBufferGeometry( 2,2,window.innerWidth/100, window.innerHeight/100);
    // var geometry = new THREE.PlaneBufferGeometry( 2,2);

    uniformsSimplex = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() },
        scale: { type: "f", value: noiseControls.scale },
        damp: { type: "i", value: noiseControls.damp },
        amp: { type: "f", value: noiseControls.amp },
        offset: { type: "f", value: noiseControls.offset },
        oct: { type: "i", value: noiseControls.oct },
    };
    uniformsSlope = {
        tex0: { value: blend.texture },
        u_time: { type: "f", value: 1.0 },
        sampleStep: { type: "f", value: slopeControls.sampleStep },
        strength: { type: "f", value: slopeControls.strength },
        xSpeed: { type: "f", value: slopeControls.xSpeed },
        ySpeed: { type: "f", value: slopeControls.ySpeed },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };

    uniformsDisplace = {
        tex0: { value: slopeTexture.texture },
        // tex1: { value: feedback.texture },
        tex1: { value: mix.texture },
        u_time: { type: "f", value: 1.0 },
        midPoint: { type: "f", value: displaceControls.midPoint },
        weight: { type: "f", value: displaceControls.weight },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };
    uniformsDisplaceMask = {
        tex0: { value: slopeTexture.texture },
        // tex1: { value: feedback.texture },
        tex1: { value: mix.texture },
        tex2: { value: maskTexture},
        u_time: { type: "f", value: 1.0 },
        mixAmt: { type: "f", value: 1. }        ,
        midPoint: { type: "f", value: displaceControls.midPoint },
        weight: { type: "f", value: displaceControls.weight },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };

    uniformsFeedback= {
        tex0: { value: noiseTexture.texture },
        // tex0: { value: maskTexture },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };
    uniformsFeedbackMask= {
        tex0: { value: noiseTexture.texture },
        tex1: { value: maskTexture },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };
    uniformsBlend= {
        tex0: { value: noiseTexture.texture },
        tex1: { value: feedback.texture },
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };

    uniformsBlend= {
        tex0: { value: noiseTexture.texture },
        tex1: { value: feedback.texture },
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };

    uniformsBlendMask= {
        tex0: { value: noiseTexture.texture },
        tex1: { value: feedback.texture },
        tex2: { value: maskTexture},
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };

    uniformsMix= {
        tex0: { value: noiseTexture.texture },
        tex1: { value: displace.texture },
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        mixAmt: { type: "f", value: 0. }
    };
    uniformsMixMask= {
        tex0: { value: textureCam },
        tex1: { value: displace.texture },
        tex2: { value: maskTexture },
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        mixAmt: { type: "f", value: 0. }
    };
    var materialSimplex = new THREE.ShaderMaterial( {
        uniforms: uniformsSimplex,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'simplexShader' ).textContent
    } );

    var materialSlope = new THREE.ShaderMaterial( {
        uniforms: uniformsSlope,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'slopeShader' ).textContent
    } );

    // var materialDisplace = new THREE.ShaderMaterial( {
    //     uniforms: uniformsDisplace,
    //     vertexShader: document.getElementById( 'vertexShader' ).textContent,
    //     fragmentShader: document.getElementById( 'displaceShader' ).textContent
    // } );
    var materialDisplace = new THREE.ShaderMaterial( {
        uniforms: uniformsDisplaceMask,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'displaceShaderMask' ).textContent
    } );

    var materialFeedback = new THREE.ShaderMaterial( {
        uniforms: uniformsFeedback,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'feedbackShader' ).textContent
    } );

    // var materialFeedback = new THREE.ShaderMaterial( {
    //     uniforms: uniformsFeedbackMask,
    //     vertexShader: document.getElementById( 'vertexShader' ).textContent,
    //     fragmentShader: document.getElementById( 'feedbackShaderMask' ).textContent
    // } );

    var materialBlend = new THREE.ShaderMaterial( {
        uniforms: uniformsBlend,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'blendShader' ).textContent
    } );
   
    // var materialBlend = new THREE.ShaderMaterial( {
    //     uniforms: uniformsBlendMask,
    //     vertexShader: document.getElementById( 'vertexShader' ).textContent,
    //     fragmentShader: document.getElementById( 'blendShaderMask' ).textContent
    // } );

    var materialMix = new THREE.ShaderMaterial( {
        uniforms: uniformsMix,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'mixShader' ).textContent
    } );

    // var materialMix = new THREE.ShaderMaterial( {
    //     uniforms: uniformsMixMask,
    //     vertexShader: document.getElementById( 'vertexShader' ).textContent,
    //     fragmentShader: document.getElementById( 'mixShaderMask' ).textContent
    // } );
  
    var materialSoftLight = new THREE.ShaderMaterial( {
        uniforms: uniformsBlend,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'softLightShader' ).textContent
    } );
    gui.add(text, 'speed', { "Soft Light": 0, Abs: 1, slope:2} ).onChange(()=>{
        if(text.speed == 0){
          meshBlend.material = materialSoftLight;
        }else if(text.speed == 1){
          meshBlend.material = materialBlend;
        } else {
          // mesh.material = materialSlope;

        }
    });

  
    console.log(textureCam);    
    console.log(sources.A);    

    gui.add(sources, 'A', { "Camera": 0, "noise": 1} ).onChange(()=>{
        console.log(sources.A);    
        if(sources.A == 0){
            // uniformsFeedback.tex0.value = textureCam;    
            // uniformsMix.tex0.value = textureCam;                 
            // uniformsMixMask.tex0.value = textureCam;                 
            uniformsFeedback.tex0.value = textureCam;    
            uniformsMix.tex0.value = textureCam;                 


        } else if(sources.A == 1){
            // uniformsFeedback.tex0.value = noiseTexture.texture;    
            // uniformsMix.tex0.value = noiseTexture.texture;                 
            // uniformsMixMask.tex0.value = noiseTexture.texture;    
            uniformsFeedback.tex0.value = noiseTexture.texture;    
            uniformsMix.tex0.value = textureCam;                 
            uniformsMix.tex0.value = noiseTexture.texture;    

        }
    });
    gui.add(sources, 'B', { "Camera": 0, "noise": 1} ).onChange(()=>{
        console.log(sources.B);    
        if(sources.B     == 0){
             uniformsBlend.tex0.value = textureCam;    
            // uniformsMix.tex1.value = textureCam;     
                        
            // uniformsMix.tex0.value = textureCam;                 

        } else if(sources.B == 1){
            uniformsBlend.tex0.value = noiseTexture.texture;    
            // uniformsFeedback.tex0.value = noiseTexture.texture;    

            // uniformsMix.tex1.value = noiseTexture.texture;                 
            // uniformsMix.tex0.value = noiseTexture.texture;    
        }
    });
    gui.add(modulator, 'Source', { feedback: 0, noise: 1} ).onChange(()=>{
        if(modulator.Source     == 0){
            uniformsDisplace.tex0.value = slopeTexture.texture;    
            uniformsDisplaceMask.tex0.value = slopeTexture.texture;    
        } else if(modulator.Source == 1){
            uniformsDisplace.tex0.value = noiseTexture.texture;    
            uniformsDisplaceMask.tex0.value = noiseTexture.texture;    

       }
    });

     mesh = new THREE.Mesh( geometry, materialDisplace );
    sceneOut.add( mesh );
    
    gui.add(outputSource, 'Source', { materialDisplace: 0, materialBlend: 1,materialMix:2,materialSimplex:3 ,materialSlope:4,materialFeedback:5} ).onChange(()=>{
        if(outputSource.Source     == 0){
            mesh.material = materialDisplace;
        } else if(outputSource.Source == 1){
            mesh.material = materialBlend;
        } else if(outputSource.Source == 2){
            mesh.material = materialMix;
        }else if(outputSource.Source == 3){
             mesh.material = materialSimplex;
        }else if(outputSource.Source == 4){
            mesh.material = materialSlope;
        }else if(outputSource.Source == 5){
            mesh.material = materialFeedback;
        }
    });

     mesh2 = new THREE.Mesh( geometry, materialDisplace );
    rtScene4.add( mesh2);

     meshBlend = new THREE.Mesh( geometry, materialBlend );
    blendScene.add( meshBlend);
    
    var meshMix = new THREE.Mesh( geometry, materialMix );
    mixScene.add( meshMix);
    
    meshB = new THREE.Mesh( geometry, materialSimplex );
    rtScene.add( meshB );
    meshC = new THREE.Mesh( geometry, materialSlope );
    rtScene2.add( meshC );
    var meshD = new THREE.Mesh( geometry, materialFeedback );

    rtScene3.add( meshD );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.autoClear = false;

    container.appendChild( renderer.domElement );

    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false );
   
    renderer.setRenderTarget( noiseTexture );
    renderer.clear();
    renderer.render( rtScene, camera );
   
    document.onmousemove = function(e){

    }
    document.onmousedown = function(e){
        // if(c <=2){
    //    mesh.material = materialBlend;
    }
  

}

function createStats() {
  var stats = new Stats();
  stats.setMode(0);

  stats.domElement.style.position = 'absolute';
//   stats.domElement.style.left = '100';
//   stats.domElement.style.top = '1000';

  return stats;
}
function onWindowResize( event ) {
    renderer.setSize( window.innerWidth, window.innerHeight );
    uniformsSimplex.u_resolution.value.x = renderer.domElement.width/2;
    uniformsSimplex.u_resolution.value.y = renderer.domElement.height/2;
    uniformsSlope.u_resolution.value.x = renderer.domElement.width/2;
    uniformsSlope.u_resolution.value.y = renderer.domElement.height/2;
    uniformsDisplace.u_resolution.value.x = renderer.domElement.width/2;
    uniformsDisplace.u_resolution.value.y = renderer.domElement.height/2;
    uniformsFeedback.u_resolution.value.x = renderer.domElement.width/2;
    uniformsFeedback.u_resolution.value.y = renderer.domElement.height/2;
    uniformsBlend.u_resolution.value.x = renderer.domElement.width/2;
    uniformsBlend.u_resolution.value.y = renderer.domElement.height/2;
    uniformsMix.u_resolution.value.x = renderer.domElement.width/2;
    uniformsMix.u_resolution.value.y = renderer.domElement.height/2;
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    uniformsSimplex.u_time.value += noiseControls.speed ;
    uniformsSimplex.scale.value = noiseControls.scale;
    uniformsSimplex.amp.value = noiseControls.amp;
    uniformsSimplex.offset.value = noiseControls.offset;
    uniformsSimplex.oct.value = noiseControls.oct;
    uniformsSimplex.damp.value = noiseControls.damp;

    uniformsDisplace.weight.value = displaceControls.weight;
    uniformsDisplaceMask.weight.value = displaceControls.weight;
    uniformsDisplaceMask.mixAmt.value = displaceControls.mixAmt;


    uniformsSlope.xSpeed.value = slopeControls.xSpeed ;
    uniformsSlope.ySpeed.value = slopeControls.ySpeed;
    // uniformsSlope.xSpeed.value = Math.sin(t) ;
    // t++;
    console.log( uniformsSlope.xSpeed.value )
    uniformsSlope.ySpeed.value = slopeControls.ySpeed;

    uniformsSlope.strength.value = slopeControls.strength;
    uniformsSlope.sampleStep.value = slopeControls.sampleStep;

    uniformsMix.mixAmt.value = mixControls.mixAmount * mixControls.mult;
    uniformsMixMask.mixAmt.value = mixControls.mixAmount * mixControls.mult;

    // uniformsDisplace.midPoint.value = displaceControls.midPoint;


    // renderer.setRenderTarget( noiseTexture );
    // renderer.clear();
    // renderer.render( rtScene, camera );
   
// uniforms.tDiffuse = noiseTexture;
// meshB.material = noiseTexture.texture;
// meshB.material.needsUpdate = true;
stats.begin();

if((!cam || !mod )&& uniformsSimplex.speed != 0){
renderer.setRenderTarget( noiseTexture );
renderer.clear();
renderer.render( rtScene, camera );
}
renderer.setRenderTarget( mix );
renderer.clear();
renderer.render( mixScene, camera );

renderer.setRenderTarget( blend );
renderer.clear();
renderer.render( blendScene, camera );

renderer.setRenderTarget( slopeTexture );
renderer.clear();
renderer.render( rtScene2, camera );
// renderer.clear();




renderer.setRenderTarget( feedback );
renderer.clear();
renderer.render( rtScene3, camera );

renderer.setRenderTarget( displace );
renderer.clear();
renderer.render( rtScene4, camera );

renderer.setRenderTarget( null );
renderer.clear();
renderer.render( sceneOut, camera );


uniformsFeedback.tex0.value = displace.texture

if (hasLoaded)loadAndUseBodyPix();

stats.end();
// loadAndUseBodyPix()
}

function getWebcam() {
    const constraints = {
        video: true,
        audio: false
    };
    return navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            videoEl.srcObject = stream;
           
            mediaRecorder = new MediaRecorder(stream);
            
            return new Promise((resolve, reject) => {
                videoEl.onloadedmetadata = (e) => {
                    console.log( "w + " +videoEl.clientWidth);
                    console.log( "h + " +videoEl.clientHeight);

                    // videoEl.style.width =`${videoEl.clientWidth}px`;
                    // videoEl.style.height = `${videoEl.clientHeight}px`;
                    // videoEl.width = videoEl.clientWidth;
                    // videoEl.height = videoEl.clientHeight;
                
                    videoEl.play();
                   
                    resolve(videoEl);
                };
            });
        }).then(async function() {
           
                net = await bodyPix.load({
                    architecture: 'MobileNetV1',
                    outputStride: 16,
                    multiplier: 0.75,
                    quantBytes: 1
                 
                });
                  hasLoaded = true;
        });
}

async function loadAndUseBodyPix() {

    net.multiplier = bodyPixControls.multiplier ;
    maskTexture.needsUpdate=true;
    // // BodyPix model loaded
    const segmentation = await net.segmentPerson(videoEl, {
  flipHorizontal: true,
  internalResolution: 'low',
  opacity:0.1,
  segmentationThreshold: bodyPixControls.multiplier 
});
    const maskBackground = 1.0;
    // // // Convert the personSegmentation into a mask to darken the background.
    const backgroundDarkeningMask = bodyPix.toMask(segmentation, maskBackground);
    // const canvas = document.getElementById('canvas');
    const opacity = 1.0

    // draw the mask onto the image on a canvas.  With opacity set to 0.7 this will darken the background.
    bodyPix.drawMask(bodyPixCanv, videoEl, backgroundDarkeningMask, opacity);
            // console.log('done')
        //    canvas.style.width = videoEl.style.width;
        //    canvas.style.height = videoEl.style.height;

 }