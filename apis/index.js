const defaultUrl = 'http://localhost:5000';

export const CreateUser = `${defaultUrl}/users/register`
export const LoginUser = `${defaultUrl}/users/login`
export const CreateEvent = `${defaultUrl}/events/create`
export const FetchEvents = `${defaultUrl}/events`
export const RegisterForEvent = (eventId) => {
    return `${defaultUrl}/events/${eventId}/register`;
}; export const FetchRegisteredUsers = (selectedEventId) => `${defaultUrl}/events/${selectedEventId}/registered-users`
