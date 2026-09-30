/**
 * config.js
 * Central place for constant lists used across the app.
 * When the PHP backend is built, these can be mirrored server-side
 * (e.g. as ENUM columns or lookup tables) without changing the UI code
 * that references them.
 */
const CONFIG = {
  businessNameFallback: "AKAD Sweet Party Rentals",

  bookingStatuses: [
    "Pending", "Confirmed", "Reserved", "Preparing", "Released",
    "Event Completed", "Returned", "Inspected", "Completed",
    "Cancelled", "Rejected"
  ],

  // Status colors for badges (Bootstrap contextual classes)
  bookingStatusColors: {
    "Pending": "warning",
    "Confirmed": "info",
    "Reserved": "info",
    "Preparing": "primary",
    "Released": "primary",
    "Event Completed": "secondary",
    "Returned": "secondary",
    "Inspected": "secondary",
    "Completed": "success",
    "Cancelled": "dark",
    "Rejected": "danger"
  },

  paymentStatuses: ["Unpaid", "Partial", "Fully Paid"],
  paymentStatusColors: {
    "Unpaid": "danger",
    "Partial": "warning",
    "Fully Paid": "success"
  },

  paymentMethods: ["GCash", "MariBank"],

  customerTypes: ["Guest / No Account", "Registered"],

  inventoryStatuses: [
    "Available", "Reserved", "Released", "On Rental",
    "Returned", "Damaged", "Under Maintenance", "Missing"
  ],
  inventoryStatusColors: {
    "Available": "success",
    "Reserved": "info",
    "Released": "primary",
    "On Rental": "primary",
    "Returned": "secondary",
    "Damaged": "danger",
    "Under Maintenance": "warning",
    "Missing": "dark"
  },

  itemConditions: ["Good", "Minor Damage", "Damaged", "Missing", "Not Applicable"],

  eventTypes: [
    "Birthday Party", "Wedding", "Debut", "Christening", "Corporate Event",
    "Reunion", "Anniversary", "Graduation", "Other"
  ],

  minBookingNoticeDaysDefault: 2,
  bookingHoursDefault: { open: "08:00", close: "22:00" }
};
