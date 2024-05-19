const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const server = express();
const serverPort = 3000;

server.use(bodyParser.json());

// Создание ключей для цифровой подписи
const keys = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

let tempMessage = ''; // Временное сообщение для подписи клиентом

server.get('/getPublicKey', (req, res) => {
  res.send(keys.publicKey);
});

server.post('/createSignature', (req, res) => {
  const inputMessage = req.body.message;

  if (!inputMessage) {
    return res.status(400).json({ error: 'Отсутствует сообщение в теле запроса' });
  }

  const signer = crypto.createSign('SHA256');
  signer.update(inputMessage);
  const digitalSignature = signer.sign(keys.privateKey, 'base64');

  res.json({ signature: digitalSignature });
});

server.post('/checkSignature', (req, res) => {
  const originalMessage = req.body.signedMessage;
  const receivedSignature = req.body.signature;
  const receivedPublicKey = req.body.publicKey;

  if (!originalMessage || !receivedSignature || !receivedPublicKey) {
    return res.status(400).json({ error: 'Отсутствуют необходимые данные в теле запроса' });
  }

  const verify = crypto.createVerify('SHA256');
  verify.update(originalMessage);

  const validSignature = verify.verify(receivedPublicKey, receivedSignature, 'base64');

  res.json({ isValid: validSignature });
});

server.get('/createRandomMessage', (req, res) => {
  tempMessage = crypto.randomBytes(32).toString('hex');
  res.json({ randomMessage: tempMessage });
});

server.post('/checkRandomMessageSignature', (req, res) => {
  const messageToVerify = req.body.message;
  const receivedPublicKey = req.body.publicKey;
  const receivedSignature = req.body.signature;

  if (!messageToVerify || !receivedPublicKey || !receivedSignature) {
    return res.status(400).json({ error: 'Отсутствуют необходимые данные в теле запроса' });
  }

  const verifyRandom = crypto.createVerify('SHA256');
  verifyRandom.update(Buffer.from(messageToVerify, 'utf-8'));

  const validRandomSignature = verifyRandom.verify(receivedPublicKey, receivedSignature, 'base64');

  res.json({ isValid: validRandomSignature });
});

server.listen(serverPort, () => {
  console.log(`Сервер запущен по адресу http://localhost:${serverPort}`);
});
