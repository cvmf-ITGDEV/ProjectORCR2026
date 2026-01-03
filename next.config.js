/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["typeorm", "reflect-metadata", "pg"],
};

module.exports = nextConfig;
