const axios = require('axios');

const apiUrl = 'http://localhost:3000';

axios.get(`${apiUrl}/getPublicKey`)
  .then((res) => {
    const pubKey = res.data;

    // Сценарий 1: Подписать сообщение и проверить его на сервере
    const msg1 = 'Hello, server!';

    axios.post(`${apiUrl}/createSignature`, {
      message: msg1,
    })
      .then((res) => {
        const sign1 = res.data.signature;

        axios.post(`${apiUrl}/checkSignature`, {
          signedMessage: msg1,
          signature: sign1,
          publicKey: pubKey,
        })
          .then((res) => {
            console.log('Сценарий 1:');
            console.log(`Верификация: ${res.data.isValid ? 'Успешно' : 'Неуспешно'}`);
          })
          .catch((err) => {
            console.error('Ошибка при верификации сценария 1:', err.message);
          });
      })
      .catch((err) => {
        console.error('Ошибка при создании подписи:', err.message);
      });

    // Сценарий 2: Получить случайное сообщение и проверить его подпись
    axios.get(`${apiUrl}/createRandomMessage`)
      .then((res) => {
        const randomMsg = res.data.randomMessage.toString();

        axios.post(`${apiUrl}/createSignature`, {
          message: randomMsg,
        })
          .then((res) => {
            const sign2 = res.data.signature;

            axios.post(`${apiUrl}/checkRandomMessageSignature`, {
              message: randomMsg,
              signature: sign2,
              publicKey: pubKey,
            })
              .then((res) => {
                console.log('Сценарий 2:');
                console.log(`Верификация: ${res.data.isValid ? 'Успешно' : 'Неуспешно'}`);
              })
              .catch((err) => {
                console.error('Ошибка при верификации сценария 2:', err.message);
              });
          })
          .catch((err) => {
            console.error('Ошибка при подписании случайного сообщения:', err.message);
          });
      })
      .catch((err) => {
        console.error('Ошибка при получении случайного сообщения:', err.message);
      });
  })
  .catch((err) => {
    console.error('Ошибка при получении публичного ключа:', err.message);
  });
