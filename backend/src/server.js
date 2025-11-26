const app = require('./app');
const config = require('./config/config'); // Importar la configuración centralizada

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
