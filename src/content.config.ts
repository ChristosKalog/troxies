// Ορισμός του περιεχομένου του site.
// - Παραστάσεις: ένα αρχείο .md ανά παράσταση στο src/content/parastaseis/
// - Μέλη: το αρχείο src/data/meli.yaml
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const parastaseis = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/parastaseis' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    years: z.string().optional(),          // π.χ. "2023–2024"
    order: z.number(),                      // μεγαλύτερο = πιο πρόσφατο (εμφανίζεται πρώτο)
    summary: z.string(),                    // μία-δύο προτάσεις για λίστες
    cover: z.string().optional(),           // π.χ. "/images/spitia-cover.jpg" (από τον φάκελο public)
    gallery: z.array(z.string()).optional(),
    duration: z.string().optional(),
    incomplete: z.boolean().optional(),     // true = λείπουν ακόμα στοιχεία
    award: z.string().optional(),
    credits: z
      .array(z.object({ role: z.string(), names: z.string() }))
      .optional(),
    cast: z.array(z.string()).optional(),
    dates: z
      .array(
        z.object({
          city: z.string(),
          venue: z.string(),
          from: z.coerce.date().optional(),
          label: z.string().optional(),       // ελεύθερο κείμενο αν δεν ξέρουμε ακριβή ημερομηνία
          to: z.coerce.date().optional(),
          note: z.string().optional(),
          tickets: z.string().url().optional(),
        })
      )
      .optional(),
    press: z
      .array(z.object({ quote: z.string(), author: z.string(), outlet: z.string() }))
      .optional(),
  }),
});

const meli = defineCollection({
  loader: file('src/data/meli.yaml'),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number().default(99),
    photo: z.string().optional(),
  }),
});

export const collections = { parastaseis, meli };
