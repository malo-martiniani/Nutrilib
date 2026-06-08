# Nutrilib - Application de Suivi Nutritionnel

Nutrilib est une application web moderne et sécurisée permettant aux utilisateurs de suivre leur journal alimentaire quotidien en recherchant des aliments via l'API FatSecret et en enregistrant leur consommation de calories et de macronutriments (protéines, glucides, lipides).

Ce projet a été réalisé dans le cadre du diplôme **Développeur Web et Web Mobile (DWWM)**.

---

## 🛠️ Architecture Technique

L'application est découpée en deux parties distinctes (Client / Serveur) :

- **Back-end (API)** :
  - **Runtime** : Node.js avec le framework Express.
  - **Base de données** : MySQL (relationnelle) pour le stockage des comptes utilisateurs et des entrées de journal.
  - **Sécurité** : Hachage de mot de passe à sens unique avec `bcryptjs`, authentification sécurisée par jeton **JWT (JSON Web Tokens)**, et protection contre les attaques XSS/injections grâce aux en-têtes HTTP de sécurité configurés via `helmet`.
  - **Proxy FatSecret** : Serveur proxy Node.js pour gérer de manière sécurisée les requêtes OAuth 2.0 vers FatSecret sans exposer les clés d'API (Client ID / Client Secret) côté client.

- **Front-end (Client)** :
  - **Framework** : React (via Vite pour un build ultra rapide).
  - **Style** : Tailwind CSS v4 avec design moderne (thème sombre, glassmorphism, et micro-animations).
  - **Icônes** : Lucide React.

---

## 💾 Structure de la Base de Données

Le schéma relationnel SQL de la base de données `nutrilib` est le suivant :

```sql
-- Création de la table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Création de la table du journal alimentaire
CREATE TABLE IF NOT EXISTS journal_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  food_id VARCHAR(100), -- ID FatSecret optionnel
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
```

---

## 🚀 Installation locale et Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) (Version 18+ recommandée)
- Un serveur [MySQL](https://www.mysql.com/) en local (ex: via WAMP, XAMPP ou MySQL Installer officiel)
- [MySQL Workbench](https://www.mysql.com/products/workbench/) pour visualiser la base.

### 💡 Méthode Express : Tout lancer d'un coup (Recommandé)
Vous pouvez installer toutes les dépendances et démarrer les deux applications (Front et Back) en parallèle depuis le dossier racine du projet.

1. **Installation** :
   À la racine du projet, installez l'outil de lancement simultané (`concurrently`) et les packages des sous-dossiers :
   ```bash
   npm install
   npm run install-all
   ```
2. **Configuration** :
   Configurez votre mot de passe de base de données dans le fichier `backend/.env` (voir l'étape de configuration détaillée ci-dessous).
3. **Lancement** :
   Démarrez le serveur et le client en même temps avec une seule commande à la racine :
   ```bash
   npm run dev
   ```

---

### Méthode Manuelle (Pas à pas)

### 1. Configuration du Serveur (Back-end)
1. Ouvrez un terminal dans le dossier `/backend`.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier nommé `.env` dans le dossier `/backend` (ou modifiez le fichier `.env` généré) et ajustez vos variables :
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe_mysql
   DB_NAME=nutrilib
   JWT_SECRET=un_code_secret_tres_long_et_complexe
   FATSECRET_CLIENT_ID=votre_client_id_fatsecret
   FATSECRET_CLIENT_SECRET=votre_client_secret_fatsecret
   ```
   > 💡 **Note sur l'API FatSecret** : Si vos identifiants ne sont pas renseignés ou sont fictifs, l'application bascule automatiquement en **mode démonstration** avec des données d'aliments simulées (mock), vous permettant de tester l'application immédiatement sans clé API active.
4. Lancez le serveur en mode développement :
   ```bash
   npm run dev
   ```
   *Le serveur démarre sur le port 5000 et crée automatiquement la base de données `nutrilib` et les tables nécessaires.*

### 2. Configuration du Client (Front-end)
1. Ouvrez un terminal dans le dossier `/frontend`.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le projet React en local :
   ```bash
   npm run dev
   ```
4. Ouvrez votre navigateur sur l'adresse fournie (généralement `http://localhost:5173`).

---

## ☁️ Guide de Déploiement en Production

Voici la procédure recommandée pour déployer l'application sur un serveur de production (type VPS sous Linux Ubuntu 22.04 LTS).

### 1. Préparation du serveur VPS
Connectez-vous à votre serveur en SSH et installez Node.js, MySQL et Nginx :
```bash
sudo apt update
sudo apt install -y nodejs npm mysql-server nginx git
```

### 2. Déploiement de la Base de Données
Sécurisez MySQL sur le serveur de production, puis créez la base de données et l'utilisateur dédié :
```bash
sudo mysql_secure_installation
sudo mysql -u root -p
```
Dans l'interface MySQL :
```sql
CREATE DATABASE IF NOT EXISTS nutrilib DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nutrilib_user'@'localhost' IDENTIFIED BY 'mot_de_passe_ultra_securise';
GRANT ALL PRIVILEGES ON nutrilib.* TO 'nutrilib_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Déploiement et Démarrage du Back-end (PM2)
Nous utilisons **PM2** (Process Manager) pour exécuter l'application Node.js en tâche de fond et la redémarrer automatiquement en cas de plantage ou de redémarrage du serveur.

1. Installez PM2 globalement :
   ```bash
   sudo npm install -g pm2
   ```
2. Clonez votre projet dans le dossier `/var/www/nutrilib` et accédez à `/backend`.
3. Créez le fichier `.env` final de production avec les vraies clés.
4. Démarrez l'application avec PM2 :
   ```bash
   pm2 start src/server.js --name "nutrilib-api"
   ```
5. Configurez PM2 pour qu'il se lance au démarrage du serveur :
   ```bash
   pm2 startup
   pm2 save
   ```

### 4. Build du Front-end
Le front-end React doit être compilé en fichiers HTML/CSS/JS statiques optimisés pour la production :
1. Allez dans le dossier `/frontend`.
2. Lancez le build :
   ```bash
   npm run build
   ```
   *Cela génère un dossier `/dist` contenant les fichiers compilés de l'application cliente.*
3. Déplacez le contenu du dossier `/dist` vers le répertoire web public de votre serveur :
   ```bash
   sudo mkdir -p /var/www/nutrilib/html
   sudo cp -r dist/* /var/www/nutrilib/html/
   ```

### 5. Configuration de Nginx en Reverse Proxy
Nginx servira directement les fichiers statiques du front-end React et redirigera les requêtes API (commençant par `/api`) vers notre serveur Node.js tournant en arrière-plan sur le port 5000.

1. Créez un fichier de configuration pour le site dans Nginx :
   ```bash
   sudo nano /etc/nginx/sites-available/nutrilib
   ```
2. Ajoutez la configuration suivante :
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.fr; # Remplacez par votre domaine ou IP publique

       # 1. Servir le Front-end React
       location / {
           root /var/www/nutrilib/html;
           index index.html index.htm;
           try_files $uri $uri/ /index.html; # Nécessaire pour le routage Single Page App (SPA)
       }

       # 2. Proxy vers le Back-end Node.js
       location /api/ {
           proxy_pass http://localhost:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
3. Activez le site et redémarrez Nginx :
   ```bash
   sudo ln -s /etc/nginx/sites-available/nutrilib /etc/nginx/sites-enabled/
   sudo nginx -t # Test de la syntaxe
   sudo systemctl restart nginx
   ```

### 6. Sécurisation SSL (HTTPS) avec Let's Encrypt
Pour répondre aux critères de sécurité requis pour le diplôme, le trafic doit être chiffré :
```bash
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d votre-domaine.fr
```
*Certbot va générer le certificat SSL Let's Encrypt et configurer automatiquement la redirection HTTPS dans Nginx.*
