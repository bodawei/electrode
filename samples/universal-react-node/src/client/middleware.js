import "es6-promise";
import "isomorphic-fetch";
const HTTP_BAD_REQUEST = 400;
const HTTP_OK = 200;
let token;

const updateStorage = (store) => (next) => (action) => {
  const result = next(action);
  const completeState = store.getState();
  fetch("/1", {credentials: "same-origin"})
    .then((resp) => {
      if (resp.status === HTTP_OK) {
        token = resp.headers.get("x-csrf-jwt");
      } else {
        throw new Error("token generation failed");
      }
      fetch("/updateStorage", {
        credentials: "same-origin",
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "x-csrf-jwt": token
        },
        body: JSON.stringify(completeState)
      })
        .then((response) => {
          if (response.status >= HTTP_BAD_REQUEST) {
            throw new Error("Bad response from server");
          }
          return result;
        })
        .catch((err) => {
          throw new Error("Error Updating Storage", err);
        });
    })
    .catch((err) => {
      throw new Error("Error Fetching Csrf Token", err);
    });
};

export default updateStorage;
