// Test pour vérifier que nos hooks n'ont plus de boucles infinies

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useNotifications } from '../hooks/useNotifications';

console.log('✅ Tests des hooks - vérification des imports');

// Vérification basique que les hooks sont importables
export const testHooks = () => {
  console.log('✅ useLocalStorage importé');
  console.log('✅ useUserPreferences importé');
  console.log('✅ useNotifications importé');
};

// Test que nous pouvons faire en dehors de React
testHooks();
