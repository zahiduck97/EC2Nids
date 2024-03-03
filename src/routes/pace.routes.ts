import { Request, Response, Router } from 'express';
import axios from "axios";

const router = Router();

router.get('/', (req: Request, res: Response, next) => {
    try {
        const form = {
            serviceDate: "28-02-2024",
            serviceTime: "08:30",
            serviceType: 101,
            modelId: "350Z",
            fullName: "Test Niobu",
            email: "Nibu@test.com",
            phone: "5512345678",
            street: "Test Street",
            postalcode: "5512345",
            city: "ESTADO DE MÉXICO",
            comments: "Me interesa prueba de manejo",
            vendorName: "Test Vendor",
            number: "12",
            neighbourhood: "Test neighbourhood",
            references: "References",
            vin: "VIN123456789",
            plate: "PLA-1234",
            rfc: "XAXX010101000",
            leadType: 3,
            year: 2024,
            contactPreference: 1,
            serviceBookingComments: "test 23",
            serviceTypeId: "Express",

            dealerId: "Test Dealer 12",
            model: "D245"
        }

        axios.post('https://www.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8', form, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(response => {
                console.log('Data submitted successfully');
                res.send('Exito');
            })
            .catch(error => {
                console.error('Error submitting form', error);
                res.send('Error');
            });
    } catch (e) {
        next(e)
    }
});

export default router;
