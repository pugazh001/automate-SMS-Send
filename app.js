
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const { sql, poolPromise } = require('./dbconfig');
const bodyParser = require('body-parser');


const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


const accountSid = "" // Your Twilio Account SID
const authToken = ""   // Your Twilio Auth Token
const client = new twilio(accountSid, authToken);

// app.post('/api/send-notification', (req, res) => {
//     const { titleMessage, subtitleMessage, clients,time } = req.body;

//     console.log(titleMessage, subtitleMessage, clients);
      
//     // Construct the message content
//     const messageContent = `${titleMessage}\n${subtitleMessage}`;
        
//    // Send messages after a 10-minute delay
//     setTimeout(() => {
//         clients.forEach(clientInfo => {
//             client.messages.create({
//                 body: messageContent,
//                 from: '+12486716138', // Your Twilio phone number
//                 to: clientInfo.contact
//             })
//             .then(message => console.log(`Message sent to ${clientInfo.name}: ${message.sid}`))
//             .catch(error => console.error(`Failed to send message to ${clientInfo.name}: ${error.message}`));
//         });
//     }, time* 60 * 1000); // 10 minutes in milliseconds
//     // clients.forEach(clientInfo => {
//     //          client.messages.create({
//     //                body: messageContent,
//     //              from: '+12486716138', // Your Twilio phone number
//     //                to: clientInfo.contact
//     //            })
//     //            .then(message => console.log(`Message sent to ${clientInfo.name}: ${message.sid}`))
//     //          .catch(error => console.error(`Failed to send message to ${clientInfo.name}: ${error.message}`));
//     //       });
//     res.send('Messages will be sent after 10 minutes.');
// });

app.post('/api/send-notification', (req, res) => {
  const { titleMessage, subtitleMessage, clients } = req.body;

  console.log(titleMessage, subtitleMessage, clients);
    
  // Construct the message content
  const messageContent = `${titleMessage}\n${subtitleMessage}`;
      
  // Loop through each client and send the message based on their reminder interval
  clients.forEach(clientInfo => {
      const delayInMinutes = clientInfo.time; // Use the time specified for each client
      const delayInMilliseconds = delayInMinutes * 60 * 1000;

      setTimeout(() => {
          client.messages.create({
              body: messageContent,
              from: '+12486716138', // Your Twilio phone number
              to: clientInfo.contact
          })
          .then(message => console.log(`Message sent to ${clientInfo.name}: ${message.sid}`))
          .catch(error => console.error(`Failed to send message to ${clientInfo.name}: ${error.message}`));
      }, delayInMilliseconds);
  });

  res.send('Messages will be sent based on the specified delay times for each client.');
});


app.get('/api/patients', async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query('SELECT * FROM Patients');
      res.json(result.recordset);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  });
  
  // Endpoint to add a new patient
  app.post('/api/patients', async (req, res) => {
    const {
      EntryType, EntryNo, UHID, ConsultBy, PatientName,
      ReferredBy, Address, Disease, Place, CellNo, Sex,
      Age, BloodGroup, TotalQty, NextVisitAfter, NextVisitDate
    } = req.body;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('EntryType', sql.NVarChar, EntryType)
        .input('EntryNo', sql.NVarChar, EntryNo)
        .input('UHID', sql.NVarChar, UHID)
        .input('ConsultBy', sql.NVarChar, ConsultBy)
        .input('PatientName', sql.NVarChar, PatientName)
        .input('ReferredBy', sql.NVarChar, ReferredBy)
        .input('Address', sql.NVarChar, Address)
        .input('Disease', sql.NVarChar, Disease)
        .input('Place', sql.NVarChar, Place)
        .input('CellNo', sql.NVarChar, CellNo)
        .input('Sex', sql.NVarChar, Sex)
        .input('Age', sql.Int, Age)
        .input('BloodGroup', sql.NVarChar, BloodGroup)
        .input('TotalQty', sql.Int, TotalQty)
        .input('NextVisitAfter', sql.NVarChar, NextVisitAfter)
        .input('NextVisitDate', sql.Date, NextVisitDate)
        .query('INSERT INTO dbo.Patients (EntryType, EntryNo, UHID, ConsultBy, PatientName, ReferredBy, Address, Disease, Place, CellNo, Sex, Age, BloodGroup, TotalQty, NextVisitAfter, NextVisitDate) VALUES (@EntryType, @EntryNo, @UHID, @ConsultBy, @PatientName, @ReferredBy, @Address, @Disease, @Place, @CellNo, @Sex, @Age, @BloodGroup, @TotalQty, @NextVisitAfter, @NextVisitDate)');
      
      res.status(201).send({ message: 'Patient added successfully' });
    } catch (err) {
      console.log(err);
      
      res.status(500).send({ message: err.message });
    }
  });


//get

app.get('/api/patients', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Patients');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get('/patients/:id', async (req, res) => {
  const { id } = req.params; // Extract the ID from the route parameter
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('PatientID', sql.Int, id) // Pass the ID as an input parameter
      .query('SELECT * FROM Patients WHERE PatientID = @PatientID'); // Query to select the patient by ID

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]); // Return the first matching record
    } else {
      res.status(404).send({ message: 'Patient not found' }); // Handle case where no patient is found
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});



  // medicine
  app.get('/api/medicines', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM MedicineTdb');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});
app.get('/api/medicines/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const pool = await poolPromise;
      const result = await pool.request()
          .input('MedicineID', sql.Int, id)
          .query('SELECT * FROM MedicineTdb WHERE MedicineID = @MedicineID');
      if (result.recordset.length > 0) {
          res.json(result.recordset[0]);
      } else {
          res.status(404).send({ message: 'Medicine not found' });
      }
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
});

  app.post('/api/medicines', async (req, res) => {
    const { MedicineName, Dose, Qty, Days } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('MedicineName', sql.NVarChar, MedicineName)
            .input('Dose', sql.NVarChar, Dose)
            .input('Qty', sql.Int, Qty)
            .input('Days', sql.Int, Days)
            .query('INSERT INTO MedicineTdb (MedicineName, Dose, Qty, Days) VALUES (@MedicineName, @Dose, @Qty, @Days)');
        res.status(201).send({ message: 'Medicine added successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});
app.put('/api/medicines/:id', async (req, res) => {
  const { id } = req.params;
  const { MedicineName, Dose, Qty, Days } = req.body;
  try {
      const pool = await poolPromise;
      await pool.request()
          .input('MedicineID', sql.Int, id)
          .input('MedicineName', sql.NVarChar, MedicineName)
          .input('Dose', sql.NVarChar, Dose)
          .input('Qty', sql.Int, Qty)
          .input('Days', sql.Int, Days)
          .query('UPDATE MedicineTdb SET MedicineName = @MedicineName, Dose = @Dose, Qty = @Qty, Days = @Days WHERE MedicineID = @MedicineID');
      res.send({ message: 'Medicine updated successfully' });
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
});
app.delete('/api/medicines/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const pool = await poolPromise;
      await pool.request()
          .input('MedicineID', sql.Int, id)
          .query('DELETE FROM MedicineTdb WHERE MedicineID = @MedicineID');
      res.send({ message: 'Medicine deleted successfully' });
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
});
app.listen(3000, () => console.log('Server running on port 3000'));
