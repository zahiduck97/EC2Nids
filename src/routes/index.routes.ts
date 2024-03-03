import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response, next) => {
    res.send('<h1>ACCESO DENEGADO</h1>');
});

export default router;
