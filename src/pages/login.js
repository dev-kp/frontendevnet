'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { LoginUser } from '../../apis';
import { useRouter } from 'next/router';

const Login = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // State to manage validation errors
    const [errors, setErrors] = useState({});

    // State to manage API loading and error messages
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Handle input changes
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    // Validate form inputs
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        if (validateForm()) {
            setLoading(true); // Show loading state
            setApiError(''); // Clear previous API errors

            try {
                // Call the login API
                const response = await axios.post(LoginUser, formData);
                const userId = response.data.user._id;
                const token = response.data.token;
                console.log(userId)
                // Handle successful login
                // console.log('Login successful:', response.data);
                alert('Login successful!');
                // Redirect to dashboard or home page
                router.push('/dashboard'); // Client-side navigation
                localStorage.setItem('user', userId);
                localStorage.setItem('token', token);

            } catch (error) {
                // Handle API errors
                console.error('Login failed:', error.response?.data || error.message);
                setApiError(error.response?.data?.message || 'An error occurred during login.');
            } finally {
                setLoading(false); // Hide loading state
            }
        } else {
            console.log('Form has errors:', errors);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs italic">{errors.email}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs italic">{errors.password}</p>
                        )}
                    </div>

                    {apiError && (
                        <div className="mb-4">
                            <p className="text-red-500 text-sm text-center">{apiError}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                            type="submit"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                    </div>

                    <div className="text-center">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="font-bold text-blue-500 hover:text-blue-800"
                            >
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;