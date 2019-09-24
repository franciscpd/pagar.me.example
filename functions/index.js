const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const { validationResult } = require("express-validator");
const bodyParser = require("body-parser");
const cors = require("cors");
const pagarme = require("pagarme");

const { api_key, _encryption_key } = functions.config().pagarme;

const { transaction } = require("./validators");

const app = express();

admin.initializeApp();
app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/postback", (req, res) => {
  const db = admin.firestore();
  const { id, current_status } = req.body;

  const transactionRef = db.collection("transactions").doc(id.toString());
  transactionRef.get().then(doc => {
    if (doc.exists) {
      transactionRef
        .set(
          {
            status: current_status
          },
          { merge: true }
        )
        .then(() => {
          res.sendStatus(200);
          return true;
        })
        .catch(err => {
          console.log(err);
        });
    }
  });

  return true;
});

app.post("/transaction", transaction, (req, res) => {
  const db = admin.firestore();
  const {
    postback_url,
    amount,
    card_hash,
    card_holder_name,
    card_cvv,
    card_number,
    card_expiration_date,
    customer,
    billing,
    items,
    installments = 1,
    soft_descriptor,
    payment_method,
    boleto_instructions
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  pagarme.transactions
    .create(
      {},
      {
        api_key,
        postback_url,
        async: Boolean(postback_url),
        amount,
        card_hash,
        card_holder_name,
        card_cvv,
        card_number,
        card_expiration_date,
        customer,
        billing,
        installments,
        payment_method,
        soft_descriptor,
        boleto_instructions,
        items
      }
    )
    .then(
      ({
        id,
        status,
        refuse_reason,
        status_reason,
        amount,
        installments,
        cost,
        payment_method,
        boleto_url,
        boleto_barcode,
        boleto_expiration_date,
        customer,
        billing,
        items
      }) => {
        db.collection("transactions")
          .doc(id.toString())
          .set({
            status,
            refuse_reason,
            status_reason,
            amount,
            installments,
            cost,
            payment_method,
            boleto_url,
            boleto_barcode,
            boleto_expiration_date,
            customer,
            billing,
            items
          })
          .then(() => {
            res.status(200).send({ id });
          });
      }
    )
    .catch(error => {
      res.status(400).send({ error });
    });
});

exports.api = functions.https.onRequest(app);
