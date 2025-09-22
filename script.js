// AyurSutra Panchakarma - JavaScript functionality with Backend Integration

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// API Helper Functions
const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
};

// Authentication Functions
const auth = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        authToken = response.data.token;
        currentUser = response.data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        return response.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.success) {
        authToken = response.data.token;
        currentUser = response.data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        return response.data;
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
  },

  isAuthenticated() {
    return !!authToken && !!currentUser;
  },

  getCurrentUser() {
    return currentUser;
  }
};

// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const toggle = document.getElementById('mobile-menu-toggle');
  
  if (menu && toggle) {
    menu.classList.toggle('active');
    
    const icon = toggle.querySelector('svg');
    if (menu.classList.contains('active')) {
      icon.innerHTML = '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/>';
    } else {
      icon.innerHTML = '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
    }
  }
}

// Dashboard Data Loading Functions
const dashboard = {
  async loadPatientDashboard() {
    try {
      const response = await api.get('/dashboard/patient');
      if (response.success) {
        this.updatePatientDashboard(response.data);
      }
    } catch (error) {
      console.error('Failed to load patient dashboard:', error);
      this.showError('Failed to load dashboard data');
    }
  },

  async loadPractitionerDashboard() {
    try {
      const response = await api.get('/dashboard/practitioner');
      if (response.success) {
        this.updatePractitionerDashboard(response.data);
      }
    } catch (error) {
      console.error('Failed to load practitioner dashboard:', error);
      this.showError('Failed to load dashboard data');
    }
  },

  updatePatientDashboard(data) {
    // Update progress summary
    if (data.progressSummary) {
      const { totalPrograms, activePrograms, completedSessions, upcomingSessions, unreadNotifications } = data.progressSummary;
      
      // Update progress bar
      updateProgressBar('overall-progress', (completedSessions / (completedSessions + upcomingSessions)) * 100);
      
      // Update stats
      const statsElements = document.querySelectorAll('.hero-stat-number');
      if (statsElements[0]) statsElements[0].textContent = completedSessions;
      if (statsElements[1]) statsElements[1].textContent = activePrograms;
      if (statsElements[2]) statsElements[2].textContent = totalPrograms;
    }

    // Update upcoming sessions
    this.updateUpcomingSessions(data.upcomingSessions);
    
    // Update notifications
    this.updateNotifications(data.recentNotifications);
  },

  updatePractitionerDashboard(data) {
    // Update today's sessions
    this.updateTodaySessions(data.todaySessions);
    
    // Update patient progress
    this.updatePatientProgress(data.patientProgress);
    
    // Update stats
    this.updatePractitionerStats(data.stats);
  },

  updateUpcomingSessions(sessions) {
    const sessionsContainer = document.querySelector('.card-content .space-y-4');
    if (!sessionsContainer || !sessions) return;

    sessionsContainer.innerHTML = sessions.map(session => `
      <div class="session-item" style="border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem;">
        <div style="display: flex; align-items: start; justify-content: space-between;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <h3 class="font-semibold">${session.treatment_name}</h3>
              <span class="badge badge-${session.status === 'confirmed' ? 'success' : 'outline'}">${session.status}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 0.5rem;">
              <span style="display: flex; align-items: center; gap: 0.25rem;">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                ${new Date(session.scheduled_date).toLocaleDateString()}
              </span>
              <span style="display: flex; align-items: center; gap: 0.25rem;">
                <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                ${session.scheduled_time}
              </span>
            </div>
            <p style="font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 0.5rem;">
              with ${session.practitioner_first_name} ${session.practitioner_last_name}
            </p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="rescheduleSession(${session.id})">Reschedule</button>
        </div>
      </div>
    `).join('');
  },

  updateTodaySessions(sessions) {
    // Implementation for practitioner today's sessions
    console.log('Today\'s sessions:', sessions);
  },

  updatePatientProgress(progress) {
    // Implementation for patient progress updates
    console.log('Patient progress:', progress);
  },

  updatePractitionerStats(stats) {
    // Implementation for practitioner stats
    console.log('Practitioner stats:', stats);
  },

  updateNotifications(notifications) {
    // Implementation for notifications
    console.log('Notifications:', notifications);
  },

  showError(message) {
    // Show error message to user
    console.error(message);
    // You can implement a toast notification here
  }
};

// Session Management Functions
const sessions = {
  async loadSessions() {
    try {
      const response = await api.get('/sessions');
      if (response.success) {
        this.updateSessionsList(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  },

  async createSession(sessionData) {
    try {
      const response = await api.post('/sessions', sessionData);
      if (response.success) {
        this.loadSessions(); // Refresh the list
        return response.data;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  async updateSessionStatus(sessionId, status, notes) {
    try {
      const response = await api.put(`/sessions/${sessionId}/status`, { status, notes });
      if (response.success) {
        this.loadSessions(); // Refresh the list
        return response.data;
      }
    } catch (error) {
      console.error('Failed to update session status:', error);
      throw error;
    }
  },

  async cancelSession(sessionId, reason) {
    try {
      const response = await api.put(`/sessions/${sessionId}/cancel`, { reason });
      if (response.success) {
        this.loadSessions(); // Refresh the list
        return response.data;
      }
    } catch (error) {
      console.error('Failed to cancel session:', error);
      throw error;
    }
  },

  updateSessionsList(sessions) {
    // Update the sessions display
    console.log('Sessions updated:', sessions);
  }
};

// Wellness Tracking Functions
const wellness = {
  async logWellness(wellnessData) {
    try {
      const response = await api.post('/wellness/log', wellnessData);
      if (response.success) {
        this.loadTodayWellness();
        return response.data;
      }
    } catch (error) {
      console.error('Failed to log wellness:', error);
      throw error;
    }
  },

  async loadTodayWellness() {
    try {
      const response = await api.get('/wellness/today');
      if (response.success) {
        this.updateTodayWellness(response.data);
      }
    } catch (error) {
      console.error('Failed to load today\'s wellness:', error);
    }
  },

  async loadWellnessSummary(days = 30) {
    try {
      const response = await api.get(`/wellness/summary?days=${days}`);
      if (response.success) {
        this.updateWellnessSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load wellness summary:', error);
    }
  },

  updateTodayWellness(wellnessData) {
    // Update today's wellness display
    console.log('Today\'s wellness:', wellnessData);
  },

  updateWellnessSummary(summary) {
    // Update wellness summary charts/display
    console.log('Wellness summary:', summary);
  }
};

// Feedback Functions
const feedback = {
  async submitFeedback(feedbackData) {
    try {
      const response = await api.post('/feedback', feedbackData);
      if (response.success) {
        this.showSuccessMessage('Feedback submitted successfully');
        return response.data;
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  },

  async loadFeedback(practitionerId) {
    try {
      const response = await api.get(`/feedback/practitioner/${practitionerId}`);
      if (response.success) {
        this.updateFeedbackDisplay(response.data);
      }
    } catch (error) {
      console.error('Failed to load feedback:', error);
    }
  },

  updateFeedbackDisplay(feedbackData) {
    // Update feedback display
    console.log('Feedback data:', feedbackData);
  },

  showSuccessMessage(message) {
    // Show success message
    console.log('Success:', message);
  }
};

// Reviews and Testimonials Functions
const reviews = {
  async loadReviews(featuredOnly = false) {
    try {
      const response = await api.get(`/reviews?featured=${featuredOnly}`);
      if (response.success) {
        this.updateReviewsDisplay(response.data.reviews);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  },

  async submitReview(reviewData) {
    try {
      const response = await api.post('/reviews', reviewData);
      if (response.success) {
        this.showSuccessMessage('Review submitted successfully!');
        return response.data;
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  },

  async getReviewStats() {
    try {
      const response = await api.get('/reviews/stats');
      if (response.success) {
        this.updateReviewStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load review stats:', error);
    }
  },

  updateReviewsDisplay(reviews) {
    const reviewsContainer = document.querySelector('.reviews-container');
    if (!reviewsContainer || !reviews) return;

    reviewsContainer.innerHTML = reviews.map(review => `
      <div class="review-item" style="border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 1rem;">
          <div>
            <h4 style="margin: 0; font-weight: 600;">${review.name}</h4>
            ${review.title ? `<p style="margin: 0.25rem 0 0 0; color: var(--muted-foreground); font-size: 0.875rem;">${review.title}</p>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${this.generateStars(review.rating)}
            ${review.is_verified ? '<span class="badge badge-success">Verified</span>' : ''}
          </div>
        </div>
        <p style="margin: 0; line-height: 1.6;">${review.comment}</p>
        <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--muted-foreground);">
          ${new Date(review.created_at).toLocaleDateString()}
        </div>
      </div>
    `).join('');
  },

  generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<span style="color: #fbbf24;">★</span>';
      } else {
        stars += '<span style="color: #d1d5db;">★</span>';
      }
    }
    return stars;
  },

  updateReviewStats(stats) {
    const statsContainer = document.querySelector('.review-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">${stats.averageRating}</div>
        <div style="display: flex; justify-content: center; margin: 0.5rem 0;">
          ${this.generateStars(Math.round(stats.averageRating))}
        </div>
        <div style="font-size: 0.875rem; color: var(--muted-foreground);">
          Based on ${stats.totalReviews} reviews
        </div>
      </div>
    `;
  },

  showSuccessMessage(message) {
    // Show success message
    console.log('Success:', message);
  }
};

// Articles and Blog Functions
const articles = {
  async loadArticles(featuredOnly = false, category = null) {
    try {
      let url = `/articles?featured=${featuredOnly}`;
      if (category) url += `&category=${category}`;
      
      const response = await api.get(url);
      if (response.success) {
        this.updateArticlesDisplay(response.data.articles);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  },

  async getArticle(slug) {
    try {
      const response = await api.get(`/articles/${slug}`);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to load article:', error);
      throw error;
    }
  },

  updateArticlesDisplay(articles) {
    const articlesContainer = document.querySelector('.articles-container');
    if (!articlesContainer || !articles) return;

    articlesContainer.innerHTML = articles.map(article => `
      <article class="article-item" style="border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 1.5rem;">
        ${article.featured_image ? `
          <div style="height: 200px; background: linear-gradient(45deg, var(--primary), var(--secondary)); background-image: url('${article.featured_image}'); background-size: cover; background-position: center;"></div>
        ` : ''}
        <div style="padding: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            ${article.category ? `<span class="badge badge-outline">${article.category}</span>` : ''}
            ${article.is_featured ? '<span class="badge badge-primary">Featured</span>' : ''}
          </div>
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">
            <a href="/article/${article.slug}" style="text-decoration: none; color: inherit;">${article.title}</a>
          </h3>
          ${article.excerpt ? `<p style="margin: 0 0 1rem 0; color: var(--muted-foreground); line-height: 1.6;">${article.excerpt}</p>` : ''}
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; color: var(--muted-foreground);">
            <span>${new Date(article.published_at).toLocaleDateString()}</span>
            <span>${article.view_count} views</span>
          </div>
        </div>
      </article>
    `).join('');
  }
};

// Contact Form Functions
const contact = {
  async submitContact(contactData) {
    try {
      const response = await api.post('/contact/submit', contactData);
      if (response.success) {
        this.showSuccessMessage('Message sent successfully! We will get back to you soon.');
        return response.data;
      }
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      throw error;
    }
  },

  showSuccessMessage(message) {
    // Show success message
    console.log('Success:', message);
  }
};

// Newsletter Functions
const newsletter = {
  async subscribe(email, name = '') {
    try {
      const response = await api.post('/newsletter/subscribe', { email, name });
      if (response.success) {
        this.showSuccessMessage('Successfully subscribed to newsletter!');
        return response.data;
      }
    } catch (error) {
      console.error('Failed to subscribe to newsletter:', error);
      throw error;
    }
  },

  async unsubscribe(email) {
    try {
      const response = await api.post('/newsletter/unsubscribe', { email });
      if (response.success) {
        this.showSuccessMessage('Successfully unsubscribed from newsletter');
        return response.data;
      }
    } catch (error) {
      console.error('Failed to unsubscribe from newsletter:', error);
      throw error;
    }
  },

  showSuccessMessage(message) {
    // Show success message
    console.log('Success:', message);
  }
};

// FAQ Functions
const faq = {
  async loadFAQs(category = null) {
    try {
      let url = '/faq';
      if (category) url += `?category=${category}`;
      
      const response = await api.get(url);
      if (response.success) {
        this.updateFAQDisplay(response.data);
      }
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    }
  },

  updateFAQDisplay(faqs) {
    const faqContainer = document.querySelector('.faq-container');
    if (!faqContainer || !faqs) return;

    faqContainer.innerHTML = faqs.map(faq => `
      <div class="faq-item" style="border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 1rem;">
        <button class="faq-question" style="width: 100%; padding: 1rem; text-align: left; background: none; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="this.parentElement.querySelector('.faq-answer').classList.toggle('hidden')">
          <span style="font-weight: 600;">${faq.question}</span>
          <span style="font-size: 1.25rem;">+</span>
        </button>
        <div class="faq-answer hidden" style="padding: 0 1rem 1rem 1rem; color: var(--muted-foreground); line-height: 1.6;">
          ${faq.answer}
        </div>
      </div>
    `).join('');
  }
};

// Update progress bars with animation
function updateProgressBar(elementId, targetValue) {
  const progressBar = document.getElementById(elementId);
  if (progressBar) {
    let currentValue = 0;
    const increment = targetValue / 50;
    
    const animation = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(animation);
      }
      progressBar.style.width = currentValue + '%';
    }, 20);
  }
}

// Initialize progress bars when page loads
function initializeProgressBars() {
  // Patient dashboard progress
  updateProgressBar('overall-progress', 75);
  
  // Progress page individual programs
  updateProgressBar('abhyanga-progress', 75);
  updateProgressBar('meditation-progress', 60);
}

// Star rating functionality
function setRating(rating) {
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('filled');
      star.innerHTML = '<path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';
    } else {
      star.classList.remove('filled');
      star.innerHTML = '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';
    }
  });
}

// Calendar navigation
function navigateCalendar(direction) {
  // This would typically connect to a backend or update the calendar display
  console.log('Navigating calendar:', direction);
}

// Mark notification as read
function markNotificationRead(notificationId) {
  const notification = document.getElementById('notification-' + notificationId);
  if (notification) {
    notification.classList.remove('notification-unread');
    const indicator = notification.querySelector('.unread-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
}

// Submit feedback
function submitFeedback() {
  const feedbackText = document.getElementById('feedback-text');
  const ratingValue = document.querySelector('.rating-star.filled:last-of-type');
  
  if (feedbackText && feedbackText.value.trim() && ratingValue) {
    // Simulate feedback submission
    alert('Thank you for your feedback! It has been submitted successfully.');
    feedbackText.value = '';
    
    // Reset rating
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach(star => {
      star.classList.remove('filled');
      star.innerHTML = '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';
    });
  } else {
    alert('Please provide feedback text and rating before submitting.');
  }
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Set active navigation item based on current page
  const currentPage = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage || (currentPage === '/' && href === 'index.html')) {
      item.classList.add('active');
    }
  });
  
  // Initialize progress bars with delay for animation effect
  setTimeout(initializeProgressBars, 500);
  
  // Add click handlers for interactive elements
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Add rating star click handlers
  const ratingStars = document.querySelectorAll('.rating-star');
  ratingStars.forEach((star, index) => {
    star.addEventListener('click', () => setRating(index + 1));
  });
  
  // Add submit feedback handler
  const submitBtn = document.getElementById('submit-feedback');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitFeedback);
  }
  
  // Add notification click handlers
  const notifications = document.querySelectorAll('.notification-item');
  notifications.forEach(notification => {
    notification.addEventListener('click', function() {
      const notificationId = this.id.replace('notification-', '');
      markNotificationRead(notificationId);
    });
  });
  
  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// New Tab Functionality
function openNewTab(url) {
  window.open(url, '_blank');
}

// Enhanced navigation with new tab options
function openDashboardInNewTab() {
  openNewTab('patient-dashboard.html');
}

function openProgressInNewTab() {
  openNewTab('progress.html');
}

function openScheduleInNewTab() {
  openNewTab('schedule.html');
}

function openNotificationsInNewTab() {
  openNewTab('notifications.html');
}

function openFeedbackInNewTab() {
  openNewTab('feedback.html');
}

// Utility functions
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(time) {
  return new Date('2000-01-01 ' + time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Session management functions
function rescheduleSession(sessionId) {
  alert('Reschedule functionality would be implemented here for session ' + sessionId);
}

function startSession(sessionId) {
  alert('Starting session ' + sessionId + '. This would typically open a session management interface.');
}

function viewSessionDetails(sessionId) {
  alert('Viewing details for session ' + sessionId + '. This would typically open a detailed view.');
}

// Wellness logging
function logWellness() {
  alert('Wellness logging interface would open here, allowing patients to input their daily wellness metrics.');
}

function updateSymptoms() {
  alert('Symptom update interface would open here.');
}

// Quick actions
function scheduleAppointment() {
  alert('Appointment scheduling interface would open here.');
}

function viewDetailedReport() {
  alert('Detailed progress report would be displayed here.');
}

function shareProgress() {
  if (navigator.share) {
    navigator.share({
      title: 'My Wellness Progress - AyurSutra',
      text: 'Check out my wellness journey progress!',
      url: window.location.href
    });
  } else {
    alert('Progress sharing functionality would be implemented here.');
  }
}

// Calendar functionality
function selectSession(sessionElement) {
  // Remove previous selections
  document.querySelectorAll('.session-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Add selection to clicked session
  sessionElement.classList.add('selected');
}

// Form validation
function validateFeedbackForm() {
  const feedbackText = document.getElementById('feedback-text');
  const hasRating = document.querySelector('.rating-star.filled');
  
  return feedbackText && feedbackText.value.trim() && hasRating;
}

// Dynamic content updates (would typically connect to backend)
function updateSessionStatus(sessionId, newStatus) {
  const sessionElement = document.querySelector(`[data-session-id="${sessionId}"]`);
  if (sessionElement) {
    const statusBadge = sessionElement.querySelector('.badge');
    if (statusBadge) {
      statusBadge.textContent = newStatus;
      statusBadge.className = `badge badge-${newStatus}`;
    }
  }
}

// Search functionality
function searchPatients(query) {
  console.log('Searching patients with query:', query);
  // Implementation would filter patient list based on search query
}

function filterNotifications(type) {
  const notifications = document.querySelectorAll('.notification-item');
  notifications.forEach(notification => {
    const notificationType = notification.dataset.type;
    if (type === 'all' || notificationType === type) {
      notification.style.display = 'block';
    } else {
      notification.style.display = 'none';
    }
  });
}