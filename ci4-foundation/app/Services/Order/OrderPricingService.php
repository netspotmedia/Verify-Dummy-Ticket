<?php

namespace App\Services\Order;

use InvalidArgumentException;

class OrderPricingService
{
    /** @param array<string,mixed> $data */
    public function calculate(array $data): array
    {
        $services = $data['services'] ?? [];
        $travelerCount = max(1, (int) ($data['traveler_count'] ?? 1));
        $countryCode = strtoupper((string) ($data['customer_country_code'] ?? 'US'));
        $provider = strtolower((string) ($data['provider'] ?? 'paystack'));
        $exchangeRate = (float) ($data['exchange_rate'] ?? 1650);

        $tripTypePrice = $this->tripTypePrice((string) ($data['trip_type'] ?? 'one_way'));
        $validityPrice = $this->flightValidityPrice((string) ($data['validity'] ?? '3d'));
        $flightTotal = in_array('flight', $services, true) ? ($tripTypePrice * $travelerCount + $validityPrice) : 0.0;

        $hotelTotal = 0.0;
        if (in_array('hotel', $services, true)) {
            $hotelTotal = $this->hotelCost((string) ($data['hotel_type'] ?? 'one_for_all'), $travelerCount);
        }

        $insuranceTotal = 0.0;
        if (in_array('insurance', $services, true)) {
            $insuranceTotal = $this->insuranceCostPerPerson((string) ($data['insurance_area'] ?? 'schengen'), (string) ($data['insurance_duration'] ?? '21d')) * $travelerCount;
        }

        $deliveryCost = $this->deliveryCost((string) ($data['delivery_speed'] ?? 'normal'));

        $items = [];
        if (in_array('flight', $services, true)) {
            $items[] = ['code' => 'flight_trip', 'label' => 'Flight Reservation', 'qty' => $travelerCount, 'unit' => $tripTypePrice, 'total' => $tripTypePrice * $travelerCount];
            $items[] = ['code' => 'flight_validity', 'label' => 'Flight Validity', 'qty' => 1, 'unit' => $validityPrice, 'total' => $validityPrice];
        }
        if (in_array('hotel', $services, true)) {
            $hotelType = (string) ($data['hotel_type'] ?? 'one_for_all');
            $items[] = ['code' => 'hotel', 'label' => $hotelType === 'separate_per_traveler' ? 'Hotel (Separate)' : 'Hotel (One for all)', 'qty' => $hotelType === 'separate_per_traveler' ? $travelerCount : 1, 'unit' => $hotelType === 'separate_per_traveler' ? 5 : 0, 'total' => $hotelTotal];
        }
        if (in_array('insurance', $services, true)) {
            $unit = $this->insuranceCostPerPerson((string) ($data['insurance_area'] ?? 'schengen'), (string) ($data['insurance_duration'] ?? '21d'));
            $items[] = ['code' => 'insurance', 'label' => 'Travel Insurance', 'qty' => $travelerCount, 'unit' => $unit, 'total' => $insuranceTotal];
        }
        $items[] = ['code' => 'delivery', 'label' => 'Delivery Speed', 'qty' => 1, 'unit' => $deliveryCost, 'total' => $deliveryCost];

        $subtotalUsd = $flightTotal + $hotelTotal + $insuranceTotal + $deliveryCost;
        $taxUsd = 0.0;
        $discountUsd = 0.0;
        $totalUsd = max(0.0, $subtotalUsd + $taxUsd - $discountUsd);

        $isNigeria = $countryCode === 'NG';
        $currency = $isNigeria ? 'NGN' : 'USD';

        $allowedProviders = $isNigeria ? ['paystack'] : ['paystack', 'paypal'];
        if (! in_array($provider, $allowedProviders, true)) {
            throw new InvalidArgumentException($isNigeria ? 'Nigeria checkout supports Paystack only.' : 'Choose Paystack or PayPal.');
        }

        $displayMultiplier = $currency === 'NGN' ? $exchangeRate : 1;

        return [
            'currency' => $currency,
            'allowed_providers' => $allowedProviders,
            'exchange_rate' => $exchangeRate,
            'items' => $items,
            'subtotal_usd' => $subtotalUsd,
            'tax_usd' => $taxUsd,
            'discount_usd' => $discountUsd,
            'total_usd' => $totalUsd,
            'subtotal' => round($subtotalUsd * $displayMultiplier, 2),
            'tax' => round($taxUsd * $displayMultiplier, 2),
            'discount' => round($discountUsd * $displayMultiplier, 2),
            'total' => round($totalUsd * $displayMultiplier, 2),
            'provider' => $provider,
        ];
    }

    private function tripTypePrice(string $tripType): float
    {
        return match ($tripType) {
            'one_way' => 5,
            'return_trip' => 8,
            'multi_city' => 15,
            default => 5,
        };
    }

    private function flightValidityPrice(string $validity): float
    {
        return match ($validity) {
            '3d' => 0,
            '7d' => 5,
            '14d' => 10,
            '21d' => 15,
            '30d' => 20,
            default => 0,
        };
    }

    private function hotelCost(string $hotelType, int $travelerCount): float
    {
        if ($hotelType === 'separate_per_traveler') {
            return (float) ($travelerCount * 5);
        }
        return (float) (5 + max($travelerCount - 1, 0));
    }

    private function insuranceCostPerPerson(string $area, string $duration): float
    {
        $table = [
            'schengen' => ['21d' => 20, '3m' => 30, '6m' => 40, '1y' => 50],
            'worldwide_area_1' => ['21d' => 25, '3m' => 35, '6m' => 45, '1y' => 55],
            'worldwide_area_2' => ['21d' => 28, '3m' => 48, '6m' => 65, '1y' => 80],
        ];

        return (float) ($table[$area][$duration] ?? 20);
    }

    private function deliveryCost(string $speed): float
    {
        return match ($speed) {
            'express' => 10,
            'fast' => 5,
            default => 0,
        };
    }
}
