// Edit this file to change business details, prices and contacts.
window.SAFISHA_CONFIG = {
  businessName: "Safisha Laundry Services",
  tagline: "By students, for students.",
  currency: "KSh",

  services: [
    { id: "wash-fold", name: "Wash & fold", unit: "per kg", price: 150 },
    { id: "wash-iron", name: "Wash & iron", unit: "per kg", price: 200 },
    { id: "iron-only", name: "Iron only", unit: "per item", price: 50 },
    { id: "bedding", name: "Bedding & duvets", unit: "per item", price: 400 }
  ],

  fees: {
    pickup: 100,
    dropoff: 0
  },

  serviceAreas: [
    "Main campus hostels",
    "Off-campus hostels",
    "Town centre",
    "Other"
  ],

  contact: {
    phone: "+254 700 000 000",
    whatsapp: "254700000000",
    email: "hello@example.com",
    pickupPoint: "Ask us for the pickup point near campus"
  }
};
