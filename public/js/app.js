document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('paymentForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');
    const errorAlert = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset UI state
        errorAlert.style.display = 'none';
        errorAlert.textContent = '';
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        spinner.style.display = 'block';

        // Collect Form Data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Safely construct URL (taake trailing slash ka issue na aaye)
            let basePath = window.location.pathname;
            if (basePath.endsWith('/')) basePath = basePath.slice(0, -1);
            const submitUrl = `${basePath}/submit${window.location.search}`;

            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            // JSON parse karein (ab Shopify HTML page hijack nahi karega)
            const result = await response.json();

            // IMPORTANT: Ab hum check kar rahe hain ke result mein error toh nahi hai
            if (!response.ok || result.error) {
                let errorMsg = result.error || 'Unable to process request.';
                if (result.details && result.details.length > 0) {
                    errorMsg = result.details[0]; // Show the first validation error
                }
                throw new Error(errorMsg);
            }

            // SUCCESS! Instant redirect to Shopify native checkout
            window.location.href = result.checkoutUrl;

        } catch (error) {
            // Restore UI on error and show the TRUE error message
            errorAlert.textContent = error.message;
            errorAlert.style.display = 'block';
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            spinner.style.display = 'none';
        }
    });
});