// Runtime configuration for Seleção de Cuidadores.
// This file is served as a static asset and can be replaced per environment.
// The Docker entrypoint substitutes __SELECAO_API_KEY__ with the
// SELECAO_CUIDADORES_API_KEY environment variable at container startup.
window.__SELECAO_CONFIG__ = {
  apiKey: '__SELECAO_API_KEY__',
};
