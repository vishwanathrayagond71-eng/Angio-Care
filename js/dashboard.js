/* ==========================================================================
   ANGIOCARE - FARMER DASHBOARD MODULE
   ========================================================================== */

const dashboardModule = (() => {

    // Retrieve active session values and display stats
    function loadDashboardData() {
        const session = authModule.getSession();
        if (!session) {
            // User is a guest - hide farmer panel
            document.getElementById('menu-farmer-dash').style.display = 'none';
            return;
        }

        // Show dashboard nav links
        document.getElementById('menu-farmer-dash').style.display = 'block';

        // Welcome Header
        document.getElementById('dashboard-welcome').textContent = `Hello, ${session.name}!`;
        document.getElementById('dashboard-location').textContent = `Location: ${session.location}`;

        // Populate metrics
        const history = session.history || [];
        const savedTreatments = session.savedTreatments || [];

        // Scans count
        document.getElementById('dash-scan-count').textContent = history.length;

        // Warnings count
        const activeWarnings = calculateActiveWarnings(session.location);
        document.getElementById('dash-warning-count').textContent = activeWarnings;

        // Health index calculation
        const healthIndex = calculateCropHealth(history);
        document.getElementById('dash-health-index').textContent = `${healthIndex}%`;

        // Render Recent Scans list
        renderRecentScans(history);

        // Render Saved Treatments list
        renderSavedTreatments(savedTreatments);

        // Update profile setting text boxes
        document.getElementById('profile-name').value = session.name;
        document.getElementById('profile-location').value = session.location;
        document.getElementById('profile-crop').value = session.crop || 'Rice';
    }

    // Helper: Weather warning alerts count
    function calculateActiveWarnings(location) {
        if (!location) return 0;
        const loc = location.toLowerCase();
        if (loc.includes('gujarat') || loc.includes('anand')) return 1;
        if (loc.includes('assam') || loc.includes('kerala')) return 2;
        return 0;
    }

    // Calculate crop health rating: starts at 100%, drops per disease severity detected
    function calculateCropHealth(history) {
        if (history.length === 0) return 100;
        
        let score = 100;
        // Deduct points based on the last 5 scans
        const recent = history.slice(0, 5);
        recent.forEach(scan => {
            if (scan.severity === 'High') score -= 15;
            else if (scan.severity === 'Medium') score -= 8;
            else if (scan.severity === 'Low') score -= 3;
        });

        return Math.max(score, 30); // Floor at 30%
    }

    // Build scan history rows in dashboard
    function renderRecentScans(history) {
        const list = document.getElementById('dashboard-scan-history');
        list.innerHTML = '';

        if (history.length === 0) {
            list.innerHTML = `<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: 24px;">No scans recorded yet. Try running an AI Diagnosis.</p>`;
            return;
        }

        history.forEach(scan => {
            const item = document.createElement('div');
            item.className = 'dashboard-list-item';
            
            const severityClass = scan.severity === 'High' ? 'icon-danger' : (scan.severity === 'Medium' ? 'icon-warning' : 'icon-success');
            const severityIcon = scan.severity === 'High' ? 'alert-octagon' : (scan.severity === 'Medium' ? 'alert-triangle' : 'check-circle');

            item.innerHTML = `
                <div class="item-left">
                    <div class="item-icon ${severityClass}">
                        <i data-lucide="${severityIcon}" style="width: 18px; height: 18px;"></i>
                    </div>
                    <div class="item-details">
                        <h4>${scan.disease}</h4>
                        <p>Crop: ${scan.crop} | Confidence: ${scan.confidence}</p>
                    </div>
                </div>
                <div style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
                    ${scan.date}
                </div>
            `;
            list.appendChild(item);
        });

        // Initialize Lucide icons
        lucide.createIcons();
    }

    // Render Saved Treatments list
    function renderSavedTreatments(saved) {
        const list = document.getElementById('dashboard-saved-treatments');
        list.innerHTML = '';

        if (saved.length === 0) {
            list.innerHTML = `<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: 24px;">No treatments saved. Open a leaf result and save to list.</p>`;
            return;
        }

        saved.forEach(item => {
            const row = document.createElement('div');
            row.className = 'dashboard-list-item';
            row.innerHTML = `
                <div class="item-left">
                    <div class="item-icon icon-info">
                        <i data-lucide="bookmark" style="width: 18px; height: 18px;"></i>
                    </div>
                    <div class="item-details" style="max-width: 80%;">
                        <h4 style="color: var(--primary-dark);">${item.disease} (${item.crop})</h4>
                        <p style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${item.treatment}</p>
                    </div>
                </div>
                <button onclick="dashboardModule.deleteSavedTreatment('${item.id}'); event.stopPropagation();" style="color: var(--danger); font-size: 14px;" title="Remove saved treatment">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                </button>
            `;
            list.appendChild(row);
        });

        lucide.createIcons();
    }

    // Delete single saved treatment item
    function deleteSavedTreatment(id) {
        const session = authModule.getSession();
        if (!session) return;

        const users = authModule.getUsers();
        const userIndex = users.findIndex(u => u.email === session.email);

        if (userIndex !== -1) {
            users[userIndex].savedTreatments = users[userIndex].savedTreatments.filter(t => t.id !== id);
            authModule.saveUsers(users);

            // Update session
            localStorage.setItem('angiocare_session', JSON.stringify(users[userIndex]));
            app.showToast('Treatment deleted', 'info');
            loadDashboardData();
        }
    }

    // Clear Scan History
    function clearHistory() {
        const session = authModule.getSession();
        if (!session) return;

        if (!confirm('Are you sure you want to clear your prediction history?')) return;

        const users = authModule.getUsers();
        const userIndex = users.findIndex(u => u.email === session.email);

        if (userIndex !== -1) {
            users[userIndex].history = [];
            authModule.saveUsers(users);

            // Update session
            localStorage.setItem('angiocare_session', JSON.stringify(users[userIndex]));
            app.showToast('Diagnostic history cleared', 'success');
            loadDashboardData();
        }
    }

    return {
        loadDashboardData,
        deleteSavedTreatment,
        clearHistory
    };
})();
