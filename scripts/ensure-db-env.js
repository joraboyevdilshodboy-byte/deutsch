const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  if (!content.includes('DATABASE_URL=') && content.includes('MONGODB_URI=')) {
    fs.appendFileSync(envPath, '\nDATABASE_URL="' + content.match(/MONGODB_URI="([^"]+)"/)?.[1] + '"\n');
  }
}
