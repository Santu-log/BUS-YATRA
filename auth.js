// auth.js

// --- DOM Elements ---
const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');
const signupButton = document.getElementById('signup-button');
const signinButton = document.getElementById('signin-button');
const authMessage = document.getElementById('auth-message');

// --- Toggling between forms ---
document.getElementById('show-signin').addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    signinForm.style.display = 'block';
});

document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    signinForm.style.display = 'none';
    signupForm.style.display = 'block';
});

// --- Sign Up Logic ---
signupButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;
            console.log('Signed up:', user);
            authMessage.style.color = 'green';
            authMessage.textContent = 'Account created successfully! Redirecting...';
            // Redirect to the main page after a short delay
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        })
        .catch((error) => {
            authMessage.style.color = 'red';
            authMessage.textContent = error.message;
        });
});

// --- Sign In Logic ---
signinButton.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in successfully
            const user = userCredential.user;
            console.log('Signed in:', user);
            authMessage.style.color = 'green';
            authMessage.textContent = 'Signed in successfully! Redirecting...';
            // Redirect to the main page
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        })
        .catch((error) => {
            authMessage.style.color = 'red';
            authMessage.textContent = error.message;
        });
});

// --- ADD THIS CODE to the end of auth.js ---

// --- DOM Elements for Social Sign-In ---
const googleSignInButton = document.getElementById('google-signin-button');
const facebookSignInButton = document.getElementById('facebook-signin-button');

// --- Google Sign-In Logic ---
googleSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log('Signed in with Google:', user);
            authMessage.style.color = 'green';
            authMessage.textContent = 'Signed in successfully! Redirecting...';
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        }).catch((error) => {
            authMessage.style.color = 'red';
            authMessage.textContent = error.message;
        });
});

// --- Facebook Sign-In Logic ---
facebookSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.FacebookAuthProvider();

    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log('Signed in with Facebook:', user);
            authMessage.style.color = 'green';
            authMessage.textContent = 'Signed in successfully! Redirecting...';
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        }).catch((error) => {
            // Handle common errors
            if (error.code === 'auth/account-exists-with-different-credential') {
                authMessage.textContent = 'An account already exists with the same email address. Try signing in with Google.';
            } else {
                authMessage.textContent = error.message;
            }
            authMessage.style.color = 'red';
        });
});