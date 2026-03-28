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

            if (responseData.errors) {
                throw new Error(`GraphQL Error: ${JSON.stringify(responseData.errors)}`);
            }

            const { draftOrder, userErrors } = responseData.data.draftOrderCreate;

            if (userErrors && userErrors.length > 0) {
                throw new Error(userErrors[0].message);
            }

            return draftOrder.invoiceUrl;

        } catch (error) {
            console.error('[Shopify API Error]', error.response?.data || error.message);
            throw new Error('Failed to generate secure checkout link.');
        }
    }
}

module.exports = new ShopifyService();