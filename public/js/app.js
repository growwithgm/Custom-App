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
            // BULLETPROOF FIX: Send the POST request to the exact same URL we are currently on.
            // This prevents Shopify Proxy from breaking the path with missing slashes.
            const submitUrl = window.location.pathname + window.location.search;

            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                let errorMsg = result.error || 'Unable to process request.';
                if (result.details && result.details.length > 0) {
                    errorMsg = result.details[0]; // Show the first validation error
                }
                throw new Error(errorMsg);
            }

            // SUCCESS! Instant redirect to Shopify native checkout
            window.location.href = result.checkoutUrl;

        } catch (error) {
            // Restore UI on error
            errorAlert.textContent = error.message;
            errorAlert.style.display = 'block';
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            spinner.style.display = 'none';
        }
    });
});