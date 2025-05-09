import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import {
  FaTachometerAlt,
  FaPlus,
  FaThList,
  FaCouch,
  FaSignOutAlt,
} from "react-icons/fa";
import "../components/RoomDesign.css";

export default function CreateRoomDesign() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [furniture, setFurniture] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [selectedFurnitureItem, setSelectedFurnitureItem] = useState(null); // For 3D editor
  const [is3DMode, setIs3DMode] = useState(false); // Toggle between 2D and 3D view

  const [savedDesign, setSavedDesign] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [furnitureFilter, setFurnitureFilter] = useState("all");
  const [showFurnitureGallery, setShowFurnitureGallery] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    shape: "rectangular",
    width: "",
    roomLength: "", // This is properly defined
    height: "",
    secondWidth: "",
    secondLength: "",
    isPublic: false,
    colorScheme: {
      name: "Default",
      walls: "#FFFFFF",
      floor: "#8B4513",
      ceiling: "#F8F8F8",
      trim: "#FFFFFF",
    },
  });

  // Three.js references
  const mountRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const dragControlsRef = useRef(null);
  const furnitureMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const init3DScene = useCallback(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Clean up previous scene if it exists
    if (rendererRef.current) {
      if (mountRef.current.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current.dispose();
    }

    try {
      // Create renderer with error handling
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });

      // Verify WebGL is supported
      if (!renderer.getContext()) {
        throw new Error("WebGL not supported");
      }

      // Rest of your initialization code...
    } catch (error) {
      console.error("3D initialization failed:", error);
      // Fallback or error message to user
    }

    if (controlsRef.current) {
      controlsRef.current.dispose();
    }

    if (dragControlsRef.current) {
      dragControlsRef.current.dispose();
    }

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
    };
  }, []);

  // Create 3D room
  const create3DRoom = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous room objects (keep lights and furniture)
    scene.children.forEach((child) => {
      if (!child.isLight && !child.userData.isFurniture) {
        scene.remove(child);
      }
    });

    // Parse dimensions with validation
    const width = Math.max(parseFloat(formData.width) || 5, 1);
    const roomLength = Math.max(parseFloat(formData.roomLength) || 5, 1);
    const height = Math.max(parseFloat(formData.height) || 3, 1);
    const secondWidth = Math.max(parseFloat(formData.secondWidth) || 3, 1);
    const secondLength = Math.max(parseFloat(formData.secondLength) || 3, 1);

    // Floor - use the validated dimensions
    const floorGeometry =
      formData.shape === "rectangular"
        ? new THREE.PlaneGeometry(width, roomLength)
        : new THREE.Shape();

    // For L-shaped room, create a custom floor shape
    if (formData.shape === "L-shaped") {
      floorGeometry.moveTo(-width / 2, -roomLength / 2);
      floorGeometry.lineTo(width / 2, -roomLength / 2);
      floorGeometry.lineTo(width / 2, secondLength / 2 - roomLength / 2);
      floorGeometry.lineTo(
        -width / 2 + secondWidth,
        secondLength / 2 - roomLength / 2
      );
      floorGeometry.lineTo(-width / 2 + secondWidth, roomLength / 2);
      floorGeometry.lineTo(-width / 2, roomLength / 2);
      floorGeometry.lineTo(-width / 2, -roomLength / 2);
    }

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(formData.colorScheme.floor),
      side: THREE.DoubleSide,
      roughness: 0.8,
    });

    let floor;
    if (formData.shape === "rectangular") {
      floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
    } else {
      // For L-shaped, use ShapeGeometry
      const shapeGeometry = new THREE.ShapeGeometry(floorGeometry);
      floor = new THREE.Mesh(shapeGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
    }

    floor.receiveShadow = true;
    floor.userData = { isFloor: true };
    scene.add(floor);

    // Walls with improved material
    const wallColor = new THREE.Color(formData.colorScheme.walls);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const wallThickness = 0.1;

    if (formData.shape === "rectangular") {
      // Create walls for rectangular room
      const walls = [
        // Left wall
        {
          size: [wallThickness, height, roomLength],
          pos: [-width / 2, height / 2, 0],
        },
        // Right wall
        {
          size: [wallThickness, height, roomLength],
          pos: [width / 2, height / 2, 0],
        },
        // Back wall
        {
          size: [width, height, wallThickness],
          pos: [0, height / 2, -roomLength / 2],
        },
        // Front wall
        {
          size: [width, height, wallThickness],
          pos: [0, height / 2, roomLength / 2],
        },
      ];

      walls.forEach((wall) => {
        const wallMesh = new THREE.Mesh(
          new THREE.BoxGeometry(...wall.size),
          wallMaterial
        );
        wallMesh.position.set(...wall.pos);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        sceneRef.current.add(wallMesh);
      });
    } else if (formData.shape === "L-shaped") {
      // Create walls for L-shaped room - fixed positioning
      const walls = [
        // Main section left wall
        {
          size: [wallThickness, height, roomLength],
          pos: [-width / 2, height / 2, 0],
        },
        // Main section right wall (partial)
        {
          size: [wallThickness, height, roomLength - secondLength],
          pos: [width / 2, height / 2, -secondLength / 2],
        },
        // Back wall (full width including extension)
        {
          size: [width, height, wallThickness],
          pos: [0, height / 2, -roomLength / 2],
        },
        // Extension right wall
        {
          size: [wallThickness, height, secondLength],
          pos: [
            (secondWidth - width) / 2,
            height / 2,
            (roomLength - secondLength) / 2,
          ],
        },
        // Extension front wall
        {
          size: [secondWidth, height, wallThickness],
          pos: [-width / 2 + secondWidth / 2, height / 2, roomLength / 2],
        },
      ];

      walls.forEach((wall) => {
        const wallMesh = new THREE.Mesh(
          new THREE.BoxGeometry(...wall.size),
          wallMaterial
        );
        wallMesh.position.set(...wall.pos);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        sceneRef.current.add(wallMesh);
      });
    }

    // Add a grid helper for better orientation
    const gridHelper = new THREE.GridHelper(
      Math.max(width, roomLength) * 1.2,
      Math.ceil(Math.max(width, roomLength)),
      0x555555,
      0x333333
    );
    gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting
    scene.add(gridHelper);

    // Add ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(width, roomLength);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(formData.colorScheme.ceiling),
      side: THREE.DoubleSide,
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    ceiling.receiveShadow = true;
    scene.add(ceiling);
  }, [formData]);

  const addFurnitureToScene = useCallback(
    (furnitureData) => {
      const furnitureItem = furniture.find(
        (item) => item._id === furnitureData.itemId
      );
      if (!furnitureItem) return;

      const scene = sceneRef.current;
      if (!scene) return;

      // Remove any existing furniture with the same ID
      const existingFurniture = furnitureMeshesRef.current.find(
        (mesh) => mesh.userData.furnitureData.itemId === furnitureData.itemId
      );

      if (existingFurniture) {
        scene.remove(existingFurniture);
        furnitureMeshesRef.current = furnitureMeshesRef.current.filter(
          (mesh) => mesh.userData.furnitureData.itemId !== furnitureData.itemId
        );
      }

      // Create more visually distinct furniture based on type
      const furnitureType = furnitureItem.productType.toLowerCase();
      let geometry, material, mesh;

      // Standard material with some variation based on furniture type
      const createMaterial = () => {
        const colors = {
          sofa: 0x6b8e23, // Olive green for sofas
          chair: 0x8b4513, // Saddle brown for chairs
          table: 0x5c4033, // Brown for tables
          bed: 0x4682b4, // Steel blue for beds
          shelf: 0x8b5a00, // Orange brown for shelves
          cabinet: 0x855e42, // Medium brown for cabinets
        };

        const baseColor = colors[furnitureType] || 0x8b4513;

        return new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.7,
          metalness: 0.1,
        });
      };

      // Create type-specific geometry
      switch (furnitureType) {
        case "chair":
          // Chair - made of seat and backrest
          const chairGroup = new THREE.Group();

          // Seat
          const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
          const seatMesh = new THREE.Mesh(seatGeometry, createMaterial());
          seatMesh.position.y = 0.25;
          chairGroup.add(seatMesh);

          // Backrest
          const backGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.1);
          const backMesh = new THREE.Mesh(backGeometry, createMaterial());
          backMesh.position.set(0, 0.5, -0.2);
          chairGroup.add(backMesh);

          // Legs
          const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
          const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
          });

          const positions = [
            [0.2, 0.15, 0.2],
            [-0.2, 0.15, 0.2],
            [0.2, 0.15, -0.2],
            [-0.2, 0.15, -0.2],
          ];

          positions.forEach((pos) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            chairGroup.add(leg);
          });

          mesh = chairGroup;
          break;

        case "table":
          const tableGroup = new THREE.Group();

          // Table top
          const topGeometry = new THREE.BoxGeometry(1, 0.05, 1);
          const topMesh = new THREE.Mesh(topGeometry, createMaterial());
          topMesh.position.y = 0.35;
          tableGroup.add(topMesh);

          // Table legs
          const tableLegs = [
            [0.4, 0.2, 0.4],
            [-0.4, 0.2, 0.4],
            [0.4, 0.2, -0.4],
            [-0.4, 0.2, -0.4],
          ];

          tableLegs.forEach((pos) => {
            const leg = new THREE.Mesh(
              new THREE.CylinderGeometry(0.05, 0.05, 0.7),
              new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
            );
            leg.position.set(...pos);
            tableGroup.add(leg);
          });

          mesh = tableGroup;
          break;

        case "sofa":
          const sofaGroup = new THREE.Group();

          // Base/seat
          const sofaBaseGeometry = new THREE.BoxGeometry(1.8, 0.3, 0.7);
          const sofaBaseMesh = new THREE.Mesh(
            sofaBaseGeometry,
            createMaterial()
          );
          sofaBaseMesh.position.y = 0.15;
          sofaGroup.add(sofaBaseMesh);

          // Backrest
          const sofaBackGeometry = new THREE.BoxGeometry(1.8, 0.5, 0.2);
          const sofaBackMesh = new THREE.Mesh(
            sofaBackGeometry,
            createMaterial()
          );
          sofaBackMesh.position.set(0, 0.4, -0.25);
          sofaGroup.add(sofaBackMesh);

          // Armrests
          const armGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.7);
          const leftArm = new THREE.Mesh(armGeometry, createMaterial());
          leftArm.position.set(0.8, 0.2, 0);
          sofaGroup.add(leftArm);

          const rightArm = new THREE.Mesh(armGeometry, createMaterial());
          rightArm.position.set(-0.8, 0.2, 0);
          sofaGroup.add(rightArm);

          mesh = sofaGroup;
          break;

        case "bed":
          const bedGroup = new THREE.Group();

          // Mattress
          const mattressGeometry = new THREE.BoxGeometry(1.8, 0.2, 1.2);
          const mattressMaterial = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
          });
          const mattressMesh = new THREE.Mesh(
            mattressGeometry,
            mattressMaterial
          );
          mattressMesh.position.y = 0.2;
          bedGroup.add(mattressMesh);

          // Frame
          const frameGeometry = new THREE.BoxGeometry(2, 0.2, 1.4);
          const frameMesh = new THREE.Mesh(frameGeometry, createMaterial());
          frameMesh.position.y = 0.1;
          bedGroup.add(frameMesh);

          // Headboard
          const headboardGeometry = new THREE.BoxGeometry(2, 0.6, 0.1);
          const headboardMesh = new THREE.Mesh(
            headboardGeometry,
            createMaterial()
          );
          headboardMesh.position.set(0, 0.4, -0.7);
          bedGroup.add(headboardMesh);

          mesh = bedGroup;
          break;

        default:
          // Default furniture as a simple box with size based on type
          const dimensions = {
            shelf: [1.2, 1.8, 0.4],
            cabinet: [1, 1.2, 0.5],
            default: [0.8, 0.8, 0.8],
          }[furnitureType] || [0.8, 0.8, 0.8];

          geometry = new THREE.BoxGeometry(...dimensions);
          material = createMaterial();
          mesh = new THREE.Mesh(geometry, material);
      }

      // Set position and rotation based on the furniture data
      mesh.position.set(
        furnitureData.position.x,
        furnitureData.position.y || 0.5, // Default height if not specified
        furnitureData.position.z
      );

      // Apply rotation around Y axis (in radians)
      mesh.rotation.y = ((furnitureData.rotation || 0) * Math.PI) / 180;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Store reference data
      mesh.userData = {
        furnitureData,
        furnitureItem,
        isFurniture: true,
      };

      scene.add(mesh);
      furnitureMeshesRef.current.push(mesh);

      // Reinitialize drag controls when adding new furniture
      setupDragControls();
    },
    [furniture]
  );

  // Setup drag controls for furniture
  const setupDragControls = () => {
    if (dragControlsRef.current) {
      dragControlsRef.current.deactivate();
      dragControlsRef.current.dispose();
    }

    if (furnitureMeshesRef.current.length > 0) {
      dragControlsRef.current = new DragControls(
        furnitureMeshesRef.current,
        cameraRef.current,
        rendererRef.current.domElement
      );

      dragControlsRef.current.addEventListener("drag", (event) => {
        const draggedObject = event.object;
        const index = selectedFurniture.findIndex(
          (item) => item.itemId === draggedObject.userData.furnitureData.itemId
        );

        if (index !== -1) {
          const updatedFurniture = [...selectedFurniture];
          updatedFurniture[index].position = {
            x: draggedObject.position.x,
            y: draggedObject.position.y,
            z: draggedObject.position.z,
          };
          setSelectedFurniture(updatedFurniture);
        }
      });

      dragControlsRef.current.addEventListener("dragend", () => {
        // Optional: Add any post-drag logic here
      });
    }
  };

  const handleCanvasClick = useCallback(
    (event) => {
      if (!selectedFurnitureItem || !sceneRef.current || !cameraRef.current)
        return;

      // Get mouse position
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Get intersections with floor or other objects
      const intersects = raycasterRef.current.intersectObjects(
        sceneRef.current.children
      );

      if (intersects.length > 0) {
        const intersect = intersects[0];

        // Only place furniture on the floor or other furniture
        if (
          intersect.object.userData.isFloor ||
          intersect.object.userData.isFurniture
        ) {
          // Create a new furniture item
          const newFurniture = {
            itemId: selectedFurnitureItem._id,
            position: {
              x: Math.round(intersect.point.x * 10) / 10, // Round to 1 decimal place
              y: Math.round(intersect.point.y * 10) / 10,
              z: Math.round(intersect.point.z * 10) / 10,
            },
            rotation: 0, // Default rotation
          };

          // Make sure Y position is appropriate based on what was clicked
          if (intersect.object.userData.isFloor) {
            // If placing on floor, adjust Y based on furniture type
            const furnitureType =
              selectedFurnitureItem.productType.toLowerCase();
            const heightOffsets = {
              chair: 0.4,
              table: 0.35,
              sofa: 0.4,
              bed: 0.3,
              default: 0.4,
            };
            newFurniture.position.y = heightOffsets[furnitureType] || 0.4;
          } else {
            // If placing on another furniture, place slightly above it
            newFurniture.position.y = intersect.point.y + 0.05;
          }

          // Update state with the new furniture item
          setSelectedFurniture((prev) => [...prev, newFurniture]);

          // Add to 3D scene
          addFurnitureToScene(newFurniture);

          // Reset selection after placement
          setSelectedFurnitureItem(null);

          // Update 2D preview after adding furniture
          generatePreview();
        }
      }
    },
    [selectedFurnitureItem, addFurnitureToScene]
  );

  // Initialize 3D scene when switching to 3D mode
  useEffect(() => {
    if (is3DMode) {
      init3DScene();
      create3DRoom();

      // Add existing furniture to scene
      selectedFurniture.forEach((item) => {
        addFurnitureToScene(item);
      });
    }
  }, [is3DMode, init3DScene, create3DRoom, selectedFurniture]);

  // Update 3D room when form data changes
  useEffect(() => {
    return () => {
      if (dragControlsRef.current) {
        dragControlsRef.current.deactivate();
        dragControlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [
    is3DMode,
    init3DScene,
    create3DRoom,
    selectedFurniture,
    formData.width,
    formData.roomLength,
    formData.height,
  ]);

  // Generate preview based on current form data
  const generatePreview = useCallback(() => {
    // Only generate preview if we have the required dimensions
    if (formData.width && formData.roomLength && formData.height) {
      // For L-shaped rooms, require additional dimensions
      if (
        formData.shape === "L-shaped" &&
        (!formData.secondWidth || !formData.secondLength)
      ) {
        return;
      }

      // Create a simple preview canvas representation
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scale = 20;

      // Calculate canvas size
      let canvasWidth, canvasHeight;
      if (formData.shape === "L-shaped") {
        canvasWidth =
          Math.max(
            parseFloat(formData.width),
            parseFloat(formData.secondWidth)
          ) *
            scale +
          40;
        canvasHeight =
          Math.max(
            parseFloat(formData.roomLength),
            parseFloat(formData.secondLength)
          ) *
            scale +
          40;
      } else {
        canvasWidth = parseFloat(formData.width) * scale + 40;
        canvasHeight = parseFloat(formData.roomLength) * scale + 40;
      }

      canvasWidth = Math.max(canvasWidth, 300);
      canvasHeight = Math.max(canvasHeight, 300);

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Draw room background
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate center points for room drawing
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      // Draw room outline with correct centering
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 2;

      if (formData.shape === "rectangular") {
        // Simple rectangular room
        const roomWidth = parseFloat(formData.width) * scale;
        const roomLength = parseFloat(formData.roomLength) * scale;

        // Calculate position to center the room
        const roomX = centerX - roomWidth / 2;
        const roomY = centerY - roomLength / 2;

        // Draw walls
        ctx.fillStyle = formData.colorScheme.walls;
        ctx.fillRect(roomX, roomY, roomWidth, roomLength);

        // Add floor fill
        ctx.fillStyle = formData.colorScheme.floor;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(roomX, roomY, roomWidth, roomLength);
        ctx.globalAlpha = 1.0;

        // Draw outline
        ctx.strokeRect(roomX, roomY, roomWidth, roomLength);
      } else if (formData.shape === "L-shaped") {
        // L-shaped room drawing logic (existing code)
        const mainWidth = parseFloat(formData.width) * scale;
        const mainLength = parseFloat(formData.roomLength) * scale;
        const secWidth = parseFloat(formData.secondWidth) * scale;
        const secLength = parseFloat(formData.secondLength) * scale;

        // Draw L shape
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(10 + mainWidth, 10);
        ctx.lineTo(10 + mainWidth, 10 + secLength);
        ctx.lineTo(10 + secWidth, 10 + secLength);
        ctx.lineTo(10 + secWidth, 10 + mainLength);
        ctx.lineTo(10, 10 + mainLength);
        ctx.closePath();

        // Fill with wall color
        ctx.fillStyle = formData.colorScheme.walls;
        ctx.fill();

        // Add floor color
        ctx.fillStyle = formData.colorScheme.floor;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Draw outline again
        ctx.stroke();
      }

      if (selectedFurniture && selectedFurniture.length > 0) {
        selectedFurniture.forEach((item) => {
          // Find the furniture details
          const furnitureItem = furniture.find((f) => f._id === item.itemId);
          if (!furnitureItem) return;

          // Choose color based on furniture type
          const furnitureColors = {
            chair: "#8B4513", // Brown
            table: "#5C4033", // Dark brown
            sofa: "#6B8E23", // Olive green
            bed: "#4682B4", // Steel blue
            default: "#8B4513", // Default brown
          };

          const furnitureColor =
            furnitureColors[furnitureItem.productType?.toLowerCase()] ||
            furnitureColors.default;
          ctx.fillStyle = furnitureColor;

          // Calculate furniture dimensions based on type
          const furnitureDimensions = {
            chair: { width: 0.5, length: 0.5 },
            table: { width: 1.0, length: 1.0 },
            sofa: { width: 1.8, length: 0.7 },
            bed: { width: 1.8, length: 1.2 },
            default: { width: 0.8, length: 0.8 },
          }[furnitureItem.productType?.toLowerCase()] || {
            width: 0.8,
            length: 0.8,
          };

          // Convert 3D coordinates to 2D canvas position
          const furnitureX = centerX + item.position.x * scale;
          const furnitureY = centerY + item.position.z * scale; // z in 3D = y in 2D top-down view
          const furnitureWidth = furnitureDimensions.width * scale;
          const furnitureLength = furnitureDimensions.length * scale;

          // Draw a rotated rectangle if rotation is specified
          if (item.rotation) {
            ctx.save();
            ctx.translate(furnitureX, furnitureY);
            ctx.rotate((item.rotation * Math.PI) / 180);
            ctx.fillRect(
              -furnitureWidth / 2,
              -furnitureLength / 2,
              furnitureWidth,
              furnitureLength
            );

            // Add a small indicator for front direction
            ctx.fillStyle = "#000000";
            ctx.fillRect(
              -furnitureWidth / 4,
              -furnitureLength / 2,
              furnitureWidth / 2,
              3
            );
            ctx.restore();
          } else {
            ctx.fillRect(
              furnitureX - furnitureWidth / 2,
              furnitureY - furnitureLength / 2,
              furnitureWidth,
              furnitureLength
            );

            // Add a small indicator for front direction
            ctx.fillStyle = "#000000";
            ctx.fillRect(
              furnitureX - furnitureWidth / 4,
              furnitureY - furnitureLength / 2,
              furnitureWidth / 2,
              3
            );
          }

          // Add label
          ctx.fillStyle = "#000";
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            furnitureItem.title.substring(0, 10) +
              (furnitureItem.title.length > 10 ? "..." : ""),
            furnitureX,
            furnitureY
          );
        });
      } else if (formData.shape === "L-shaped") {
        // L-shaped room
        const mainWidth = parseFloat(formData.width) * scale;
        const mainLength = parseFloat(formData.roomLength) * scale;
        const secWidth = parseFloat(formData.secondWidth) * scale;
        const secLength = parseFloat(formData.secondLength) * scale;

        // Draw L shape
        ctx.beginPath();
        ctx.moveTo(10, 10); // Start at top-left
        ctx.lineTo(10 + mainWidth, 10); // Top edge
        ctx.lineTo(10 + mainWidth, 10 + secLength); // Right edge of main section
        ctx.lineTo(10 + secWidth, 10 + secLength); // Bottom edge connecting to extension
        ctx.lineTo(10 + secWidth, 10 + mainLength); // Right edge of extension
        ctx.lineTo(10, 10 + mainLength); // Bottom edge
        ctx.closePath();

        // Fill with wall color
        ctx.fillStyle = formData.colorScheme.walls;
        ctx.fill();

        // Add floor color
        ctx.fillStyle = formData.colorScheme.floor;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Draw outline again
        ctx.stroke();
      }

      // Draw furniture if present
      if (selectedFurniture && selectedFurniture.length > 0) {
        selectedFurniture.forEach((item) => {
          const furnitureItem = furniture.find((f) => f._id === item.itemId);
          if (!furnitureItem) return;

          // Choose color based on furniture type (same as rectangular room)
          const furnitureColors = {
            chair: "#8B4513",
            table: "#5C4033",
            sofa: "#6B8E23",
            bed: "#4682B4",
            default: "#8B4513",
          };

          const furnitureColor =
            furnitureColors[furnitureItem.productType?.toLowerCase()] ||
            furnitureColors.default;
          ctx.fillStyle = furnitureColor;

          const furnitureDimensions = {
            chair: { width: 0.5, length: 0.5 },
            table: { width: 1.0, length: 1.0 },
            sofa: { width: 1.8, length: 0.7 },
            bed: { width: 1.8, length: 1.2 },
            default: { width: 0.8, length: 0.8 },
          }[furnitureItem.productType?.toLowerCase()] || {
            width: 0.8,
            length: 0.8,
          };

          // Convert 3D coordinates to 2D canvas position
          const furnitureX = centerX + item.position.x * scale;
          const furnitureY = centerY + item.position.z * scale;
          const furnitureWidth = furnitureDimensions.width * scale;
          const furnitureLength = furnitureDimensions.length * scale;

          ctx.fillStyle = "#8B4513"; // Brown color for furniture
          // Simple rectangle for each furniture item
          const x = 10 + item.position.x * scale;
          const y = 10 + item.position.y * scale;
          const itemWidth = 20; // Standard width for preview
          const itemLength = 20; // Standard length for preview

          // Draw a rotated rectangle if rotation is specified
          if (item.rotation) {
            ctx.save();
            ctx.translate(furnitureX, furnitureY);
            ctx.rotate((item.rotation * Math.PI) / 180);
            ctx.fillRect(
              -furnitureWidth / 2,
              -furnitureLength / 2,
              furnitureWidth,
              furnitureLength
            );
            ctx.restore();
          } else {
            ctx.fillRect(x, y, itemWidth, itemLength);
          }
        });
      }

      // Return as data URL
      setPreviewUrl(canvas.toDataURL("image/png"));
    }
  }, [formData, selectedFurniture, furniture]);

  useEffect(() => {
    return () => {
      // Clean up Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current?.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      if (controlsRef.current) controlsRef.current.dispose();
      if (dragControlsRef.current) dragControlsRef.current.dispose();

      // Clear references
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      dragControlsRef.current = null;
    };
  }, []);

  const toggleViewMode = () => {
    setTimeout(() => {
      setIs3DMode(!is3DMode);
    }, 100);

    // Clean up existing scene before switching
    if (is3DMode && rendererRef.current) {
      if (mountRef.current?.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    setIs3DMode(!is3DMode);
  };

  // Fetch furniture items on page load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFurniture = async () => {
      try {
        const response = await Axios.get(
          "http://localhost:3001/api/admin/furniture",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFurniture(response.data.data || []);
      } catch (err) {
        console.error("Error fetching furniture:", err);
        setError("Failed to load furniture items.");
      }
    };

    fetchFurniture();
  }, [navigate]);

  // Generate preview when form data changes
  useEffect(() => {
    generatePreview();
  }, [formData, selectedFurniture, generatePreview]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("colorScheme.")) {
      const colorKey = name.split(".")[1];
      setFormData({
        ...formData,
        colorScheme: {
          ...formData.colorScheme,
          [colorKey]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle furniture filter change
  const handleFurnitureFilterChange = (e) => {
    setFurnitureFilter(e.target.value);
  };

  // Filter furniture items based on type
  const getFilteredFurniture = () => {
    if (furnitureFilter === "all") {
      return furniture;
    }
    return furniture.filter((item) => item.productType === furnitureFilter);
  };

  // Get unique product types
  const getProductTypes = () => {
    const types = new Set(furniture.map((item) => item.productType));
    return ["all", ...Array.from(types)];
  };

  const handleDeleteDesign = async (designId) => {
    if (!designId) {
      setError("No design selected for deletion");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      await Axios.delete(
        `http://localhost:3001/api/admin/room-designs/${designId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/room-designs");
      }, 2000);
    } catch (err) {
      console.error("Error deleting room design:", err);
      setError(err.response?.data?.message || "Failed to delete room design");
    } finally {
      setLoading(false);
    }
  };

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
      console.error("3D View Error:", error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="h-[500px] flex items-center justify-center bg-red-50 text-red-600">
            Error loading 3D view. Please try switching views again.
          </div>
        );
      }

      return this.props.children;
    }
  }

  // Handle furniture selection
  const handleFurnitureSelect = (item) => {
    const newFurnitureItem = {
      itemId: item._id,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
    };
    setSelectedFurniture([...selectedFurniture, newFurnitureItem]);
  };

  // Update furniture position
  const handleFurniturePositionChange = (index, axis, value) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture[index].position[axis] = Number(value);
    setSelectedFurniture(updatedFurniture);
  };

  // Update furniture rotation
  const handleFurnitureRotationChange = (index, value) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture[index].rotation = Number(value);
    setSelectedFurniture(updatedFurniture);
  };

  // Remove furniture from selection
  const removeFurniture = (index) => {
    const updatedFurniture = [...selectedFurniture];
    updatedFurniture.splice(index, 1);
    setSelectedFurniture(updatedFurniture);
  };

  const [operation, setOperation] = useState(null); // 'create', 'update', 'delete'

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOperation("create");
    setError(null);

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Prepare data for API
    const dimensions = {
      width: parseFloat(formData.width),
      length: parseFloat(formData.roomLength),
      height: parseFloat(formData.height),
    };

    // Add secondary dimensions for L-shaped rooms
    if (formData.shape === "L-shaped") {
      dimensions.secondWidth = parseFloat(formData.secondWidth);
      dimensions.secondLength = parseFloat(formData.secondLength);
    }

    const roomDesignData = {
      name: formData.name,
      dimensions: {
        width: parseFloat(formData.width),
        length: parseFloat(formData.roomLength),
        height: parseFloat(formData.height),
        // Add secondary dimensions for L-shaped if needed
      },
      shape: formData.shape,
      colorScheme: formData.colorScheme,
      furniture: selectedFurniture.map((item) => ({
        itemId: item.itemId,
        position: {
          x: item.position.x,
          y: item.position.y,
          z: item.position.z,
        },
        rotation: item.rotation || 0,
      })),
      isPublic: formData.isPublic,
    };

    try {
      const response = await Axios.post(
        "http://localhost:3001/api/admin/room-designs/create",
        roomDesignData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      // Redirect to room designs page after successful creation
      setSavedDesign(response.data.design);

      setTimeout(() => {
        navigate("/admin/room-designs");
      }, 2000);
    } catch (err) {
      console.error("Error creating room design:", err);
      setError(err.response?.data?.message || "Failed to create room design");
    } finally {
      setLoading(false);
    }
  };

  {
    error && (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
        role="alert"
      >
        <p>
          {operation === "create" && "Error creating design: "}
          {operation === "update" && "Error updating design: "}
          {operation === "delete" && "Error deleting design: "}
          {error}
        </p>
      </div>
    );
  }

  // Publish the saved design
  const handlePublish = async () => {
    if (!savedDesign) {
      setError("Please save your design before publishing");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      // Update the design to mark it as public
      await Axios.put(
        `http://localhost:3001/api/admin/room-designs/${savedDesign._id}`,
        { isPublic: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      // Now redirect after successful publish
      setTimeout(() => {
        navigate("/admin/room-designs");
      }, 2000);
    } catch (err) {
      console.error("Error publishing room design:", err);
      setError(err.response?.data?.message || "Failed to publish room design");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-design-main">
      <div className="room-navbar">
        <aside className="sidebar">
          <div className="logo">LOGO</div>
          <nav className="nav-links-dashboard">
            <a href="/dashboard" className="nav-link-dashboard">
              <FaTachometerAlt className="icon" /> Dashboard
            </a>
            <a
              href="/admin/create-room-design"
              className="nav-link-dashboard  active"
            >
              <FaPlus className="icon" /> Create Designs
            </a>
            <a href="/admin/room-designs" className="nav-link-dashboard">
              <FaThList className="icon" /> My Designs
            </a>
            <a href="/admin/furniture/add" className="nav-link-dashboard">
              <FaCouch className="icon" /> Furniture
            </a>
            <a href="/logout" className="nav-link-dashboard">
              <FaSignOutAlt className="icon" /> Log Out
            </a>
          </nav>
        </aside>
      </div>

      <div className="room-create">
        <h1 className="room-title text-4xl font-bold mb-6">
          CREATE ROOM DESIGNS
        </h1>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
            role="alert"
          >
            <p>Room design created successfully! Redirecting...</p>
          </div>
        )}

        {/* Add 3D/2D toggle button */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={toggleViewMode}
            className={`toggle-view-btn px-4 py-2 rounded-md transition duration-300 ${
              is3DMode ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {is3DMode ? "Switch to 2D View" : "Switch to 3D View"}
          </button>
        </div>

        <div className="preview-area">
          <h2 className="text-xl font-semibold mb-4">Room Design Preview</h2>

          {is3DMode ? (
            <ErrorBoundary>
              <div className="relative h-[500px] border rounded-lg overflow-hidden">
                <div
                  ref={mountRef}
                  onClick={handleCanvasClick}
                  className="w-full h-full"
                  style={{
                    cursor: selectedFurnitureItem ? "crosshair" : "grab",
                  }}
                />

                {selectedFurnitureItem && (
                  <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
                    <p className="font-medium">
                      Placing: {selectedFurnitureItem.title}
                    </p>
                    <button
                      onClick={() => setSelectedFurnitureItem(null)}
                      className="mt-2 text-sm text-red-600"
                    >
                      Cancel Placement
                    </button>
                  </div>
                )}
              </div>
            </ErrorBoundary>
          ) : (
            <div className="flex justify-center items-center bg-gray-100 rounded-lg h-[500px]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Room Preview"
                  className="max-w-full max-h-full"
                />
              ) : (
                <p>Set room dimensions to generate preview</p>
              )}
            </div>
          )}
        </div>

        {/* Furniture Selection Panel for 3D Mode */}
        {is3DMode && (
          <div className="furniture-selection-panel mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">
              Select Furniture to Place
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {furniture.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setSelectedFurnitureItem(item);
                    setIs3DMode(true); // Switch to 3D mode automatically
                  }}
                  className={`furniture-item ${
                    selectedFurnitureItem?._id === item._id ? "selected" : ""
                  }`}
                >
                  {item.image ? (
                    <img
                      src={`http://localhost:3001/${item.image}`}
                      alt={item.title}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                  <div className="text-sm font-medium text-center truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {item.productType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Room Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="name"
                >
                  Room Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="shape"
                >
                  Room Shape *
                </label>
                <select
                  id="shape"
                  name="shape"
                  value={formData.shape}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                >
                  <option value="rectangular">Rectangular</option>
                  <option value="L-shaped">L-shaped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Room Dimensions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Room Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="width"
                >
                  Width (meters) *
                </label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  min="1"
                  max="100"
                  step="0.1"
                  value={formData.width}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="roomLength"
                >
                  Length (meters) *
                </label>
                <input
                  type="number"
                  id="roomLength"
                  name="roomLength"
                  min="1"
                  max="100"
                  step="0.1"
                  value={formData.roomLength}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="height"
                >
                  Height (meters) *
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  min="1"
                  max="30"
                  step="0.1"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                  required
                />
              </div>
            </div>

            {/* L-shaped room additional dimensions */}
            {formData.shape === "L-shaped" && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="secondWidth"
                  >
                    Second Width (meters) *
                  </label>
                  <input
                    type="number"
                    id="secondWidth"
                    name="secondWidth"
                    min="1"
                    max="100"
                    step="0.1"
                    value={formData.secondWidth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    required={formData.shape === "L-shaped"}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="secondLength"
                  >
                    Second Length (meters) *
                  </label>
                  <input
                    type="number"
                    id="secondLength"
                    name="secondLength"
                    min="1"
                    max="100"
                    step="0.1"
                    value={formData.secondLength}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    required={formData.shape === "L-shaped"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color Scheme */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Color Scheme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.name"
                >
                  Color Scheme Name
                </label>
                <input
                  type="text"
                  id="colorScheme.name"
                  name="colorScheme.name"
                  value={formData.colorScheme.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.walls"
                >
                  Wall Color
                </label>
                <input
                  type="color"
                  id="colorScheme.walls"
                  name="colorScheme.walls"
                  value={formData.colorScheme.walls}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.floor"
                >
                  Floor Color
                </label>
                <input
                  type="color"
                  id="colorScheme.floor"
                  name="colorScheme.floor"
                  value={formData.colorScheme.floor}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.ceiling"
                >
                  Ceiling Color
                </label>
                <input
                  type="color"
                  id="colorScheme.ceiling"
                  name="colorScheme.ceiling"
                  value={formData.colorScheme.ceiling}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
              {/* <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="colorScheme.trim"
                >
                  Trim Color
                </label>
                <input
                  type="color"
                  id="colorScheme.trim"
                  name="colorScheme.trim"
                  value={formData.colorScheme.trim}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                />
              </div> */}
            </div>
          </div>

          {/* Furniture Selection */}
          {furniture && furniture.length > 0 && (
            <div className="mb-8">
              <h2 className="furniture-select text-xl font-semibold mb-4">
                Furniture Selection
              </h2>

              <button
                type="button"
                onClick={() => setShowFurnitureGallery(!showFurnitureGallery)}
                className="select-btn mb-4 px-4 py-2 text-white rounded-md transition duration-300"
              >
                {showFurnitureGallery
                  ? "Hide Furniture Gallery"
                  : "Show Furniture Gallery"}
              </button>

              {showFurnitureGallery && (
                <div className="mt-4">
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 font-medium mb-2"
                      htmlFor="furnitureFilter"
                    >
                      Filter by Type
                    </label>
                    <select
                      id="furnitureFilter"
                      value={furnitureFilter}
                      onChange={handleFurnitureFilterChange}
                      className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014482]"
                    >
                      {getProductTypes().map((type) => (
                        <option key={type} value={type}>
                          {type === "all" ? "All Items" : type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {getFilteredFurniture().map((item) => (
                      <div
                        key={item._id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="h-48 bg-gray-200 relative">
                          {item.image ? (
                            <img
                              src={`http://localhost:3001/${item.image}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-800 mb-1 truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.productType}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              ${item.price.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFurnitureSelect(item)}
                              className="add-btn text-xs px-2 py-1 text-white rounded"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Furniture List */}
              {selectedFurniture.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Selected Furniture ({selectedFurniture.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedFurniture.map((item, index) => {
                      const furnitureDetails = furniture.find(
                        (f) => f._id === item.itemId
                      );
                      return (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-md border border-gray-200"
                        >
                          <div className="md:flex items-start">
                            {/* Furniture image thumbnail */}
                            <div className="md:w-1/6 mb-3 md:mb-0 md:mr-4">
                              {furnitureDetails?.image ? (
                                <img
                                  src={`http://localhost:3001/${furnitureDetails.image}`}
                                  alt={furnitureDetails.title}
                                  className="w-full h-20 object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">
                                    No image
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Furniture details and controls */}
                            <div className="md:w-5/6">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium">
                                  {furnitureDetails?.title || "Furniture Item"}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => removeFurniture(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    X Position
                                  </label>
                                  <input
                                    type="number"
                                    value={item.position.x}
                                    onChange={(e) =>
                                      handleFurniturePositionChange(
                                        index,
                                        "x",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Y Position
                                  </label>
                                  <input
                                    type="number"
                                    value={item.position.y}
                                    onChange={(e) =>
                                      handleFurniturePositionChange(
                                        index,
                                        "y",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Z Position
                                  </label>
                                  <input
                                    type="number"
                                    value={item.position.z}
                                    onChange={(e) =>
                                      handleFurniturePositionChange(
                                        index,
                                        "z",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Rotation (degrees)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="359"
                                    value={item.rotation}
                                    onChange={(e) =>
                                      handleFurnitureRotationChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visibility Setting */}
          <div className="mb-8">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-5 h-5 border rounded"
              />
              <label className="ml-2 block text-gray-700" htmlFor="isPublic">
                Make this room design public
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="cancel-btn px-6 py-2 text-white rounded-md transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`create-room-btn px-6 py-2 text-white rounded-md transition duration-300 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating..." : "Create Room Design"}
            </button>
          </div>
          <br />
          <br />
        </form>
      </div>
    </div>
  );
}
