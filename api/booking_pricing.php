<?php

/**
 * Calculate a booking's base package, selected add-ons, discount, and fees
 * from current database prices. Client-supplied subtotal fields are ignored.
 */
function completedBookingPaymentsCents(PDO $pdo, int $bookingId): int
{
    $query = $pdo->prepare(
        "SELECT amount
         FROM payments
         WHERE booking_id = ?
           AND payment_status = 'Completed'
         ORDER BY payment_id
         FOR UPDATE"
    );
    $query->execute([$bookingId]);
    $total = 0;
    foreach ($query->fetchAll(PDO::FETCH_COLUMN) as $amount) {
        $total += moneyCents($amount);
    }
    return $total;
}

function bookingBalanceCents(
    PDO $pdo,
    int $bookingId,
    $agreedTotal
): int {
    return moneyCents($agreedTotal)
        - completedBookingPaymentsCents($pdo, $bookingId);
}

function calculateBookingTotals(PDO $pdo, int $serviceId, ?int $packageId, array $addonIds, $discount, $fees, $snapshotPrice = null): array
{
    $packagePrice = $snapshotPrice ?? 0;
    if ($packageId && $snapshotPrice === null) {
        $package = $pdo->prepare('SELECT price FROM packages WHERE package_id = ? AND service_id = ?');
        $package->execute([$packageId, $serviceId]);
        $packagePrice = $package->fetchColumn();
        if ($packagePrice === false) throw new InvalidArgumentException('The selected package is not valid for this service.');
    }

    $ids = [];
    foreach ($addonIds as $value) {
        $value = (string)$value;
        if (ctype_digit($value)) {
            $addonId = (int)$value;
        } elseif (preg_match('/^[A-Za-z][A-Za-z0-9]*-(\d+)$/', $value, $match)) {
            $addonId = (int)$match[1];
        } else {
            throw new InvalidArgumentException('An add-on selection is invalid.');
        }
        if ($addonId < 1) {
            throw new InvalidArgumentException('An add-on selection is invalid.');
        }
        $ids[$addonId] = $addonId;
    }

    $addonsTotal = 0;
    if ($ids) {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $addons = $pdo->prepare("SELECT addon_id, price FROM addons WHERE service_id = ? AND status = 'Active' AND addon_id IN ($placeholders)");
        $addons->execute([$serviceId, ...array_values($ids)]);
        $prices = $addons->fetchAll();
        if (count($prices) !== count($ids)) {
            throw new InvalidArgumentException('One or more selected add-ons are not valid for this service.');
        }
        foreach ($prices as $addon) {
            $price = (int)round((float)$addon['price'] * 100);
            if ($price < 0) throw new InvalidArgumentException('Add-on price cannot be negative.');
            $addonsTotal += $price;
        }
    }

    if (!is_numeric($discount) || !is_numeric($fees) || (float)$discount < 0 || (float)$fees < 0) {
        throw new InvalidArgumentException('Discount and fees must be non-negative amounts.');
    }

    $subtotal = (int)round((float)$packagePrice * 100);
    $discountCents = (int)round((float)$discount * 100);
    $feesCents = (int)round((float)$fees * 100);
    $total = max($subtotal + $addonsTotal - $discountCents + $feesCents, 0);

    return [
        'subtotal' => number_format($subtotal / 100, 2, '.', ''),
        'addons_total' => number_format($addonsTotal / 100, 2, '.', ''),
        'total' => number_format($total / 100, 2, '.', ''),
    ];
}
