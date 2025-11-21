// Generate bcrypt hashes for seed data passwords
const bcrypt = require('bcrypt');

async function generateHashes() {
  const password = 'password123';
  const saltRounds = 10;

  console.log('Generating bcrypt hashes for password: "password123"\n');
  
  // Generate 6 hashes (one for each user)
  for (let i = 1; i <= 6; i++) {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`User ${i}: ${hash}`);
  }
  
  console.log('\n✅ Copy these hashes into database/seed_data.sql');
  console.log('Replace the placeholder hashes in the INSERT INTO users statement');
}

generateHashes().catch(console.error);

