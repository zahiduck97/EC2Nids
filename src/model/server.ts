import express, { Application } from 'express';
const morgan = require('morgan');
import cors from 'cors';
import helmet from 'helmet';
import indexRoutes from '../routes/index.routes';
import PaceRoutes from "../routes/pace.routes";
import NidsRoutes from "../routes/nids.routes";
const { getConnection } = require('../config/config');

class Server {
    private app: Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '8080';
        this.middlewares();
        this.routes();
        this.connectDB();
    }

    async connectDB() {
        await getConnection();
    }

    middlewares() {
        this.app.use(morgan('tiny'));
        this.app.use(cors());
        this.app.use(helmet());
        this.app.disable('x-powered-by');
        this.app.use(express.json());
    }

    routes() {
        this.app.use('/', indexRoutes);
        this.app.use('/pace', PaceRoutes)
        this.app.use('/nids', NidsRoutes)
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto: ' + this.port);
        });
    }
}

export default Server;
