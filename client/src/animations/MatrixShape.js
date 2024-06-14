import * as THREE from "three";
import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();

const MatrixShape = {
    prepare: function ({scene, camera, settings, gui, setSettingsCallback}) {
        const group = new THREE.Group();
        camera.position.set(0, 0, 100);
        camera.lookAt(scene.position);
        scene.add(camera);

        const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
        const planeMaterial = new THREE.MeshBasicMaterial({
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
        const bigBallMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ee,
            wireframe: true
        });

        const smallBallGeometry = new THREE.IcosahedronGeometry(4, 3);
        const smallBallMaterial = new THREE.MeshBasicMaterial({
            color: 0x34ebd2,
            wireframe: true
        });

        const bigBall = new THREE.Mesh(bigBallGeometry, bigBallMaterial);
        bigBall.position.set(0, 0, 0);
        group.add(bigBall);

        const smallBall = new THREE.Mesh(smallBallGeometry, smallBallMaterial);
        smallBall.position.set(0, 0, 0);
        group.add(smallBall);

        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.intensity = 0.9;
        spotLight.position.set(-10, 40, 20);
        spotLight.lookAt(bigBall);
        spotLight.castShadow = true;
        scene.add(spotLight);

        scene.add(group);

        if(gui){  
            const matrixFolder = gui.addFolder('MatrixShape Settings');
            matrixFolder.addColor(settings, 'planeColor').onChange(value => setSettingsCallback('planeColor', value));
            matrixFolder.addColor(settings, 'bigBallColor').onChange(value => setSettingsCallback('bigBallColor', value));
            matrixFolder.addColor(settings, 'smallBallColor').onChange(value => setSettingsCallback('smallBallColor', value));
            matrixFolder.add(settings, 'lightIntensity', 0, 2).onChange(value => setSettingsCallback('lightIntensity', value));
            matrixFolder.add(settings, 'wireframeThickness', 0, 3).onChange(value => setSettingsCallback('wireframeThickness', value));
            matrixFolder.open();
        }


        

        return { group, spotLight };
    },

    animate: function ({ group, spotLight }, dataArray, composer, settings) {
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

        const avg = (arr) => arr.reduce((sum, b) => sum + b) / arr.length;
        const max = (arr) => arr.reduce((a, b) => Math.max(a, b));
        const min = (arr) => arr.reduce((a, b) => Math.min(a, b));

        const lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
        const upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

        const lowerMax = max(lowerHalfArray);
        const lowerMin = min(lowerHalfArray);
        const lowerAvg = avg(lowerHalfArray);
        const upperAvg = avg(upperHalfArray);
        const upperMax = avg(upperHalfArray);
        const upperMin = min(upperHalfArray);

        const lowerMaxFr = lowerMax / lowerHalfArray.length;
        const lowerMinFr = lowerMin / lowerHalfArray.length;
        const lowerAvgFr = lowerAvg / lowerHalfArray.length;
        const upperAvgFr = upperAvg / upperHalfArray.length;
        const upperMaxFr = upperMax / upperHalfArray.length;
        const upperMinFr = upperMin / upperHalfArray.length;

        makeRoughGround(group.children[0], modulate(lowerAvgFr, 0, 1, 0.25, 0.5));
        makeRoughGround(group.children[1], modulate(lowerMaxFr, 0, 1, 0.2, 1));

        makeRoughBall(group.children[2], modulate(Math.pow(upperAvg, 0.4), 0, 1, 0, 8), modulate(upperMaxFr, 0, 1, 0, 4));
        makeRoughBall(group.children[3], modulate(Math.pow(lowerAvg, 0.4), 0, 1, 0, 4), modulate(upperAvgFr, 0, 1, 0, 8));

        group.rotation.y += 0.005;

        group.children.forEach((child, index) => {
            if (index < 4) {
                child.material.color.set(settings[index < 2 ? 'planeColor' : index === 2 ? 'bigBallColor' : 'smallBallColor']);
                child.material.wireframeLinewidth = settings.wireframeThickness;
            }
        });

        spotLight.intensity = settings.lightIntensity;

        composer.render();
    },

    reset: function (scene, group) {
        scene.remove(group);
        group.children.forEach(child => {
            child.geometry.dispose();
            child.material.dispose();
        });
    }
};

export default MatrixShape;
