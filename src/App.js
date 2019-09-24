import React, { useReducer, useEffect } from "react";
import getUuid from "uuid-by-string";
import pagarme from "pagarme";
import { db } from "services/firebase";
import { general } from "config";
import api from "services/api";

const INITIAL_STATE = {
  card_number: "",
  card_holder_name: "",
  card_expiration_month: "",
  card_expiration_year: "",
  card_cvv: "",
  transaction_id: null,
  listener: null,
  transaction: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.payload.key]: action.payload.value };
    case "SET_TRANSACTION_ID":
      return { ...state, transaction_id: action.payload.id };
    case "SET_TRANSACTION":
      return { ...state, transaction: action.payload.transaction };
    case "SET_LISTENER":
      return { ...state, listener: action.payload.ref };
    case "CLEAR_LISTENER":
      return { ...state, listener: null };
    default:
      throw new Error();
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    if (state.transaction_id) {
      const ref = db
        .collection("transactions")
        .doc(state.transaction_id)
        .onSnapshot(doc => {
          dispatch({
            type: "SET_TRANSACTION",
            payload: { transaction: doc.data() }
          });
        });
      dispatch({ type: "SET_LISTENER", payload: { ref } });
    }
  }, [state.transaction_id]);

  useEffect(() => {
    if (state.transaction) {
      console.log(state.transaction, state.transaction_id);
    }
  }, [state.transaction, state.transaction_id]);

  const handleChange = e => {
    dispatch({
      type: "SET_FIELD",
      payload: { key: e.target.id, value: e.target.value }
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { encryption_key } = general;
    const {
      card_number,
      card_holder_name,
      card_expiration_month,
      card_expiration_year,
      card_cvv
    } = state;
    const card = {
      card_number,
      card_cvv,
      card_holder_name,
      card_expiration_date: `${card_expiration_month}/${card_expiration_year}`
    };

    const cardValidation = pagarme.validate({ card });

    if (!cardValidation.card.card_number)
      console.log("Oops, número de cartão incorreto");

    pagarme.client
      .connect({ encryption_key })
      .then(client => client.security.encrypt(card))
      .then(async card_hash => {
        await api
          .post("/transaction", {
            amount: 1000,
            ...card,
            card_hash,
            postback_url: `${general.base_url}/postback`,
            payment_method: "credit_card",
            customer: {
              type: "individual",
              external_id: getUuid("franciscpd@gmail.com"),
              name: "Francisross Soares de Oliveira",
              country: "br",
              email: "franciscpd@gmail.com",
              documents: [
                {
                  type: "cpf",
                  number: "00000000000"
                }
              ],
              phone_numbers: ["+5516996324483"]
            },
            billing: {
              name: "Francisross Soares de Oliveira",
              address: {
                country: "br",
                state: "sp",
                city: "Ribeirão Preto",
                neighborhood: "Jardim Manuel Pena",
                street: "Rua João Mobíglia",
                street_number: "325",
                zipcode: "14098300"
              }
            },
            items: [
              {
                id: "r123",
                title: "Red pill",
                unit_price: 500,
                quantity: 1,
                tangible: false
              },
              {
                id: "b123",
                title: "Blue pill",
                unit_price: 500,
                quantity: 1,
                tangible: false
              }
            ]
          })
          .then(res => {
            dispatch({
              type: "SET_TRANSACTION_ID",
              payload: { id: res.data.id.toString() }
            });
          })
          .catch(error => {
            console.log(error);
          });
      });
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        Número do cartão:{" "}
        <input
          type="text"
          id="card_number"
          value={state.card_number}
          onChange={handleChange}
        />
        <br />
        Nome (como escrito no cartão):{" "}
        <input
          type="text"
          id="card_holder_name"
          value={state.card_holder_name}
          onChange={handleChange}
        />
        <br />
        Mês de expiração:{" "}
        <input
          type="text"
          id="card_expiration_month"
          value={state.card_expiration_month}
          onChange={handleChange}
        />
        <br />
        Ano de expiração:{" "}
        <input
          type="text"
          id="card_expiration_year"
          value={state.card_expiration_year}
          onChange={handleChange}
        />
        <br />
        Código de segurança:{" "}
        <input
          type="text"
          id="card_cvv"
          value={state.card_cvv}
          onChange={handleChange}
        />
        <br />
        <div id="field_errors" />
        <input type="submit" value="Enviar" />
      </form>
    </div>
  );
};

export default App;
