require('dotenv').config();
const JWT = require('jsonwebtoken');

function generateTestToken() {
  const payload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'admin@test.com',
    role: 'admin'
  };
  
  const secret = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
  
  if (!secret) {
    console.error('❌ ACCESS_TOKEN_SECRET_SIGNATURE not found in environment');
    console.log('Available env vars:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT);
    return null;
  }
  
  const token = JWT.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '2 days'
  });
  
  console.log('✅ Test token generated successfully:');
  console.log(token);
  
  return token;
}

generateTestToken(); 