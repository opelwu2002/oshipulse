const { createClient } = require('@supabase/supabase-js');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';
const client = createClient(url, key);

async function testProfilesCRUD() {
  const testId = 'test-uuid-' + Date.now();
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

  // 1. 測試 Insert
  const { error: insertErr } = await client.from('profiles').insert([testData]);
  console.log('Insert test result:', insertErr ? insertErr.message : 'SUCCESS');

  // 2. 測試 Select
  const { data: readData, error: readErr } = await client.from('profiles').select('*').eq('id', testId);
  console.log('Select test result count:', readData ? readData.length : 0);

  // 3. 測試 Delete
  const { error: delErr } = await client.from('profiles').delete().eq('id', testId);
  console.log('Delete test result:', delErr ? delErr.message : 'SUCCESS');

  // 4. 再次確認已刪除
  const { data: afterDel } = await client.from('profiles').select('*').eq('id', testId);
  console.log('After delete count:', afterDel ? afterDel.length : 0);
}
testProfilesCRUD();
