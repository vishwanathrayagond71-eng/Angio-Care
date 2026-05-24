/* ==========================================================================
   ANGIOCARE - AUTHENTICATION MODULE
   ========================================================================== */

const authModule = (() => {
    // Local storage keys
    const USERS_KEY = 'angiocare_users';
    const SESSION_KEY = 'angiocare_session';

    // Mock initial users database
    const defaultUsers = [
        {
            name: 'Ramesh Patel',
            email: 'ramesh@farm.com',
            location: 'Anand, Gujarat',
            crop: 'Tomato',
            password: 'password123',
            history: [
                {
                    id: 'scan-1',
                    date: '2026-05-20',
                    crop: 'Tomato',
                    disease: 'Early Blight',
                    severity: 'Medium',
                    confidence: '94.2%'
                },
                {
                    id: 'scan-2',
                    date: '2026-05-18',
                    crop: 'Potato',
                    disease: 'Late Blight',
                    severity: 'High',
                    confidence: '98.1%'
                }
            ],
            savedTreatments: [
                {
                    id: 'treat-1',
                    disease: 'Late Blight',
                    crop: 'Potato',
                    treatment: 'Copper Fungicide Spray, crop rotation, and removing infected vines.'
                }
            ]
        },
        {
            name: 'System Admin',
            email: 'admin@gmail.com',
            location: 'New Delhi, Delhi',
            crop: 'None',
            password: 'admin123',
            isAdmin: true,
            history: [],
            savedTreatments: []
        }
    ];

    // Temp storage for registration flow before OTP verification
    let tempUserData = null;
    let expectedOtp = '';

    // Initialize users database in localStorage if empty, and migrate admin credentials if needed
    function init() {
        const users = localStorage.getItem(USERS_KEY);
        if (!users) {
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        } else {
            try {
                let parsedUsers = JSON.parse(users);
                let adminUser = parsedUsers.find(u => u.isAdmin);
                if (adminUser && adminUser.email !== 'admin@gmail.com') {
                    adminUser.email = 'admin@gmail.com';
                    adminUser.password = 'admin123';
                    localStorage.setItem(USERS_KEY, JSON.stringify(parsedUsers));
                    console.log("Admin credentials auto-migrated in LocalStorage to admin@gmail.com");
                }
            } catch (e) {
                console.error("Failed to migrate users: ", e);
            }
        }
    }

    // Retrieve users list
    function getUsers() {
        init();
        return JSON.parse(localStorage.getItem(USERS_KEY));
    }

    // Save users list
    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Get current logged-in user session
    function getSession() {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }

    // Toggle registration/login forms visual UI
    function toggleForm(type) {
        const loginWrapper = document.getElementById('login-form-wrapper');
        const registerWrapper = document.getElementById('register-form-wrapper');
        
        if (type === 'register') {
            loginWrapper.classList.remove('active');
            registerWrapper.classList.add('active');
        } else {
            registerWrapper.classList.remove('active');
            loginWrapper.classList.add('active');
        }
    }

    // Registration flow
    function register() {
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        const location = document.getElementById('reg-location').value.trim();
        const crop = document.getElementById('reg-crop').value;
        const password = document.getElementById('reg-pass').value;

        if (!name || !email || !location || !crop || !password) {
            app.showToast('Please fill all fields', 'warning');
            return;
        }

        const users = getUsers();
        if (users.some(u => u.email === email)) {
            app.showToast('Email already registered', 'danger');
            return;
        }

        // Keep userdata in temporary holder
        tempUserData = { name, email, location, crop, password, history: [], savedTreatments: [], isAdmin: false };
        
        // Generate simulated OTP
        expectedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`[AngioCare OTP Debug] Simulated Verification Code: ${expectedOtp}`);
        
        // Show OTP Modal
        document.getElementById('otp-modal').classList.add('active');
        
        // Alert farmer via toast
        app.showToast(`Verification code sent! (Check Dev Console: ${expectedOtp})`, 'info');
        
        // Autofocus first OTP digit
        setTimeout(() => {
            const inputs = document.querySelectorAll('.otp-input');
            if (inputs[0]) inputs[0].focus();
        }, 100);
    }

    // Close OTP dialog
    function closeOtpModal() {
        document.getElementById('otp-modal').classList.remove('active');
        tempUserData = null;
        expectedOtp = '';
    }

    // Resend simulated verification OTP
    function resendOtp() {
        expectedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`[AngioCare OTP Debug] Resent Verification Code: ${expectedOtp}`);
        app.showToast(`New verification code sent! (Check Dev Console: ${expectedOtp})`, 'info');
    }

    // Handle single digit OTP keystroke progression
    function handleOtpInput(element, event) {
        if (element.value && element.nextElementSibling) {
            element.nextElementSibling.focus();
        } else if (event.key === 'Backspace' && element.previousElementSibling) {
            element.previousElementSibling.focus();
        }
    }

    // Verify OTP input values
    function verifyOtp() {
        const inputs = document.querySelectorAll('.otp-input');
        let enteredOtp = '';
        inputs.forEach(input => {
            enteredOtp += input.value.trim();
        });

        if (enteredOtp !== expectedOtp) {
            app.showToast('Invalid OTP. Please try again.', 'danger');
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
            return;
        }

        // Match successful: Register user into database
        const users = getUsers();
        users.push(tempUserData);
        saveUsers(users);

        app.showToast('Account activated successfully!', 'success');
        
        // Log in immediately
        localStorage.setItem(SESSION_KEY, JSON.stringify(tempUserData));
        closeOtpModal();
        
        // Refresh app shell UI
        app.updateUserUI();
        app.navigateTo('farmer-dash-view');
        
        // Trigger welcome notification
        app.addNotification('System Alert', `Welcome to AngioCare, ${tempUserData.name}! Make your first leaf scan to monitor crop health.`, 'success');
    }

    // Login Flow
    function login() {
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const pass = document.getElementById('login-pass').value;

        const users = getUsers();
        const foundUser = users.find(u => u.email === email && u.password === pass);

        if (!foundUser) {
            app.showToast('Incorrect email or password', 'danger');
            return;
        }

        // Set session
        localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
        app.showToast('Signed in successfully!', 'success');
        
        // Update App UI
        app.updateUserUI();
        
        // Route based on role
        if (foundUser.isAdmin) {
            app.navigateTo('admin-dash-view');
            app.addNotification('Admin Entry', 'Logged into Admin Console. Database and Feedbacks loaded.', 'info');
        } else {
            app.navigateTo('farmer-dash-view');
        }
    }

    // Logout session
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        app.showToast('Signed out successfully.', 'info');
        app.updateUserUI();
        app.navigateTo('home-view');
    }

    // Show simulated Forgot Password alert
    function showForgotPassword() {
        const email = document.getElementById('login-email').value.trim();
        if (!email) {
            app.showToast('Please type your email address first', 'warning');
            return;
        }
        app.showToast(`Password recovery link sent to ${email}`, 'success');
    }

    // Update Profile Information
    function updateProfile() {
        const session = getSession();
        if (!session) return;

        const newName = document.getElementById('profile-name').value.trim();
        const newLocation = document.getElementById('profile-location').value.trim();
        const newCrop = document.getElementById('profile-crop').value;

        if (!newName || !newLocation || !newCrop) {
            app.showToast('Profile values cannot be empty', 'warning');
            return;
        }

        // Update database
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === session.email);
        
        if (userIndex !== -1) {
            users[userIndex].name = newName;
            users[userIndex].location = newLocation;
            users[userIndex].crop = newCrop;
            saveUsers(users);

            // Update session
            const updatedSession = users[userIndex];
            localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
            
            app.showToast('Profile updated successfully!', 'success');
            
            // Re-render UI
            app.updateUserUI();
        }
    }

    // Save disease report into user prediction history
    function appendScanHistory(report) {
        const session = getSession();
        if (!session) return;

        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === session.email);

        if (userIndex !== -1) {
            users[userIndex].history.unshift(report); // Add to beginning of array
            saveUsers(users);

            // Update current session
            localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
            
            // Re-render dashboard if visible
            dashboardModule.loadDashboardData();
        }
    }

    // Save treatments
    function saveTreatment(treatmentItem) {
        const session = getSession();
        if (!session) {
            app.showToast('Log in to save crop treatments', 'warning');
            app.navigateTo('auth-view');
            return;
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === session.email);

        if (userIndex !== -1) {
            const hasSaved = users[userIndex].savedTreatments.some(t => t.disease === treatmentItem.disease && t.crop === treatmentItem.crop);
            if (hasSaved) {
                app.showToast('Treatment already saved to profile', 'info');
                return;
            }

            users[userIndex].savedTreatments.unshift(treatmentItem);
            saveUsers(users);

            // Update current session
            localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
            
            app.showToast('Treatment saved to profile successfully!', 'success');
            
            // Refresh
            dashboardModule.loadDashboardData();
        }
    }

    return {
        init,
        getUsers,
        saveUsers,
        getSession,
        toggleForm,
        register,
        login,
        logout,
        showForgotPassword,
        closeOtpModal,
        resendOtp,
        handleOtpInput,
        verifyOtp,
        updateProfile,
        appendScanHistory,
        saveTreatment
    };
})();

// Init storage on load
authModule.init();
