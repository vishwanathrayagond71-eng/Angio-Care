/* ==========================================================================
   ANGIOCARE - ADMINISTRATIVE PANEL MODULE
   ========================================================================== */

const adminModule = (() => {
    let cropChartInstance = null;
    let accuracyChartInstance = null;

    // Seed mock data for farmer feedbacks
    const FEEDBACKS_KEY = 'angiocare_feedbacks';
    const defaultFeedbacks = [
        {
            id: 'feed-1',
            name: 'Baldev Singh',
            email: 'baldev@gmail.com',
            message: 'AngioBot Hindi voice is translating very accurately. Can you add Punjabi voice support soon?',
            date: '2026-05-22',
            resolved: false
        },
        {
            id: 'feed-2',
            name: 'Karan Patil',
            email: 'karan@rediffmail.com',
            message: 'Is Sugarcane Red Rot model accuracy updated? I scanned a stem and it classified early rot with 96% confidence.',
            date: '2026-05-21',
            resolved: false
        },
        {
            id: 'feed-3',
            name: 'Ananya Rao',
            email: 'ananya@farmtech.org',
            message: 'Pradhan Mantri Fasal Bima scheme criteria has changed in Karnataka. Please update the KB card details.',
            date: '2026-05-19',
            resolved: true
        }
    ];

    function init() {
        if (!localStorage.getItem(FEEDBACKS_KEY)) {
            localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(defaultFeedbacks));
        }
    }

    // Retrieve feedbacks list
    function getFeedbacks() {
        init();
        return JSON.parse(localStorage.getItem(FEEDBACKS_KEY));
    }

    // Save feedbacks list
    function saveFeedbacks(feeds) {
        localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feeds));
    }

    // Load and render Admin Panel views
    function loadAdminDashboard() {
        const session = authModule.getSession();
        if (!session || !session.isAdmin) {
            document.getElementById('menu-admin-dash').style.display = 'none';
            return;
        }

        // Show Admin Nav Link
        document.getElementById('menu-admin-dash').style.display = 'block';

        // Load counters
        const users = authModule.getUsers().filter(u => !u.isAdmin);
        const feedbacks = getFeedbacks();
        const unresolvedFeeds = feedbacks.filter(f => !f.resolved);

        // Calculate total reports logged across all user histories
        let totalScans = 182; // Base baseline
        authModule.getUsers().forEach(user => {
            totalScans += (user.history || []).length;
        });

        // Set counters
        document.getElementById('admin-total-farmers').textContent = users.length + 12400; // Simulated scale
        document.getElementById('admin-total-reports').textContent = totalScans + 45000;
        document.getElementById('admin-total-feedbacks').textContent = unresolvedFeeds.length;

        // Render Tables
        renderUsersTable(users);
        renderFeedbackTable(feedbacks);

        // Render Analytics Charts
        renderAnalyticsCharts();
    }

    // Populate Users list in admin
    function renderUsersTable(users) {
        const tbody = document.getElementById('admin-users-table');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No farmers registered.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td>${user.location}</td>
                <td><span class="kb-tag tag-crop">${user.crop || 'Generic'}</span></td>
                <td>
                    <button class="btn-secondary" style="color: var(--danger); font-size:12px; padding:6px 12px;" onclick="adminModule.deleteUser('${user.email}')">
                        <i data-lucide="trash-2" style="width:14px; height:14px; vertical-align:middle; margin-right:4px;"></i> Block
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        lucide.createIcons();
    }

    // Populate Feedback inquiries table
    function renderFeedbackTable(feedbacks) {
        const tbody = document.getElementById('admin-feedback-table');
        tbody.innerHTML = '';

        if (feedbacks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No feedback records found.</td></tr>`;
            return;
        }

        feedbacks.forEach(feed => {
            const tr = document.createElement('tr');
            if (feed.resolved) {
                tr.style.opacity = '0.6';
            }
            
            const actionBtn = feed.resolved 
                ? `<span style="color: var(--success); font-weight: 600; font-size: 13px;">✔ Resolved</span>`
                : `<button class="btn-primary-sm" style="font-size:11px; padding:6px 12px;" onclick="adminModule.resolveFeedback('${feed.id}')">Resolve</button>`;

            tr.innerHTML = `
                <td><strong>${feed.name}</strong></td>
                <td>${feed.email}</td>
                <td><p style="max-width: 300px; white-space: normal;">"${feed.message}"</p></td>
                <td>${feed.date}</td>
                <td>
                    <div style="display:flex; gap:8px; align-items:center;">
                        ${actionBtn}
                        <button class="btn-secondary" style="color: var(--danger); font-size:11px; padding:6px; border-radius:50%;" onclick="adminModule.deleteFeedback('${feed.id}')" title="Delete record">
                            <i data-lucide="trash" style="width:12px; height:12px;"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        lucide.createIcons();
    }

    // Resolve farmer feedback
    function resolveFeedback(id) {
        const feeds = getFeedbacks();
        const index = feeds.findIndex(f => f.id === id);
        if (index !== -1) {
            feeds[index].resolved = true;
            saveFeedbacks(feeds);
            app.showToast('Feedback marked as resolved!', 'success');
            loadAdminDashboard();
        }
    }

    // Delete feedback row
    function deleteFeedback(id) {
        const feeds = getFeedbacks();
        const filtered = feeds.filter(f => f.id !== id);
        saveFeedbacks(filtered);
        app.showToast('Feedback record deleted', 'info');
        loadAdminDashboard();
    }

    // Block or Delete a registered user profile
    function deleteUser(email) {
        if (!confirm(`Are you sure you want to block the user: ${email}?`)) return;

        const users = authModule.getUsers();
        const filtered = users.filter(u => u.email !== email);
        authModule.saveUsers(filtered);

        app.showToast('User account blocked successfully', 'success');
        loadAdminDashboard();
    }

    // Append new inquiry from landing contact form
    function submitFarmerFeedback(name, email, message) {
        const feeds = getFeedbacks();
        feeds.unshift({
            id: 'feed-' + Date.now(),
            name,
            email,
            message,
            date: new Date().toISOString().split('T')[0],
            resolved: false
        });
        saveFeedbacks(feeds);
    }

    // Initialize Chart.js analytics graphs
    function renderAnalyticsCharts() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const labelColor = isDark ? '#9ca3af' : '#4b5563';

        // 1. Crop Distribution Chart (Doughnut)
        const ctxCrop = document.getElementById('adminCropChart').getContext('2d');
        if (cropChartInstance) cropChartInstance.destroy();
        
        cropChartInstance = new Chart(ctxCrop, {
            type: 'doughnut',
            data: {
                labels: ['Rice', 'Wheat', 'Tomato', 'Potato', 'Corn', 'Cotton', 'Sugarcane', 'Banana'],
                datasets: [{
                    data: [32, 25, 18, 12, 8, 5, 4, 3], // Percentage distribution
                    backgroundColor: [
                        '#10b981', '#3b82f6', '#ef4444', '#f59e0b', 
                        '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'
                    ],
                    borderWidth: 2,
                    borderColor: isDark ? '#1f2937' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: labelColor, font: { family: 'Inter', weight: '600' } }
                    }
                }
            }
        });

        // 2. Classifications Bar Chart
        const ctxAccuracy = document.getElementById('adminAccuracyDoughnut').getContext('2d');
        if (accuracyChartInstance) accuracyChartInstance.destroy();

        accuracyChartInstance = new Chart(ctxAccuracy, {
            type: 'bar',
            data: {
                labels: ['Fungal', 'Bacterial', 'Viral', 'Healthy'],
                datasets: [{
                    label: 'Classified Cases (Thousands)',
                    data: [28.4, 12.1, 4.2, 18.6],
                    backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: labelColor },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: labelColor },
                        grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
                    }
                }
            }
        });
    }

    return {
        init,
        loadAdminDashboard,
        resolveFeedback,
        deleteFeedback,
        deleteUser,
        submitFarmerFeedback
    };
})();

// Init feedbacks database
adminModule.init();
