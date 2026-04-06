# Order Form Logic, Pricing Rules, and Validation (Developer Blueprint)

This document captures the canonical logic for the CI4 order wizard implementation.

## Step flow
1. Select services
2. Common information
3. Flight details (conditional)
4. Hotel details (conditional)
5. Insurance details (conditional)
6. Delivery + review
7. Payment

## Supported services
- Flight Reservation
- Hotel Confirmation
- Travel Insurance

## Core pricing rules (USD base)

### Flight
- One Way: $5 per traveler
- Return Trip: $8 per traveler
- Multi-City: $15 per traveler

`flightTripTotal = tripTypePrice * travelerCount`

### Flight Validity (flat per order)
- 3d: $0
- 7d: $5
- 14d: $10
- 21d: $15
- 30d: $20

### Hotel
- Separate per traveler: `travelerCount * 5`
- One for all: `5 + max(travelerCount - 1, 0) * 1`

### Insurance (per traveler)
- Schengen: 21d=20, 3m=30, 6m=40, 1y=50
- Worldwide Area 1: 21d=25, 3m=35, 6m=45, 1y=55
- Worldwide Area 2: 21d=28, 3m=48, 6m=65, 1y=80

`insuranceTotal = insuranceUnitPrice * travelerCount`

### Delivery (flat)
- Normal: $0
- Fast: $5
- Express: $10

## Total formula
`totalUSD = flightTripTotal + flightValidity + hotelTotal + insuranceTotal + deliveryTotal`

## Currency and gateway logic
- Base pricing is USD.
- Nigeria (`countryCode=NG`):
  - display currency: NGN
  - gateway: Paystack only
- Other countries:
  - display currency: USD
  - gateway: Paystack or PayPal

`totalNGN = round(totalUSD * exchangeRate)`

## Validation requirements
- At least one service selected
- travelerCount >= 1
- email valid
- country + countryCode required
- if flight selected: tripType + validity + details required
- if hotel selected: hotel type required
- if insurance selected: area + duration required
- gateway must be allowed for country
