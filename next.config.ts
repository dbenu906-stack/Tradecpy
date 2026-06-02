import type {NextConfig} from 'next';
import { execSync } from 'child_process';

function getGitProjectId(): string {
  if (process.env.NEXT_PUBLIC_GIT_PROJECT_ID) {
    return process.env.NEXT_PUBLIC_GIT_PROJECT_ID;
  }

  try {
    const rawUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const githubUrl = rawUrl.replace(/\.git$/, '');

    if (githubUrl.startsWith('git@github.com:')) {
      return githubUrl.replace('git@github.com:', '');
    }

    if (githubUrl.startsWith('https://github.com/')) {
      return githubUrl.replace('https://github.com/', '');
    }
  } catch (error) {
    // Ignore and fall back to placeholder.
  }

  return 'REPLACE_WITH_YOUR_GIT_PROJECT_ID';
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_GIT_PROJECT_ID: getGitProjectId(),
  },
};

export default nextConfig;
