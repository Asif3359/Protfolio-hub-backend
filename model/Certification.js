// models/Certification.js
const mongoose = require("../db");

const CertificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  issuer: String,
  issueDate: Date,
  credentialLink: String
}, { versionKey: false });

module.exports = mongoose.model("Certification", CertificationSchema);
