import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import * as THREE from "three";
import "../components/RoomDesign.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  FaTachometerAlt,
  FaPlus,
  FaThList,
  FaCouch,
  FaSignOutAlt,
} from "react-icons/fa";

const RoomDesignsPage = () => {
  const [roomDesigns, setRoomDesigns] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("2d");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const threeDContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomDesignsAndFurniture = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        // Fetch room designs
        const designsResponse = await axios.get(
          "http://localhost:3001/api/admin/room-designs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRoomDesigns(designsResponse.data.designs);

        // Fetch furniture
        const furnitureResponse = await axios.get(
          "http://localhost:3001/api/admin/furniture",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFurniture(furnitureResponse.data.data || []);

        if (designsResponse.data.designs.length > 0) {
          // Fetch complete details for the first design
          const detailResponse = await axios.get(
            `http://localhost:3001/api/admin/room-designs/${designsResponse.data.designs[0]._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setSelectedDesign(detailResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoomDesignsAndFurniture();
  }, [navigate]);

  useEffect(() => {
    if (selectedDesign && activeTab === "3d" && threeDContainerRef.current) {
      initThreeJS();
  
      return () => {
        cleanupThreeJS();
      };
    } else {
      // Clean up when not in 3D mode
      cleanupThreeJS();
    }
  }, [selectedDesign, activeTab]);

  const cleanupThreeJS = () => {
    if (rendererRef.current) {
      // Cancel animation frame
      if (rendererRef.current.animationFrameId) {
        cancelAnimationFrame(rendererRef.current.animationFrameId);
      }
  
      // Safely remove the renderer's DOM element
      if (
        rendererRef.current.domElement &&
        threeDContainerRef.current &&
        threeDContainerRef.current.contains(rendererRef.current.domElement)
      ) {
        threeDContainerRef.current.removeChild(rendererRef.current.domElement);
      }
  
      // Dispose of resources
      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
  
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
  
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
  
      // Clear refs
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    }
  };

  useEffect(() => {
    if (selectedDesign && activeTab === "3d" && threeDContainerRef.current) {
      initThreeJS();

      return () => {
        // Clean up Three.js resources when component unmounts or dependencies change
        if (rendererRef.current) {
          // Cancel animation frame
          if (rendererRef.current.animationFrameId) {
            cancelAnimationFrame(rendererRef.current.animationFrameId);
          }

          // Safely remove the renderer's DOM element
          if (
            rendererRef.current.domElement &&
            rendererRef.current.domElement.parentNode ===
              threeDContainerRef.current
          ) {
            threeDContainerRef.current.removeChild(
              rendererRef.current.domElement
            );
          }

          disposeThreeJSResources();
        }
      };
    }
  }, [selectedDesign, activeTab]);

  const disposeThreeJSResources = () => {
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
  };

  const initThreeJS = () => {
    if (!selectedDesign || !threeDContainerRef.current) return;

    // First clean up any existing scene
    cleanupThreeJS();

    // Clear the container before adding new elements
    if (threeDContainerRef.current) {
      while (threeDContainerRef.current.firstChild) {
        threeDContainerRef.current.removeChild(
          threeDContainerRef.current.firstChild
        );
      }
    }

    if (rendererRef.current) {
      // Cancel any existing animation frame
      if (rendererRef.current.animationFrameId) {
        cancelAnimationFrame(rendererRef.current.animationFrameId);
      }

      // Only remove the DOM element if it exists and is still attached
      if (
        rendererRef.current.domElement &&
        rendererRef.current.domElement.parentNode === threeDContainerRef.current
      ) {
        threeDContainerRef.current.removeChild(rendererRef.current.domElement);
      }

      disposeThreeJSResources();
    }

    // Clear the container before adding new elements
    while (threeDContainerRef.current.firstChild) {
      threeDContainerRef.current.removeChild(
        threeDContainerRef.current.firstChild
      );
    }

    // Get container dimensions
    const width = threeDContainerRef.current.clientWidth;
    const height = 400; // Fixed height

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    threeDContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid for reference
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Create room based on design
    createRoom(scene, selectedDesign);

    // Animation loop
    const animate = () => {
      renderer.animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = threeDContainerRef.current.clientWidth;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(renderer.animationFrameId);
    };
  };

  const createRoom = (scene, design) => {
    const { dimensions, shape, colorScheme } = design;
    const width = dimensions.width;
    const length = dimensions.length;
    const height = dimensions.height;

    // Wall material
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: colorScheme?.walls || 0xffffff,
      side: THREE.DoubleSide,
    });

    // Floor material
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: colorScheme?.floor || 0x8b4513,
      side: THREE.DoubleSide,
    });

    // Ceiling material
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: colorScheme?.ceiling || 0xf8f8f8,
      side: THREE.DoubleSide,
    });

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(width, length);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(width, length);
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    scene.add(ceiling);

    // Create walls based on room shape
    if (shape === "rectangular" || shape === "custom") {
      // Back wall
      const backWallGeometry = new THREE.PlaneGeometry(width, height);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.z = -length / 2;
      backWall.position.y = height / 2;
      scene.add(backWall);

      // Left wall
      const leftWallGeometry = new THREE.PlaneGeometry(length, height);
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.position.x = -width / 2;
      leftWall.position.y = height / 2;
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      // Right wall
      const rightWallGeometry = new THREE.PlaneGeometry(length, height);
      const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
      rightWall.position.x = width / 2;
      rightWall.position.y = height / 2;
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // Front wall - OMITTED to create open view from camera perspective
      // We don't add a front wall, which creates the open view effect
    } else if (shape === "L-shaped") {
      // Create L-shaped room
      // This is a simplified version - you would need to adapt this based on your exact L-shape definition
      const mainWidth = width * 0.6;
      const mainLength = length;
      const secondaryWidth = width - mainWidth;
      const secondaryLength = length * 0.6;

      // Main section walls
      // Back wall
      const backWallGeometry = new THREE.PlaneGeometry(mainWidth, height);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.x = (width - mainWidth) / 2;
      backWall.position.z = -length / 2;
      backWall.position.y = height / 2;
      scene.add(backWall);

      // Left wall
      const leftWallGeometry = new THREE.PlaneGeometry(mainLength, height);
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.position.x = -width / 2 + mainWidth;
      leftWall.position.y = height / 2;
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      // Secondary section walls
      // Back wall for secondary section
      const secondaryBackWallGeometry = new THREE.PlaneGeometry(
        secondaryWidth,
        height
      );
      const secondaryBackWall = new THREE.Mesh(
        secondaryBackWallGeometry,
        wallMaterial
      );
      secondaryBackWall.position.x = -width / 2 + secondaryWidth / 2;
      secondaryBackWall.position.z = length / 2 - secondaryLength;
      secondaryBackWall.position.y = height / 2;
      scene.add(secondaryBackWall);

      // Left wall for secondary section
      const secondaryLeftWallGeometry = new THREE.PlaneGeometry(
        secondaryLength,
        height
      );
      const secondaryLeftWall = new THREE.Mesh(
        secondaryLeftWallGeometry,
        wallMaterial
      );
      secondaryLeftWall.position.x = -width / 2;
      secondaryLeftWall.position.z = length / 2 - secondaryLength / 2;
      secondaryLeftWall.position.y = height / 2;
      secondaryLeftWall.rotation.y = Math.PI / 2;
      scene.add(secondaryLeftWall);
    }

    // Add window to back wall for realism
    if (shape === "rectangular" || shape === "custom") {
      // Add window to back wall
      const windowWidth = width * 0.4;
      const windowHeight = height * 0.4;
      const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
      const windowMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb, // Light blue for window
        transparent: true,
        opacity: 0.7,
      });
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.z = -length / 2 + 0.01; // Slightly in front of back wall
      windowMesh.position.y = height * 0.6;
      windowMesh.position.x = 0;
      scene.add(windowMesh);

      // Window frame
      const frameSize = 0.05;
      const frameColor = 0xffffff; // White frame
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: frameColor,
      });

      // Horizontal frames
      const horizontalFrameGeometry = new THREE.BoxGeometry(
        windowWidth + frameSize,
        frameSize,
        frameSize
      );

      const topFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
      topFrame.position.set(
        0,
        windowMesh.position.y + windowHeight / 2,
        -length / 2 + 0.02
      );
      scene.add(topFrame);

      const bottomFrame = new THREE.Mesh(
        horizontalFrameGeometry,
        frameMaterial
      );
      bottomFrame.position.set(
        0,
        windowMesh.position.y - windowHeight / 2,
        -length / 2 + 0.02
      );
      scene.add(bottomFrame);

      // Vertical frames
      const verticalFrameGeometry = new THREE.BoxGeometry(
        frameSize,
        windowHeight,
        frameSize
      );

      const leftFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
      leftFrame.position.set(
        -windowWidth / 2,
        windowMesh.position.y,
        -length / 2 + 0.02
      );
      scene.add(leftFrame);

      const rightFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
      rightFrame.position.set(
        windowWidth / 2,
        windowMesh.position.y,
        -length / 2 + 0.02
      );
      scene.add(rightFrame);

      // Center divider
      const centerDivider = new THREE.Mesh(
        verticalFrameGeometry,
        frameMaterial
      );
      centerDivider.position.set(0, windowMesh.position.y, -length / 2 + 0.02);
      scene.add(centerDivider);
    }

    // Add door to right wall for realism
    const doorWidth = 1;
    const doorHeight = height * 0.8;
    const doorGeometry = new THREE.PlaneGeometry(doorWidth, doorHeight);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White door
      side: THREE.DoubleSide,
    });

    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.rotation.y = -Math.PI / 2; // Align with right wall
    door.position.set(width / 2 - 0.01, doorHeight / 2, length / 4); // Position on right wall
    scene.add(door);

    // Add furniture if available
    if (design.furniture && design.furniture.length > 0 && furniture.length > 0) {
      design.furniture.forEach((item) => {
        const furnitureItem = furniture.find(f => f._id === item.itemId);
        if (!furnitureItem) return;
  
        // Create geometry based on furniture type
        let dimensions = [1, 1, 1]; // Default dimensions
        
        // Set dimensions based on furniture type
        switch(furnitureItem.productType.toLowerCase()) {
          case 'sofa':
            dimensions = [2.5, 0.8, 1];
            break;
          case 'chair':
            dimensions = [1.2, 0.8, 1];
            break;
          case 'table':
            dimensions = [1.8, 0.4, 1];
            break;
          // Add more cases as needed
        }
  
        const material = new THREE.MeshStandardMaterial({
          color: 0x8b4513, // Or use furnitureItem.color if available
        });
  
        const furnitureMesh = new THREE.Mesh(
          new THREE.BoxGeometry(...dimensions),
          material
        );
  
        // Set position from the saved design data
        furnitureMesh.position.set(
          item.position.x,
          item.position.y,
          item.position.z
        );
        
        // Set rotation if available
        if (item.rotation) {
          furnitureMesh.rotation.y = item.rotation;
        }
  
        furnitureMesh.castShadow = true;
        scene.add(furnitureMesh);
      });
    } else {
      // Add some default furniture to match the image
      // Sofa
      const sofaGeometry = new THREE.BoxGeometry(2.5, 0.8, 1);
      const sofaMaterial = new THREE.MeshStandardMaterial({ color: 0xcd853f }); // Tan/brown
      const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
      sofa.position.set(-1.5, 0.4, -0.5);
      sofa.castShadow = true;
      scene.add(sofa);

      // Sofa back
      const sofaBackGeometry = new THREE.BoxGeometry(2.5, 0.6, 0.3);
      const sofaBack = new THREE.Mesh(sofaBackGeometry, sofaMaterial);
      sofaBack.position.set(-1.5, 0.85, -0.85);
      sofaBack.castShadow = true;
      scene.add(sofaBack);

      // Sofa armrests
      const armrestGeometry = new THREE.BoxGeometry(0.3, 0.6, 1);

      const leftArmrest = new THREE.Mesh(armrestGeometry, sofaMaterial);
      leftArmrest.position.set(-2.65, 0.7, -0.5);
      leftArmrest.castShadow = true;
      scene.add(leftArmrest);

      const rightArmrest = new THREE.Mesh(armrestGeometry, sofaMaterial);
      rightArmrest.position.set(-0.35, 0.7, -0.5);
      rightArmrest.castShadow = true;
      scene.add(rightArmrest);

      // Armchair
      const chairGeometry = new THREE.BoxGeometry(1.2, 0.8, 1);
      const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57 }); // Green
      const chair = new THREE.Mesh(chairGeometry, chairMaterial);
      chair.position.set(1.5, 0.4, -0.5);
      chair.castShadow = true;
      scene.add(chair);

      // Chair back
      const chairBackGeometry = new THREE.BoxGeometry(1.2, 0.6, 0.3);
      const chairBack = new THREE.Mesh(chairBackGeometry, chairMaterial);
      chairBack.position.set(1.5, 0.85, -0.85);
      chairBack.castShadow = true;
      scene.add(chairBack);

      // Chair armrests
      const chairArmrestGeometry = new THREE.BoxGeometry(0.2, 0.4, 1);

      const leftChairArmrest = new THREE.Mesh(
        chairArmrestGeometry,
        chairMaterial
      );
      leftChairArmrest.position.set(0.9, 0.6, -0.5);
      leftChairArmrest.castShadow = true;
      scene.add(leftChairArmrest);

      const rightChairArmrest = new THREE.Mesh(
        chairArmrestGeometry,
        chairMaterial
      );
      rightChairArmrest.position.set(2.1, 0.6, -0.5);
      rightChairArmrest.castShadow = true;
      scene.add(rightChairArmrest);

      // Coffee table
      const tableGeometry = new THREE.BoxGeometry(1.8, 0.4, 1);
      const tableMaterial = new THREE.MeshStandardMaterial({ color: 0xa0522d });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.set(0, 0.2, 0.5);
      table.castShadow = true;
      scene.add(table);

      // TV Stand
      const tvStandGeometry = new THREE.BoxGeometry(2, 0.6, 0.6);
      const tvStandMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
      });
      const tvStand = new THREE.Mesh(tvStandGeometry, tvStandMaterial);
      tvStand.position.set(0, 0.3, -1.7);
      tvStand.castShadow = true;
      scene.add(tvStand);

      // TV
      const tvGeometry = new THREE.BoxGeometry(1.8, 1, 0.1);
      const tvMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      const tv = new THREE.Mesh(tvGeometry, tvMaterial);
      tv.position.set(0, 1.3, -1.7);
      tv.castShadow = true;
      scene.add(tv);

      // Plant in pot
      const potGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 16);
      const potMaterial = new THREE.MeshStandardMaterial({ color: 0xa0522d });
      const pot = new THREE.Mesh(potGeometry, potMaterial);
      pot.position.set(2.3, 0.2, 2);
      pot.castShadow = true;
      scene.add(pot);

      // Plant foliage
      const foliageGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(2.3, 0.7, 2);
      foliage.castShadow = true;
      scene.add(foliage);
    }

    // Position camera to view from the open side
    cameraRef.current.position.set(0, height / 1.5, length * 1.2);
    cameraRef.current.lookAt(0, height / 2, 0);
    controlsRef.current.target.set(0, height / 2, 0);
    controlsRef.current.update();
  };

  const handleDesignClick = async (design) => {
    setSelectedDesign(design);

    // Get detailed design information including ratings and furniture details
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `http://localhost:3001/api/admin/room-designs/${design._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedDesign(response.data);
    } catch (err) {
      console.error("Error fetching design details:", err);
    }
  };

  // Handle edit room design - navigate to edit page with the design ID
  const handleEditDesign = (designId, e) => {
    e.stopPropagation(); // Prevent the card click event
    navigate(`/admin/edit-room-design/${designId}`);
  };

  // Handle delete room design
  const handleDeleteDesign = async (designId, e) => {
    e.stopPropagation(); // Prevent the card click event

    if (window.confirm("Are you sure you want to delete this room design?")) {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        await axios.delete(
          `http://localhost:3001/api/admin/room-designs/${designId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Remove the deleted design from state
        setRoomDesigns(roomDesigns.filter((design) => design._id !== designId));

        // If the deleted design was selected, select another one
        if (selectedDesign && selectedDesign._id === designId) {
          const remainingDesigns = roomDesigns.filter(
            (design) => design._id !== designId
          );
          if (remainingDesigns.length > 0) {
            setSelectedDesign(remainingDesigns[0]);
          } else {
            setSelectedDesign(null);
          }
        }
      } catch (err) {
        console.error("Error deleting room design:", err);
        alert("Failed to delete room design. Please try again later.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#DEE8F1] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#014482] mb-4">
            Room Designs
          </h1>
          <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-[#014482] text-white py-2 px-4 rounded hover:bg-[#01325e] transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-main">
      <div className="room-navbar">
        <aside className="sidebar">
          <div className="logo">LOGO</div>
          <nav className="nav-links-dashboard">
            <a href="/dashboard" className="nav-link-dashboard">
              <FaTachometerAlt className="icon" /> Dashboard
            </a>
            <a href="/admin/create-room-design" className="nav-link-dashboard">
              <FaPlus className="icon" /> Create Designs
            </a>
            <a href="/admin/room-designs" className="nav-link-dashboard active">
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
      <div className="room-section">
        <br />
        <br />
        <div className="section-heading">
          <h1>MY DESIGNS</h1>
        </div>

        {roomDesigns.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              No Room Designs Found
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't created any room designs yet.
            </p>
          </div>
        ) : (
          <div className="design-section grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar - Design list */}
            <div className="design-main bg-white p-6 rounded-lg shadow-md">
              <div className="search-box1">
                <span className="icon1">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  placeholder="Search Here"
                  className="search-input1"
                />
              </div>
              <div className="space-y-3 max-h-96">
                {roomDesigns.map((design) => (
                  <div
                    key={design._id}
                    onClick={() => handleDesignClick(design)}
                    className={`design-cards p-3 rounded-md cursor-pointer transition ${
                      selectedDesign?._id === design._id
                        ? " bg-[#014482] text-black"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{design.name}</h3>
                      <div className="flex space-x-2">
                        {/* Edit Icon */}
                        <button
                          onClick={(e) => handleEditDesign(design._id, e)}
                          className={`p-1 rounded-full ${
                            selectedDesign?._id === design._id
                              ? "text-black hover:bg-gray-300"
                              : "text-gray-600 hover:bg-gray-300"
                          }`}
                          title="Edit Design"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        {/* Delete Icon */}
                        <button
                          onClick={(e) => handleDeleteDesign(design._id, e)}
                          className={`p-1 rounded-full ${
                            selectedDesign?._id === design._id
                              ? "text-black hover:bg-gray-300"
                              : "text-gray-600 hover:bg-gray-300"
                          }`}
                          title="Delete Design"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm">
                      {design.shape} • {design.dimensions.width}x
                      {design.dimensions.length}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main content - Room visualization */}
            <div className="design-sub lg:col-span-2">
              {selectedDesign && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                      {selectedDesign.name}
                    </h2>
                    <div className="flex rounded-md overflow-hidden">
                      <button
                        onClick={() => setActiveTab("2d")}
                        className={`btn-2d py-2 px-4 ${
                          activeTab === "2d" ? " text-white" : "text-gray-700"
                        }`}
                      >
                        2D View
                      </button>
                      <button
                        onClick={() => setActiveTab("3d")}
                        className={`btn-3d py-2 px-4 ${
                          activeTab === "3d" ? "text-white" : "text-gray-700"
                        }`}
                      >
                        3D View
                      </button>
                    </div>
                  </div>

                  {/* Room details */}
                  <div className="design-details grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div>
                      <p className="text-gray-500">Dimensions</p>
                      <p>
                        {selectedDesign.dimensions.width}m ×{" "}
                        {selectedDesign.dimensions.length}m ×{" "}
                        {selectedDesign.dimensions.height}m
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Shape</p>
                      <p className="capitalize">{selectedDesign.shape}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Visibility</p>
                      <p>{selectedDesign.isPublic ? "Public" : "Private"}</p>
                    </div>
                  </div>
                  {/* Display area */}
                  <div className="border rounded-md p-1 bg-gray-50">
                    {activeTab === "2d" ? (
                      <div className="h-96 flex items-center justify-center">
                        {selectedDesign.preview2DUrl ? (
                          <img
                            src={`http://localhost:3001${selectedDesign.preview2DUrl}`}
                            alt={`2D preview of ${selectedDesign.name}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-gray-500 text-center">
                            <p>No 2D preview available</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        ref={threeDContainerRef}
                        className="h-96 w-full"
                        key={`3d-container-${selectedDesign._id}`} // Add key to force re-render
                      >
                        {/* Three.js will render here */}
                      </div>
                    )}
                  </div>
                  {/* Color scheme display */}
                  {selectedDesign.colorScheme && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-2">
                        Color Scheme: {selectedDesign.colorScheme.name}
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-md border border-gray-300"
                            style={{
                              backgroundColor: selectedDesign.colorScheme.walls,
                            }}
                          ></div>
                          <span className="text-xs mt-1">Walls</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-md border border-gray-300"
                            style={{
                              backgroundColor: selectedDesign.colorScheme.floor,
                            }}
                          ></div>
                          <span className="text-xs mt-1">Floor</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-md border border-gray-300"
                            style={{
                              backgroundColor:
                                selectedDesign.colorScheme.ceiling,
                            }}
                          ></div>
                          <span className="text-xs mt-1">Ceiling</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-md border border-gray-300"
                            style={{
                              backgroundColor: selectedDesign.colorScheme.trim,
                            }}
                          ></div>
                          <span className="text-xs mt-1">Trim</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Furniture Display */}
                  {selectedDesign.furniture &&
                    selectedDesign.furniture.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-2">
                          Selected Furniture
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedDesign.furniture.map((item, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 p-3 rounded-md"
                            >
                              {item.itemId &&
                              typeof item.itemId === "object" ? (
                                <>
                                  <div className="h-32 overflow-hidden rounded-md mb-2 bg-white flex items-center justify-center">
                                    {item.itemId.image ? (
                                      <img
                                        src={`http://localhost:3001/${item.itemId.image
                                          .replace(/\\/g, "/")
                                          .replace(/^.*uploads/, "uploads")}`}
                                        alt={item.itemId.title}
                                        className="h-full w-full object-contain"
                                      />
                                    ) : (
                                      <div className="text-gray-400 text-center">
                                        No image
                                      </div>
                                    )}
                                  </div>
                                  <p className="font-medium">
                                    {item.itemId.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {item.itemId.productType}
                                  </p>
                                  <p className="text-sm font-medium">
                                    ${item.itemId.price.toFixed(2)}
                                  </p>
                                </>
                              ) : (
                                <p className="text-gray-500">
                                  Furniture item not loaded
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Ratings Display */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">
                      Design Ratings
                    </h3>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <div className="flex items-center mb-3">
                        <div className="text-3xl font-bold mr-2">
                          {selectedDesign.averageRating
                            ? selectedDesign.averageRating.toFixed(1)
                            : "0.0"}
                        </div>
                        <div className="flex text-yellow-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill={
                                selectedDesign.averageRating >= star
                                  ? "currentColor"
                                  : "none"
                              }
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          ))}
                        </div>
                        <div className="ml-2 text-gray-500">
                          (
                          {selectedDesign.ratings
                            ? selectedDesign.ratings.length
                            : 0}{" "}
                          ratings)
                        </div>
                      </div>

                      {/* Add a button to load detailed ratings if needed */}
                      {selectedDesign.ratings &&
                      selectedDesign.ratings.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedDesign.ratings.map((rating, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded-md"
                            >
                              <div className="flex justify-between">
                                <div className="flex text-yellow-500">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill={
                                        rating.value >= star
                                          ? "currentColor"
                                          : "none"
                                      }
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                      />
                                    </svg>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(rating.date).toLocaleDateString()}
                                </div>
                              </div>
                              {rating.comment && (
                                <p className="mt-2 text-sm">{rating.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-2">
                          No ratings yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <br />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDesignsPage;
