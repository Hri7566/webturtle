import { Client } from "./Client.js";

const client = new Client("ws://home.hri7566.info:3000");
client.start();

client.on("clear", (msg) => {
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

/**
 * Voxel renderer
 * https://threejs.org/manual/#en/voxel-geometry
 */

class VoxelWorld {
    static faces = [
        {
            dir: [-1, 0, 0],
            corners: [
                [0, 1, 0],
                [0, 0, 0],
                [0, 1, 1],
                [0, 0, 1],
            ],
        },
        {
            dir: [1, 0, 0],
            corners: [
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 0],
                [1, 0, 0],
            ],
        },
        {
            dir: [0, -1, 0],
            corners: [
                [1, 0, 1],
                [0, 0, 1],
                [1, 0, 0],
                [0, 0, 0],
            ],
        },
        {
            dir: [0, 1, 0],
            corners: [
                [0, 1, 1],
                [1, 1, 1],
                [0, 1, 0],
                [1, 1, 0],
            ],
        },
        {
            dir: [0, 0, -1],
            corners: [
                [1, 0, 0],
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
            ],
        },
        {
            dir: [0, 0, 1],
            corners: [
                [0, 0, 1],
                [1, 0, 1],
                [0, 1, 1],
                [1, 1, 1],
            ],
        },
    ];

    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cellSliceSize = cellSize ** 2;
        this.cell = new Uint8Array(cellSize ** 3);
    }

    generateGeometryDataForCell(cellX, cellY, cellZ) {
        const cellSize = this.cellSize;

        const positions = [];
        const normals = [];
        const indices = [];

        const startX = cellX * this.cellSize;
        const startY = cellY * this.cellSize;
        const startZ = cellZ * this.cellSize;

        for (let y = 0; y < cellSize; y++) {
            const voxelY = startY + y;

            for (let z = 0; z < cellSize; z++) {
                const voxelZ = startZ + z;

                for (let x = 0; x < cellSize; x++) {
                    const voxelX = startX + x;

                    const voxel = this.getVoxel(voxelX, voxelY, voxelZ);

                    if (voxel) {
                        for (const face of VoxelWorld.faces) {
                            const neighbor = this.getVoxel(
                                voxelX + face.dir[0],
                                voxelY + face.dir[1],
                                voxelZ + face.dir[2]
                            );

                            if (!neighbor) {
                                const i = positions.length / 3;

                                for (const pos of face.corners) {
                                    positions.push(
                                        pos[0] + x,
                                        pos[1] + y,
                                        pos[2] + z
                                    );

                                    normals.push(...face.dir);
                                }
                            }
                        }
                    }
                }
            }
        }

        return {
            positions,
            normals,
            indices,
        };
    }

    getCellForVoxel(x, y, z) {
        const cellSize = this.cellSize;

        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const cellZ = Math.floor(z / cellSize);

        if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
            return null;
        }

        return this.cell;
    }

    getVoxel(x, y, z) {
        const cell = this.getCellForVoxel(x, y, z);
        if (!cell) return 0;

        const cellSize = this.cellSize;
        const voxelOffset = this.getVoxelOffset(x, y, z);

        return cell[voxelOffset];
    }

    setVoxel(x, y, z, v) {
        let cell = this.getCellForVoxel(x, y, z);
        if (!cell) return;

        const cellSize = this.cellSize;
        const voxelOffset = this.getVoxelOffset(x, y, z);

        cell[voxelOffset] = v;
    }

    getVoxelOffset(x, y, z) {
        const cellSize = this.cellSize;
        const cellSliceSize = this.cellSliceSize;

        const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
        const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
        const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;

        const voxelOffset = voxelY * cellSliceSize + voxelZ * cellSize + voxelX;
        return voxelOffset;
    }
}

/**
 * THREE.js
 */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// render setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// generate world
const cellSize = 32;
const world = new VoxelWorld(cellSize);

for (let y = 0; y < cellSize; y++) {
    for (let z = 0; z < cellSize; z++) {
        for (let x = 0; x < cellSize; x++) {
            const height =
                (Math.sin((x / cellSize) * Math.PI * 2) +
                    Math.sin((z / cellSize) * Math.PI * 3)) *
                    (cellSize / 6) +
                cellSize / 2;

            if (y < height) world.setVoxel(x, y, z, 1);
        }
    }
}

const data = world.generateGeometryDataForCell(0, 0, 0);

const geometry = new THREE.BufferGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const positionNumComponents = 3;
const normalNumComponents = 3;
geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        new Float32Array(data.positions),
        positionNumComponents
    )
);
geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(
        new Float32Array(data.normals),
        normalNumComponents
    )
);

geometry.setIndex(data.indices);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(light);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

camera.position.set(2.5, 2.5, 2.5);
controls.update();

function animate() {
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    controls.update();

    renderer.render(scene, camera);
}
