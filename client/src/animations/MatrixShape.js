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

    const bigBallGeometry = new THREE.IcosahedronGeometry(10, 4);
    const bigBallMaterial = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });

    const smallBallGeometry = new THREE.IcosahedronGeometry(4, 3);
    const smallBallMaterial = new THREE.MeshLambertMaterial({
        color: 0x34ebd2,
        wireframe: true
    });

    const bigBall = new THREE.Mesh(bigBallGeometry, bigBallMaterial);
    bigBall.position.set(0, 0, 0);
    group.add(bigBall);

    
    const smallBall = new THREE.Mesh(smallBallGeometry, smallBallMaterial);
    smallBall.position.set(0, 0, 0);
    group.add(smallBall);


    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(bigBall);
    spotLight.castShadow = true;
    scene.add(spotLight);

    scene.add(group);

};

const animate = (dataArray, composer) => {

    var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
    var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

    var lowerMax = max(lowerHalfArray);
    var lowerMin = min(lowerHalfArray);
    var lowerAvg = avg(lowerHalfArray);
    var upperAvg = avg(upperHalfArray);
    var upperMax = avg(upperHalfArray);
    var upperMin = min(upperHalfArray);


    var lowerMaxFr = lowerMax / lowerHalfArray.length;
    var lowerMinFr = lowerMin / lowerHalfArray.length;
    var lowerAvgFr = lowerAvg / lowerHalfArray.length;
    var upperAvgFr = upperAvg / upperHalfArray.length;
    var upperMaxFr = upperMax / upperHalfArray.length;
    var upperMinFr = upperMin / upperHalfArray.length;


    makeRoughGround(group.children[0], modulate(lowerAvgFr, 0, 1, 0.25, 3));
    makeRoughGround(group.children[1], modulate(lowerMaxFr, 0, 1, 0.2, 6));
    
    makeRoughBall(group.children[2], modulate(Math.pow(upperAvg, 0.4), 0, 1, 0, 8), modulate(upperMaxFr, 0, 1, 0, 4));
    makeRoughBall(group.children[3], modulate(Math.pow(lowerAvg, 0.4), 0, 1, 0, 4), modulate(upperAvgFr, 0, 1, 0, 8));


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

function min(arr){
    return arr.reduce(function(a, b){ return Math.min(a, b); })
}

export { prepare, animate };
