const { createClient } = require('@supabase/supabase-js');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';
const client = createClient(url, key);

async function checkProfiles() {
  const { data, error } = await client.from('profiles').select('*');
  console.log('Select profiles:', { data, error });
}
checkProfiles();
