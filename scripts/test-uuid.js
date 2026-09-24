const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';
const client = createClient(url, key);

async function testProfilesUUID() {
  const testId = crypto.randomUUID();
  const testData = {
    id: testId,
    username: 'antigravity_test',
    full_name: '架構測試員',
    nickname: '即時推',
    birth_date: '2000-01-01',
    phone: '0988-123-456',
    address: '台北市測試路1號',
    favorite_idol: '五條悟',
    updated_at: new Date().toISOString()
  };

  const { error: insertErr } = await client.from('profiles').insert([testData]);
  console.log('Insert test result:', insertErr ? insertErr.message : 'SUCCESS');

  const { data: readData } = await client.from('profiles').select('*').eq('id', testId);
  console.log('Select test result count:', readData ? readData.length : 0);

  const { error: delErr } = await client.from('profiles').delete().eq('id', testId);
  console.log('Delete test result:', delErr ? delErr.message : 'SUCCESS');

  const { data: afterDel } = await client.from('profiles').select('*').eq('id', testId);
  console.log('After delete count:', afterDel ? afterDel.length : 0);
}
testProfilesUUID();
