import React, { useState } from 'react';
import Link from 'next/link'; // For navigation back to the login page
import axios from 'axios'; // For making API requests
import { CreateUser } from './../../apis'; // API endpoint for user registration
import { useRouter } from 'next/router';
const Register = () => {
    const router = useRouter()
    // State to manage form inputs
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});

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

        if (!formData.name) {
            newErrors.name = 'name is required';
        }

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

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm Password is required';
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        if (validateForm()) {
            try {
                // Call the registration API
                const response = await axios.post(CreateUser, formData);

                // Check if the API returned a token
                if (response.data.token) {
                    // Store the token in local storage
                    localStorage.setItem('token', response.data.token);

                    // Redirect to a protected page (e.g., dashboard)
                    router.push('/login');
                } else {
                    alert('Registration successful, but no token received.');
                }
            } catch (error) {
                console.error('Registration failed:', error.response?.data || error.message);
                alert('Registration failed. Please try again.');
            }
        } else {
            console.log('Form has errors:', errors);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            placeholder="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs italic">{errors.name}</p>
                        )}
                    </div>

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

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="confirmPassword"
                            type="password"
                            placeholder="******************"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs italic">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Register
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-bold text-blue-500 hover:text-blue-800"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;