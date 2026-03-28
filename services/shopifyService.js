const axios = require('axios');

class ShopifyService {
    async createDraftOrder(shop, accessToken, data) {
        const apiVersion = '2024-01';
        const baseURL = `https://${shop}/admin/api/${apiVersion}/graphql.json`;

        const customAttributes = [
            { key: "Customer Name", value: data.fullName || "Guest" }
        ];
        
        if (data.reference) {
            customAttributes.push({ key: "Reference", value: data.reference });
        }
        if (data.phone) {
            customAttributes.push({ key: "Phone Number", value: data.phone });
        }

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

        const input = {
            lineItems: [{
                title: "Custom Payment",
                originalUnitPrice: data.amount,
                quantity: 1,
                customAttributes: customAttributes
            }],
            email: data.email, 
            note: data.note || "Created via Custom Payment Page"
        };

        const variables = { input };

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

            if (responseData.errors) {
                throw new Error(`Shopify API Error: ${responseData.errors[0].message}`);
            }

            const { draftOrder, userErrors } = responseData.data.draftOrderCreate;

            if (userErrors && userErrors.length > 0) {
                throw new Error(`Shopify rejected data: ${userErrors[0].message}`);
            }

            return draftOrder.invoiceUrl;

        } catch (error) {
            console.error('[Shopify API Error]', error.response?.data || error.message);
            
            if (error.response && error.response.status === 401) {
                throw new Error("Invalid Shopify Token. Please re-authenticate the app.");
            }
            if (error.response && error.response.status === 403) {
                throw new Error("Missing Scopes. Make sure 'write_draft_orders' is enabled in Shopify App settings.");
            }
            
            throw error; 
        }
    }
}

module.exports = new ShopifyService();