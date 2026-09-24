const { createClient } = require('@supabase/supabase-js');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';
const client = createClient(url, key);

async function probeColumns() {
  const { error } = await client.from('profiles').insert([{ unknown_col_probe: '123' }]);
  console.log('Error message:', error ? error.message : 'No error');
}
probeColumns();
