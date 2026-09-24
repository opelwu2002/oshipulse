const { createClient } = require('@supabase/supabase-js');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';
const client = createClient(url, key);

async function test() {
  const tables = ['profiles', 'events', 'idols', 'battles', 'audit_logs', 'collab_wishes', 'orders', 'messages'];
  for (const t of tables) {
    try {
      const { data, error } = await client.from(t).select('*').limit(3);
      if (error) {
        console.log(`Table [${t}]: ERROR -> ${error.code} ${error.message}`);
      } else {
        console.log(`Table [${t}]: OK -> count = ${data.length}`);
      }
    } catch (e) {
      console.log(`Table [${t}]: EXCEPTION -> ${e.message}`);
    }
  }
}
test();
