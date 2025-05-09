import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import "./FurniturePage/furniture.css";

const UserRoomDesignsPage = () => {
  const [roomDesigns, setRoomDesigns] = useState([]);
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
    const fetchRoomDesigns = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await axios.get(
          "http://localhost:3001/api/room-designs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRoomDesigns(response.data.designs);
        if (response.data.designs.length > 0) {
          const detailResponse = await axios.get(
            `http://localhost:3001/api/room-designs/${response.data.designs[0]._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setSelectedDesign(detailResponse.data);
        }
      } catch (err) {
        console.error("Error fetching room designs:", err);
        setError("Failed to fetch room designs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDesigns();
  }, [navigate]);

  useEffect(() => {
    if (selectedDesign && activeTab === "3d" && threeDContainerRef.current) {
      initThreeJS();
      return () => {
        if (rendererRef.current) {
          if (rendererRef.current.animationFrameId) {
            cancelAnimationFrame(rendererRef.current.animationFrameId);
          }
          if (
            rendererRef.current.domElement &&
            threeDContainerRef.current &&
            threeDContainerRef.current.contains(rendererRef.current.domElement)
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
    if (!selectedDesign) return;
    if (rendererRef.current && rendererRef.current.domElement) {
      threeDContainerRef.current.removeChild(rendererRef.current.domElement);
      disposeThreeJSResources();
    }
    const width = threeDContainerRef.current.clientWidth;
    const height = 400;
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    threeDContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    createRoom(scene, selectedDesign);

    const animate = () => {
      renderer.animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      const width = threeDContainerRef.current.clientWidth;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

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

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: colorScheme?.walls || 0xffffff,
      side: THREE.DoubleSide,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: colorScheme?.floor || 0x8b4513,
      side: THREE.DoubleSide,
    });

    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: colorScheme?.ceiling || 0xf8f8f8,
      side: THREE.DoubleSide,
    });

    const floorGeometry = new THREE.PlaneGeometry(width, length);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceilingGeometry = new THREE.PlaneGeometry(width, length);
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    scene.add(ceiling);
    if (shape === "rectangular" || shape === "custom") {
      const backWallGeometry = new THREE.PlaneGeometry(width, height);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.z = -length / 2;
      backWall.position.y = height / 2;
      scene.add(backWall);

      const leftWallGeometry = new THREE.PlaneGeometry(length, height);
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.position.x = -width / 2;
      leftWall.position.y = height / 2;
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWallGeometry = new THREE.PlaneGeometry(length, height);
      const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
      rightWall.position.x = width / 2;
      rightWall.position.y = height / 2;
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);
    } else if (shape === "L-shaped") {
      const mainWidth = width * 0.6;
      const mainLength = length;
      const secondaryWidth = width - mainWidth;
      const secondaryLength = length * 0.6;

      const backWallGeometry = new THREE.PlaneGeometry(mainWidth, height);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.x = (width - mainWidth) / 2;
      backWall.position.z = -length / 2;
      backWall.position.y = height / 2;
      scene.add(backWall);

      const leftWallGeometry = new THREE.PlaneGeometry(mainLength, height);
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.position.x = -width / 2 + mainWidth;
      leftWall.position.y = height / 2;
      leftWall.rotation.y = Math.PI / 2;

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

    if (shape === "rectangular" || shape === "custom") {
      const windowWidth = width * 0.4;
      const windowHeight = height * 0.4;
      const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
      const windowMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.7,
      });
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.z = -length / 2 + 0.01;
      windowMesh.position.y = height * 0.6;
      windowMesh.position.x = 0;
      scene.add(windowMesh);

      const frameSize = 0.05;
      const frameColor = 0xffffff;
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: frameColor,
      });

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

      const centerDivider = new THREE.Mesh(
        verticalFrameGeometry,
        frameMaterial
      );
      centerDivider.position.set(0, windowMesh.position.y, -length / 2 + 0.02);
      scene.add(centerDivider);
    }

    const doorWidth = 1;
    const doorHeight = height * 0.8;
    const doorGeometry = new THREE.PlaneGeometry(doorWidth, doorHeight);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.rotation.y = -Math.PI / 2;
    door.position.set(width / 2 - 0.01, doorHeight / 2, length / 4);
    scene.add(door);

    if (design.furniture && design.furniture.length > 0) {
      design.furniture.forEach((item) => {
        const furnitureGeometry = new THREE.BoxGeometry(1, 1, 1);
        const furnitureMaterial = new THREE.MeshStandardMaterial({
          color: 0x8b4513,
        });
        const furniture = new THREE.Mesh(furnitureGeometry, furnitureMaterial);
        furniture.position.set(
          item.position.x - width / 2 + 0.5,
          item.position.y + 0.5,
          item.position.z - length / 2 + 0.5
        );
        furniture.castShadow = true;
        scene.add(furniture);
      });
    } else {
      const foliageGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(2.3, 0.7, 2);
      foliage.castShadow = true;
      scene.add(foliage);
    }

    cameraRef.current.position.set(0, height / 1.5, length * 1.2);
    cameraRef.current.lookAt(0, height / 2, 0);
    controlsRef.current.target.set(0, height / 2, 0);
    controlsRef.current.update();
  };

  const handleDesignClick = async (design) => {
    setSelectedDesign(design);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `http://localhost:3001/api/room-designs/${design._id}`,
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

  const handleRateDesign = async (rating) => {
    if (!selectedDesign) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `http://localhost:3001/api/room-designs/${selectedDesign._id}/rate`,
        { rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await axios.get(
        `http://localhost:3001/api/room-designs/${selectedDesign._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedDesign(response.data);
    } catch (err) {
      console.error("Error rating design:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]"></div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div>
      <header className="navbar2">
        <div className="navbar-content2">
          <div className="logo2">LOGO</div>
          <nav className="nav-links2">
            <a href="/">Home</a>
            <Link to="/user/products" className="hover:text-gray-300">
              Products
            </Link>
            <Link to="/user/design" className="hover:text-gray-300">
              Design
            </Link>
            <Link to="/user/favorites" className="hover:text-gray-300">
              Favorites
            </Link>
            <Link to="/user/cart" className="hover:text-gray-300">
              Cart
            </Link>
            <button onClick={handleLogout} className="log-out">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <div className="hero-section2">
        <h1 className="title4">Explore Room Designs</h1><br />

        {roomDesigns.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              No Room Designs Found
            </h2>
            <p className="text-gray-600 mb-6">
              There are no public room designs available at the moment.
            </p>
          </div>
        ) : (
          <div className="design-page grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="design-sidebar bg-[#525B44] p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search designs..."
                    className="w-full p-3 border border-gray-300 rounded-md pl-10"
                  />
                  <span className="absolute left-3 top-3 text-gray-400">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {roomDesigns.map((design) => (
                  <div
                    key={design._id}
                    onClick={() => handleDesignClick(design)}
                    className={`p-3 rounded-md cursor-pointer transition flex justify-between items-center ${
                      selectedDesign?._id === design._id
                        ? "bg-[#011122] text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div>
                      <h3 className="font-medium">{design.name}</h3>
                      <p
                        className={`text-sm ${
                          selectedDesign?._id === design._id
                            ? "text-gray-200"
                            : "text-gray-500"
                        }`}
                      >
                        {design.shape} • {design.dimensions.width}x
                        {design.dimensions.length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="design-detail lg:col-span-2">
              {selectedDesign ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl text-black font-bold">
                      {selectedDesign.name}
                    </h2>
                    <div className="flex rounded-md overflow-hidden">
                      <button
                        onClick={() => setActiveTab("2d")}
                        className={`py-2 px-4 ${
                          activeTab === "2d"
                            ? "bg-[#014482] text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        2D View
                      </button>
                      <button
                        onClick={() => setActiveTab("3d")}
                        className={`py-2 px-4 ${
                          activeTab === "3d"
                            ? "bg-[#014482] text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        3D View
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div>
                      <p className="text-gray-500">Dimensions</p>
                      <p className="font-medium text-black">
                        {selectedDesign.dimensions.width}m ×{" "}
                        {selectedDesign.dimensions.length}m ×{" "}
                        {selectedDesign.dimensions.height}m
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 ">Shape</p>
                      <p className="capitalize text-black">{selectedDesign.shape}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Designer</p>
                      <p className="text-black">
                        {selectedDesign.createdBy?.email?.split("@")[0] ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <div className="flex mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRateDesign(star)}
                          className="focus:outline-none"
                        >
                          <FaStar
                            className={`h-5 w-5 ${
                              selectedDesign.averageRating >= star
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {selectedDesign.averageRating.toFixed(1)} (
                      {selectedDesign.ratings?.length || 0}{" "}
                      {selectedDesign.ratings?.length === 1
                        ? "rating"
                        : "ratings"}
                      )
                    </span>
                  </div>

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
                      ></div>
                    )}
                  </div>

                  {selectedDesign.colorScheme && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-black text-lg mb-2">
                        Color Scheme:{" "}
                        {selectedDesign.colorScheme.name || "Default"}
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-md border border-gray-300"
                            style={{
                              backgroundColor: selectedDesign.colorScheme.walls,
                            }}
                          ></div>
                          <span className="text-xs text-black mt-1">Walls</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-md border border-gray-300"
                            style={{
                              backgroundColor: selectedDesign.colorScheme.floor,
                            }}
                          ></div>
                          <span className="text-xs mt-1 text-black">Floor</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-md border border-gray-300"
                            style={{
                              backgroundColor:
                                selectedDesign.colorScheme.ceiling,
                            }}
                          ></div>
                          <span className="text-xs mt-1 text-black">Ceiling</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="w-12 h-12 rounded-md border border-gray-300"
                            style={{
                              backgroundColor: selectedDesign.colorScheme.trim,
                            }}
                          ></div>
                          <span className="text-xs mt-1 text-black">Trim</span>
                        </div>
                      </div>
                    </div>
                  )}

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
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Select a Room Design
                  </h2>
                  <p className="text-gray-600">
                    Choose a design from the list to view details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoomDesignsPage;
