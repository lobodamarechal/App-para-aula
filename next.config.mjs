/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdfjs-dist usa um worker; garantimos que o canvas (dependência opcional) não
  // quebra o build no servidor, onde não é necessário.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
  experimental: {
    // Pacotes que devem ser tratados como externos no runtime do servidor.
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
};

export default nextConfig;
