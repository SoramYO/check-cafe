"use strict";

const { BadRequestError } = require("../configs/error.response");

const validateShopOwnerRegistration = (req, res, next) => {
  const {
    shop_name,
    owner_name,
    email,
    password,
    phone,
    address,
    city,
    city_code,
    district,
    district_code,
    ward,
    description,
    category,
  } = req.body;

  // Required fields validation
  const requiredFields = {
    shop_name: "Shop name is required",
    owner_name: "Owner name is required",
    email: "Email is required",
    password: "Password is required",
    phone: "Phone number is required",
    address: "Address is required",
    city: "City is required",
    city_code: "City code is required",
    district: "District is required",
    district_code: "District code is required",
    ward: "Ward is required",
    description: "Description is required",
    category: "Category is required",
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    if (!req.body[field] || String(req.body[field]).trim() === "") {
      throw new BadRequestError(message);
    }
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new BadRequestError("Invalid email format");
  }

  // Password length validation
  if (password.length < 6) {
    throw new BadRequestError("Password must be at least 6 characters long");
  }

  // Phone number validation (Vietnamese format)
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    throw new BadRequestError("Invalid phone number format");
  }

  // Sanitize inputs
  req.body.shop_name = shop_name.trim();
  req.body.owner_name = owner_name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = phone.trim();
  req.body.address = address.trim();
  req.body.city = city.trim();
  req.body.district = district.trim();
  req.body.ward = ward.trim();
  req.body.description = description.trim();
  req.body.category = category.trim();

  next();
};

module.exports = {
  validateShopOwnerRegistration,
}; 