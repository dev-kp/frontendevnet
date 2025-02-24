import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreateEvent, FetchEvents, FetchRegisteredUsers, RegisterForEvent } from '../../apis';
import { useRouter } from 'next/router';

const Dashboard = () => {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        maxParticipants: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    useEffect(() => { console.log(localStorage.getItem('token')) }, [])
    // Fetch events with search and pagination
    const fetchEvents = async (page = 1, query = '') => {
        try {
            const response = await axios.get(FetchEvents, {
                params: {
                    page,
                    limit: 10,
                    search: query,
                },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            console.log(response.data.events)
            setEvents(response.data.events);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching events:', error);
            alert('Failed to fetch events. Please try again.');
        }
    };

    // Fetch events on component mount
    useEffect(() => {
        fetchEvents(currentPage, searchQuery);
    }, []); // Empty dependency array to run only once on mount

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle search on Enter key press
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1); // Reset to the first page when searching
            fetchEvents(1, searchQuery);
        }
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchEvents(page, searchQuery);
    };

    // Open modal with selected event
    const openEventModal = (event) => {
        setSelectedEvent(event);
    };

    // Close modal
    const closeEventModal = () => {
        setSelectedEvent(null);
        setRegisteredUsers([]);

    };
    const handleRegister = async () => {
        if (!selectedEvent) {
            alert('No event selected for registration.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (!token || !user) {
                alert('Please login to register for the event.');
                return;
            }



            const response = await axios.post(
                RegisterForEvent(selectedEvent._id),
                { userId: user._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`Successfully registered for: ${selectedEvent.title}`);
            closeEventModal();
            fetchEvents(currentPage, searchQuery);

        } catch (error) {
            console.error('Registration failed:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Failed to register.';
            alert(errorMessage);
            closeEventModal();
        }
    };
    const fetchRegisteredUsers = async () => {
        if (!selectedEvent) return;
        setIsLoadingUsers(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to view registered users.');
                return;
            }

            const response = await axios.get(FetchRegisteredUsers(selectedEvent._id), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.users && response.data.users.length > 0) {
                setRegisteredUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error fetching registered users:', error);
            alert('Failed to fetch registered users.');
        }

        setIsLoadingUsers(false);
    };



    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    // Open Create Event modal
    const openCreateEventModal = () => {
        setIsCreateEventModalOpen(true);
    };

    // Close Create Event modal
    const closeCreateEventModal = () => {
        setIsCreateEventModalOpen(false);
        setEventForm({
            title: '',
            description: '',
            date: '',
            location: '',
            maxParticipants: '',
        });
        setErrors({});
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventForm({
            ...eventForm,
            [name]: value,
        });
    };

    // Handle form submission
    const handleCreateEvent = async (e) => {
        e.preventDefault();

        // Validation checks
        const errors = {};

        if (!eventForm.title.trim()) {
            errors.title = 'Title is required';
        }

        if (!eventForm.date) {
            errors.date = 'Date is required';
        } else if (new Date(eventForm.date) < new Date()) {
            errors.date = 'Date must be in the future';
        }

        if (!eventForm.location.trim()) {
            errors.location = 'Location is required';
        }

        if (!eventForm.maxParticipants) {
            errors.maxParticipants = 'Max Participants is required';
        } else if (eventForm.maxParticipants <= 0) {
            errors.maxParticipants = 'Max Participants must be a positive number';
        }

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        try {

            const eventData = {
                ...eventForm,
                createdBy: localStorage.getItem('user'),
            };


            const response = await axios.post(CreateEvent, eventData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

            setEvents([...events, response.data]);

            closeCreateEventModal();
            fetchEvents(currentPage, searchQuery);
            alert('Event created successfully!');
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Events Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchSubmit}
                        className="shadow appearance-none border rounded w-64 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={openCreateEventModal}
                    >
                        Create Event
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Max Participants
                            </th> */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                            <tr
                                key={event._id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => openEventModal(event)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {event.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {event.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(event.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {event.location}
                                </td>
                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {event.registeredUsers.length} / {event.maxParticipants}
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-6">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        className={`mx-1 px-4 py-2 rounded ${currentPage === index + 1
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedEvent.title}</h2>
                        <p className="text-gray-600 mb-6">{selectedEvent.description}</p>
                        <p className="text-gray-600">Date: {selectedEvent.date}</p>
                        <p className="text-gray-600">Location: {selectedEvent.location}</p>
                        <p className="text-gray-600">Max Participants: {selectedEvent.maxParticipants}</p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                onClick={closeEventModal}
                            >
                                Close
                            </button>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleRegister}
                            >
                                Register
                            </button>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={fetchRegisteredUsers}
                            >
                                View Members
                            </button>
                        </div>
                        {isLoadingUsers && <p className="mt-4 text-center text-gray-600">Loading members...</p>}
                        {registeredUsers.length > 0 ? (
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-green-500">Registered Members:</h3>

                                <ul className="mt-2">
                                    {registeredUsers.map((user) => (
                                        <li key={user._id} className="text-gray-700">{user.name} ({user.email})</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="mt-4 text-center text-gray-600">No members registered yet.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {isCreateEventModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Event</h2>
                        <form onSubmit={handleCreateEvent}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                    Title
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="title"
                                    type="text"
                                    name="title"
                                    placeholder="Event Title"
                                    value={eventForm.title}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-xs italic">{errors.title}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="description"
                                    name="description"
                                    placeholder="Event Description"
                                    value={eventForm.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                                    Date
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="date"
                                    type="date"
                                    name="date"
                                    value={eventForm.date}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.date && (
                                    <p className="text-red-500 text-xs italic">{errors.date}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                                    Location
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="location"
                                    type="text"
                                    name="location"
                                    placeholder="Event Location"
                                    value={eventForm.location}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.location && (
                                    <p className="text-red-500 text-xs italic">{errors.location}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxParticipants">
                                    Max Participants
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="maxParticipants"
                                    type="number"
                                    name="maxParticipants"
                                    placeholder="Max Participants"
                                    value={eventForm.maxParticipants}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.maxParticipants && (
                                    <p className="text-red-500 text-xs italic">{errors.maxParticipants}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    type="button"
                                    onClick={closeCreateEventModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    type="submit"
                                >
                                    Create Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;