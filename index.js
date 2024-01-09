const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();

const PORT = 3005;

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,  //Time - 2 minutes
    max: 2 //Request from a IP address in above time frame
})

app.use(morgan('combined'));
app.use(limiter);

app.use('/authservice', async (req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = axios.get('http://localhost:3001/api/v1/isAuthenticated',{
            headers:{
                'x-access-token': req.headers['x-access-token']
            }
        });
        console.log(response.data);
        if(response.data.success){
            next();
        }
        else{
            return res.status(401).json({
                message: 'Unauthorised'
        })
    }
    } catch (error) {
        return res.status(401).json({
            message: 'Something went wrong'
        })
    }
})

app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true}));
app.get('/home',(req, res) => {
    return res.json({message: 'OK'});
})

app.listen(PORT, () => {
    console.log(`Server Started at port ${PORT}`);
})