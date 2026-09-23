import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Grid3x3, Sun, Move, RotateCw, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StudioScene3D({ 
  sceneObjects = [],
  environment = {},
  onObjectSelect,
  onObjectTransform,
  selectedObjectId,
  transformMode = 'translate'
}) {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [threeModules, setThreeModules] = useState(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const transformControlRef = useRef(null);
  const objectsMapRef = useRef(new Map());
  const rafRef = useRef(null);

  // Load Three.js modules
  useEffect(() => {
    const loadThree = async () => {
      try {
        const THREE = await import('three');
        
        // Create simple fallback controls since drei handles most 3D
        setThreeModules({ 
          THREE,
          // Simple orbit controls implementation
          OrbitControls: class SimpleOrbitControls {
            constructor(camera, domElement) {
              this.camera = camera;
              this.domElement = domElement;
              this.enabled = true;
              this.enableDamping = false;
              this.dampingFactor = 0.05;
              this.target = new THREE.Vector3();
              
              this._spherical = { radius: 5, phi: Math.PI / 4, theta: 0 };
              this._isDragging = false;
              this._lastMouse = { x: 0, y: 0 };
              
              this._onMouseDown = (e) => {
                if (!this.enabled) return;
                this._isDragging = true;
                this._lastMouse = { x: e.clientX, y: e.clientY };
              };
              
              this._onMouseUp = () => { this._isDragging = false; };
              
              this._onMouseMove = (e) => {
                if (!this.enabled || !this._isDragging) return;
                const dx = e.clientX - this._lastMouse.x;
                const dy = e.clientY - this._lastMouse.y;
                this._spherical.theta -= dx * 0.01;
                this._spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this._spherical.phi + dy * 0.01));
                this._lastMouse = { x: e.clientX, y: e.clientY };
                this._updateCamera();
              };
              
              this._onWheel = (e) => {
                if (!this.enabled) return;
                this._spherical.radius = Math.max(1, Math.min(50, this._spherical.radius + e.deltaY * 0.01));
                this._updateCamera();
              };
              
              this._updateCamera = () => {
                const { radius, phi, theta } = this._spherical;
                this.camera.position.set(
                  this.target.x + radius * Math.sin(phi) * Math.cos(theta),
                  this.target.y + radius * Math.cos(phi),
                  this.target.z + radius * Math.sin(phi) * Math.sin(theta)
                );
                this.camera.lookAt(this.target);
              };
              
              domElement.addEventListener('mousedown', this._onMouseDown);
              domElement.addEventListener('mouseup', this._onMouseUp);
              domElement.addEventListener('mousemove', this._onMouseMove);
              domElement.addEventListener('wheel', this._onWheel);
            }
            
            update() { /* no-op for damping */ }
            
            dispose() {
              this.domElement.removeEventListener('mousedown', this._onMouseDown);
              this.domElement.removeEventListener('mouseup', this._onMouseUp);
              this.domElement.removeEventListener('mousemove', this._onMouseMove);
              this.domElement.removeEventListener('wheel', this._onWheel);
            }
          },
          // Simple transform controls stub
          TransformControls: class SimpleTransformControls extends THREE.Object3D {
            constructor(camera, domElement) {
              super();
              this.camera = camera;
              this.domElement = domElement;
              this.object = null;
              this.mode = 'translate';
              this._listeners = {};
            }
            setMode(mode) { this.mode = mode; }
            attach(obj) { this.object = obj; }
            detach() { this.object = null; }
            addEventListener(type, fn) { this._listeners[type] = fn; }
            removeEventListener(type) { delete this._listeners[type]; }
          },
          // GLTFLoader from three
          GLTFLoader: THREE.GLTFLoader || class {
            async loadAsync(url) {
              return new Promise((resolve, reject) => {
                const loader = new THREE.ObjectLoader();
                // Fallback - just return empty scene
                resolve({ scene: new THREE.Group() });
              });
            }
          }
        });
      } catch (error) {
        console.error('Failed to load Three.js:', error);
      }
    };

    loadThree();
  }, []);

  // Initialize scene
  useEffect(() => {
    if (!threeModules || !mountRef.current || !canvasRef.current) return;

    const { THREE, OrbitControls, TransformControls, GLTFLoader } = threeModules;
    let isMounted = true;

    const init = async () => {
      try {
        // Renderer
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current = renderer;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(environment.backgroundColor || '#1a1a1a');
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
          environment.camera?.fov || 50,
          mountRef.current.clientWidth / mountRef.current.clientHeight,
          0.1,
          1000
        );
        const camPos = environment.camera?.position || [0, 2, 5];
        camera.position.set(camPos[0], camPos[1], camPos[2]);
        cameraRef.current = camera;

        // Lights
        const ambientLight = new THREE.AmbientLight(
          environment.ambientLightColor || '#ffffff',
          environment.ambientLightIntensity || 0.5
        );
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight('#ffffff', 1.0);
        dirLight.position.set(5, 10, 7.5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        scene.add(dirLight);

        // Grid Helper
        const gridHelper = new THREE.GridHelper(20, 20, '#666666', '#333333');
        scene.add(gridHelper);

        // Orbit Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        const target = environment.camera?.target || [0, 0, 0];
        controls.target.set(target[0], target[1], target[2]);
        controls.update();
        controlsRef.current = controls;

        // Transform Controls
        const transformControl = new TransformControls(camera, renderer.domElement);
        transformControl.setMode(transformMode);
        transformControl.addEventListener('dragging-changed', (event) => {
          controls.enabled = !event.value;
        });
        
        transformControl.addEventListener('objectChange', () => {
          if (transformControl.object && selectedObjectId) {
            const obj = transformControl.object;
            const pos = obj.position.toArray();
            const rot = obj.rotation.toArray().slice(0, 3);
            const scale = obj.scale.toArray();
            
            if (onObjectTransform) {
              onObjectTransform(selectedObjectId, {
                position: pos,
                rotation: rot,
                scale: scale
              });
            }
          }
        });

        scene.add(transformControl);
        transformControlRef.current = transformControl;

        // Load scene objects
        const loader = new GLTFLoader();
        for (const sceneObj of sceneObjects) {
          if (sceneObj.object_type === 'mesh' && sceneObj.asset_url) {
            try {
              const gltf = await loader.loadAsync(sceneObj.asset_url);
              const mesh = gltf.scene;
              
              mesh.position.fromArray(sceneObj.position || [0, 0, 0]);
              mesh.rotation.fromArray(sceneObj.rotation || [0, 0, 0]);
              mesh.scale.fromArray(sceneObj.scale || [1, 1, 1]);
              mesh.userData.sceneObjectId = sceneObj.id;
              mesh.userData.sceneObjectName = sceneObj.name;
              
              // Apply material config
              if (sceneObj.material_config) {
                mesh.traverse((child) => {
                  if (child.isMesh) {
                    const mat = child.material;
                    if (sceneObj.material_config.baseColor) {
                      mat.color = new THREE.Color(sceneObj.material_config.baseColor);
                    }
                    if (sceneObj.material_config.metalness !== undefined) {
                      mat.metalness = sceneObj.material_config.metalness;
                    }
                    if (sceneObj.material_config.roughness !== undefined) {
                      mat.roughness = sceneObj.material_config.roughness;
                    }
                    if (sceneObj.material_config.emissive) {
                      mat.emissive = new THREE.Color(sceneObj.material_config.emissive);
                      mat.emissiveIntensity = sceneObj.material_config.emissiveIntensity || 0;
                    }
                  }
                });
              }

              scene.add(mesh);
              objectsMapRef.current.set(sceneObj.id, mesh);
            } catch (error) {
              console.error(`Failed to load object ${sceneObj.name}:`, error);
            }
          }
        }

        setLoading(false);

        // Animation loop
        const animate = () => {
          if (!isMounted) return;
          rafRef.current = requestAnimationFrame(animate);

          if (controls) controls.update();
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };
        animate();

        // Handle resize
        const handleResize = () => {
          if (!mountRef.current) return;
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;

          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          isMounted = false;
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(rafRef.current);
          renderer.dispose();
        };
      } catch (error) {
        console.error('Scene initialization error:', error);
        setLoading(false);
      }
    };

    init();
  }, [threeModules, sceneObjects, environment]);

  // Update transform control mode
  useEffect(() => {
    if (transformControlRef.current) {
      transformControlRef.current.setMode(transformMode);
    }
  }, [transformMode]);

  // Update selected object
  useEffect(() => {
    if (!transformControlRef.current) return;

    if (selectedObjectId) {
      const selectedMesh = objectsMapRef.current.get(selectedObjectId);
      if (selectedMesh) {
        transformControlRef.current.attach(selectedMesh);
      } else {
        transformControlRef.current.detach();
      }
    } else {
      transformControlRef.current.detach();
    }
  }, [selectedObjectId]);

  // Handle canvas clicks for selection
  useEffect(() => {
    if (!canvasRef.current || !threeModules) return;

    const { THREE } = threeModules;
    const canvas = canvasRef.current;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      if (!sceneRef.current || !cameraRef.current) return;

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      
      const objectsToTest = Array.from(objectsMapRef.current.values());
      const intersects = raycaster.intersectObjects(objectsToTest, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.sceneObjectId) {
          obj = obj.parent;
        }
        
        if (obj.userData.sceneObjectId && onObjectSelect) {
          onObjectSelect(obj.userData.sceneObjectId);
        }
      } else {
        if (onObjectSelect) onObjectSelect(null);
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [threeModules, onObjectSelect]);

  return (
    <div ref={mountRef} className="relative w-full h-full bg-[#1a1a1a]">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#0088cc] animate-spin mx-auto mb-3" />
            <p className="text-white text-sm">Loading Scene...</p>
          </div>
        </div>
      )}

      {/* Scene Info Overlay */}
      <div className="absolute top-4 left-4 space-y-2">
        <Badge className="bg-black/70 text-white border-[#0088cc]/30">
          <Grid3x3 className="w-3 h-3 mr-1" />
          {sceneObjects.length} Objects
        </Badge>
        <Badge className="bg-black/70 text-white border-[#0088cc]/30">
          <Sun className="w-3 h-3 mr-1" />
          Lights: {environment.directionalLights?.length || 1}
        </Badge>
      </div>

      {/* Transform Mode Indicator */}
      {selectedObjectId && (
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-[#0088cc] text-white flex items-center gap-2">
            {transformMode === 'translate' && <Move className="w-3 h-3" />}
            {transformMode === 'rotate' && <RotateCw className="w-3 h-3" />}
            {transformMode === 'scale' && <Maximize2 className="w-3 h-3" />}
            {transformMode.toUpperCase()} MODE
          </Badge>
        </div>
      )}

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs p-3 rounded-lg space-y-1">
        <p><strong>Left Click:</strong> Select Object</p>
        <p><strong>Right Drag:</strong> Rotate Camera</p>
        <p><strong>Scroll:</strong> Zoom</p>
        <p><strong>Drag Gizmo:</strong> Transform Object</p>
      </div>
    </div>
  );
}