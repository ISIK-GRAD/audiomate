import * as THREE from "three";
import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();
let group;

const prepare = (scene, camera) => {

    group = new THREE.Group();
    camera.position.set(0,0,100);
    camera.lookAt(scene.position);
    scene.add(camera);
    
    const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x6904ce,
        side: THREE.DoubleSide,
        wireframe: true
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(0, 30, 0);
    group.add(plane);
    
    const plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
    plane2.rotation.x = -0.5 * Math.PI;
    plane2.position.set(0, -30, 0);
    group.add(plane2);

    const icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
    const lambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });

    const ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    ball.position.set(0, 0, 0);
    group.add(ball);


    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(ball);
    spotLight.castShadow = true;
    scene.add(spotLight);

    scene.add(group);

};

const animate = (dataArray, composer) => {

    var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
    var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

    var lowerMax = max(lowerHalfArray);
    var lowerAvg = avg(lowerHalfArray);
    var upperAvg = avg(upperHalfArray);

    var lowerMaxFr = lowerMax / lowerHalfArray.length;
    var upperAvgFr = upperAvg / upperHalfArray.length;

    console.log("group", group);

    makeRoughGround(group.children[0], modulate(upperAvgFr, 0, 1, 0.5, 4));
    makeRoughGround(group.children[1], modulate(lowerMaxFr, 0, 1, 0.5, 4));
    
    makeRoughBall(group.children[2], modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

    group.rotation.y += 0.005;
    composer.render();
};

const makeRoughBall = (mesh, bassFr, treFr) => {
    const positions = mesh.geometry.attributes.position.array;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positions.length; i += 3) {
        vertex.fromArray(positions, i);
        const offset = mesh.geometry.parameters.radius;
        const amp = 7;
        const time = window.performance.now();
        vertex.normalize();
        const rf = 0.00001;
        const distance = (offset + bassFr) + simplex.noise3D(vertex.x + time * rf * 7, vertex.y + time * rf * 8, vertex.z + time * rf * 9) * amp * treFr;
        vertex.multiplyScalar(distance);
        vertex.toArray(positions, i);
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
};

const makeRoughGround = (mesh, distortionFr) => {
    const positions = mesh.geometry.attributes.position.array;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positions.length; i += 3) {
        vertex.fromArray(positions, i);
        const amp = 2;
        const time = Date.now();
        const distance = (simplex.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
        vertex.z = distance;
        vertex.toArray(positions, i);
    }
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
};

const modulate = (val, minVal, maxVal, outMin, outMax) => {
    const fraction = (val - minVal) / (maxVal - minVal);
    const delta = outMax - outMin;
    return outMin + (fraction * delta);
};

function avg(arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}

export { prepare, animate };
