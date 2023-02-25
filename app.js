require('dotenv').config();

const express = require('express');
const PORT = process.env.PORT || 3000 ;
const app = express();
const pug = require('pug');
const cors = require('cors');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AcnRlKOZwJzUswbc5eES0jrZZ3F8T2spC0kvNSV-3mQEC_NwcvBCASvMJEkO6oV1RcsqxiKJ4vf1mXbJ',
    'client_secret': 'EAe1C3MW7VHIxI3QTQOaxyu-xSzv3b_A3gHkQdHdBq9ZpYb4wIOt3OIOtkGPHevxy_EtWRdRTyqfJffS'
  });



app.set('view engine','pug');

app.use(cors());

app.get('/',(req,res) => res.render('index'));

app.post('/pay',(req,res)=>{
    // console.log("Here is my Post Request")
    const create_payment_json ={
        "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
};
paypal.payment.create(create_payment_json, function(error,payment){
        if(error){
            console.log(error.response);
            throw error;
        }
        else{
            // console.log("Create Payment Response");
            // console.log(payment);
            // res.send('test');

            for(let i=0; i< payment.links.length; i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }


        }
});

});

app.get('/success',(req,res)=>{

    const payerId = req.query.PayerID ;
    const paymentId = req.query.paymentId ;
    
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
      };
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("GET Payment Response ")
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
    });

// })

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(PORT,()=>{
    console.log(`Server was start on PORT ${PORT}`)
}); 