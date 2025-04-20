import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';

export default function Dashboard() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('authToken');

      if (!token || user.role !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        const response = await Axios.get('http://localhost:3001/api/admin/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAdminData(response.data);
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Authentication failed. Redirecting to login...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014482]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#DEE8F1] font-inter">
      <h1 className="text-3xl font-bold text-[#014482]">Welcome to the Dashboard</h1>
    </div>
  );
}
