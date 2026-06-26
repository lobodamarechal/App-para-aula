/**
 * Flag de modo demonstração, isolado num módulo mínimo para que os componentes
 * de cliente o possam importar sem arrastar todo o conjunto de dados de exemplo.
 *
 * Ativa-se automaticamente quando não há backend Supabase configurado.
 */
export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;
