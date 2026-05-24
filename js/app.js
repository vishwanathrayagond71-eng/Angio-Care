/* ==========================================================================
   ANGIOCARE - MAIN CONTROLLER & APPLICATION ROUTER
   ========================================================================== */

const app = (() => {
    const NOTIFICATIONS_KEY = 'angiocare_notifications';

    // Initial load configurations
    window.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initNavigation();
        initNotifications();
        initFaqs();
        updateUserUI();

        // Initialize child modules
        detectorModule.init();
        kbModule.init();
        chatbotModule.init();

        // Render landing accuracy bar animations on load
        triggerAccuracyBarAnimation();

        // Create initial default chart on landing page
        renderLandingAccuracyChart();
    });

    // Theme Management (Dark/Light mode)
    function initTheme() {
        const savedTheme = localStorage.getItem('angiocare_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeToggleUI(savedTheme);

        const toggleBtn = document.getElementById('theme-toggle');
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('angiocare_theme', nextTheme);
            updateThemeToggleUI(nextTheme);
            
            showToast(`Theme switched to ${nextTheme} mode`, 'info');
            
            // Re-render weather and admin charts to adjust text colors
            if (document.getElementById('weather-view').classList.contains('active')) {
                weatherModule.loadWeatherData();
            }
            if (document.getElementById('admin-dash-view').classList.contains('active')) {
                adminModule.loadAdminDashboard();
            }
        });
    }

    function updateThemeToggleUI(theme) {
        const sun = document.getElementById('theme-icon-light');
        const moon = document.getElementById('theme-icon-dark');
        if (theme === 'dark') {
            sun.style.display = 'none';
            moon.style.display = 'block';
        } else {
            sun.style.display = 'block';
            moon.style.display = 'none';
        }
    }

    // SPA Routing / Navigation handling
    function initNavigation() {
        const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');

        // Nav click routing
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetView = item.getAttribute('data-target');
                if (targetView) {
                    navigateTo(targetView);
                    
                    // Highlight active menu item
                    menuItems.forEach(m => m.classList.remove('active'));
                    item.classList.add('active');

                    // Close sidebar on mobile after clicking
                    if (window.innerWidth <= 992) {
                        sidebar.classList.remove('open');
                    }
                }
            });
        });

        // Hamburger mobile toggle
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 && !sidebar.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Direct routing method
    function navigateTo(viewId) {
        // Stop active camera stream if leaving AI detector
        if (viewId !== 'detection-view') {
            detectorModule.stopCamera();
        }

        // Hide all views, show target
        const sections = document.querySelectorAll('.view-section');
        sections.forEach(sec => sec.classList.remove('active'));

        const target = document.getElementById(viewId);
        if (target) {
            target.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Sync Sidebar active highlighting
        const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
        menuItems.forEach(item => {
            if (item.getAttribute('data-target') === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Lazy load module-specific data
        if (viewId === 'farmer-dash-view') {
            dashboardModule.loadDashboardData();
        } else if (viewId === 'weather-view') {
            weatherModule.loadWeatherData();
        } else if (viewId === 'admin-dash-view') {
            adminModule.loadAdminDashboard();
        }
    }

    // Adjust visibility based on active session
    function updateUserUI() {
        const session = authModule.getSession();
        const menuAuth = document.getElementById('menu-auth');
        const menuFarmer = document.getElementById('menu-farmer-dash');
        const menuLogout = document.getElementById('menu-logout');
        const menuAdmin = document.getElementById('menu-admin-dash');
        const profileBtn = document.getElementById('nav-profile-btn');

        if (session) {
            // Logged in
            menuAuth.style.display = 'none';
            menuLogout.style.display = 'block';

            if (session.isAdmin) {
                menuAdmin.style.display = 'block';
                menuFarmer.style.display = 'none';
                profileBtn.style.color = 'var(--secondary)';
                profileBtn.title = 'Logged in as Admin';
                profileBtn.onclick = () => navigateTo('admin-dash-view');
            } else {
                menuAdmin.style.display = 'none';
                menuFarmer.style.display = 'block';
                profileBtn.style.color = 'var(--primary)';
                profileBtn.title = `Logged in as ${session.name}`;
                profileBtn.onclick = () => navigateTo('farmer-dash-view');
            }
        } else {
            // Guest mode
            menuAuth.style.display = 'block';
            menuFarmer.style.display = 'none';
            menuLogout.style.display = 'none';
            menuAdmin.style.display = 'none';
            profileBtn.style.color = 'var(--text-muted)';
            profileBtn.title = 'Farmer Sign In';
            profileBtn.onclick = () => navigateTo('auth-view');
        }

        // Initialize/Refill Lucide icons
        lucide.createIcons();
    }

    // Dynamic toast messages dispatcher
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'check-circle';
        if (type === 'warning') iconName = 'alert-triangle';
        else if (type === 'danger') iconName = 'alert-octagon';
        else if (type === 'info') iconName = 'info';

        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        
        lucide.createIcons();

        // Slide out after 3.5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInToast 0.3s reverse cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    }

    // FAQs collapsible accordion logic
    function initFaqs() {
        const faqHeaders = document.querySelectorAll('.faq-header');
        faqHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                item.classList.toggle('open');
            });
        });
    }

    // Notification center systems
    function initNotifications() {
        const defaultNotifications = [
            {
                id: 'notif-1',
                title: 'System Setup',
                text: 'Welcome to AngioCare! Set up your farm profile to trace disease alerts.',
                type: 'success',
                date: '2026-05-24'
            }
        ];

        if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(defaultNotifications));
        }

        const notifBtn = document.getElementById('notification-btn');
        notifBtn.addEventListener('click', toggleNotificationModal);

        updateNotificationBadge();
    }

    function getNotifications() {
        return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || [];
    }

    // Add dynamic notification card
    function addNotification(title, text, type = 'info') {
        const notifs = getNotifications();
        notifs.unshift({
            id: 'notif-' + Date.now(),
            title,
            text,
            type,
            date: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
        updateNotificationBadge();

        // Trigger visual toast
        showToast(text, type);
    }

    // Update red badge counter
    function updateNotificationBadge() {
        const notifs = getNotifications();
        const badge = document.getElementById('notification-badge');
        badge.textContent = notifs.length;
    }

    // Show/Hide inbox overlay
    function toggleNotificationModal() {
        const modal = document.getElementById('notification-modal');
        modal.classList.toggle('active');

        if (modal.classList.contains('active')) {
            renderNotificationInbox();
        }
    }

    // Populate modal inbox cards
    function renderNotificationInbox() {
        const list = document.getElementById('notification-inbox-list');
        list.innerHTML = '';
        const notifs = getNotifications();

        if (notifs.length === 0) {
            list.innerHTML = `<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: 24px;">No notifications in your inbox.</p>`;
            return;
        }

        notifs.forEach(notif => {
            const item = document.createElement('div');
            item.className = 'dashboard-list-item';
            
            let colorClass = 'icon-info';
            let icon = 'info';
            if (notif.type === 'danger') { colorClass = 'icon-danger'; icon = 'alert-octagon'; }
            else if (notif.type === 'warning') { colorClass = 'icon-warning'; icon = 'alert-triangle'; }
            else if (notif.type === 'success') { colorClass = 'icon-success'; icon = 'check-circle'; }

            item.innerHTML = `
                <div class="item-left">
                    <div class="item-icon ${colorClass}">
                        <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
                    </div>
                    <div class="item-details" style="max-width: 85%;">
                        <h4 style="margin: 0; font-size:14px;">${notif.title}</h4>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted); line-height: 1.4;">${notif.text}</p>
                    </div>
                </div>
                <div style="font-size: 10px; color: var(--text-muted); font-weight: 500;">
                    ${notif.date}
                </div>
            `;
            list.appendChild(item);
        });
        lucide.createIcons();
    }

    // Wipe inbox
    function clearNotifications() {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
        updateNotificationBadge();
        renderNotificationInbox();
        showToast('Notification inbox cleared', 'info');
    }

    // Submit inquiry from Landing Form
    function submitFeedback() {
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const msg = document.getElementById('contact-msg').value.trim();

        if (!name || !email || !msg) return;

        adminModule.submitFarmerFeedback(name, email, msg);
        
        showToast('Thank you! Our support team will contact you shortly.', 'success');
        
        // Reset forms
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('contact-msg').value = '';
    }

    // UI Animations: Animate landing accuracy bar widths
    function triggerAccuracyBarAnimation() {
        setTimeout(() => {
            const bars = document.querySelectorAll('.accuracy-bar-inner');
            bars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                bar.style.width = targetWidth;
            });
        }, 300);
    }

    // Draw primary landing statistics bar chart
    function renderLandingAccuracyChart() {
        const ctx = document.getElementById('accuracyChart').getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const labelColor = isDark ? '#9ca3af' : '#4b5563';

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Tomato Late Blight', 'Rice Blast', 'Corn Rust', 'Potato Late Blight', 'Cotton Leaf Spot', 'Sugarcane Red Rot'],
                datasets: [{
                    label: 'AI Model Accuracy (%)',
                    data: [98.6, 97.8, 97.4, 99.1, 95.8, 96.5],
                    backgroundColor: 'rgba(16, 185, 129, 0.75)',
                    borderColor: '#10b981',
                    borderWidth: 2,
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
                        min: 90,
                        max: 100,
                        ticks: { color: labelColor },
                        grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
                    }
                }
            }
        });
    }

    return {
        navigateTo,
        updateUserUI,
        showToast,
        addNotification,
        clearNotifications,
        toggleNotificationModal,
        submitFeedback
    };
})();
