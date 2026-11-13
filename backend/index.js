require("dotenv").config();

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const router = express.Router();
const YALM = require('yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const validator = require('express-openapi-validator');
const cookieParser = require('cookie-parser');
const authorize = require('./middlewares/authorize');

app.use(express.json());
app.use(cookieParser());
app.use(router);

//ler o arquivo openapi.yaml e configurar o Swagger UI
const apiDoc = YALM.parse(fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDoc));

//midleware para validar o openapi
app.use(
	validator.middleware({
		apiSpec: apiDoc,
		validateRequests: true,
		validateResponses: false,
	})
);

//middleware para tratar erros
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

//controllers
const tokensController = require('./controllers/tokens');
const usersController = require('./controllers/users');

app.use('/tokens', tokensController);
app.use('/users', authorize, usersController);

app.get('/', (req, res) => {
	res.send('API is running');
});

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});