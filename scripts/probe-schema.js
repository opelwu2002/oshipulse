const { createClient } = require('@supabase/supabase-js');
const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';

async function probe() {
  const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
  const schema = await res.json();
  const profilesDef = schema.definitions ? schema.definitions.profiles : null;
  const ordersDef = schema.definitions ? schema.definitions.orders : null;
  console.log('Profiles table columns:', profilesDef ? Object.keys(profilesDef.properties) : 'No definition');
  console.log('Orders table columns:', ordersDef ? Object.keys(ordersDef.properties) : 'No definition');
}
probe();
