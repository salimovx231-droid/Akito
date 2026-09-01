/**
 * NovaMc.uz - Advanced 3D WebGL Engine (Three.js)
 * Global 3D Particle Trails, Interactive Subpage 3D Objects, Hero Minecraft Block Engine
 * Created for NovaMc by Zero_dev
 */

(function () {
    'use strict';

    // Procedural Pixel Art Texture Generator
    function createBlockTextures(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        let mainColor, borderColors, pixelAccents, gemColor;

        if (type === 'diamond') {
            mainColor = '#24b0b3';
            borderColors = ['#1d8c8e', '#16696b', '#3be3e7'];
            pixelAccents = ['#64f7fa', '#9dfbfe', '#2eb8bc', '#18797b'];
            gemColor = '#50e9ec';
        } else if (type === 'anarchy') {
            mainColor = '#6d28d9';
            borderColors = ['#4c1d95', '#3b0764', '#9333ea'];
            pixelAccents = ['#a855f7', '#c084fc', '#e879f9', '#581c87'];
            gemColor = '#c084fc';
        } else { // gold
            mainColor = '#d97706';
            borderColors = ['#b45309', '#78350f', '#f59e0b'];
            pixelAccents = ['#fbbf24', '#fde68a', '#f59e0b', '#92400e'];
            gemColor = '#fde047';
        }

        ctx.fillStyle = mainColor;
        ctx.fillRect(0, 0, 128, 128);

        const pSize = 8;
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                if (x === 0 || y === 0 || x === 15 || y === 15) {
                    const borderIndex = (x + y) % borderColors.length;
                    ctx.fillStyle = borderColors[borderIndex];
                } else if (x === 1 || y === 1 || x === 14 || y === 14) {
                    ctx.fillStyle = borderColors[0];
                } else {
                    const rand = Math.random();
                    if (rand > 0.75) {
                        ctx.fillStyle = pixelAccents[Math.floor(Math.random() * pixelAccents.length)];
                    } else if (rand < 0.25) {
                        ctx.fillStyle = borderColors[0];
                    } else {
                        ctx.fillStyle = mainColor;
                    }
                }
                ctx.fillRect(x * pSize, y * pSize, pSize, pSize);
            }
        }

        ctx.fillStyle = gemColor;
        const centerPixels = [
            [7, 4], [8, 4],
            [6, 5], [7, 5], [8, 5], [9, 5],
            [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6],
            [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7],
            [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8],
            [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9],
            [6, 10], [7, 10], [8, 10], [9, 10],
            [7, 11], [8, 11]
        ];
        centerPixels.forEach(([px, py]) => {
            ctx.fillRect(px * pSize, py * pSize, pSize, pSize);
        });

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(5 * pSize, 5 * pSize, 2 * pSize, 2 * pSize);

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    class Nova3DEngine {
        constructor() {
            this.heroContainer = document.getElementById('hero-3d-container');
            this.subpageContainer = document.getElementById('subpage-3d-container');
            this.bgContainer = document.getElementById('bg-3d-canvas');

            this.currentType = 'diamond';
            this.mousePos = { x: 0, y: 0 };
            this.mouseWorld = new THREE.Vector3();

            this.isDragging = false;
            this.previousMousePosition = { x: 0, y: 0 };

            this.cursorSparks = [];

            this.initBackgroundParticles();
            if (this.heroContainer) {
                this.initHeroBlock();
            }
            if (this.subpageContainer) {
                this.initSubpageObject();
            }

            this.bindEvents();
            this.animate();
        }

        initBackgroundParticles() {
            if (!this.bgContainer) return;

            this.bgScene = new THREE.Scene();
            this.bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.bgCamera.position.z = 100;

            this.bgRenderer = new THREE.WebGLRenderer({
                canvas: this.bgContainer,
                alpha: true,
                antialias: true
            });
            this.bgRenderer.setSize(window.innerWidth, window.innerHeight);
            this.bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Floating 3D Geometry Particles
            const count = 140;
            const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);

            this.particles = [];
            this.particleGroup = new THREE.Group();

            const colors = [0x9b51e0, 0x03dac6, 0xffb86c, 0xbb86fc, 0x00e676, 0x7000ff];

            for (let i = 0; i < count; i++) {
                const material = new THREE.MeshBasicMaterial({
                    color: colors[Math.floor(Math.random() * colors.length)],
                    transparent: true,
                    opacity: 0.25 + Math.random() * 0.5,
                    wireframe: Math.random() > 0.5
                });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(
                    (Math.random() - 0.5) * 220,
                    (Math.random() - 0.5) * 220,
                    (Math.random() - 0.5) * 160
                );

                const scale = 0.4 + Math.random() * 1.6;
                mesh.scale.set(scale, scale, scale);

                mesh.userData = {
                    rotSpeedX: (Math.random() - 0.5) * 0.025,
                    rotSpeedY: (Math.random() - 0.5) * 0.025,
                    floatSpeed: 0.04 + Math.random() * 0.1,
                    initialY: mesh.position.y
                };

                this.particleGroup.add(mesh);
                this.particles.push(mesh);
            }

            // Interactive Cursor Spark Particle System
            this.sparkGroup = new THREE.Group();
            this.bgScene.add(this.sparkGroup);

            this.bgScene.add(this.particleGroup);
        }

        spawnCursorSparks(x, y) {
            if (!this.sparkGroup || Math.random() > 0.4) return;

            const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const colors = [0x03dac6, 0x9b51e0, 0xffb86c, 0x00e676];
            const mat = new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                transparent: true,
                opacity: 0.9
            });

            const p = new THREE.Mesh(geo, mat);

            // Convert screen mouse to 3D background world space
            const vector = new THREE.Vector3(x, y, 0.5);
            vector.unproject(this.bgCamera);
            const dir = vector.sub(this.bgCamera.position).normalize();
            const distance = -this.bgCamera.position.z / dir.z;
            const pos = this.bgCamera.position.clone().add(dir.multiplyScalar(distance));

            p.position.copy(pos);
            p.position.x += (Math.random() - 0.5) * 2;
            p.position.y += (Math.random() - 0.5) * 2;

            p.userData = {
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4 + 0.2,
                vz: (Math.random() - 0.5) * 0.4,
                life: 1.0,
                decay: 0.03 + Math.random() * 0.03
            };

            this.sparkGroup.add(p);
            this.cursorSparks.push(p);
        }

        initHeroBlock() {
            this.heroScene = new THREE.Scene();

            const width = this.heroContainer.clientWidth || 400;
            const height = this.heroContainer.clientHeight || 400;

            this.heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
            this.heroCamera.position.set(0, 0, 7.5);

            this.heroRenderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });
            this.heroRenderer.setSize(width, height);
            this.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            this.heroContainer.appendChild(this.heroRenderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            this.heroScene.add(ambientLight);

            this.pointLight1 = new THREE.PointLight(0x03dac6, 2.5, 20);
            this.pointLight1.position.set(5, 5, 5);
            this.heroScene.add(this.pointLight1);

            this.pointLight2 = new THREE.PointLight(0x9b51e0, 2.5, 20);
            this.pointLight2.position.set(-5, -5, 3);
            this.heroScene.add(this.pointLight2);

            const boxGeo = new THREE.BoxGeometry(2.8, 2.8, 2.8);
            this.blockMaterials = this.createMaterials('diamond');

            this.cubeMesh = new THREE.Mesh(boxGeo, this.blockMaterials);
            this.cubeMesh.rotation.x = 0.3;
            this.cubeMesh.rotation.y = -0.5;

            const wireGeo = new THREE.BoxGeometry(2.95, 2.95, 2.95);
            const wireMat = new THREE.MeshBasicMaterial({
                color: 0x03dac6,
                wireframe: true,
                transparent: true,
                opacity: 0.25
            });
            this.auraMesh = new THREE.Mesh(wireGeo, wireMat);
            this.cubeMesh.add(this.auraMesh);

            const ringGeo = new THREE.TorusGeometry(2.2, 0.05, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x9b51e0,
                transparent: true,
                opacity: 0.6
            });
            this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
            this.ringMesh.rotation.x = Math.PI / 2;
            this.ringMesh.position.y = -2.0;
            this.heroScene.add(this.ringMesh);

            this.burstGroup = new THREE.Group();
            this.heroScene.add(this.burstGroup);

            this.heroScene.add(this.cubeMesh);
        }

        initSubpageObject() {
            this.subpageScene = new THREE.Scene();

            const width = this.subpageContainer.clientWidth || 300;
            const height = this.subpageContainer.clientHeight || 220;
            const type = this.subpageContainer.getAttribute('data-3d-type') || 'shield';

            this.subpageCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
            this.subpageCamera.position.set(0, 0, 6);

            this.subpageRenderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });
            this.subpageRenderer.setSize(width, height);
            this.subpageRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            this.subpageContainer.appendChild(this.subpageRenderer.domElement);

            const ambient = new THREE.AmbientLight(0xffffff, 0.8);
            this.subpageScene.add(ambient);

            const light = new THREE.PointLight(type === 'shield' ? 0x9b51e0 : 0x03dac6, 3, 20);
            light.position.set(3, 4, 5);
            this.subpageScene.add(light);

            this.subpageGroup = new THREE.Group();

            if (type === 'shield') {
                // 3D Shield Octahedron + Ring
                const geo = new THREE.OctahedronGeometry(1.6, 0);
                const mat = new THREE.MeshStandardMaterial({
                    color: 0x9b51e0,
                    wireframe: false,
                    roughness: 0.2,
                    metalness: 0.8
                });
                const mesh = new THREE.Mesh(geo, mat);

                const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
                    color: 0x03dac6,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.4
                }));
                wire.scale.set(1.08, 1.08, 1.08);

                const ringGeo = new THREE.TorusGeometry(2.1, 0.04, 16, 60);
                const ringMat = new THREE.MeshBasicMaterial({ color: 0x03dac6, transparent: true, opacity: 0.6 });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI / 3;

                this.subpageGroup.add(mesh);
                this.subpageGroup.add(wire);
                this.subpageGroup.add(ring);
            } else if (type === 'support') {
                // 3D Support Beacon Heart / Portal Orb
                const geo = new THREE.DodecahedronGeometry(1.5, 0);
                const mat = new THREE.MeshStandardMaterial({
                    color: 0x00e676,
                    roughness: 0.2,
                    metalness: 0.7,
                    emissive: 0x004d26
                });
                const heartMesh = new THREE.Mesh(geo, mat);

                const ring1 = new THREE.Mesh(
                    new THREE.TorusGeometry(2.2, 0.04, 16, 80),
                    new THREE.MeshBasicMaterial({ color: 0x03dac6, transparent: true, opacity: 0.7 })
                );
                ring1.rotation.x = Math.PI / 4;

                const ring2 = new THREE.Mesh(
                    new THREE.TorusGeometry(2.5, 0.03, 16, 80),
                    new THREE.MeshBasicMaterial({ color: 0x9b51e0, transparent: true, opacity: 0.5 })
                );
                ring2.rotation.y = Math.PI / 3;

                this.subpageGroup.add(heartMesh);
                this.subpageGroup.add(ring1);
                this.subpageGroup.add(ring2);
            } else {
                // 3D Guide Ender Crystal Gem + Orbiters
                const geo = new THREE.IcosahedronGeometry(1.4, 0);
                const mat = new THREE.MeshStandardMaterial({
                    color: 0x03dac6,
                    roughness: 0.1,
                    metalness: 0.9
                });
                const gem = new THREE.Mesh(geo, mat);

                const outerWire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.65, 0), new THREE.MeshBasicMaterial({
                    color: 0xffb86c,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.5
                }));

                // 4 Orbiting satellite mini-cubes
                this.satellites = [];
                for (let i = 0; i < 4; i++) {
                    const satGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                    const satMat = new THREE.MeshBasicMaterial({ color: 0xbb86fc });
                    const sat = new THREE.Mesh(satGeo, satMat);
                    sat.userData = { angle: (i * Math.PI) / 2, radius: 2.2 };
                    this.subpageGroup.add(sat);
                    this.satellites.push(sat);
                }

                this.subpageGroup.add(gem);
                this.subpageGroup.add(outerWire);
            }

            this.subpageScene.add(this.subpageGroup);
        }

        createMaterials(type) {
            const texture = createBlockTextures(type);
            const mats = [];
            for (let i = 0; i < 6; i++) {
                mats.push(new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.3,
                    metalness: 0.2,
                    bumpMap: texture,
                    bumpScale: 0.03
                }));
            }
            return mats;
        }

        setBlockType(type) {
            if (!this.cubeMesh || this.currentType === type) return;
            this.currentType = type;

            const newMats = this.createMaterials(type);
            this.cubeMesh.material = newMats;

            if (type === 'diamond') {
                this.pointLight1.color.setHex(0x03dac6);
                this.auraMesh.material.color.setHex(0x03dac6);
            } else if (type === 'anarchy') {
                this.pointLight1.color.setHex(0x9b51e0);
                this.auraMesh.material.color.setHex(0xc084fc);
            } else if (type === 'gold') {
                this.pointLight1.color.setHex(0xffb86c);
                this.auraMesh.material.color.setHex(0xfde047);
            }

            this.triggerBurst();
        }

        triggerBurst() {
            if (!this.heroScene) return;

            const particleCount = 45;
            const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
            const matColor = this.currentType === 'diamond' ? 0x03dac6 : (this.currentType === 'anarchy' ? 0xc084fc : 0xffb86c);

            for (let i = 0; i < particleCount; i++) {
                const mat = new THREE.MeshBasicMaterial({
                    color: matColor,
                    transparent: true,
                    opacity: 1.0
                });
                const p = new THREE.Mesh(geo, mat);

                p.position.set(0, 0, 0);

                const dir = new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ).normalize();

                const speed = 0.1 + Math.random() * 0.25;
                p.userData = {
                    velocity: dir.multiplyScalar(speed),
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.03
                };

                this.burstGroup.add(p);
            }
        }

        bindEvents() {
            window.addEventListener('resize', () => this.onWindowResize());

            window.addEventListener('mousemove', (e) => {
                const normX = (e.clientX / window.innerWidth) * 2 - 1;
                const normY = -(e.clientY / window.innerHeight) * 2 + 1;
                this.mousePos.x = normX;
                this.mousePos.y = normY;

                this.spawnCursorSparks(normX, normY);
            });

            if (this.heroContainer) {
                const dom = this.heroRenderer.domElement;

                dom.addEventListener('mousedown', (e) => {
                    this.isDragging = true;
                    this.previousMousePosition = { x: e.clientX, y: e.clientY };
                });

                window.addEventListener('mouseup', () => {
                    this.isDragging = false;
                });

                dom.addEventListener('mousemove', (e) => {
                    if (!this.isDragging) return;

                    const deltaX = e.clientX - this.previousMousePosition.x;
                    const deltaY = e.clientY - this.previousMousePosition.y;

                    this.cubeMesh.rotation.y += deltaX * 0.01;
                    this.cubeMesh.rotation.x += deltaY * 0.01;

                    this.previousMousePosition = { x: e.clientX, y: e.clientY };
                });

                dom.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 1) {
                        this.isDragging = true;
                        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    }
                }, { passive: true });

                dom.addEventListener('touchmove', (e) => {
                    if (this.isDragging && e.touches.length === 1) {
                        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
                        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

                        this.cubeMesh.rotation.y += deltaX * 0.01;
                        this.cubeMesh.rotation.x += deltaY * 0.01;

                        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    }
                }, { passive: true });

                dom.addEventListener('touchend', () => {
                    this.isDragging = false;
                });

                dom.addEventListener('click', () => {
                    this.triggerBurst();
                });
            }
        }

        onWindowResize() {
            if (this.bgRenderer) {
                this.bgCamera.aspect = window.innerWidth / window.innerHeight;
                this.bgCamera.updateProjectionMatrix();
                this.bgRenderer.setSize(window.innerWidth, window.innerHeight);
            }

            if (this.heroRenderer && this.heroContainer) {
                const w = this.heroContainer.clientWidth;
                const h = this.heroContainer.clientHeight;
                this.heroCamera.aspect = w / h;
                this.heroCamera.updateProjectionMatrix();
                this.heroRenderer.setSize(w, h);
            }

            if (this.subpageRenderer && this.subpageContainer) {
                const w = this.subpageContainer.clientWidth;
                const h = this.subpageContainer.clientHeight;
                this.subpageCamera.aspect = w / h;
                this.subpageCamera.updateProjectionMatrix();
                this.subpageRenderer.setSize(w, h);
            }
        }

        animate() {
            requestAnimationFrame(() => this.animate());

            const time = Date.now() * 0.001;

            // Animate background particle field & cursor sparks
            if (this.particleGroup) {
                this.particleGroup.rotation.y = time * 0.03 + window.scrollY * 0.0005;
                this.particleGroup.rotation.x = Math.sin(time * 0.02) * 0.1;

                this.particles.forEach((p) => {
                    p.rotation.x += p.userData.rotSpeedX;
                    p.rotation.y += p.userData.rotSpeedY;
                    p.position.y = p.userData.initialY + Math.sin(time * 2 + p.position.x) * 3;
                });

                // Animate Cursor Sparks
                for (let i = this.cursorSparks.length - 1; i >= 0; i--) {
                    const spark = this.cursorSparks[i];
                    spark.position.x += spark.userData.vx;
                    spark.position.y += spark.userData.vy;
                    spark.position.z += spark.userData.vz;
                    spark.userData.life -= spark.userData.decay;
                    spark.material.opacity = spark.userData.life;
                    spark.scale.multiplyScalar(0.95);

                    if (spark.userData.life <= 0) {
                        this.sparkGroup.remove(spark);
                        spark.geometry.dispose();
                        spark.material.dispose();
                        this.cursorSparks.splice(i, 1);
                    }
                }

                this.bgRenderer.render(this.bgScene, this.bgCamera);
            }

            // Animate Hero 3D Block
            if (this.cubeMesh) {
                if (!this.isDragging) {
                    this.cubeMesh.rotation.y += 0.008;
                    this.cubeMesh.rotation.x = 0.2 + Math.sin(time * 1.5) * 0.1;
                }

                this.cubeMesh.position.y = Math.sin(time * 2) * 0.2;

                if (this.auraMesh) {
                    this.auraMesh.rotation.y -= 0.015;
                }
                if (this.ringMesh) {
                    this.ringMesh.rotation.z = time * 0.5;
                }

                if (this.pointLight1) {
                    this.pointLight1.position.x = 5 + this.mousePos.x * 3;
                    this.pointLight1.position.y = 5 + this.mousePos.y * 3;
                }

                if (this.burstGroup) {
                    for (let i = this.burstGroup.children.length - 1; i >= 0; i--) {
                        const p = this.burstGroup.children[i];
                        p.position.add(p.userData.velocity);
                        p.userData.life -= p.userData.decay;
                        p.material.opacity = p.userData.life;
                        p.scale.multiplyScalar(0.96);

                        if (p.userData.life <= 0) {
                            this.burstGroup.remove(p);
                            p.geometry.dispose();
                            p.material.dispose();
                        }
                    }
                }

                this.heroRenderer.render(this.heroScene, this.heroCamera);
            }

            // Animate Subpage 3D Object
            if (this.subpageGroup) {
                this.subpageGroup.rotation.y = time * 0.6 + this.mousePos.x * 0.5;
                this.subpageGroup.rotation.x = Math.sin(time * 0.8) * 0.15 + this.mousePos.y * 0.3;

                if (this.satellites) {
                    this.satellites.forEach((sat) => {
                        const ang = sat.userData.angle + time * 1.5;
                        sat.position.x = Math.cos(ang) * sat.userData.radius;
                        sat.position.z = Math.sin(ang) * sat.userData.radius;
                        sat.position.y = Math.sin(time * 3 + sat.userData.angle) * 0.4;
                        sat.rotation.x += 0.03;
                        sat.rotation.y += 0.03;
                    });
                }

                this.subpageRenderer.render(this.subpageScene, this.subpageCamera);
            }
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        window.nova3D = new Nova3DEngine();
    });
})();
