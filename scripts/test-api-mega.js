#!/usr/bin/env node

/**
 * Script de test pour l'endpoint API user-mega-config
 * Teste l'API complète de gestion des configurations MEGA
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE = process.env.NETLIFY_URL || 'http://localhost:8888';
const TEST_USER = {
  email: 'test-api@example.com',
  password: 'testpassword123',
  name: 'Test API User'
};

class APITester {
  constructor() {
    this.token = null;
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const isHttps = API_BASE.startsWith('https');
      const url = new URL(API_BASE + path);
      
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const req = (isHttps ? https : http).request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, data: parsed, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, data: data, headers: res.headers });
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async login() {
    console.log('🔐 Tentative de connexion...');
    
    const response = await this.makeRequest('/.netlify/functions/auth', {
      method: 'POST',
      body: {
        action: 'login',
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    if (response.status === 200 && response.data.token) {
      this.token = response.data.token;
      console.log('✅ Connexion réussie');
      return true;
    } else {
      console.log('❌ Échec de la connexion:', response.data);
      return false;
    }
  }

  async register() {
    console.log('📝 Tentative d\'inscription...');
    
    const response = await this.makeRequest('/.netlify/functions/auth', {
      method: 'POST',
      body: {
        action: 'register',
        ...TEST_USER,
      },
    });

    if (response.status === 201) {
      console.log('✅ Inscription réussie');
      return true;
    } else {
      console.log('ℹ️ Inscription échouée (utilisateur existe peut-être):', response.data);
      return false;
    }
  }

  async testCreateMegaConfig() {
    console.log('\n📁 Test: Création de configuration MEGA...');
    
    const response = await this.makeRequest('/.netlify/functions/user-mega-config', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: {
        email: 'test@mega.nz',
        password: 'test-password-123',
      },
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    return response.status === 201;
  }

  async testGetMegaConfig() {
    console.log('\n📖 Test: Récupération de configuration MEGA...');
    
    const response = await this.makeRequest('/.netlify/functions/user-mega-config', {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    return response.status === 200;
  }

  async testUpdateMegaConfig() {
    console.log('\n🔄 Test: Mise à jour de configuration MEGA...');
    
    const response = await this.makeRequest('/.netlify/functions/user-mega-config', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${this.token}` },
      body: {
        email: 'updated@mega.nz',
        password: 'updated-password-123',
      },
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    return response.status === 200;
  }

  async testMegaConnection() {
    console.log('\n🔗 Test: Test de connexion MEGA...');
    
    const response = await this.makeRequest('/.netlify/functions/user-mega-config?action=test', {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    return response.status === 200;
  }

  async testDeleteMegaConfig() {
    console.log('\n🗑️ Test: Suppression de configuration MEGA...');
    
    const response = await this.makeRequest('/.netlify/functions/user-mega-config', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.token}` },
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    return response.status === 200;
  }

  async runTests() {
    console.log('🧪 Tests de l\'API user-mega-config\n');
    console.log(`🌐 URL de base: ${API_BASE}\n`);

    let success = 0;
    let total = 0;

    // Inscription (optionnelle)
    await this.register();

    // Connexion
    if (await this.login()) {
      
      // Test de création
      total++;
      if (await this.testCreateMegaConfig()) {
        success++;
        console.log('✅ Création: OK');
      } else {
        console.log('❌ Création: ÉCHEC');
      }

      // Test de récupération
      total++;
      if (await this.testGetMegaConfig()) {
        success++;
        console.log('✅ Récupération: OK');
      } else {
        console.log('❌ Récupération: ÉCHEC');
      }

      // Test de mise à jour
      total++;
      if (await this.testUpdateMegaConfig()) {
        success++;
        console.log('✅ Mise à jour: OK');
      } else {
        console.log('❌ Mise à jour: ÉCHEC');
      }

      // Test de connexion MEGA (pourrait échouer si les identifiants ne sont pas valides)
      total++;
      if (await this.testMegaConnection()) {
        success++;
        console.log('✅ Test connexion: OK');
      } else {
        console.log('⚠️ Test connexion: ÉCHEC (normal si identifiants invalides)');
      }

      // Test de suppression
      total++;
      if (await this.testDeleteMegaConfig()) {
        success++;
        console.log('✅ Suppression: OK');
      } else {
        console.log('❌ Suppression: ÉCHEC');
      }

    } else {
      console.log('❌ Impossible de se connecter, arrêt des tests');
      return;
    }

    // Résumé
    console.log(`\n📊 Résultats: ${success}/${total} tests réussis`);
    
    if (success === total) {
      console.log('🎉 Tous les tests API sont passés !');
    } else {
      console.log('⚠️ Certains tests ont échoué');
    }
  }
}

// Execution
if (require.main === module) {
  const tester = new APITester();
  
  tester.runTests().catch((error) => {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  });
}

module.exports = { APITester };
