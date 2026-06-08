const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

let pool;

async function initializeDatabase() {
  try {
    // 1. Connexion initiale sans base de données pour vérifier/créer la base
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connexion au serveur MySQL réussie.');

    const dbName = process.env.DB_NAME || 'nutrilib';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Base de données "${dbName}" vérifiée ou créée.`);
    await connection.end();

    // 2. Création du Pool de connexion avec la base de données
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Création des tables si elles n'existent pas
    await createTables();

    return pool;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error.message);
    console.error('Veuillez vérifier vos identifiants MySQL dans le fichier backend/.env');
    throw error;
  }
}

async function createTables() {
  const connection = await pool.getConnection();
  try {
    // Table Utilisateurs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('Table "users" vérifiée/créée.');

    // Table Journal Alimentaire
    await connection.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        food_id VARCHAR(100), -- ID FatSecret de l'aliment si disponible
        food_name VARCHAR(255) NOT NULL,
        calories INT NOT NULL,
        protein DECIMAL(6,2) DEFAULT 0.00,
        carbs DECIMAL(6,2) DEFAULT 0.00,
        fat DECIMAL(6,2) DEFAULT 0.00,
        meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
        serving_amount DECIMAL(6,2) NOT NULL DEFAULT 100.00,
        serving_unit VARCHAR(50) DEFAULT 'g',
        entry_date DATE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table "journal_entries" vérifiée/créée.');

  } catch (error) {
    console.error('Erreur lors de la création des tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Fonction utilitaire pour exécuter des requêtes SQL
async function query(sql, params) {
  if (!pool) {
    throw new Error('La base de données n\'a pas été initialisée. Appelez initializeDatabase d\'abord.');
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

module.exports = {
  initializeDatabase,
  query,
  getPool: () => pool
};
