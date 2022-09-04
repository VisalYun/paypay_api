const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const PAYPAY = require('@paypayopa/paypayopa-sdk-node');
const dotenv = require("dotenv")
const { v4: uuidv4 } = require('uuid');
//import { apiRouter } from './routes';
dotenv.config()

const port = process.env.APP_PORT ? process.env.APP_PORT : 4000;

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const MERCHANT_ID = process.env.MERCHANT_ID;
function configurePayPay() {
    PAYPAY.Configure({
        clientId: API_KEY,
        clientSecret: API_SECRET,
        merchantId: MERCHANT_ID,
        productionMode: false
    });
}
configurePayPay();

const app = express();
app.disable("x-powered-by");
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));
//app.use("/", apiRouter);

app.get("/", (req, res) => {
    res.render(__dirname+"index.html")
})

app.post("/auth", (req, res) => {
    let payload = {
        scopes: [
            "direct_debit"
        ],
        nonce: "random_generated_string",
        redirectType: "WEB_LINK",
        redirectUrl: "https://google.com",
        referenceId: uuidv4()
    };
    // Calling the method to create the account linking QR Code
    PAYPAY.AccountLinkQRCodeCreate(payload, (response) => {
        // Printing if the method call was SUCCESS
        console.log(response.BODY.resultInfo.code);
        // Printing the link to the generated QR Code
        res.send(response.BODY)
    });
})

app.post("/payment", (req, res) => {
    const token = req.headers['authorization']
    const userAuthId = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    const {amount, id} = req.body
    let payload = {
        merchantPaymentId: uuidv4(),
        amount: {
           amount,
           currency: "JPY"
        },
        userAuthorizationId: userAuthId.userAuthorizationId,
        orderDescription: `Deposit ${id}`
      };
      // Calling the method to create a qr code
      PAYPAY.CreatePayment(payload, (response) => {
      // Printing if the method call was SUCCESS
          res.send(response.BODY)
      });
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

