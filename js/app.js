var container;
var camera, scene, rtScene, renderer, rtScene2;
var uniforms;
 let noiseTexture;
 let feedback;
 let displace;
 let slopeTexture;
 let blend;

//  var materialSlope
var meshB
 let mouseX = 0;
 let mouseY = 2;
 const videoEl = document.getElementById('video');

init();
animate();
function init() {
 
   

textureCam = new THREE.VideoTexture(videoEl);

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


    noiseTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    slopeTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    feedback = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    displace = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    blend = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);

    // var geometry = new THREE.PlaneBufferGeometry( 2,2,window.innerWidth/100, window.innerHeight/100);
    var geometry = new THREE.PlaneBufferGeometry( 2,2);

    uniformsSimplex = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() },
        scale: { type: "f", value: 10 },
        damp: { type: "i", value: 1 },
        amp: { type: "f", value: 1.0 },
        offst: { type: "f", value: 0. },
        oct: { type: "i", value: 10 },
    };
    uniformsSlope = {
        tex0: { value: blend.texture },
        u_time: { type: "f", value: 1.0 },
        sampleStep: { type: "f", value: 0.01 },
        strength: { type: "f", value: 1.0 },
        xSpeed: { type: "f", value: 0.00 },
        ySpeed: { type: "f", value: 0.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };

    uniformsDisplace = {
        tex0: { value: slopeTexture.texture },
        tex1: { value: feedback.texture },
        u_time: { type: "f", value: 1.0 },
        midPoint: { type: "f", value: 0.5 },
        weight: { type: "f", value: 0.009 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };
    uniformsFeedback= {
        tex0: { value: noiseTexture.texture },
        u_time: { type: "f", value: 1.0 },
        midPoint: { type: "f", value: 0.5 },
        weight: { type: "f", value: 0.9 },
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

    var materialDisplace = new THREE.ShaderMaterial( {
        uniforms: uniformsDisplace,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'displaceShader' ).textContent
    } );

    var materialFeedback = new THREE.ShaderMaterial( {
        uniforms: uniformsFeedback,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'feedbackShader' ).textContent
    } );

    var materialBlend = new THREE.ShaderMaterial( {
        uniforms: uniformsBlend,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'blendShader' ).textContent
    } );


    var mesh = new THREE.Mesh( geometry, materialDisplace );
    sceneOut.add( mesh );
    var mesh2 = new THREE.Mesh( geometry, materialDisplace );
    rtScene4.add( mesh2);

    var meshBlend = new THREE.Mesh( geometry, materialBlend );
    blendScene.add( meshBlend);

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
        // uniformsFeedback.tex0.value = textureCam;// noiseTexture.texture
        uniformsBlend.tex0.value = textureCam;// noiseTexture.texture

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
    uniformsSimplex.u_resolution.value.x = renderer.domElement.width;
    uniformsSimplex.u_resolution.value.y = renderer.domElement.height;
    uniformsSlope.u_resolution.value.x = renderer.domElement.width;
    uniformsSlope.u_resolution.value.y = renderer.domElement.height;
    uniformsDisplace.u_resolution.value.x = renderer.domElement.width;
    uniformsDisplace.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    uniformsSimplex.u_time.value += 0.01;

// uniforms.tDiffuse = noiseTexture;
// meshB.material = noiseTexture.texture;
// meshB.material.needsUpdate = true;
stats.begin();

renderer.setRenderTarget( noiseTexture );
renderer.clear();
renderer.render( rtScene, camera );

renderer.setRenderTarget( blend );
renderer.clear();
renderer.render( blendScene, camera );

renderer.setRenderTarget( slopeTexture );
renderer.clear();
renderer.render( rtScene2, camera );
// renderer.clear();

renderer.setRenderTarget( feedback );
renderer.render(rtScene3, camera);



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

stats.end();

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
                    videoEl.style.width =`${videoEl.clientWidth}px`;
                    videoEl.style.height = `${videoEl.clientHeight}px`;
                    videoEl.width = videoEl.clientWidth;
                    videoEl.height = videoEl.clientHeight;
                
                    videoEl.play();

                    resolve(videoEl);
                };
            });
        });
}