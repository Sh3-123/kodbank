// fetch is global in Node 18+
const jwt = require('jsonwebtoken');
const pool = require('../backend/db');
require('dotenv').config({ path: '../backend/.env' });

const baseUrl = 'http://localhost:5000';
let pass = 0; let fail = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`PASS: ${testName}`);
        pass++;
    } else {
        console.log(`FAIL: ${testName}`);
        fail++;
    }
}

async function runTests() {
    try {
        const user1 = `user_${Date.now()}`;
        const email1 = `${user1}@test.com`;
        const pass1 = 'secret123';

        // 1. register new user
        let res = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user1, email: email1, password: pass1 })
        });
        assert(res.status === 201, 'register new user → success');

        // 2. duplicate username
        res = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user1, email: 'other@test.com', password: pass1 })
        });
        assert(res.status === 400, 'duplicate username → rejected');

        // 3. duplicate email
        res = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'otherName', email: email1, password: pass1 })
        });
        assert(res.status === 400, 'duplicate email → rejected');

        // check DB for user
        const [rows] = await pool.query('SELECT * FROM koduser WHERE username = ?', [user1]);
        const dbUser = rows[0];

        // 4. password hashed
        assert(dbUser && dbUser.password !== pass1 && dbUser.password.startsWith('$2b$'), 'password stored hashed');

        // 5. default balance
        assert(dbUser && parseFloat(dbUser.balance) === 100000.00, 'default balance = 100000');

        // 6. Valid login
        res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user1, password: pass1 })
        });
        const setCookie = res.headers.get('set-cookie');
        assert(res.status === 200 && setCookie && setCookie.includes('token='), 'valid login returns JWT cookie');

        // 20. cookie is httpOnly
        assert(setCookie && setCookie.includes('HttpOnly'), 'cookie is httpOnly');

        // extract token
        let token = '';
        if (setCookie) {
            token = setCookie.split('token=')[1].split(';')[0];
        }

        // 7. invalid password rejected
        const invalidRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user1, password: 'wrongpassword' })
        });
        assert(invalidRes.status === 401, 'invalid password rejected');

        // 8. token stored in DB
        const [tokenRows] = await pool.query('SELECT * FROM usertoken WHERE uid = ? ORDER BY tid DESC LIMIT 1', [dbUser.uid]);
        assert(tokenRows.length > 0 && tokenRows[0].token === token, 'token stored in DB');

        // Database tests
        assert(dbUser !== undefined, 'koduser table populated');
        assert(tokenRows.length > 0, 'usertoken table populated');
        assert(tokenRows[0].uid === dbUser.uid, 'token linked to uid');

        // 9, 10. token contains claims
        const decoded = jwt.decode(token);
        assert(decoded && decoded.sub === user1, 'token contains username subject');
        assert(decoded && decoded.role !== undefined, 'token contains role claim');

        // 14. valid token returns balance
        res = await fetch(`${baseUrl}/getBalance`, {
            headers: { 'Cookie': `token=${token}` }
        });
        const balanceData = await res.json();
        assert(res.status === 200, 'valid token returns balance');

        // 16. response contains correct balance
        assert(balanceData.balance === '100000.00' || balanceData.balance === 100000, 'response contains correct balance');

        // 18. password not returned in API
        assert(balanceData.password === undefined, 'password not returned in API');

        // 13. missing token rejected
        res = await fetch(`${baseUrl}/getBalance`);
        assert(res.status === 401, 'missing token rejected');

        // 12. tampered token rejected
        res = await fetch(`${baseUrl}/getBalance`, {
            headers: { 'Cookie': `token=${token}xyz` }
        });
        assert(res.status === 401, 'tampered token rejected');

        // 11. expired token
        const expiredToken = jwt.sign({ sub: user1, uid: dbUser.uid, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '-1h' });
        res = await fetch(`${baseUrl}/getBalance`, {
            headers: { 'Cookie': `token=${expiredToken}` }
        });
        assert(res.status === 401, 'expired token rejected');

        // 17. SQL injection
        res = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "' OR '1'='1", password: pass1 })
        });
        assert(res.status === 401, 'SQL injection attempt blocked');

        console.log(`\nResults: ${pass} passed, ${fail} failed`);
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

runTests();
