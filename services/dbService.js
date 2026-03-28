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
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
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
        const db = this._readDB();
        return db[shop] ? db[shop].accessToken : null;
    }
}

module.exports = new DBService();