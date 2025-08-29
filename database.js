const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Password reset tokens table
    db.run(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
});

// User functions
const User = {
    // Create new user
    create: (email, password, name, callback) => {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return callback(err);
            
            db.run(
                'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
                [email, hashedPassword, name],
                function(err) {
                    callback(err, this.lastID);
                }
            );
        });
    },

    // Find user by email
    findByEmail: (email, callback) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], callback);
    },

    // Find user by ID
    findById: (id, callback) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], callback);
    },

    // Verify password
    verifyPassword: (plainPassword, hashedPassword, callback) => {
        bcrypt.compare(plainPassword, hashedPassword, callback);
    },

    // Update password
    updatePassword: (userId, newPassword, callback) => {
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) return callback(err);
            
            db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId],
                callback
            );
        });
    }
};

// Password reset token functions
const PasswordResetToken = {
    // Create reset token
    create: (userId, callback) => {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
        
        db.run(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt.toISOString()],
            function(err) {
                callback(err, token);
            }
        );
    },

    // Find valid token
    findValidToken: (token, callback) => {
        db.get(
            `SELECT prt.*, u.email 
             FROM password_reset_tokens prt 
             JOIN users u ON prt.user_id = u.id 
             WHERE prt.token = ? AND prt.expires_at > datetime('now') AND prt.used = FALSE`,
            [token],
            callback
        );
    },

    // Mark token as used
    markAsUsed: (tokenId, callback) => {
        db.run(
            'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
            [tokenId],
            callback
        );
    }
};

module.exports = { db, User, PasswordResetToken };
