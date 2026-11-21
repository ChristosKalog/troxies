// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Όταν βγει online, βάλε εδώ το πραγματικό domain (π.χ. 'https://trochies.gr')
  site: 'https://trochies.example',
  // Προφόρτωση σελίδων όταν ο δείκτης περνάει πάνω από link → πιο ομαλές μεταβάσεις
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
