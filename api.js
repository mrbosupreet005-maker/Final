// Simple API utility for AyurSutra
class API {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('auth_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // If backend is not available, use mock data
            if (!response.ok || response.status === 404) {
                console.log('Backend not available, using mock data for:', endpoint);
                return this.getMockResponse(endpoint, options);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.log('API Error, using mock data for:', endpoint, error.message);
            // Always return mock data for demo purposes
            return this.getMockResponse(endpoint, options);
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Mock responses for demo purposes
    getMockResponse(endpoint, options) {
        console.log('Using mock data for:', endpoint);
        
        // Mock sessions data
        if (endpoint.includes('/sessions')) {
            if (options.method === 'POST') {
                return {
                    success: true,
                    message: 'Session created successfully',
                    data: {
                        id: Math.floor(Math.random() * 1000),
                        ...JSON.parse(options.body || '{}'),
                        status: 'scheduled',
                        created_at: new Date().toISOString()
                    }
                };
            }
            return {
                success: true,
                data: {
                    sessions: [
                        {
                            id: 1,
                            scheduled_date: new Date().toISOString().split('T')[0],
                            scheduled_time: '10:00',
                            duration_minutes: 60,
                            status: 'scheduled',
                            treatment_name: 'Ayurvedic Massage',
                            practitioner_first_name: 'Dr. Sarah',
                            practitioner_last_name: 'Johnson'
                        },
                        {
                            id: 2,
                            scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            scheduled_time: '14:00',
                            duration_minutes: 45,
                            status: 'confirmed',
                            treatment_name: 'Yoga Therapy',
                            practitioner_first_name: 'Dr. Michael',
                            practitioner_last_name: 'Chen'
                        }
                    ]
                }
            };
        }

        // Mock practitioners data
        if (endpoint.includes('/practitioners')) {
            return {
                success: true,
                data: {
                    practitioners: [
                        { id: 1, user: { first_name: 'Dr. Sarah', last_name: 'Johnson' }, specialization: 'Ayurvedic Medicine' },
                        { id: 2, user: { first_name: 'Dr. Michael', last_name: 'Chen' }, specialization: 'Yoga Therapy' },
                        { id: 3, user: { first_name: 'Dr. Priya', last_name: 'Sharma' }, specialization: 'Herbal Medicine' }
                    ]
                }
            };
        }

        // Mock treatments data
        if (endpoint.includes('/programs/treatments')) {
            return {
                success: true,
                data: {
                    treatments: [
                        { id: 1, name: 'Ayurvedic Massage', duration_minutes: 60, price: 80 },
                        { id: 2, name: 'Yoga Therapy', duration_minutes: 45, price: 60 },
                        { id: 3, name: 'Herbal Consultation', duration_minutes: 30, price: 40 },
                        { id: 4, name: 'Meditation Session', duration_minutes: 30, price: 35 }
                    ]
                }
            };
        }

        // Mock schedule stats
        if (endpoint.includes('/schedule/stats')) {
            return {
                success: true,
                data: {
                    upcomingSessions: 3,
                    completedSessions: 12,
                    averageRating: 4.5
                }
            };
        }

        // Mock session management endpoints
        if (endpoint.includes('/session-management')) {
            if (endpoint.includes('/start')) {
                return {
                    success: true,
                    message: 'Session started successfully',
                    data: {
                        session_id: endpoint.split('/')[3],
                        status: 'in_progress',
                        started_at: new Date().toISOString()
                    }
                };
            }
            
            if (endpoint.includes('/complete')) {
                return {
                    success: true,
                    message: 'Session completed successfully',
                    data: {
                        session_id: endpoint.split('/')[3],
                        status: 'completed',
                        completed_at: new Date().toISOString()
                    }
                };
            }
            
            if (endpoint.includes('/reschedule')) {
                return {
                    success: true,
                    message: 'Reschedule request submitted successfully',
                    data: {
                        id: Math.floor(Math.random() * 1000),
                        session_id: endpoint.split('/')[3],
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                };
            }
            
            if (endpoint.includes('/wellness/log')) {
                return {
                    success: true,
                    message: 'Wellness logged successfully',
                    data: {
                        id: Math.floor(Math.random() * 1000),
                        log_date: new Date().toISOString().split('T')[0],
                        ...JSON.parse(options.body || '{}'),
                        created_at: new Date().toISOString()
                    }
                };
            }
            
            if (endpoint.includes('/symptoms')) {
                if (options.method === 'POST') {
                    return {
                        success: true,
                        message: 'Symptoms updated successfully',
                        data: {
                            id: Math.floor(Math.random() * 1000),
                            ...JSON.parse(options.body || '{}'),
                            created_at: new Date().toISOString()
                        }
                    };
                }
                return {
                    success: true,
                    data: [
                        { id: 1, symptom_name: 'Headache', severity: 6, description: 'Mild headache', duration_days: 2 },
                        { id: 2, symptom_name: 'Fatigue', severity: 4, description: 'Feeling tired', duration_days: 1 }
                    ]
                };
            }
            
            if (endpoint.includes('/wellness/today')) {
                return {
                    success: true,
                    data: {
                        id: 1,
                        log_date: new Date().toISOString().split('T')[0],
                        energy_level: 4,
                        sleep_quality: 3,
                        mood: 4,
                        stress_level: 2,
                        symptoms: 'Feeling good today',
                        notes: 'Had a great day'
                    }
                };
            }
        }

        // Mock schedule reviews
        if (endpoint.includes('/schedule/reviews')) {
            return {
                success: true,
                message: 'Review submitted successfully',
                data: {
                    id: Math.floor(Math.random() * 1000),
                    ...JSON.parse(options.body || '{}'),
                    created_at: new Date().toISOString()
                }
            };
        }

        // Mock quick booking
        if (endpoint.includes('/schedule/quick-book')) {
            return {
                success: true,
                message: 'Session booked successfully',
                data: {
                    id: Math.floor(Math.random() * 1000),
                    ...JSON.parse(options.body || '{}'),
                    status: 'scheduled',
                    created_at: new Date().toISOString()
                }
            };
        }

        // Default mock response
        return {
            success: true,
            message: 'Operation completed successfully',
            data: {}
        };
    }
}

// Create global API instance
window.api = new API();
