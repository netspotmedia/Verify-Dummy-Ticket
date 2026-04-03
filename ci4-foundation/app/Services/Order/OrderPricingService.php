<?php

namespace App\Services\Order;

class OrderPricingService
{
    /** @param array<string,mixed> $data */
    public function calculate(array $data): array
    {
        $services = $data['services'] ?? [];
        $travelerCount = max(1, (int) ($data['traveler_count'] ?? 1));

        $flightPerPerson = $this->flightCostPerPerson((string) ($data['trip_type'] ?? 'one_way'), (string) ($data['validity'] ?? '3d'));
        $hotelTotal = $this->hotelCost((string) ($data['hotel_type'] ?? 'shared_booking'), $travelerCount);
        $insurancePerPerson = $this->insuranceCostPerPerson((string) ($data['insurance_area'] ?? 'schengen'), (string) ($data['insurance_duration'] ?? '21d'));
        $deliveryCost = $this->deliveryCost((string) ($data['delivery_speed'] ?? 'normal'));

        $items = [];
        if (in_array('flight', $services, true)) {
            $items[] = ['code' => 'flight', 'label' => 'Flight Reservation', 'qty' => $travelerCount, 'unit' => $flightPerPerson, 'total' => $flightPerPerson * $travelerCount];
        }
        if (in_array('hotel', $services, true)) {
            $items[] = ['code' => 'hotel', 'label' => 'Hotel Confirmation', 'qty' => 1, 'unit' => $hotelTotal, 'total' => $hotelTotal];
        }
        if (in_array('insurance', $services, true)) {
            $items[] = ['code' => 'insurance', 'label' => 'Travel Insurance', 'qty' => $travelerCount, 'unit' => $insurancePerPerson, 'total' => $insurancePerPerson * $travelerCount];
        }

        $items[] = ['code' => 'delivery', 'label' => 'Delivery Speed', 'qty' => 1, 'unit' => $deliveryCost, 'total' => $deliveryCost];

        $subtotal = array_sum(array_map(static fn($i) => (float) $i['total'], $items));
        $tax = 0.0;
        $discount = 0.0;
        $total = max(0, $subtotal + $tax - $discount);

        return [
            'items' => $items,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $discount,
            'total' => $total,
        ];
    }

    private function flightCostPerPerson(string $tripType, string $validity): float
    {
        $trip = match ($tripType) {
            'one_way' => 5,
            'return_trip' => 8,
            'multi_city' => 15,
            default => 5,
        };

        $valid = match ($validity) {
            '3d' => 0,
            '7d' => 5,
            '14d' => 10,
            '21d' => 15,
            '30d' => 20,
            default => 0,
        };

        return (float) ($trip + $valid);
    }

    private function hotelCost(string $hotelType, int $travelerCount): float
    {
        if ($hotelType === 'separate_per_traveler') {
            return (float) (5 * $travelerCount);
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
