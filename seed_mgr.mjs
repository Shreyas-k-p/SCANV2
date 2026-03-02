import https from 'https';

const data = JSON.stringify([{
    staff_id: 'MGR5710',
    role: 'MANAGER',
    name: 'Shreyas K P',
    secret_id: '5710'
}]);

const options = {
    hostname: 'ohkrzxcmueodijbhxxgx.supabase.co',
    path: '/rest/v1/profiles',
    method: 'POST',
    headers: {
        'apikey': 'sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK',
        'Authorization': 'Bearer sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
};

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
