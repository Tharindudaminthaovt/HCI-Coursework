import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "./NavBar";

const ShoppingCart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [statusCheckAttempts, setStatusCheckAttempts] = useState(0);
  const navigate = useNavigate();

  console.log("Component rendered with state:", {
    cartItemCount: cart?.items?.length || 0,
    total: cart?.total || 0,
    loading,
    error,
    paymentProcessing,
    paymentSuccess,
    paymentError,
    currentOrderId,
    statusCheckAttempts,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  useEffect(() => {
    console.log("Loading PayHere script...");
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log("PayHere script loaded successfully");
      if (window.payhere) {
        console.log("PayHere object is available in window");
      } else {
        console.error(
          "PayHere object NOT available in window after script load"
        );
      }
    };

    script.onerror = (error) => {
      console.error("Error loading PayHere script:", error);
    };
    return () => {
      console.log("Removing PayHere script");
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    console.log("fetchCart effect triggered");
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      const response = await fetch("http://localhost:3001/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Cart API response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Cart data received:", result);
        setCart(result.data || { items: [], total: 0 });
        console.log(
          "Cart state updated with items:",
          result.data?.items?.length || 0
        );
      } else {
        const errorData = await response.json();
        console.error("Error response from cart API:", errorData);
        setError(errorData.message || "Failed to fetch cart");
      }
    } catch (error) {
      console.error("Exception in fetchCart:", error);
      setError("An error occurred while fetching your cart");
    } finally {
      console.log("Fetch cart completed, setting loading to false");
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    console.log(`Updating quantity for item ${itemId} to ${newQuantity}`);
    if (newQuantity < 1) {
      console.log("Quantity less than 1, ignoring update");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Making update quantity request");

      const response = await fetch(
        `http://localhost:3001/api/cart/update/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      console.log("Update quantity response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Update quantity success:", result);
        setCart(result.data);
      } else {
        const errorData = await response.json();
        console.error("Error updating quantity:", errorData);
        alert(errorData.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Exception in handleUpdateQuantity:", error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    console.log(`Removing item ${itemId} from cart`);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/cart/remove/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Remove item response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Item removed successfully:", result);
        setCart(result.data);
      } else {
        console.error("Failed to remove item, status:", response.status);
        alert("Failed to remove item");
      }
    } catch (error) {
      console.error("Exception in handleRemoveItem:", error);
    }
  };

  const handleClearCart = async () => {
    console.log("Clear cart requested");
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      console.log("Cart clear cancelled by user");
      return;
    }

    console.log("Proceeding with cart clear");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Clear cart response status:", response.status);

      if (response.ok) {
        console.log("Cart cleared successfully");
        setCart({ items: [], total: 0 });
      } else {
        console.error("Failed to clear cart");
        alert("Failed to clear cart");
      }
    } catch (error) {
      console.error("Exception in handleClearCart:", error);
    }
  };

  const handleCheckout = async () => {
    console.log("Starting checkout process...");
    setPaymentProcessing(true);
    setPaymentError(null);

    try {
      const token = localStorage.getItem("token");
      console.log("Token available for checkout:", !!token);

      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("Fetching user profile...");
      const userResponse = await fetch("http://localhost:3001/api/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User profile response status:", userResponse.status);

      if (!userResponse.ok) {
        console.error(
          "Failed to fetch user profile, status:",
          userResponse.status
        );
        throw new Error("Failed to fetch user profile");
      }

      const userData = await userResponse.json();
      console.log("User profile fetched successfully:", userData);

      console.log("Initializing payment...");
      const paymentResponse = await fetch(
        "http://localhost:3001/api/payment/init",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      console.log("Payment init response status:", paymentResponse.status);

      if (!paymentResponse.ok) {
        console.error("Payment init failed, status:", paymentResponse.status);
        throw new Error("Failed to initialize payment");
      }

      const paymentData = await paymentResponse.json();
      console.log("Payment initialized successfully:", paymentData);

      if (!paymentData.success) {
        console.error("Payment data indicates failure:", paymentData.message);
        throw new Error(paymentData.message || "Payment initialization failed");
      }

      console.log("Setting order ID:", paymentData.data.orderId);
      setCurrentOrderId(paymentData.data.orderId);

      if (!window.payhere) {
        console.error("PayHere object not available in window");
        throw new Error(
          "Payment gateway not loaded. Please refresh and try again."
        );
      }

      console.log("Configuring PayHere callbacks");
      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("Payment completed. OrderID:", orderId);
        console.log("Clearing cart after successful payment");
        handleManualCartClear();
        console.log(
          "Starting payment status check for order:",
          paymentData.data.orderId
        );
        checkPaymentStatus(paymentData.data.orderId);
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed by user");
        setPaymentProcessing(false);
      };

      window.payhere.onError = function onError(error) {
        console.error("PayHere error:", error);
        setPaymentError("Payment failed: " + error);
        setPaymentProcessing(false);
      };

      const payment = {
        sandbox: true,
        merchant_id: paymentData.data.merchantId,
        return_url: undefined,
        cancel_url: undefined,
        notify_url: "http://localhost:3001/api/payment/notify",
        order_id: paymentData.data.orderId,
        items: paymentData.data.items,
        amount: paymentData.data.amount,
        currency: paymentData.data.currency,
        hash: paymentData.data.hash,
        first_name: userData.firstName || "Customer",
        last_name: userData.lastName || "",
        email: userData.email,
        phone: "0771234567",
        address: "Sample Address",
        city: "Colombo",
        country: "Sri Lanka",
      };

      console.log("Starting PayHere payment with config:", payment);

      console.log("Calling payhere.startPayment()");
      window.payhere.startPayment(payment);
      console.log("PayHere startPayment called successfully");
    } catch (error) {
      console.error("Checkout error:", error);
      setPaymentError(error.message || "An error occurred during checkout");
      setPaymentProcessing(false);
    }
  };

  const handleManualCartClear = async () => {
    console.log("Manually clearing cart after payment");
    try {
      const token = localStorage.getItem("token");
      console.log("Sending cart clear request");

      const response = await fetch("http://localhost:3001/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Manual cart clear response status:", response.status);

      if (response.ok) {
        console.log("Cart cleared successfully after payment");
        setCart({ items: [], total: 0 });
      } else {
        console.error("Failed to clear cart after payment");
      }
    } catch (error) {
      console.error("Exception in handleManualCartClear:", error);
    }
  };

  const checkPaymentStatus = async (orderId) => {
    console.log(
      `Checking payment status for order: ${orderId}, attempt: ${
        statusCheckAttempts + 1
      }`
    );

    try {
      console.log("Waiting briefly for payment to process...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Wait completed, proceeding with status check");

      const token = localStorage.getItem("token");
      console.log(`Making request to payment status API for order ${orderId}`);

      const response = await fetch(
        `http://localhost:3001/api/payment/status/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Payment status response status:", response.status);

      if (!response.ok) {
        console.error(
          "Failed to check payment status, status:",
          response.status
        );
        throw new Error("Failed to check payment status");
      }

      const result = await response.json();
      console.log("Payment status result:", result);

      if (result.data.status === "success") {
        console.log("Payment status: success");
        setPaymentSuccess(true);
        setCart({ items: [], total: 0 });
      } else if (result.data.status === "failed") {
        console.error("Payment status: failed");
        setPaymentError("Payment failed");
        setPaymentProcessing(false);
      } else {
        console.log(
          `Payment status: ${result.data.status}, checking again in 3 seconds...`
        );
        setStatusCheckAttempts((prev) => {
          console.log(
            `Increasing status check attempts from ${prev} to ${prev + 1}`
          );
          return prev + 1;
        });

        const newAttempts = statusCheckAttempts + 1;
        if (newAttempts < 3) {
          console.log(
            `Scheduling next check in 3 seconds, attempt ${newAttempts + 1}`
          );
          setTimeout(() => checkPaymentStatus(orderId), 3000);
        } else {
          console.log("Maximum retry attempts reached, stopping status checks");
          console.log("Assuming payment success based on PayHere completion");
          setPaymentSuccess(true);
          setCart({ items: [], total: 0 });
          handleManualCartClear();
        }
      }
    } catch (error) {
      console.error("Exception in checkPaymentStatus:", error);
      console.log(
        "Error occurred during status check, assuming success anyway"
      );
      setPaymentSuccess(true);
      setCart({ items: [], total: 0 });
      handleManualCartClear();
    }
  };

  console.log("Rendering component with state:", {
    cartItems: cart.items.length,
    loading,
    error,
    paymentProcessing,
    paymentSuccess,
  });

  if (loading) {
    console.log("Rendering loading state");
    return (
      <div>
        <NavBar />
        <div className="container mx-auto p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004581]"></div>
        </div>
      </div>
    );
  }

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
        <h1 className="title4">
          Shopping Cart
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {paymentError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {paymentError}
          </div>
        )}

        {paymentProcessing && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-3"></div>
            Processing your payment...
          </div>
        )}

        {cart.items.length === 0 && !loading && !error && !paymentSuccess ? (
          <div className="text-center py-10">
            <div className="text-7xl mb-4">🛒</div>
            <h2 className="text-2xl text-black font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add some products to your cart to see them here!
            </p>
            <button
              onClick={() => {
                console.log("Browse products clicked, navigating");
                navigate("/user/products");
              }}
              className="bg-[#004581] text-white px-6 py-2 rounded-md hover:bg-[#003366] transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <div key={item._id} className="py-6 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 w-full sm:w-32 h-32 mb-4 sm:mb-0">
                    <img
                      src={`http://localhost:3001/${item.furniture.image}`}
                      alt={item.furniture.title}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        console.error(
                          `Error loading image for ${item.furniture.title}`
                        );
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>

                  <div className="flex-grow sm:ml-6 flex flex-col sm:flex-row sm:justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.furniture.title}
                      </h3>

                      <div className="mt-1">
                        {item.furniture.discount > 0 ? (
                          <div className="flex items-center">
                            <span className="font-medium text-indigo-600">
                              $
                              {(
                                (item.furniture.price -
                                  (item.furniture.price *
                                    item.furniture.discount) /
                                    100) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                            <span className="ml-2 text-gray-400 line-through text-sm">
                              $
                              {(item.furniture.price * item.quantity).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-indigo-600">
                            ${(item.furniture.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                      <div className="flex items-center border rounded text-black">
                        <button
                          onClick={() => {
                            console.log(
                              `Decreasing quantity for ${item._id} from ${
                                item.quantity
                              } to ${item.quantity - 1}`
                            );
                            handleUpdateQuantity(item._id, item.quantity - 1);
                          }}
                          className="px-3 py-1 border-r hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button
                          onClick={() => {
                            console.log(
                              `Increasing quantity for ${item._id} from ${
                                item.quantity
                              } to ${item.quantity + 1}`
                            );
                            handleUpdateQuantity(item._id, item.quantity + 1);
                          }}
                          className="px-3 py-1 border-l hover:bg-gray-100"
                          disabled={item.quantity >= item.furniture.stockCount}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          console.log(
                            `Remove button clicked for item ${item._id}`
                          );
                          handleRemoveItem(item._id);
                        }}
                        className="text-red-500 hover:text-red-700"
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
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>${cart.total.toFixed(2)}</p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-between">
                <button
                  onClick={() => {
                    console.log("Clear cart button clicked");
                    handleClearCart();
                  }}
                  className="mb-4 sm:mb-0 bg-red-100 text-red-700 px-6 py-3 rounded-md hover:bg-red-200 transition"
                  disabled={paymentProcessing}
                >
                  Clear Cart
                </button>
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                  <button
                    onClick={() => {
                      console.log("Continue shopping button clicked");
                      navigate("/user/products");
                    }}
                    className="mb-4 sm:mb-0 border border-[#004581] text-[#004581] px-6 py-3 rounded-md hover:bg-gray-50 transition"
                    disabled={paymentProcessing}
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      console.log("Pay with PayHere button clicked");
                      handleCheckout();
                    }}
                    className="bg-[#004581] text-white px-6 py-3 rounded-md hover:bg-[#003366] transition"
                    disabled={cart.items.length === 0 || paymentProcessing}
                  >
                    {paymentProcessing ? "Processing..." : "Pay with PayHere"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
