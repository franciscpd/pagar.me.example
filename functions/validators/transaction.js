const { check, body } = require("express-validator");

module.exports = [
  check("postback_url")
    .isURL({
      protocols: ["https"],
      require_protocol: true
    })
    .withMessage("Enter a valid url"),
  check("amount")
    .isCurrency()
    .withMessage("Enter a valid currency"),
  body("payment_method").custom(value => {
    if (["credit_card", "boleto"].indexOf(value) === -1) {
      throw new Error("Enter a valid payment method");
    }

    return true;
  }),
  check("card_hash")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("card_holder_name")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("card_cvv")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("card_number")
    .isCreditCard()
    .withMessage("Enter a valid credit card"),
  check("card_expiration_date")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("customer")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  body("customer.type").custom(value => {
    if (["individual", "corporation"].indexOf(value) === -1) {
      throw new Error("Enter a valid customer type");
    }

    return true;
  }),
  check("customer.external_id")
    .isUUID()
    .withMessage("Enter a valid uuid"),
  check("customer.name")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("customer.country")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("customer.email")
    .isEmail()
    .withMessage("Enter a valid email"),
  check("customer.documents")
    .isArray()
    .withMessage("Enter a valid array"),
  body("customer.documents.*.type").custom((value, { req }) => {
    if (["cpf", "cnpj"].indexOf(value) === -1) {
      throw new Error("Enter a valid document type");
    }

    if (req.customer.type === "individual") {
    }

    return true;
  }),
  check("customer.documents.*.type")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("customer.documents.*.number")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.name")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.address")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.address.country")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.address.state")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.address.city")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.address.neighborhood")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.address.street")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.address.street_number")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("billing.address.zipcode")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("items")
    .isArray()
    .withMessage("Enter a valid array"),
  check("items.*.id")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("items.*.title")
    .not()
    .isEmpty()
    .withMessage("Field is required"),
  check("items.*.unit_price")
    .isCurrency()
    .withMessage("Field is required"),
  check("items.*.quantity")
    .isNumeric()
    .withMessage("Field is required"),
  check("items.*.tangible")
    .isBoolean()
    .withMessage("Field is required")
];
