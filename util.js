import jwt from 'jsonwebtoken';


export const isAuth = (req, res, next) =>{
    const authorization = req.headers.authorization;
    if(authorization){
        const token = authorization.slice(7, authorization.length);
        jwt.verify(token, process.env.JWT_SECRET || 'somethingsupersupersecret', (error, decode) =>{
            if(error) {
                res.status(401).send({ message: 'invalid token'});
            }
            else{
                req.user = decode;
                next();
            }
        })
    }
    else{
        console.log('errore if(authorization) else tuye isAuth');
        res.status(401).send({ message: 'you are not authorized'});
    }
}