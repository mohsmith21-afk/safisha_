(function () {
  "use strict";

  var STORAGE_KEY = "safisha_demo_bookings_v1";
  var STATUSES = ["Received", "Washing", "Ready", "Delivered"];

  var cfg = window.SAFISHA_CONFIG;
  if (!cfg) {
    document.getElementById("price-list").textContent =
      "Config file not loaded. Check that config.js is in the same folder.";
    return;
  }

  function $(id) { return document.getElementById(id); }
  function money(n) { return cfg.currency + " " + Number(n).toLocaleString("en-KE"); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Fill in text from config
  $("brand-name").textContent = cfg.businessName;
  $("hero-tagline").textContent = cfg.tagline;
  $("footer-name").textContent = cfg.businessName;
  $("contact-phone").textContent = cfg.contact.phone;
  $("contact-email").textContent = cfg.contact.email;
  $("contact-pickup").textContent = cfg.contact.pickupPoint;
  $("fee-note").textContent =
    "Pickup fee: " + money(cfg.fees.pickup) + ". Drop-off is free.";
  $("whatsapp-btn").href = "https://wa.me/" + cfg.contact.whatsapp;

  // Prices
  $("price-list").innerHTML = cfg.services.map(function (s) {
    return '<div class="card"><h3>' + escapeHtml(s.name) + '</h3>' +
      '<div class="price">' + money(s.price) + '</div>' +
      '<div class="unit">' + escapeHtml(s.unit) + '</div></div>';
  }).join("");

  // Dropdowns
  $("area").innerHTML = cfg.serviceAreas.map(function (a) {
    return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + '</option>';
  }).join("");
  $("service").innerHTML = cfg.services.map(function (s) {
    return '<option value="' + s.id + '">' + escapeHtml(s.name) + ' (' + money(s.price) + ' ' + escapeHtml(s.unit) + ')</option>';
  }).join("");

  // Minimum date is today
  var today = new Date();
  var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
  $("date").min = iso;
  $("date").value = iso;

  // Price estimate
  function estimate() {
    var service = cfg.services.find(function (s) { return s.id === $("service").value; });
    var qty = Number($("quantity").value) || 0;
    var fee = $("fulfilment").value === "pickup" ? cfg.fees.pickup : cfg.fees.dropoff;
    var total = service ? service.price * qty + fee : 0;
    $("estimate").textContent = money(total);
  }
  ["service", "quantity", "fulfilment"].forEach(function (id) {
    $(id).addEventListener("input", estimate);
    $(id).addEventListener("change", estimate);
  });
  estimate();

  // Storage helpers
  function loadBookings() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveBookings(all) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  // Demo status: advances every 2 minutes after booking
  function statusFor(booking) {
    var minutes = (Date.now() - booking.createdAt) / 60000;
    var index = Math.min(Math.floor(minutes / 2), STATUSES.length - 1);
    return index;
  }

  function renderTracker(booking) {
    var current = statusFor(booking);
    var items = STATUSES.map(function (label, i) {
      var cls = i < current ? "done" : (i === current ? "current" : "");
      return '<li class="' + cls + '">' + label + '</li>';
    }).join("");
    $("track-result").innerHTML =
      '<p><strong>Reference:</strong> ' + escapeHtml(booking.ref) + '</p>' +
      '<p><strong>Service:</strong> ' + escapeHtml(booking.serviceName) + ', ' +
      escapeHtml(booking.quantity) + ' unit(s)</p>' +
      '<ul class="status-list">' + items + '</ul>' +
      '<p class="muted">Demo: status advances automatically over time.</p>';
  }

  // Validation
  function validPhone(raw) {
    var p = raw.replace(/\s+/g, "");
    return /^(\+254|254|0)[17]\d{8}$/.test(p);
  }

  $("booking-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var errors = [];
    var name = $("name").value.trim();
    var phone = $("phone").value.trim();
    var qty = Number($("quantity").value);

    if (name.length < 2) errors.push("Please enter your name.");
    if (!validPhone(phone)) errors.push("Enter a valid Kenyan phone number, e.g. 0712 345 678.");
    if (!qty || qty < 1) errors.push("Quantity must be at least 1.");
    if (!$("date").value) errors.push("Please choose a date.");

    $("form-errors").textContent = errors.join(" ");
    if (errors.length) return;

    var service = cfg.services.find(function (s) { return s.id === $("service").value; });
    var ref = "SF-" + Math.floor(10000 + Math.random() * 90000);
    var booking = {
      ref: ref,
      name: name,
      phone: phone,
      area: $("area").value,
      serviceName: service.name,
      quantity: qty,
      fulfilment: $("fulfilment").value,
      date: $("date").value,
      notes: $("notes").value.trim(),
      total: $("estimate").textContent,
      createdAt: Date.now()
    };

    var all = loadBookings();
    all[ref] = booking;
    saveBookings(all);

    $("confirmation").hidden = false;
    $("confirmation").innerHTML =
      '<strong>Demo order placed.</strong><br>' +
      'Your reference is <strong>' + ref + '</strong>. Keep it to track your order.<br>' +
      'Estimated total: ' + escapeHtml(booking.total) + '.';

    $("booking-form").reset();
    $("date").value = iso;
    estimate();
    renderTracker(booking);
  });

  // Tracker
  $("track-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var ref = $("ref").value.trim().toUpperCase();
    var booking = loadBookings()[ref];
    if (!booking) {
      $("track-result").innerHTML =
        '<p class="error">No order found with that reference on this device.</p>';
      return;
    }
    renderTracker(booking);
  });
})();
