# Payment Setup Instructions

## Stripe Configuration for Belgium (EUR)

### 1. Environment Variables

Create a `.env.local` file in the project root with:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://13.37.117.93/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Regional Settings
NEXT_PUBLIC_DEFAULT_CURRENCY=EUR
NEXT_PUBLIC_DEFAULT_LOCALE=nl-BE
NEXT_PUBLIC_DEFAULT_COUNTRY=BE

# Development
NODE_ENV=development
```

### 2. Stripe Test Cards for Belgium/EUR

#### ✅ Successful Payment Cards:

- **Visa**: `4242424242424242`
- **Visa Debit**: `4000056655665556`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`

#### ❌ Declined Payment Cards:

- **Generic Decline**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`
- **Lost Card**: `4000000000009987`
- **Stolen Card**: `4000000000009979`

#### 🔐 Authentication Required:

- **3D Secure**: `4000002500003155`

**Note**: Use any future expiry date (e.g., 12/34), any 3-digit CVC, and any postal code.

### 3. Backend Configuration Required

Ensure your backend is configured for:

- **Currency**: EUR (Euro)
- **Country**: Belgium (BE)
- **Locale**: nl-BE
- **Stripe Test Mode**: Enabled

### 4. Testing the Payment Flow

1. Run the development server: `npm run dev`
2. Navigate to `/payment-test` (only visible in development)
3. Use the test cards provided above
4. Check the payment results and backend logs

### 5. Frontend Updates Made

- ✅ Currency formatting changed to EUR with Dutch-Belgium locale
- ✅ PaymentService updated with EUR conversion methods
- ✅ Test card helper component created
- ✅ Payment test page added for development
- ✅ Navigation updated with payment test link (dev only)

### 6. Integration Checklist

- [ ] Update backend Stripe configuration to EUR
- [ ] Set backend country to Belgium (BE)
- [ ] Configure webhook endpoints for EUR payments
- [ ] Update product prices from UAH to EUR
- [ ] Test all payment flows with test cards
- [ ] Verify currency display throughout the application

### 7. Production Deployment

Before going to production:

1. Replace test Stripe keys with live keys
2. Update webhook URLs to production
3. Remove `/payment-test` route access
4. Verify all EUR amounts are correct
5. Test with real Belgian payment methods

### 8. Useful Resources

- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Belgium Guide](https://stripe.com/docs/connect/country-guide/belgium)
- [EUR Payment Methods](https://stripe.com/docs/payments/payment-methods/overview#europe)
