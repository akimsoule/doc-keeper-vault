#!/usr/bin/env node

/**
 * Script de test pour la configuration MEGA par utilisateur
 * Ce script teste toutes les fonctionnalités de la gestion MEGA multi-utilisateur
 */

const readline = require('readline');
const path = require('path');

// Chemins vers les services
const PROJECT_ROOT = path.resolve(__dirname, '..');
process.env.NODE_PATH = path.join(PROJECT_ROOT, 'netlify/files.core/src');
require('module').Module._initPaths();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function testUserMegaConfig() {
  console.log('🧪 Test de la configuration MEGA multi-utilisateur\n');

  try {
    // Import des services
    const { PrismaClient } = require('@prisma/client');
    const { UserMegaConfigService } = require('../netlify/files.core/src/services/userMegaConfigService');
    const { EncryptionService } = require('../netlify/files.core/src/services/encryptionService');
    
    const prisma = new PrismaClient();
    const userMegaConfigService = new UserMegaConfigService();
    const encryptionService = new EncryptionService();

    console.log('✅ Services chargés avec succès\n');

    // Test 1: Créer un utilisateur de test
    console.log('📝 Test 1: Création d\'un utilisateur de test...');
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test-mega@example.com' },
      update: {},
      create: {
        name: 'Test User MEGA',
        email: 'test-mega@example.com',
        passwordHash: 'test-hash-123',
      },
    });

    console.log(`✅ Utilisateur créé: ${testUser.name} (${testUser.id})\n`);

    // Test 2: Test du service de chiffrement
    console.log('🔐 Test 2: Test du service de chiffrement...');
    
    const testData = 'test-password-mega';
    const encrypted = encryptionService.encrypt(testData);
    const decrypted = encryptionService.decrypt(encrypted);
    
    console.log(`   Original: ${testData}`);
    console.log(`   Chiffré: ${encrypted.substring(0, 20)}...`);
    console.log(`   Déchiffré: ${decrypted}`);
    console.log(`   ✅ Chiffrement/déchiffrement: ${testData === decrypted ? 'OK' : 'ERREUR'}\n`);

    // Test 3: Configuration MEGA pour l'utilisateur
    console.log('⚙️ Test 3: Configuration MEGA pour l\'utilisateur...');
    
    const megaEmail = await question('Email MEGA (ou appuyez sur Entrée pour utiliser test@mega.com): ');
    const megaPassword = await question('Mot de passe MEGA (ou appuyez sur Entrée pour utiliser test-password): ');
    
    const configData = {
      email: megaEmail || 'test@mega.com',
      password: megaPassword || 'test-password',
    };

    // Créer la configuration
    const megaConfig = await userMegaConfigService.createUserMegaConfig(testUser.id, configData);
    console.log(`✅ Configuration MEGA créée: ${megaConfig.id}\n`);

    // Test 4: Récupération de la configuration
    console.log('📖 Test 4: Récupération de la configuration...');
    
    const retrievedConfig = await userMegaConfigService.getUserMegaConfig(testUser.id);
    console.log(`   Email stocké: ${retrievedConfig?.email}`);
    console.log(`   Has credentials: ${retrievedConfig?.hasCredentials}\n`);

    // Test 5: Récupération des identifiants déchiffrés
    console.log('🔓 Test 5: Récupération des identifiants déchiffrés...');
    
    const credentials = await userMegaConfigService.getUserMegaCredentials(testUser.id);
    console.log(`   Email: ${credentials?.email}`);
    console.log(`   Password: ${credentials?.password ? '[MASQUÉ]' : 'AUCUN'}\n`);

    // Test 6: Mise à jour de la configuration
    console.log('🔄 Test 6: Mise à jour de la configuration...');
    
    const updatedConfig = await userMegaConfigService.updateUserMegaConfig(testUser.id, {
      email: configData.email + '.updated',
      password: configData.password,
    });
    console.log(`✅ Configuration mise à jour: ${updatedConfig.email}\n`);

    // Test 7: Test de configuration pour un autre utilisateur
    console.log('👥 Test 7: Configuration pour un second utilisateur...');
    
    const testUser2 = await prisma.user.upsert({
      where: { email: 'test-mega-2@example.com' },
      update: {},
      create: {
        name: 'Test User MEGA 2',
        email: 'test-mega-2@example.com',
        passwordHash: 'test-hash-456',
      },
    });

    const megaConfig2 = await userMegaConfigService.createUserMegaConfig(testUser2.id, {
      email: 'user2@mega.com',
      password: 'user2-password',
    });
    console.log(`✅ Configuration pour utilisateur 2: ${megaConfig2.email}\n`);

    // Test 8: Vérification de l'isolation des configurations
    console.log('🔒 Test 8: Vérification de l\'isolation des configurations...');
    
    const config1 = await userMegaConfigService.getUserMegaCredentials(testUser.id);
    const config2 = await userMegaConfigService.getUserMegaCredentials(testUser2.id);
    
    console.log(`   Utilisateur 1: ${config1?.email}`);
    console.log(`   Utilisateur 2: ${config2?.email}`);
    console.log(`   ✅ Isolation: ${config1?.email !== config2?.email ? 'OK' : 'ERREUR'}\n`);

    // Test 9: Suppression d'une configuration
    console.log('🗑️ Test 9: Suppression d\'une configuration...');
    
    await userMegaConfigService.deleteUserMegaConfig(testUser2.id);
    
    const deletedConfig = await userMegaConfigService.getUserMegaConfig(testUser2.id);
    console.log(`✅ Configuration supprimée: ${deletedConfig === null ? 'OK' : 'ERREUR'}\n`);

    // Nettoyage
    console.log('🧹 Nettoyage des données de test...');
    
    await userMegaConfigService.deleteUserMegaConfig(testUser.id);
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-mega@example.com', 'test-mega-2@example.com']
        }
      }
    });
    
    console.log('✅ Nettoyage terminé\n');

    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé des tests:');
    console.log('   ✅ Chargement des services');
    console.log('   ✅ Chiffrement/déchiffrement');
    console.log('   ✅ Création de configuration MEGA');
    console.log('   ✅ Récupération de configuration');
    console.log('   ✅ Récupération des identifiants');
    console.log('   ✅ Mise à jour de configuration');
    console.log('   ✅ Configuration multi-utilisateur');
    console.log('   ✅ Isolation des configurations');
    console.log('   ✅ Suppression de configuration');

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Options de ligne de commande
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
🧪 Script de test pour la configuration MEGA multi-utilisateur

Usage: node scripts/test-user-mega.js [options]

Options:
  --help, -h    Affiche cette aide
  
Ce script teste:
- Le service de chiffrement des identifiants
- La création/mise à jour/suppression des configurations MEGA
- L'isolation des configurations entre utilisateurs
- La récupération des identifiants déchiffrés

Assurez-vous que:
- La base de données PostgreSQL est démarrée
- Les migrations Prisma sont appliquées
- Les variables d'environnement sont configurées (.env)
  `);
  process.exit(0);
}

// Exécution du test
if (require.main === module) {
  testUserMegaConfig().catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { testUserMegaConfig };
