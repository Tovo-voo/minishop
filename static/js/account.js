/* register的提示訊息 */
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const password2Input = document.getElementById('password2');
    const phoneInput = document.getElementById('phonenumber');


    if (password2Input) {
        password2Input.addEventListener('blur', function(event) {
            if (event.relatedTarget && event.relatedTarget.tagName === 'A') {
                return;
            }

            if (password2Input.value.trim() === '') {
                document.getElementById('password2-error').classList.add('show');
                document.getElementById('pwdigits-error').classList.remove('show');
            } else if (password2Input.value.trim() != passwordInput.value.trim()) {
                document.getElementById('password2-error').classList.remove('show');
                document.getElementById('pwdigits-error').classList.add('show'); 
            } else {
                document.getElementById('password2-error').classList.remove('show');
                document.getElementById('pwdigits-error').classList.remove('show');
            }
        })

        phoneInput.addEventListener('blur', function(event) {
            if (event.relatedTarget && event.relatedTarget.tagName === 'A') {
                return;
            }

            if (phoneInput.value.trim() === '') {
                document.getElementById('phone-error').classList.add('show');
            } else {
                document.getElementById('phone-error').classList.remove('show');
            }
        })

        const form = document.getElementById('register-form');
        form.addEventListener('submit', function(event) {
            let hasError = false;

            if (usernameInput.value.trim() === '') {
                document.getElementById('username-error').classList.add('show');
                hasError = true;
            }

            if (passwordInput.value.trim() === '') {
                document.getElementById('password-error').classList.add('show');
                hasError = true;
            }

            if (password2Input.value.trim() === '') {
                document.getElementById('password2-error').classList.add('show');
                document.getElementById('pwdigits-error').classList.remove('show');
                hasError = true;
            } else if (password2Input.value.trim() != passwordInput.value.trim()) {
                document.getElementById('password2-error').classList.remove('show');
                document.getElementById('pwdigits-error').classList.add('show');
                hasError = true;
            }
            
            if (phoneInput.value.trim() === '') {
                document.getElementById('phone-error').classList.add('show');
                hasError = true;
            }

            if (hasError) {
                event.preventDefault();     //有錯誤才阻止送出
            }
            
        })
    }


    usernameInput.addEventListener('blur', function(event) {
        if (event.relatedTarget && event.relatedTarget.tagName === 'A') {
            return;
        }

        if (usernameInput.value.trim() === '') {
            document.getElementById('username-error').classList.add('show');
        } else {
            document.getElementById('username-error').classList.remove('show');
        }
    });

    passwordInput.addEventListener('blur', function(event) {
        if (event.relatedTarget && event.relatedTarget.tagName === 'A') {
            return;
        }

        if (passwordInput.value.trim() === '') {
            document.getElementById('password-error').classList.add('show');
        } else {
            document.getElementById('password-error').classList.remove('show');
        }
    })


    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            let hasError = false;

            if (usernameInput.value.trim() === '') {
                document.getElementById('username-error').classList.add('show');
                hasError = true;
            }

            if (passwordInput.value.trim() === '') {
                document.getElementById('password-error').classList.add('show');
                hasError = true;
            }

            if (hasError) {
                event.preventDefault();     //有錯誤才阻止送出
            }
            
        })
    }

});

