const { createClient } = require('@supabase/supabase-js');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';
const client = createClient(url, key);

async function testInsert() {
  const testUser = {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'test_real_user',
    full_name: '真實測試員',
    nickname: '測試阿米',
    phone: '0912-000-111',
    address: '台北市信義區',
    favorite_idol: '五條悟',
    created_at: new Date().toISOString()
  };
  const { data, error } = await client.from('profiles').insert([testUser]).select();
  console.log('Insert test profile:', { data, error });
  if (!error) {
    // 立即刪除測試資料
    await client.from('profiles').delete().eq('id', testUser.id);
    console.log('Deleted test profile successfully');
  }
}
testInsert();
