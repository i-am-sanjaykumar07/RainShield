const crypto = require('crypto');

console.log('\n🔐 JWT Secret Generator\n');
console.log('Generated JWT Secret:');
console.log('━'.repeat(70));
console.log(crypto.randomBytes(32).toString('hex'));
console.log('━'.repeat(70));
console.log('\n✅ Copy this secret to your backend/.env file');
console.log('   JWT_SECRET=<paste_here>\n');
