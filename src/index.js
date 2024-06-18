const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Configurações do banco de dados
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// Função para criar conexão com o banco de dados
let connection;
function handleDisconnect() {
  connection = mysql.createConnection(dbConfig); // Recria a conexão

  connection.connect(function(err) {
    if (err) {
      console.error('Erro ao conectar no banco de dados:', err);
      setTimeout(handleDisconnect, 2000); // Tenta reconectar após 2 segundos
    } else {
      console.log('Conectado ao banco de dados como id ' + connection.threadId);
    }
  });

  connection.on('error', function(err) {
    console.error('Erro no banco de dados:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconecta se a conexão for perdida
    } else {
      throw err;
    }
  });
}

handleDisconnect();

app.get('/api/products', (req, res) => {
  connection.query('SELECT * FROM products', (error, results) => {
    if (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).send('Erro ao consultar o banco de dados');
      return;
    }

    res.send(results.map(item => ({ name: item.name, price: item.price })));
  });
});

app.listen(port, () => {
  console.log(`Servidor Express rodando em http://localhost:${port}`);
});
