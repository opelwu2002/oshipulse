const { createClient } = require('@supabase/supabase-js');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';
const client = createClient(url, key);

const candidates = [
  'id', 'user_id', 'item_name', 'amount', 'total_amount', 'status',
  'created_at', 'updated_at', 'shipping_info', 'phone', 'address'
];

async function testOrderCols() {
  const valid = [];
  for (const c of candidates) {
    const { error } = await client.from('orders').select(c).limit(1);
    if (!error) valid.push(c);
  }
  console.log('Orders valid columns:', valid);
}
testOrderCols();
