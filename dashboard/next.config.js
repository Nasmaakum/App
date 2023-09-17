require('dotenv').config()

/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		API_URL: process.env.API_URL,
		APP_VERSION: process.env.APP_VERSION,
		DEVELOPER_URL: process.env.DEVELOPER_URL,
	},
	eslint: { ignoreDuringBuilds: true },
	reactStrictMode: true,
	trailingSlash: true,
	transpilePackages: ['api'],
}

module.exports = nextConfig
