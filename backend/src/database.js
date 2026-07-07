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
    // 1. Table Utilisateurs
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

    // Vérifier et ajouter les colonnes de profil si elles n'existent pas encore
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(c => c.Field);

    const columnsToAdd = [
      { name: 'display_name', definition: 'VARCHAR(100) DEFAULT NULL' },
      { name: 'avatar_url', definition: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'is_private', definition: 'TINYINT(1) DEFAULT 0' },
      { name: 'gender', definition: "ENUM('male', 'female') DEFAULT NULL" },
      { name: 'age', definition: 'INT DEFAULT NULL' },
      { name: 'height', definition: 'INT DEFAULT NULL' },
      { name: 'current_weight', definition: 'DECIMAL(5,2) DEFAULT NULL' },
      { name: 'activity_level', definition: 'VARCHAR(20) DEFAULT NULL' },
      { name: 'calorie_goal', definition: 'INT DEFAULT 2000' },
      { name: 'protein_goal', definition: 'INT DEFAULT 130' },
      { name: 'carb_goal', definition: 'INT DEFAULT 220' },
      { name: 'fat_goal', definition: 'INT DEFAULT 65' },
      { name: 'goal_type', definition: "VARCHAR(20) DEFAULT 'maintain'" },
      { name: 'target_weight', definition: 'DECIMAL(5,2) DEFAULT NULL' },
      { name: 'goal_speed', definition: "VARCHAR(20) DEFAULT 'normal'" }
    ];

    for (const col of columnsToAdd) {
      if (!columnNames.includes(col.name)) {
        await connection.query(`ALTER TABLE users ADD COLUMN \`${col.name}\` ${col.definition}`);
        console.log(`Colonne "${col.name}" ajoutée à la table "users".`);
      }
    }

    // 2. Table Journal Alimentaire
    await connection.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        food_id VARCHAR(100),
        food_name VARCHAR(255) NOT NULL,
        calories INT NOT NULL,
        protein DECIMAL(6,2) DEFAULT 0.00,
        carbs DECIMAL(6,2) DEFAULT 0.00,
        fat DECIMAL(6,2) DEFAULT 0.00,
        meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
        serving_amount DECIMAL(10,2) NOT NULL DEFAULT 100.00,
        serving_unit VARCHAR(50) DEFAULT 'g',
        entry_date DATE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table "journal_entries" vérifiée/créée.');

    // Ajouter les colonnes de micronutrition si elles n'existent pas
    const [journalColumns] = await connection.query('SHOW COLUMNS FROM journal_entries');
    const journalColumnNames = journalColumns.map(c => c.Field);
    const journalColumnsToAdd = [
      { name: 'sugar', definition: 'DECIMAL(6,2) DEFAULT 0.00' },
      { name: 'fiber', definition: 'DECIMAL(6,2) DEFAULT 0.00' },
      { name: 'sodium', definition: 'DECIMAL(6,2) DEFAULT 0.00' },
      { name: 'potassium', definition: 'DECIMAL(6,2) DEFAULT 0.00' },
      { name: 'cholesterol', definition: 'DECIMAL(6,2) DEFAULT 0.00' },
      { name: 'saturated_fat', definition: 'DECIMAL(6,2) DEFAULT 0.00' }
    ];
    for (const col of journalColumnsToAdd) {
      if (!journalColumnNames.includes(col.name)) {
        await connection.query(`ALTER TABLE journal_entries ADD COLUMN \`${col.name}\` ${col.definition}`);
        console.log(`Colonne "${col.name}" ajoutée à la table "journal_entries".`);
      }
    }

    // 3. Table de suivi du poids
    await connection.query(`
      CREATE TABLE IF NOT EXISTS weight_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        entry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, entry_date)
      ) ENGINE=InnoDB;
    `);
    console.log('Table "weight_history" vérifiée/créée.');

    // 4. Table des aliments favoris
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        food_id VARCHAR(100) NOT NULL,
        food_name VARCHAR(255) NOT NULL,
        calories INT NOT NULL,
        protein DECIMAL(6,2) DEFAULT 0.00,
        carbs DECIMAL(6,2) DEFAULT 0.00,
        fat DECIMAL(6,2) DEFAULT 0.00,
        serving_description VARCHAR(100) DEFAULT '100g',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table "favorites" vérifiée/créée.');

    // 5. Table des listes personnalisées
    await connection.query(`
      CREATE TABLE IF NOT EXISTS custom_lists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        list_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table "custom_lists" vérifiée/créée.');

    // 6. Table des éléments de listes personnalisées
    await connection.query(`
      CREATE TABLE IF NOT EXISTS custom_list_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        list_id INT NOT NULL,
        food_id VARCHAR(100) DEFAULT NULL,
        food_name VARCHAR(255) NOT NULL,
        calories INT NOT NULL,
        protein DECIMAL(6,2) DEFAULT 0.00,
        carbs DECIMAL(6,2) DEFAULT 0.00,
        fat DECIMAL(6,2) DEFAULT 0.00,
        serving_description VARCHAR(100) DEFAULT '100g',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES custom_lists(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table "custom_list_items" vérifiée/créée.');

    // 7. Table des recettes personnalisées
    await connection.query(`
      CREATE TABLE IF NOT EXISTS custom_recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipe_name VARCHAR(255) NOT NULL,
        recipe_description TEXT NULL,
        recipe_image VARCHAR(500) DEFAULT NULL,
        servings INT NOT NULL DEFAULT 1,
        calories INT NOT NULL,
        protein DECIMAL(6,2) DEFAULT 0.00,
        carbs DECIMAL(6,2) DEFAULT 0.00,
        fat DECIMAL(6,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table "custom_recipes" vérifiée/créée.');

    // 8. Table des ingrédients de recettes personnalisées
    await connection.query(`
      CREATE TABLE IF NOT EXISTS custom_recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id INT NOT NULL,
        food_id VARCHAR(100) DEFAULT NULL,
        food_name VARCHAR(255) NOT NULL,
        calories INT NOT NULL,
        protein DECIMAL(6,2) DEFAULT 0.00,
        carbs DECIMAL(6,2) DEFAULT 0.00,
        fat DECIMAL(6,2) DEFAULT 0.00,
        serving_amount DECIMAL(10,2) NOT NULL DEFAULT 100.00,
        serving_unit VARCHAR(50) DEFAULT 'g',
        FOREIGN KEY (recipe_id) REFERENCES custom_recipes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table "custom_recipe_ingredients" vérifiée/créée.');

    // Modifier serving_amount pour supporter des quantités plus grandes sans erreur out-of-range
    await connection.query(`ALTER TABLE journal_entries MODIFY COLUMN serving_amount DECIMAL(10,2) NOT NULL DEFAULT 100.00`);
    await connection.query(`ALTER TABLE custom_recipe_ingredients MODIFY COLUMN serving_amount DECIMAL(10,2) NOT NULL DEFAULT 100.00`);

    // Ajouter les colonnes servings et recipe_image à la table custom_recipes si elles n'existent pas
    const [customRecipesColumns] = await connection.query('SHOW COLUMNS FROM custom_recipes');
    const customRecipesColumnNames = customRecipesColumns.map(c => c.Field);
    if (!customRecipesColumnNames.includes('recipe_image')) {
      await connection.query('ALTER TABLE custom_recipes ADD COLUMN recipe_image VARCHAR(500) DEFAULT NULL');
      console.log('Colonne "recipe_image" ajoutée à "custom_recipes".');
    }
    if (!customRecipesColumnNames.includes('servings')) {
      await connection.query('ALTER TABLE custom_recipes ADD COLUMN servings INT NOT NULL DEFAULT 1');
      console.log('Colonne "servings" ajoutée à "custom_recipes".');
    }

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
