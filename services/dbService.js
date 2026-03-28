const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.json');

class DBService {
    constructor() {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify({}));
        }
    }

    _readDB() {
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data);
        } catch(e) {
            return {};
        }
    }

    _writeDB(data) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }

    saveShopToken(shop, token) {
        const db = this._readDB();
        db[shop] = { accessToken: token, updatedAt: new Date().toISOString() };
        this._writeDB(db);
    }

    getShopToken(shop) {
        // PERMANENT FIX FOR RENDER: 
        // Read token from environment variables so it never gets deleted
        if (process.env.SHOPIFY_PERMANENT_TOKEN) {
            return process.env.SHOPIFY_PERMANENT_TOKEN;
        }

        // Fallback to local file
        const db = this._readDB();
        return db[shop] ? db[shop].accessToken : null;
    }
}

module.exports = new DBService();