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
const materialsController = require('./controllers/materials');
const clientController = require('./controllers/clients');
const colorsController = require('./controllers/colors');
const collaboratorsController = require('./controllers/collaborators');
const filesController = require('./controllers/files');
const messagesController = require('./controllers/messages');
const notesController = require('./controllers/notes');
const productionController = require('./controllers/production');
const rolesController = require('./controllers/roles');
const stageRecordController = require('./controllers/stage-record');
const stagesController = require('./controllers/stages');
const workOrdersController = require('./controllers/work-orders');
const workTypesController = require('./controllers/work-types');
const workController = require('./controllers/works');

//falta o middleware de role base auth & implementar o resto das rotas
app.use('/tokens', tokensController);
app.use('/users',authorize, usersController);
app.use('/clients', authorize, clientController);
app.use('/colors', authorize, colorsController);
app.use('/collaborators', authorize, collaboratorsController);
app.use('/files', authorize, filesController);
app.use('/materials', authorize, materialsController);
app.use('/messages', authorize, messagesController);
app.use('/notes', authorize, notesController);
app.use('/production', authorize, productionController);
app.use('/roles', authorize, rolesController);
app.use('/stage-record', authorize, stageRecordController);
app.use('/stages', authorize, stagesController);
app.use('/work-orders', authorize, workOrdersController);
app.use('/work-types', authorize, workTypesController);
app.use('/work', authorize, workController);


app.get('/', (req, res) => {
	res.send('API is running');
});

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});