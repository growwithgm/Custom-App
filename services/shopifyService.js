const axios = require('axios');

class ShopifyService {
    async createDraftOrder(shop, accessToken, data) {
        const apiVersion = '2024-01';
        const baseURL = `https://${shop}/admin/api/${apiVersion}/graphql.json`;

        // Split name safely
        const nameParts = data.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer';

        const customAttributes = [];
        if (data.reference) customAttributes.push({ key: "Reference", value: data.reference });

        const query = `
            mutation draftOrderCreate($input: DraftOrderInput!) {
                draftOrderCreate(input: $input) {
                    draftOrder {
                        id
                        invoiceUrl
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        const variables = {
            input: {
                lineItems: [{
                    title: "Custom Payment",
                    originalUnitPrice: data.amount,
                    quantity: 1,
                    customAttributes: customAttributes
                }],
                customer: {
                    firstName: firstName,
                    lastName: lastName,
                    email: data.email,
                    phone: data.phone || null
                },
                note: data.note || "Created via Custom Payment Page",
                useCustomerDefaultAddress: false
            }
        };

        try {
            const response = await axios.post(
                baseURL,
                { query, variables },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': accessToken
                    }
                }
            );

            const responseData = response.data;

            // Agar GraphQL syntax ya token ka error hai
            if (responseData.errors) {
                throw new Error(`Shopify API Error: ${responseData.errors[0].message}`);
            }

            const { draftOrder, userErrors } = responseData.data.draftOrderCreate;

            // Agar Shopify ne data reject kiya (e.g. invalid amount)
            if (userErrors && userErrors.length > 0) {
                throw new Error(`Shopify rejected data: ${userErrors[0].message}`);
            }

            return draftOrder.invoiceUrl;

        } catch (error) {
            console.error('[Shopify API Error]', error.response?.data || error.message);
            
            // Agar Token galat hai ya expire ho gaya hai
            if (error.response && error.response.status === 401) {
                throw new Error("Invalid Shopify Token. Please re-authenticate the app.");
            }
            // Agar Token sahi hai lekin permission (scopes) nahi hain
            if (error.response && error.response.status === 403) {
                throw new Error("Missing Scopes. Make sure 'write_draft_orders' is enabled in Shopify App settings.");
            }
            
            // Asal error aage bhejein
            throw error; 
        }
    }
}

module.exports = new ShopifyService();