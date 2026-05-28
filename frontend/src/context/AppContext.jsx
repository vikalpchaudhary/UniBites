import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const API_BASE_URL = 'http://127.0.0.1:8000';

// Pre-seeded mock data in case backend server is down/not running
const MOCK_OUTLETS = [
  {
    id: 1,
    name: "Dev's Cafe",
    location: "Ground Floor, Block H (Near Main Lawns)",
    image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60",
    is_open: true,
    items: [
      { id: 101, outlet_id: 1, name: "Cold Coffee with Ice Cream", description: "Rich creamy espresso blended with vanilla ice cream", price: 90.0, category: "Beverages", is_veg: true, is_available: true },
      { id: 102, outlet_id: 1, name: "Paneer Tikka Grilled Sandwich", description: "Spicy paneer tikka stuffed inside whole wheat grilled bread", price: 120.0, category: "Snacks", is_veg: true, is_available: true },
      { id: 103, outlet_id: 1, name: "Chicken Club Sandwich", description: "Double decker toasted bread with grilled chicken, egg, lettuce and mayo", price: 140.0, category: "Snacks", is_veg: false, is_available: true },
      { id: 104, outlet_id: 1, name: "Chocolate Brownie Fudge", description: "Warm chocolate brownie topped with chocolate hot fudge", price: 80.0, category: "Desserts", is_veg: true, is_available: true },
      { id: 105, outlet_id: 1, name: "Iced Peach Tea", description: "Refreshing cold brewed tea infused with peach syrup", price: 70.0, category: "Beverages", is_veg: true, is_available: true }
    ]
  },
  {
    id: 2,
    name: "Kathi Roll Junction",
    location: "Tuck Shop Area (Block F)",
    image_url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60",
    is_open: true,
    items: [
      { id: 201, outlet_id: 2, name: "Double Egg Roll", description: "Fresh flatbread wrapped with 2 eggs, onions, mint sauce", price: 75.0, category: "Rolls", is_veg: false, is_available: true },
      { id: 202, outlet_id: 2, name: "Single Paneer Tikka Roll", description: "Marinated paneer chunks grilled and wrapped with fresh veggies", price: 90.0, category: "Rolls", is_veg: true, is_available: true },
      { id: 203, outlet_id: 2, name: "Double Chicken Roll", description: "Extra loaded grilled chicken wrapped with pickled onion and spicy chutney", price: 120.0, category: "Rolls", is_veg: false, is_available: true },
      { id: 204, outlet_id: 2, name: "Masala Fries", description: "Crispy golden potato fries tossed in spicy peri-peri masala", price: 60.0, category: "Sides", is_veg: true, is_available: true },
      { id: 205, outlet_id: 2, name: "Fresh Lime Soda", description: "Sweet and salty fizz with fresh squeezed lemon juice", price: 40.0, category: "Beverages", is_veg: true, is_available: true }
    ]
  },
  {
    id: 3,
    name: "Maggi & Tea Hotspot",
    location: "Boys Hostel 1 Courtyard",
    image_url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&auto=format&fit=crop&q=60",
    is_open: true,
    items: [
      { id: 301, outlet_id: 3, name: "Classic Butter Maggi", description: "Comforting hot maggi prepared with lots of butter", price: 45.0, category: "Maggi", is_veg: true, is_available: true },
      { id: 302, outlet_id: 3, name: "Cheese & Corn Maggi", description: "Maggi topped with melted cheddar cheese and sweet corn", price: 65.0, category: "Maggi", is_veg: true, is_available: true },
      { id: 303, outlet_id: 3, name: "Spicy Egg & Veg Maggi", description: "Maggi cooked with scrambled egg, onions, capsicum and green chillies", price: 75.0, category: "Maggi", is_veg: false, is_available: true },
      { id: 304, outlet_id: 3, name: "Adrak Elaichi Chai (Ginger Cardamom)", description: "Special university student hot brewed milk tea", price: 20.0, category: "Teas", is_veg: true, is_available: true },
      { id: 305, outlet_id: 3, name: "Hot Chocolate", description: "Creamy rich steamed cocoa drink", price: 60.0, category: "Beverages", is_veg: true, is_available: true }
    ]
  },
  {
    id: 4,
    name: "BUN Mess Menu Helper",
    location: "Student Mess (Ground Floor, Block D)",
    image_url: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=500&auto=format&fit=crop&q=60",
    is_open: true,
    items: [
      { id: 401, outlet_id: 4, name: "Breakfast: Poha, Sprouts, Boiled Eggs, Tea", description: "Served 7:30 AM to 9:30 AM", price: 0.0, category: "Mess Menu", is_veg: true, is_available: true },
      { id: 402, outlet_id: 4, name: "Lunch: Paneer Butter Masala, Dal Makhani, Roti, Rice, Boondi Raita", description: "Served 12:30 PM to 2:30 PM", price: 0.0, category: "Mess Menu", is_veg: true, is_available: true },
      { id: 403, outlet_id: 4, name: "Snacks: Veg Samosa with Mint Chutney, Tea/Coffee", description: "Served 5:00 PM to 6:30 PM", price: 0.0, category: "Mess Menu", is_veg: true, is_available: true },
      { id: 404, outlet_id: 4, name: "Dinner: Chicken Curry / Shahi Paneer, Jeera Aloo, Mix Dal, Tandoori Roti, Rice, Kheer", description: "Served 7:30 PM to 9:30 PM", price: 0.0, category: "Mess Menu", is_veg: true, is_available: true }
    ]
  }
];

const MOCK_USERS = [
  { id: 1, name: "Rahul Sharma", email: "student@bennett.edu.in", role: "student" },
  { id: 2, name: "Devendra Singh", email: "owner@bennett.edu.in", role: "owner", outlet_id: 1 },
  { id: 3, name: "Kathi Shop Owner", email: "kathi_owner@bennett.edu.in", role: "owner", outlet_id: 2 },
  { id: 4, name: "Maggi Shop Owner", email: "maggi_owner@bennett.edu.in", role: "owner", outlet_id: 3 },
  { id: 5, name: "Food Department Head", email: "admin@bennett.edu.in", role: "admin" }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('unibites_user');
    try {
      return saved ? JSON.parse(saved) : {
        id: 1,
        name: "Rahul Sharma",
        email: "student@bennett.edu.in",
        role: "student"
      };
    } catch (e) {
      return {
        id: 1,
        name: "Rahul Sharma",
        email: "student@bennett.edu.in",
        role: "student"
      };
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('unibites_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('unibites_user');
    }
  }, [user]);

  const [outlets, setOutlets] = useState(MOCK_OUTLETS);
  const [cart, setCart] = useState([]); // Array of { item, quantity }
  const [orders, setOrders] = useState([]);
  const [activePage, setActivePage] = useState('browse'); // browse, outlet-detail, orders, owner-dashboard, mess-helper
  const [selectedOutletId, setSelectedOutletId] = useState(null);
  const [usingMock, setUsingMock] = useState(false);
  const [backendActive, setBackendActive] = useState(false);
  const [users, setUsers] = useState(MOCK_USERS);

  // Fetch Outlets on load
  const loadOutlets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/outlets`);
      if (response.ok) {
        const data = await response.json();
        // If they don't have items mapped, standard fetch details. FastAPI maps them
        setOutlets(data);
        setBackendActive(true);
        setUsingMock(false);
      } else {
        throw new Error('Fallback to mock');
      }
    } catch (e) {
      console.warn("Backend server not reached. Running in standalone mock mode.", e);
      setOutlets(MOCK_OUTLETS);
      setBackendActive(false);
      setUsingMock(true);
    }
  };

  useEffect(() => {
    loadOutlets();
  }, []);

  // Sync orders for user or owner
  const loadOrders = async () => {
    if (!user) return;
    try {
      if (user.role === 'owner' && user.outlet_id) {
        const response = await fetch(`${API_BASE_URL}/api/outlets/${user.outlet_id}/orders`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      }
    } catch (e) {
      // In mock mode, we do nothing; the state orders persist locally
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Poll orders every 5s
    return () => clearInterval(interval);
  }, [user]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        if (data.role === 'owner') {
          setActivePage('owner-dashboard');
        } else if (data.role === 'admin') {
          setActivePage('admin-dashboard');
        } else {
          setActivePage('browse');
        }
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, detail: error.detail || "Authentication Failed" };
      }
    } catch (e) {
      // Fallback local mock authentication
      if (email === 'student@bennett.edu.in' && password === 'student123') {
        setUser({ id: 1, name: "Rahul Sharma", email, role: "student" });
        setActivePage('browse');
        return { success: true };
      } else if (email === 'owner@bennett.edu.in' && password === 'owner123') {
        setUser({ id: 2, name: "Devendra Singh", email, role: "owner", outlet_id: 1 });
        setActivePage('owner-dashboard');
        return { success: true };
      } else if (email === 'kathi_owner@bennett.edu.in' && password === 'owner123') {
        setUser({ id: 3, name: "Kathi Shop Owner", email, role: "owner", outlet_id: 2 });
        setActivePage('owner-dashboard');
        return { success: true };
      } else if (email === 'maggi_owner@bennett.edu.in' && password === 'owner123') {
        setUser({ id: 4, name: "Maggi Shop Owner", email, role: "owner", outlet_id: 3 });
        setActivePage('owner-dashboard');
        return { success: true };
      } else if (email === 'admin@bennett.edu.in' && password === 'admin123') {
        setUser({ id: 5, name: "Food Department Head", email, role: "admin" });
        setActivePage('admin-dashboard');
        return { success: true };
      }
      return { success: false, detail: "Server offline & invalid mock credentials" };
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setActivePage('browse');
  };

  const switchUserRole = (role) => {
    if (role === 'owner') {
      const targetId = selectedOutletId || 1;
      let ownerEmail = "owner@bennett.edu.in";
      let ownerName = "Devendra Singh";
      if (targetId === 2) {
        ownerEmail = "kathi_owner@bennett.edu.in";
        ownerName = "Kathi Shop Owner";
      } else if (targetId === 3) {
        ownerEmail = "maggi_owner@bennett.edu.in";
        ownerName = "Maggi Shop Owner";
      }
      setUser({ id: 10 + targetId, name: ownerName, email: ownerEmail, role: "owner", outlet_id: targetId });
      setActivePage('owner-dashboard');
    } else {
      setUser({ id: 1, name: "Rahul Sharma", email: "student@bennett.edu.in", role: "student" });
      setActivePage('browse');
    }
  };

  // Cart Operations
  const addToCart = (item) => {
    setCart(prevCart => {
      // Check if item is from a different outlet
      if (prevCart.length > 0 && prevCart[0].item.outlet_id !== item.outlet_id) {
        // Clear cart first if adding from different outlet
        alert("You have items from another outlet in your cart. Clearing previous items.");
        return [{ item, quantity: 1 }];
      }
      const existing = prevCart.find(i => i.item.id === item.id);
      if (existing) {
        return prevCart.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prevCart.map(i => i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prevCart.filter(i => i.item.id !== itemId);
    });
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  };

  // Order Placement
  const placeOrder = async () => {
    if (cart.length === 0) return;
    const outletId = cart[0].item.outlet_id;
    const targetOutlet = outlets.find(o => o.id === outletId);

    const orderPayload = {
      outlet_id: outletId,
      items: cart.map(c => ({
        menu_item_id: c.item.id,
        quantity: c.quantity
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const newOrder = await response.json();
        setOrders(prev => [newOrder, ...prev]);
        clearCart();
        setActivePage('orders');
        return newOrder;
      } else {
        throw new Error('API order failed');
      }
    } catch (e) {
      // Mock order creation
      const mockNewOrder = {
        id: Math.floor(Math.random() * 9000) + 1000,
        user_id: user.id,
        outlet_id: outletId,
        total_amount: getCartTotal(),
        status: "pending",
        created_at: new Date().toISOString(),
        outlet: {
          name: targetOutlet.name,
          location: targetOutlet.location
        },
        items: cart.map((c, index) => ({
          id: index + 1000,
          menu_item_id: c.item.id,
          quantity: c.quantity,
          price_at_order: c.item.price,
          menu_item: c.item
        }))
      };

      setOrders(prev => [mockNewOrder, ...prev]);
      clearCart();
      setActivePage('orders');
      return mockNewOrder;
    }
  };

  // Order status update (For Owner)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updated = await response.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      }
    } catch (e) {
      // Mock order update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  // Outlet toggle status (For Owner)
  const toggleOutletStatus = async (outletId, isOpen) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/outlets/${outletId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_open: isOpen, name: '', location: '' })
      });
      if (response.ok) {
        const updated = await response.json();
        setOutlets(prev => prev.map(o => o.id === outletId ? { ...o, is_open: updated.is_open } : o));
      }
    } catch (e) {
      // Mock outlet toggle
      setOutlets(prev => prev.map(o => o.id === outletId ? { ...o, is_open: isOpen } : o));
    }
  };

  // Menu item availability toggle (For Owner)
  const toggleItemAvailability = async (itemId, isAvailable) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu-items/${itemId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: isAvailable, name: '', price: 0.0, category: '' })
      });
      if (response.ok) {
        // Reload outlets to reflect availability
        loadOutlets();
      }
    } catch (e) {
      // Mock availability toggle
      setOutlets(prev => prev.map(o => {
        const items = o.items.map(i => i.id === itemId ? { ...i, is_available: isAvailable } : i);
        return { ...o, items };
      }));
    }
  };

  // Add a new product (For Owner)
  const addMenuItem = async (outletId, itemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/outlets/${outletId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (response.ok) {
        loadOutlets();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      // Mock local addition
      setOutlets(prev => prev.map(o => {
        if (o.id === outletId) {
          const newItem = { id: Math.floor(Math.random() * 1000) + 500, outlet_id: outletId, ...itemData, is_available: true };
          return { ...o, items: [...(o.items || []), newItem] };
        }
        return o;
      }));
      return { success: true };
    }
  };

  // Edit a product (For Owner)
  const editMenuItem = async (itemId, itemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (response.ok) {
        loadOutlets();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      // Mock local edit
      setOutlets(prev => prev.map(o => {
        const items = (o.items || []).map(i => i.id === itemId ? { ...i, ...itemData } : i);
        return { ...o, items };
      }));
      return { success: true };
    }
  };

  // Delete a product (For Owner)
  const deleteMenuItem = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu-items/${itemId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadOutlets();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      // Mock local delete
      setOutlets(prev => prev.map(o => {
        const items = (o.items || []).filter(i => i.id !== itemId);
        return { ...o, items };
      }));
      return { success: true };
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (e) {
      console.warn("Backend not reached for admin user list. Using mock data.", e);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAllUsers();
    }
  }, [user]);

  const addOutlet = async (outletData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/outlets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outletData)
      });
      if (response.ok) {
        loadOutlets();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      setOutlets(prev => {
        const newId = Math.max(...prev.map(o => o.id), 0) + 1;
        const newOutlet = { id: newId, ...outletData, items: [] };
        return [...prev, newOutlet];
      });
      return { success: true };
    }
  };

  const editOutlet = async (outletId, outletData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/outlets/${outletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outletData)
      });
      if (response.ok) {
        loadOutlets();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      setOutlets(prev => prev.map(o => o.id === outletId ? { ...o, ...outletData } : o));
      return { success: true };
    }
  };

  const deleteOutlet = async (outletId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/outlets/${outletId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadOutlets();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      setOutlets(prev => prev.filter(o => o.id !== outletId));
      return { success: true };
    }
  };

  const assignOwnerToOutlet = async (userId, outletId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/outlet`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outlet_id: outletId })
      });
      if (response.ok) {
        loadAllUsers();
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, outlet_id: outletId } : u));
      return { success: true };
    }
  };

  const getOutletDetail = () => {
    return outlets.find(o => o.id === selectedOutletId);
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      switchUserRole,
      outlets,
      selectedOutletId,
      setSelectedOutletId,
      getOutletDetail,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      placeOrder,
      orders,
      updateOrderStatus,
      toggleOutletStatus,
      toggleItemAvailability,
      addMenuItem,
      editMenuItem,
      deleteMenuItem,
      activePage,
      setActivePage,
      backendActive,
      usingMock,
      users,
      loadAllUsers,
      addOutlet,
      editOutlet,
      deleteOutlet,
      assignOwnerToOutlet
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
