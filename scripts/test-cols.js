const { createClient } = require('@supabase/supabase-js');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';
const client = createClient(url, key);

const candidates = [
  'id', 'username', 'full_name', 'nickname', 'email', 'avatar_url',
  'birth_date', 'birthday', 'phone', 'address', 'favorite_idol',
  'role', 'referral_code', 'bonus_votes', 'created_at', 'updated_at'
];

async function testCols() {
  const valid = [];
  for (const c of candidates) {
    const { error } = await client.from('profiles').select(c).limit(1);
    if (!error) valid.push(c);
  }
  console.log('Profiles valid columns:', valid);
}
testCols();
