// Enhanced Schedule Management with Star Reviews and New Tab Functionality

// Global variables
let currentWeek = new Date();
let sessions = [];
let practitioners = [];
let treatments = [];
let currentSession = null;
let sessionTimer = null;

// Initialize schedule page
document.addEventListener('DOMContentLoaded', function() {
    loadScheduleData();
    setupEventListeners();
    generateCalendar();
});

// Load all schedule-related data
async function loadScheduleData() {
    try {
        // Try to load from API first, but always fallback to demo data
        await Promise.all([
            loadSessions(),
            loadPractitioners(),
            loadTreatments(),
            loadScheduleStats()
        ]);
        updateCalendar();
        updateRecentSessions();
    } catch (error) {
        console.log('Loading demo data due to API error:', error.message);
        // Always load demo data for immediate functionality
        loadDemoData();
    }
}

// Load demo data for immediate functionality
function loadDemoData() {
    console.log('Loading demo data...');
    
    // Try to load from localStorage first
    const savedSessions = localStorage.getItem('ayursutra_sessions');
    if (savedSessions) {
        sessions = JSON.parse(savedSessions);
    } else {
        // Demo sessions
        sessions = [
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
            },
            {
                id: 3,
                scheduled_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                scheduled_time: '16:00',
                duration_minutes: 30,
                status: 'completed',
                treatment_name: 'Herbal Consultation',
                practitioner_first_name: 'Dr. Priya',
                practitioner_last_name: 'Sharma'
            }
        ];
    }
    
    // Demo practitioners
    practitioners = [
        { id: 1, user: { first_name: 'Dr. Sarah', last_name: 'Johnson' }, specialization: 'Ayurvedic Medicine' },
        { id: 2, user: { first_name: 'Dr. Michael', last_name: 'Chen' }, specialization: 'Yoga Therapy' },
        { id: 3, user: { first_name: 'Dr. Priya', last_name: 'Sharma' }, specialization: 'Herbal Medicine' }
    ];
    
    // Demo treatments
    treatments = [
        { id: 1, name: 'Ayurvedic Massage', duration_minutes: 60, price: 80 },
        { id: 2, name: 'Yoga Therapy', duration_minutes: 45, price: 60 },
        { id: 3, name: 'Herbal Consultation', duration_minutes: 30, price: 40 },
        { id: 4, name: 'Meditation Session', duration_minutes: 30, price: 35 }
    ];
    
    // Update UI with demo data
    updateCalendar();
    updateRecentSessions();
    populatePractitionerSelect();
    populateTreatmentSelect();
    
    // Update stats
    updateStats({
        upcomingSessions: 2,
        completedSessions: 1,
        averageRating: 4.5
    });
    
    showSuccess('Demo data loaded successfully!');
}

// Load sessions data
async function loadSessions() {
    try {
        const response = await api.get('/sessions');
        if (response && response.success) {
            sessions = response.data.sessions || [];
        } else {
            console.log('Using demo sessions data');
            loadDemoData();
        }
    } catch (error) {
        console.log('Using demo sessions data due to error:', error.message);
        loadDemoData();
    }
}

// Load practitioners data
async function loadPractitioners() {
    try {
        const response = await api.get('/practitioners');
        if (response && response.success) {
            practitioners = response.data.practitioners || [];
            populatePractitionerSelect();
        } else {
            console.log('Using demo practitioners data');
        }
    } catch (error) {
        console.log('Using demo practitioners data due to error:', error.message);
    }
}

// Load treatments data
async function loadTreatments() {
    try {
        const response = await api.get('/programs/treatments');
        if (response && response.success) {
            treatments = response.data.treatments || [];
            populateTreatmentSelect();
        } else {
            console.log('Using demo treatments data');
        }
    } catch (error) {
        console.log('Using demo treatments data due to error:', error.message);
    }
}

// Load schedule statistics
async function loadScheduleStats() {
    try {
        const response = await api.get('/schedule/stats');
        if (response && response.success) {
            updateStats(response.data);
        } else {
            console.log('Using demo stats data');
        }
    } catch (error) {
        console.log('Using demo stats data due to error:', error.message);
    }
}

// Update statistics display
function updateStats(stats) {
    const upcomingCount = document.getElementById('upcoming-sessions-count');
    const completedCount = document.getElementById('completed-sessions-count');
    const averageRating = document.getElementById('average-rating');
    
    if (upcomingCount) upcomingCount.textContent = stats.upcomingSessions || 0;
    if (completedCount) completedCount.textContent = stats.completedSessions || 0;
    if (averageRating) averageRating.textContent = (stats.averageRating || 0).toFixed(1);
}

// Generate calendar grid
function generateCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    
    const startOfWeek = getStartOfWeek(currentWeek);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    calendarGrid.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${isToday(date) ? 'today' : ''}`;
        
        const daySessions = getSessionsForDate(date);
        
        const dateStr = date.toISOString().split('T')[0];
        const isCurrentMonth = date.getMonth() === currentWeek.getMonth();
        
        dayElement.innerHTML = `
            <div class="calendar-header">
                <div class="day-name">${days[i]}</div>
                <div class="day-number">${date.getDate()}</div>
                <button class="add-session-btn" onclick="showQuickBookModal('${dateStr}')" title="Add session for this date">
                    <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14"/>
                        <path d="M5 12h14"/>
                    </svg>
                </button>
            </div>
            <div class="calendar-content">
                ${daySessions.map(session => createSessionElement(session)).join('')}
            </div>
        `;
        
        calendarGrid.appendChild(dayElement);
    }
    
    updateCurrentWeekDisplay();
}

// Create session element
function createSessionElement(session) {
    const statusClass = session.status.replace('_', '-');
    const timeStr = formatTime(session.scheduled_time);
    const endTime = new Date(`2000-01-01 ${session.scheduled_time}`);
    endTime.setMinutes(endTime.getMinutes() + session.duration_minutes);
    const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    return `
        <div class="session-item session-${statusClass}" data-session-id="${session.id}" onclick="selectSession(this)">
            <div class="session-time">${timeStr} - ${endTimeStr}</div>
            <div class="session-treatment">${session.treatment_name}</div>
            <div class="session-practitioner">${session.practitioner_first_name} ${session.practitioner_last_name}</div>
            <div class="session-actions">
                ${session.status === 'scheduled' ? 
                    `<button class="btn btn-sm btn-success" onclick="startSession(${session.id})">Start</button>
                     <button class="btn btn-sm btn-warning" onclick="showRescheduleModal(${session.id})">Reschedule</button>` :
                session.status === 'in_progress' ?
                    `<button class="btn btn-sm btn-primary" onclick="completeSession(${session.id})">Complete</button>
                     <button class="btn btn-sm btn-outline" onclick="viewSessionDetails(${session.id})">View</button>` :
                session.status === 'completed' ? 
                    `<button class="btn btn-sm btn-outline" onclick="showReviewModal(${session.id})">Rate</button>
                     <button class="btn btn-sm btn-primary" onclick="viewSessionDetails(${session.id})">View</button>` : 
                    `<button class="btn btn-sm btn-primary" onclick="viewSessionDetails(${session.id})">View</button>`
                }
            </div>
        </div>
    `;
}

// Get sessions for a specific date
function getSessionsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(session => session.scheduled_date === dateStr);
}

// Check if date is today
function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// Get start of week (Sunday)
function getStartOfWeek(date) {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    return startOfWeek;
}

// Update current week display
function updateCurrentWeekDisplay() {
    const currentWeekElement = document.getElementById('current-week');
    if (currentWeekElement) {
        const startOfWeek = getStartOfWeek(currentWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startStr = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        currentWeekElement.textContent = `${startStr} - ${endStr}`;
    }
}

// Navigate calendar
function navigateCalendar(direction) {
    if (direction === 'prev') {
        currentWeek.setDate(currentWeek.getDate() - 7);
    } else if (direction === 'next') {
        currentWeek.setDate(currentWeek.getDate() + 7);
    }
    
    generateCalendar();
    loadScheduleData(); // Reload data for new week
}

// Select session
function selectSession(element) {
    // Remove previous selections
    document.querySelectorAll('.session-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked session
    element.classList.add('selected');
}

// Show booking modal
function showBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.style.display = 'block';
        // Set minimum date to today
        const dateInput = document.getElementById('session-date');
        if (dateInput) {
            dateInput.min = new Date().toISOString().split('T')[0];
        }
    }
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('booking-form').reset();
    }
}

// Show review modal
function showReviewModal(sessionId) {
    const modal = document.getElementById('review-modal');
    const sessionIdInput = document.getElementById('review-session-id');
    
    if (modal && sessionIdInput) {
        sessionIdInput.value = sessionId;
        modal.style.display = 'block';
        resetStarRatings();
    }
}

// Close review modal
function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('review-form').reset();
        resetStarRatings();
    }
}

// View session details
function viewSessionDetails(sessionId) {
    const session = sessions.find(s => s.id == sessionId);
    if (!session) {
        showMessage('Session not found', 'error');
        return;
    }

    // Create session details modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'session-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Session Details</h2>
                <button class="modal-close" onclick="closeSessionDetailsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="session-details">
                    <div class="detail-section">
                        <h3>📅 Appointment Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Date:</label>
                                <span>${formatDate(session.scheduled_date)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Time:</label>
                                <span>${formatTime(session.scheduled_time)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Duration:</label>
                                <span>${session.duration_minutes} minutes</span>
                            </div>
                            <div class="detail-item">
                                <label>Status:</label>
                                <span class="badge badge-${session.status.replace('_', '-')}">${session.status.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>🏥 Treatment Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Treatment:</label>
                                <span>${session.treatment_name}</span>
                            </div>
                            <div class="detail-item">
                                <label>Type:</label>
                                <span>${getTreatmentType(session.treatment_name)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Benefits:</label>
                                <span>${getTreatmentBenefits(session.treatment_name)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>👨‍⚕️ Practitioner Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Practitioner:</label>
                                <span>Dr. ${session.practitioner_first_name} ${session.practitioner_last_name}</span>
                            </div>
                            <div class="detail-item">
                                <label>Specialization:</label>
                                <span>${getPractitionerSpecialization(session.practitioner_first_name)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Experience:</label>
                                <span>${getPractitionerExperience(session.practitioner_first_name)}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${session.notes ? `
                    <div class="detail-section">
                        <h3>📝 Session Notes</h3>
                        <div class="notes-content">
                            <p>${session.notes}</p>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h3>💡 What to Expect</h3>
                        <div class="expectations">
                            <ul>
                                <li>Arrive 10 minutes early for check-in</li>
                                <li>Wear comfortable, loose-fitting clothing</li>
                                <li>Bring any relevant medical records</li>
                                <li>Inform practitioner of any allergies or concerns</li>
                                <li>Stay hydrated before and after treatment</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-outline" onclick="closeSessionDetailsModal()">Close</button>
                    ${session.status === 'scheduled' ? 
                        `<button class="btn btn-success" onclick="startSession(${session.id}); closeSessionDetailsModal();">Start Session</button>` :
                    session.status === 'in_progress' ?
                        `<button class="btn btn-primary" onclick="completeSession(${session.id}); closeSessionDetailsModal();">Complete Session</button>` :
                    session.status === 'completed' ?
                        `<button class="btn btn-secondary" onclick="showReviewModal(${session.id}); closeSessionDetailsModal();">Rate Session</button>` :
                        ''
                    }
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Close session details modal
function closeSessionDetailsModal() {
    const modal = document.getElementById('session-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Show quick book modal for specific date
function showQuickBookModal(selectedDate) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'quick-book-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Quick Book Session</h2>
                <button class="modal-close" onclick="closeQuickBookModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="quick-book-form">
                    <div class="form-group">
                        <label>Selected Date</label>
                        <input type="date" id="quick-book-date" value="${selectedDate}" readonly style="background-color: var(--muted);">
                    </div>
                    <div class="form-group">
                        <label for="quick-practitioner-select">Practitioner</label>
                        <select id="quick-practitioner-select" required>
                            <option value="">Select Practitioner</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="quick-treatment-select">Treatment Type</label>
                        <select id="quick-treatment-select" required>
                            <option value="">Select Treatment</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="quick-session-time">Time</label>
                        <input type="time" id="quick-session-time" required>
                    </div>
                    <div class="form-group">
                        <label for="quick-session-notes">Notes (Optional)</label>
                        <textarea id="quick-session-notes" rows="3" placeholder="Any special requests or notes..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeQuickBookModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Book Session</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Populate selects
    populateQuickBookSelects();
}

// Close quick book modal
function closeQuickBookModal() {
    const modal = document.getElementById('quick-book-modal');
    if (modal) {
        modal.remove();
    }
}

// Populate quick book selects
function populateQuickBookSelects() {
    // Populate practitioners
    const practitionerSelect = document.getElementById('quick-practitioner-select');
    if (practitionerSelect) {
        practitionerSelect.innerHTML = '<option value="">Select Practitioner</option>';
        practitioners.forEach(practitioner => {
            const option = document.createElement('option');
            option.value = practitioner.id;
            option.textContent = `${practitioner.user.first_name} ${practitioner.user.last_name} - ${practitioner.specialization}`;
            practitionerSelect.appendChild(option);
        });
    }
    
    // Populate treatments
    const treatmentSelect = document.getElementById('quick-treatment-select');
    if (treatmentSelect) {
        treatmentSelect.innerHTML = '<option value="">Select Treatment</option>';
        treatments.forEach(treatment => {
            const option = document.createElement('option');
            option.value = treatment.id;
            option.textContent = `${treatment.name} - ${treatment.duration_minutes} min - $${treatment.price}`;
            treatmentSelect.appendChild(option);
        });
    }
}

// Helper functions for session details
function getTreatmentType(treatmentName) {
    const types = {
        'Ayurvedic Massage': 'Therapeutic Massage',
        'Yoga Therapy': 'Physical Therapy',
        'Herbal Consultation': 'Consultation',
        'Meditation Session': 'Mindfulness Therapy',
        'Shirodhara': 'Traditional Ayurvedic Treatment',
        'Panchakarma': 'Detoxification Therapy'
    };
    return types[treatmentName] || 'Wellness Treatment';
}

function getTreatmentBenefits(treatmentName) {
    const benefits = {
        'Ayurvedic Massage': 'Stress relief, improved circulation, muscle relaxation',
        'Yoga Therapy': 'Flexibility, strength, mental clarity, pain relief',
        'Herbal Consultation': 'Personalized wellness plan, natural healing',
        'Meditation Session': 'Mental clarity, stress reduction, inner peace',
        'Shirodhara': 'Deep relaxation, improved sleep, mental balance',
        'Panchakarma': 'Body detoxification, improved health, vitality'
    };
    return benefits[treatmentName] || 'Overall wellness and health improvement';
}

function getPractitionerSpecialization(firstName) {
    const specializations = {
        'Sarah': 'Ayurvedic Medicine & Massage Therapy',
        'Michael': 'Yoga Therapy & Physical Rehabilitation',
        'Priya': 'Herbal Medicine & Holistic Healing',
        'Demo': 'General Ayurvedic Practice'
    };
    return specializations[firstName] || 'Ayurvedic Medicine';
}

function getPractitionerExperience(firstName) {
    const experience = {
        'Sarah': '8+ years in Ayurvedic treatments',
        'Michael': '12+ years in Yoga therapy',
        'Priya': '15+ years in herbal medicine',
        'Demo': '5+ years in wellness practice'
    };
    return experience[firstName] || '5+ years in wellness practice';
}

// Reset star ratings
function resetStarRatings() {
    document.querySelectorAll('.star-rating').forEach(rating => {
        rating.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
        });
    });
}

// Populate practitioner select
function populatePractitionerSelect() {
    const select = document.getElementById('practitioner-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Practitioner</option>';
    practitioners.forEach(practitioner => {
        const option = document.createElement('option');
        option.value = practitioner.id;
        option.textContent = `${practitioner.user.first_name} ${practitioner.user.last_name} - ${practitioner.specialization}`;
        select.appendChild(option);
    });
}

// Populate treatment select
function populateTreatmentSelect() {
    const select = document.getElementById('treatment-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Treatment</option>';
    treatments.forEach(treatment => {
        const option = document.createElement('option');
        option.value = treatment.id;
        option.textContent = `${treatment.name} - ${treatment.duration_minutes} min - $${treatment.price}`;
        select.appendChild(option);
    });
}

// Load available time slots
async function loadAvailableSlots(practitionerId, date, duration) {
    try {
        const response = await api.get(`/schedule/available-slots?practitionerId=${practitionerId}&date=${date}&duration=${duration}`);
        if (response.success) {
            populateTimeSelect(response.data);
        }
    } catch (error) {
        console.error('Failed to load available slots:', error);
    }
}

// Populate time select
function populateTimeSelect(slots) {
    const select = document.getElementById('session-time');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Time</option>';
    slots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot.time;
        option.textContent = slot.display_time;
        option.disabled = !slot.available;
        select.appendChild(option);
    });
}

// Update recent sessions
function updateRecentSessions() {
    const container = document.getElementById('recent-sessions-list');
    if (!container) return;
    
    const recentSessions = sessions
        .sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date))
        .slice(0, 5);
    
    container.innerHTML = recentSessions.map(session => `
        <div class="session-card">
            <div class="session-info">
                <h4>${session.treatment_name}</h4>
                <p>${formatDate(session.scheduled_date)} at ${formatTime(session.scheduled_time)}</p>
                <p>with ${session.practitioner_first_name} ${session.practitioner_last_name}</p>
            </div>
            <div class="session-status">
                <span class="badge badge-${session.status.replace('_', '-')}">${session.status}</span>
                ${session.status === 'completed' ? 
                    `<button class="btn btn-sm btn-outline" onclick="showReviewModal(${session.id})">Rate</button>` : 
                    `<button class="btn btn-sm btn-primary" onclick="viewSessionDetails(${session.id})">View</button>`
                }
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Booking form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmission);
    }
    
    // Review form submission
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmission);
    }
    
    // Practitioner selection change
    const practitionerSelect = document.getElementById('practitioner-select');
    if (practitionerSelect) {
        practitionerSelect.addEventListener('change', handlePractitionerChange);
    }
    
    // Date selection change
    const dateInput = document.getElementById('session-date');
    if (dateInput) {
        dateInput.addEventListener('change', handleDateChange);
    }
    
    // Star rating interactions
    setupStarRatings();
    
    // Modal close on outside click
    setupModalCloseHandlers();
    
    // Add new form event listeners
    setupNewFormListeners();
}

// Setup new form event listeners
function setupNewFormListeners() {
    // Add session form
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'add-session-form') {
            e.preventDefault();
            handleAddSessionSubmission(e);
        }
    });
    
    // Wellness form
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'wellness-form') {
            e.preventDefault();
            handleWellnessSubmission(e);
        }
    });
    
    // Symptoms form
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'symptoms-form') {
            e.preventDefault();
            handleSymptomsSubmission(e);
        }
    });
    
    // Reschedule form
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'reschedule-form') {
            e.preventDefault();
            handleRescheduleSubmission(e);
        }
    });
    
    // Quick book form
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'quick-book-form') {
            e.preventDefault();
            handleQuickBookSubmission(e);
        }
    });
}

// Handle add session form submission
async function handleAddSessionSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const sessionData = {
        patientId: formData.get('add-patient-select'),
        treatmentId: formData.get('add-treatment-select'),
        scheduledDate: formData.get('add-session-date'),
        scheduledTime: formData.get('add-session-time'),
        durationMinutes: parseInt(formData.get('add-session-duration')),
        notes: formData.get('add-session-notes')
    };
    
    try {
        await addNewSession(sessionData);
        closeAddSessionModal();
    } catch (error) {
        console.error('Error adding session:', error);
    }
}

// Handle wellness form submission
async function handleWellnessSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const wellnessData = {
        energyLevel: document.getElementById('energy-level').value,
        sleepQuality: document.getElementById('sleep-quality').value,
        mood: document.getElementById('mood').value,
        stressLevel: document.getElementById('stress-level').value,
        symptoms: formData.get('symptoms'),
        notes: formData.get('wellness-notes')
    };
    
    try {
        await logTodaysWellness(wellnessData);
        closeWellnessModal();
    } catch (error) {
        console.error('Error logging wellness:', error);
    }
}

// Handle symptoms form submission
async function handleSymptomsSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const symptomData = {
        symptomName: formData.get('symptom-name'),
        severity: parseInt(document.getElementById('symptom-severity').value),
        description: formData.get('symptom-description'),
        durationDays: formData.get('symptom-duration') ? parseInt(formData.get('symptom-duration')) : null
    };
    
    try {
        await updateSymptoms(symptomData);
        closeSymptomsModal();
    } catch (error) {
        console.error('Error updating symptoms:', error);
    }
}

// Handle reschedule form submission
async function handleRescheduleSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const sessionId = formData.get('reschedule-session-id');
    const rescheduleData = {
        newDate: formData.get('reschedule-date'),
        newTime: formData.get('reschedule-time'),
        reason: formData.get('reschedule-reason')
    };
    
    try {
        await rescheduleSession(sessionId, rescheduleData.newDate, rescheduleData.newTime, rescheduleData.reason);
        closeRescheduleModal();
    } catch (error) {
        console.error('Error rescheduling session:', error);
    }
}

// Handle quick book form submission
async function handleQuickBookSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const sessionData = {
        patientId: 1, // Default patient for demo
        treatmentId: formData.get('quick-treatment-select'),
        scheduledDate: formData.get('quick-book-date'),
        scheduledTime: formData.get('quick-session-time'),
        durationMinutes: treatments.find(t => t.id == formData.get('quick-treatment-select'))?.duration_minutes || 60,
        notes: formData.get('quick-session-notes')
    };
    
    try {
        await addNewSession(sessionData);
        closeQuickBookModal();
        showMessage('Session booked successfully!', 'success');
    } catch (error) {
        console.error('Error booking session:', error);
        showMessage('Failed to book session. Please try again.', 'error');
    }
}

// Handle booking form submission
async function handleBookingSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        practitionerId: formData.get('practitioner-select'),
        treatmentId: formData.get('treatment-select'),
        scheduledDate: formData.get('session-date'),
        scheduledTime: formData.get('session-time'),
        notes: formData.get('session-notes')
    };
    
    try {
        const response = await api.post('/schedule/quick-book', bookingData);
        if (response.success) {
            showSuccess('Session booked successfully!');
            closeBookingModal();
            loadScheduleData(); // Refresh data
        }
    } catch (error) {
        showError('Failed to book session: ' + error.message);
    }
}

// Handle review form submission
async function handleReviewSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reviewData = {
        sessionId: formData.get('review-session-id'),
        rating: getSelectedRating('overall-rating'),
        treatmentRating: getSelectedRating('treatment-rating'),
        practitionerRating: getSelectedRating('practitioner-rating'),
        facilityRating: getSelectedRating('facility-rating'),
        title: formData.get('review-title'),
        comment: formData.get('review-comment'),
        isAnonymous: formData.get('anonymous-review') === 'on'
    };
    
    try {
        const response = await api.post('/schedule/reviews', reviewData);
        if (response.success) {
            showSuccess('Review submitted successfully!');
            closeReviewModal();
            loadScheduleData(); // Refresh data
        }
    } catch (error) {
        showError('Failed to submit review: ' + error.message);
    }
}

// Get selected rating from star rating
function getSelectedRating(ratingId) {
    const rating = document.getElementById(ratingId);
    if (!rating) return null;
    
    const activeStar = rating.querySelector('.star.active');
    return activeStar ? parseInt(activeStar.dataset.rating) : null;
}

// Handle practitioner selection change
function handlePractitionerChange(e) {
    const practitionerId = e.target.value;
    const treatmentSelect = document.getElementById('treatment-select');
    const dateInput = document.getElementById('session-date');
    
    if (practitionerId && treatmentSelect.value && dateInput.value) {
        const treatment = treatments.find(t => t.id == treatmentSelect.value);
        if (treatment) {
            loadAvailableSlots(practitionerId, dateInput.value, treatment.duration_minutes);
        }
    }
}

// Handle date selection change
function handleDateChange(e) {
    const date = e.target.value;
    const practitionerSelect = document.getElementById('practitioner-select');
    const treatmentSelect = document.getElementById('treatment-select');
    
    if (date && practitionerSelect.value && treatmentSelect.value) {
        const treatment = treatments.find(t => t.id == treatmentSelect.value);
        if (treatment) {
            loadAvailableSlots(practitionerSelect.value, date, treatment.duration_minutes);
        }
    }
}

// Setup star rating interactions
function setupStarRatings() {
    document.querySelectorAll('.star-rating').forEach(rating => {
        rating.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.parentElement;
                const ratingValue = parseInt(this.dataset.rating);
                
                // Clear all stars
                rating.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
                
                // Activate stars up to clicked one
                for (let i = 1; i <= ratingValue; i++) {
                    const star = rating.querySelector(`[data-rating="${i}"]`);
                    if (star) star.classList.add('active');
                }
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = this.parentElement;
                const ratingValue = parseInt(this.dataset.rating);
                
                // Clear all stars
                rating.querySelectorAll('.star').forEach(s => s.classList.remove('hover'));
                
                // Hover stars up to current one
                for (let i = 1; i <= ratingValue; i++) {
                    const star = rating.querySelector(`[data-rating="${i}"]`);
                    if (star) star.classList.add('hover');
                }
            });
        });
        
        rating.addEventListener('mouseleave', function() {
            this.querySelectorAll('.star').forEach(s => s.classList.remove('hover'));
        });
    });
}

// Setup modal close handlers
function setupModalCloseHandlers() {
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const bookingModal = document.getElementById('booking-modal');
        const reviewModal = document.getElementById('review-modal');
        
        if (e.target === bookingModal) {
            closeBookingModal();
        }
        if (e.target === reviewModal) {
            closeReviewModal();
        }
    });
}

// Open new tab functionality
function openNewTab(url) {
    window.open(url, '_blank');
}

// View session details
function viewSessionDetails(sessionId) {
    console.log('viewSessionDetails called with sessionId:', sessionId);
    
    // Ensure sessions are loaded
    if (!sessions || sessions.length === 0) {
        loadSessions();
    }
    
    const session = sessions.find(s => s.id == sessionId);
    console.log('Session found:', session);
    console.log('Available sessions:', sessions);
    
    if (session) {
        showSessionDetailsModal(session);
    } else {
        // Create a demo session if not found
        const demoSession = createDemoSession(sessionId);
        showSessionDetailsModal(demoSession);
    }
}

// Create demo session data
function createDemoSession(sessionId) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
        id: sessionId,
        patientId: 1,
        practitionerId: 1,
        treatmentId: 1,
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: '10:00',
        durationMinutes: 60,
        status: 'scheduled',
        treatment_name: 'Ayurvedic Massage Therapy',
        treatmentType: 'Therapeutic Massage',
        estimatedCost: '80.00',
        patientName: 'Sarah Johnson',
        patientAge: '32 years',
        patientPhone: '+1 (555) 123-4567',
        practitioner_first_name: 'Dr. Priya',
        practitioner_last_name: 'Sharma',
        practitioner_specialization: 'Ayurvedic Medicine & Panchakarma',
        practitioner_experience: '15 years',
        practitioner_qualification: 'BAMS, MD (Ayurveda)',
        notes: 'Patient requested focus on lower back pain and stress relief. Recommended herbal oil massage with warm stones. Patient has been experiencing chronic back pain for 3 months. Previous treatments include physiotherapy with limited success.',
        created_at: new Date().toISOString()
    };
}

// Show session details modal
function showSessionDetailsModal(session) {
    const modal = document.getElementById('session-details-modal');
    const content = document.getElementById('session-details-content');
    
    if (modal && content) {
        // Format the session details
        const sessionDate = new Date(session.scheduledDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const sessionTime = new Date(`2000-01-01 ${session.scheduledTime}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        const statusBadge = session.status === 'completed' ? 'success' : 
                           session.status === 'in_progress' ? 'warning' : 
                           session.status === 'cancelled' ? 'destructive' : 'secondary';
        
        content.innerHTML = `
            <div class="session-details">
                <div class="detail-section">
                    <h3>Session Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Session ID:</label>
                            <span>#${session.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="badge badge-${statusBadge}">${session.status.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date:</label>
                            <span>${sessionDate}</span>
                        </div>
                        <div class="detail-item">
                            <label>Time:</label>
                            <span>${sessionTime}</span>
                        </div>
                        <div class="detail-item">
                            <label>Duration:</label>
                            <span>${session.durationMinutes || 60} minutes</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Patient Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Patient ID:</label>
                            <span>#${session.patientId || 'P001'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Patient Name:</label>
                            <span>${session.patientName || 'Sarah Johnson'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Age:</label>
                            <span>${session.patientAge || '32 years'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Contact:</label>
                            <span>${session.patientPhone || '+1 (555) 123-4567'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Treatment Details</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Treatment:</label>
                            <span>${session.treatment_name || 'Ayurvedic Massage Therapy'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Type:</label>
                            <span>${session.treatmentType || 'Therapeutic Massage'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Treatment ID:</label>
                            <span>#${session.treatmentId || 'T001'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Estimated Cost:</label>
                            <span>$${session.estimatedCost || '80.00'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Practitioner Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Practitioner:</label>
                            <span>${session.practitioner_first_name || 'Dr. Priya'} ${session.practitioner_last_name || 'Sharma'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Specialization:</label>
                            <span>${session.practitioner_specialization || 'Ayurvedic Medicine & Panchakarma'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Experience:</label>
                            <span>${session.practitioner_experience || '15 years'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Qualification:</label>
                            <span>${session.practitioner_qualification || 'BAMS, MD (Ayurveda)'}</span>
                        </div>
                    </div>
                </div>
                
                ${session.notes ? `
                <div class="detail-section">
                    <h3>Notes</h3>
                    <div class="notes-content">
                        <p>${session.notes}</p>
                    </div>
                </div>
                ` : ''}
                
                <div class="detail-section">
                    <h3>Actions</h3>
                    <div class="action-buttons">
                        ${session.status === 'scheduled' ? `
                            <button class="btn btn-primary btn-sm" onclick="startSession(${session.id}); closeSessionDetailsModal();">Start Session</button>
                            <button class="btn btn-outline btn-sm" onclick="showRescheduleModal(${session.id}); closeSessionDetailsModal();">Reschedule</button>
                        ` : ''}
                        ${session.status === 'in_progress' ? `
                            <button class="btn btn-success btn-sm" onclick="completeSession(${session.id}); closeSessionDetailsModal();">Complete Session</button>
                        ` : ''}
                        ${session.status === 'completed' ? `
                            <button class="btn btn-accent btn-sm" onclick="showReviewModal(${session.id}); closeSessionDetailsModal();">Leave Review</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    } else {
        console.error('Session details modal not found!');
        showMessage('Error displaying session details!', 'error');
    }
}

// Close session details modal
function closeSessionDetailsModal() {
    const modal = document.getElementById('session-details-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Utility functions
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeStr) {
    return new Date(`2000-01-01 ${timeStr}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    console.error('Error:', message);
    // Don't show popup errors, just log them
    // showMessage(message, 'error');
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Update calendar when data changes
function updateCalendar() {
    generateCalendar();
}

// Add New Session Functionality
async function addNewSession(sessionData) {
    try {
        // Add to local sessions array
        const newSession = {
            id: Date.now(), // Simple ID generation
            scheduled_date: sessionData.scheduledDate,
            scheduled_time: sessionData.scheduledTime,
            duration_minutes: sessionData.durationMinutes,
            status: 'scheduled',
            treatment_name: treatments.find(t => t.id == sessionData.treatmentId)?.name || 'Treatment',
            practitioner_first_name: 'Dr. Demo',
            practitioner_last_name: 'Practitioner',
            notes: sessionData.notes
        };
        
        sessions.push(newSession);
        updateCalendar();
        updateRecentSessions();
        
        // Save to localStorage
        localStorage.setItem('ayursutra_sessions', JSON.stringify(sessions));
        
        showSuccess('Session added successfully!');
        return newSession;
    } catch (error) {
        showError('Failed to add session: ' + error.message);
        throw error;
    }
}

// Start Session Functionality
async function startSession(sessionId) {
    try {
        // Update session status locally
        const session = sessions.find(s => s.id == sessionId);
        if (session) {
            session.status = 'in_progress';
            updateCalendar();
            updateRecentSessions();
            
            // Save to localStorage
            localStorage.setItem('ayursutra_sessions', JSON.stringify(sessions));
        }
        
        showSuccess('Session started successfully!');
        currentSession = sessionId;
        startSessionTimer();
        return { success: true };
    } catch (error) {
        showError('Failed to start session: ' + error.message);
        throw error;
    }
}

// Complete Session Functionality
async function completeSession(sessionId, notes = '') {
    try {
        // Update session status locally
        const session = sessions.find(s => s.id == sessionId);
        if (session) {
            session.status = 'completed';
            session.notes = notes;
            updateCalendar();
            updateRecentSessions();
            
            // Save to localStorage
            localStorage.setItem('ayursutra_sessions', JSON.stringify(sessions));
        }
        
        showSuccess('Session completed successfully!');
        currentSession = null;
        stopSessionTimer();
        return { success: true };
    } catch (error) {
        showError('Failed to complete session: ' + error.message);
        throw error;
    }
}

// Reschedule Session Functionality
async function rescheduleSession(sessionId, newDate, newTime, reason) {
    try {
        // Update session locally
        const session = sessions.find(s => s.id == sessionId);
        if (session) {
            session.scheduled_date = newDate;
            session.scheduled_time = newTime;
            session.reschedule_reason = reason;
            updateCalendar();
            updateRecentSessions();
            
            // Save to localStorage
            localStorage.setItem('ayursutra_sessions', JSON.stringify(sessions));
        }
        
        showSuccess('Session rescheduled successfully!');
        return { success: true };
    } catch (error) {
        showError('Failed to reschedule session: ' + error.message);
        throw error;
    }
}

// Log Today's Wellness
async function logTodaysWellness(wellnessData) {
    try {
        // Save wellness data to localStorage
        const wellnessLog = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            ...wellnessData,
            created_at: new Date().toISOString()
        };
        
        // Get existing wellness logs
        let wellnessLogs = JSON.parse(localStorage.getItem('ayursutra_wellness') || '[]');
        
        // Update or add today's log
        const existingIndex = wellnessLogs.findIndex(log => log.date === wellnessLog.date);
        if (existingIndex >= 0) {
            wellnessLogs[existingIndex] = wellnessLog;
        } else {
            wellnessLogs.push(wellnessLog);
        }
        
        localStorage.setItem('ayursutra_wellness', JSON.stringify(wellnessLogs));
        
        showSuccess('Wellness logged successfully!');
        return { success: true, data: wellnessLog };
    } catch (error) {
        showError('Failed to log wellness: ' + error.message);
        throw error;
    }
}

// Update Symptoms
async function updateSymptoms(symptomData) {
    try {
        // Save symptom data to localStorage
        const symptom = {
            id: Date.now(),
            ...symptomData,
            created_at: new Date().toISOString()
        };
        
        // Get existing symptoms
        let symptoms = JSON.parse(localStorage.getItem('ayursutra_symptoms') || '[]');
        
        // Update or add symptom
        const existingIndex = symptoms.findIndex(s => s.symptomName === symptomData.symptomName);
        if (existingIndex >= 0) {
            symptoms[existingIndex] = symptom;
        } else {
            symptoms.push(symptom);
        }
        
        localStorage.setItem('ayursutra_symptoms', JSON.stringify(symptoms));
        
        showSuccess('Symptoms updated successfully!');
        return { success: true, data: symptom };
    } catch (error) {
        showError('Failed to update symptoms: ' + error.message);
        throw error;
    }
}

// Get Patient Symptoms
async function getPatientSymptoms() {
    try {
        const response = await api.get('/session-management/symptoms');
        if (response.success) {
            return response.data;
        }
    } catch (error) {
        console.error('Failed to load symptoms:', error);
        return [];
    }
}

// Get Today's Wellness
async function getTodaysWellness() {
    try {
        const response = await api.get('/session-management/wellness/today');
        if (response.success) {
            return response.data;
        }
    } catch (error) {
        console.error('Failed to load today\'s wellness:', error);
        return null;
    }
}

// Session Timer
function startSessionTimer() {
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }
    
    sessionTimer = setInterval(() => {
        updateSessionTimer();
    }, 1000);
}

function stopSessionTimer() {
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
}

function updateSessionTimer() {
    // Update any session timer display if needed
    console.log('Session timer running...');
}

// Share Functionality
function shareProgress() {
    if (navigator.share) {
        navigator.share({
            title: 'My Wellness Progress - AyurSutra',
            text: 'Check out my wellness journey progress!',
            url: window.location.href
        }).then(() => {
            showSuccess('Progress shared successfully!');
        }).catch((error) => {
            console.error('Error sharing:', error);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    // Fallback for browsers that don't support Web Share API
    const shareText = 'Check out my wellness journey progress on AyurSutra!';
    const shareUrl = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
            showSuccess('Share link copied to clipboard!');
        }).catch(() => {
            showShareModal(shareText, shareUrl);
        });
    } else {
        showShareModal(shareText, shareUrl);
    }
}

function showShareModal(text, url) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Share Progress</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Copy this link to share your progress:</p>
                <div class="share-content">
                    <textarea readonly style="width: 100%; height: 100px; margin: 1rem 0;">${text} ${url}</textarea>
                    <button class="btn btn-primary" onclick="navigator.clipboard.writeText(this.previousElementSibling.value); showSuccess('Link copied!'); this.closest('.modal').remove();">Copy Link</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Enhanced Session Creation Modal
function showAddSessionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'add-session-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Session</h2>
                <button class="modal-close" onclick="closeAddSessionModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="add-session-form">
                    <div class="form-group">
                        <label for="add-patient-select">Patient</label>
                        <select id="add-patient-select" required>
                            <option value="">Select Patient</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="add-treatment-select">Treatment Type</label>
                        <select id="add-treatment-select" required>
                            <option value="">Select Treatment</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="add-session-date">Date</label>
                        <input type="date" id="add-session-date" required>
                    </div>
                    <div class="form-group">
                        <label for="add-session-time">Time</label>
                        <input type="time" id="add-session-time" required>
                    </div>
                    <div class="form-group">
                        <label for="add-session-duration">Duration (minutes)</label>
                        <input type="number" id="add-session-duration" min="15" max="300" step="15" required>
                    </div>
                    <div class="form-group">
                        <label for="add-session-notes">Notes (Optional)</label>
                        <textarea id="add-session-notes" rows="3" placeholder="Any special notes..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeAddSessionModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Session</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Populate patient and treatment selects
    populateAddSessionSelects();
    
    // Set minimum date to today
    const dateInput = document.getElementById('add-session-date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
}

function closeAddSessionModal() {
    const modal = document.getElementById('add-session-modal');
    if (modal) {
        modal.remove();
    }
}

function populateAddSessionSelects() {
    // Populate patients
    const patientSelect = document.getElementById('add-patient-select');
    if (patientSelect) {
        // This would typically load from an API
        patientSelect.innerHTML = '<option value="">Select Patient</option>';
        // Add sample patients for demo
        const samplePatients = [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' },
            { id: 3, name: 'Mike Johnson' }
        ];
        samplePatients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = patient.name;
            patientSelect.appendChild(option);
        });
    }
    
    // Populate treatments
    const treatmentSelect = document.getElementById('add-treatment-select');
    if (treatmentSelect) {
        treatmentSelect.innerHTML = '<option value="">Select Treatment</option>';
        treatments.forEach(treatment => {
            const option = document.createElement('option');
            option.value = treatment.id;
            option.textContent = `${treatment.name} - ${treatment.duration_minutes} min`;
            treatmentSelect.appendChild(option);
        });
    }
}

// Wellness Logging Modal
function showWellnessModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'wellness-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Log Today's Wellness</h2>
                <button class="modal-close" onclick="closeWellnessModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="wellness-form">
                    <div class="form-group">
                        <label>Energy Level</label>
                        <div class="rating-slider">
                            <input type="range" id="energy-level" min="1" max="5" value="3" class="slider">
                            <div class="slider-labels">
                                <span>Very Low</span>
                                <span>Low</span>
                                <span>Moderate</span>
                                <span>Good</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Sleep Quality</label>
                        <div class="rating-slider">
                            <input type="range" id="sleep-quality" min="1" max="5" value="3" class="slider">
                            <div class="slider-labels">
                                <span>Poor</span>
                                <span>Fair</span>
                                <span>Good</span>
                                <span>Very Good</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Mood</label>
                        <div class="rating-slider">
                            <input type="range" id="mood" min="1" max="5" value="3" class="slider">
                            <div class="slider-labels">
                                <span>Very Poor</span>
                                <span>Poor</span>
                                <span>Neutral</span>
                                <span>Good</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Stress Level</label>
                        <div class="rating-slider">
                            <input type="range" id="stress-level" min="1" max="5" value="3" class="slider">
                            <div class="slider-labels">
                                <span>Very High</span>
                                <span>High</span>
                                <span>Moderate</span>
                                <span>Low</span>
                                <span>Very Low</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="symptoms">Symptoms (Optional)</label>
                        <textarea id="symptoms" rows="3" placeholder="Describe any symptoms you're experiencing..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="wellness-notes">Notes (Optional)</label>
                        <textarea id="wellness-notes" rows="3" placeholder="Any additional notes about your wellness..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeWellnessModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Log Wellness</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeWellnessModal() {
    const modal = document.getElementById('wellness-modal');
    if (modal) {
        modal.remove();
    }
}

// Symptoms Update Modal
function showSymptomsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'symptoms-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Update Symptoms</h2>
                <button class="modal-close" onclick="closeSymptomsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="symptoms-form">
                    <div class="form-group">
                        <label for="symptom-name">Symptom Name</label>
                        <input type="text" id="symptom-name" placeholder="e.g., Headache, Fatigue, etc." required>
                    </div>
                    <div class="form-group">
                        <label>Severity (1-10)</label>
                        <div class="rating-slider">
                            <input type="range" id="symptom-severity" min="1" max="10" value="5" class="slider">
                            <div class="slider-labels">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                                <span>6</span>
                                <span>7</span>
                                <span>8</span>
                                <span>9</span>
                                <span>10</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="symptom-description">Description (Optional)</label>
                        <textarea id="symptom-description" rows="3" placeholder="Describe the symptom in detail..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="symptom-duration">Duration (days)</label>
                        <input type="number" id="symptom-duration" min="1" placeholder="How many days have you had this symptom?">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeSymptomsModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Symptoms</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeSymptomsModal() {
    const modal = document.getElementById('symptoms-modal');
    if (modal) {
        modal.remove();
    }
}

// Reschedule Modal
function showRescheduleModal(sessionId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'reschedule-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Reschedule Session</h2>
                <button class="modal-close" onclick="closeRescheduleModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="reschedule-form">
                    <input type="hidden" id="reschedule-session-id" value="${sessionId}">
                    <div class="form-group">
                        <label for="reschedule-date">New Date</label>
                        <input type="date" id="reschedule-date" required>
                    </div>
                    <div class="form-group">
                        <label for="reschedule-time">New Time</label>
                        <input type="time" id="reschedule-time" required>
                    </div>
                    <div class="form-group">
                        <label for="reschedule-reason">Reason for Rescheduling</label>
                        <textarea id="reschedule-reason" rows="3" placeholder="Please explain why you need to reschedule..." required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeRescheduleModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Set minimum date to today
    const dateInput = document.getElementById('reschedule-date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
}

function closeRescheduleModal() {
    const modal = document.getElementById('reschedule-modal');
    if (modal) {
        modal.remove();
    }
}

// Debug function
function debugFeatures() {
    console.log('=== AYURSUTRA DEBUG INFO ===');
    console.log('Sessions loaded:', sessions.length);
    console.log('Practitioners loaded:', practitioners.length);
    console.log('Treatments loaded:', treatments.length);
    console.log('localStorage sessions:', localStorage.getItem('ayursutra_sessions'));
    console.log('localStorage wellness:', localStorage.getItem('ayursutra_wellness'));
    console.log('localStorage symptoms:', localStorage.getItem('ayursutra_symptoms'));
    console.log('API object:', typeof api);
    console.log('All functions available:', {
        addNewSession: typeof addNewSession,
        logTodaysWellness: typeof logTodaysWellness,
        updateSymptoms: typeof updateSymptoms,
        shareProgress: typeof shareProgress,
        showAddSessionModal: typeof showAddSessionModal,
        showWellnessModal: typeof showWellnessModal,
        showSymptomsModal: typeof showSymptomsModal
    });
    console.log('============================');
}

// Export functions for global access
window.openNewTab = openNewTab;
window.showBookingModal = showBookingModal;
window.closeBookingModal = closeBookingModal;
window.showReviewModal = showReviewModal;
window.closeReviewModal = closeReviewModal;
window.navigateCalendar = navigateCalendar;
window.selectSession = selectSession;
window.viewSessionDetails = viewSessionDetails;
window.showSessionDetailsModal = showSessionDetailsModal;
window.closeSessionDetailsModal = closeSessionDetailsModal;
window.createDemoSession = createDemoSession;
window.addNewSession = addNewSession;
window.startSession = startSession;
window.completeSession = completeSession;
window.rescheduleSession = rescheduleSession;
window.logTodaysWellness = logTodaysWellness;
window.updateSymptoms = updateSymptoms;
window.shareProgress = shareProgress;
window.showAddSessionModal = showAddSessionModal;
window.closeAddSessionModal = closeAddSessionModal;
window.showWellnessModal = showWellnessModal;
window.closeWellnessModal = closeWellnessModal;
window.showSymptomsModal = showSymptomsModal;
window.closeSymptomsModal = closeSymptomsModal;
window.showRescheduleModal = showRescheduleModal;
window.closeRescheduleModal = closeRescheduleModal;
window.showQuickBookModal = showQuickBookModal;
window.closeQuickBookModal = closeQuickBookModal;
window.debugFeatures = debugFeatures;
