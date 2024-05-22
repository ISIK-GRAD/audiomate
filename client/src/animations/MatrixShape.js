import * as THREE from "three";
import SimplexNoise from "simplex-noise";

const noise = new SimplexNoise();

const prepare = (scene, settings, gui) => {
    const group = new THREE.Group();
    
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
    
    scene.add(group);

    return group;
};

const animate = (group, dataArray) => {

    const lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
    const upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length);

    const lowerMax = Math.max(...lowerHalfArray);
    const upperAvg = upperHalfArray.reduce((sum, value) => sum + value, 0) / upperHalfArray.length;

    makeRoughGround(group.children[0], modulate(upperAvg, 0, 255, 0.5, 4));
    makeRoughGround(group.children[1], modulate(lowerMax, 0, 255, 0.5, 4));

    makeRoughBall(group.children[2], modulate(lowerMax, 0, 255, 0, 8), modulate(upperAvg, 0, 255, 0, 4));

    group.rotation.y += 0.005;
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
        const distance = (offset + bassFr) + noise.noise3D(vertex.x + time * rf * 7, vertex.y + time * rf * 8, vertex.z + time * rf * 9) * amp * treFr;
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
        const distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
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

export { prepare, animate };
