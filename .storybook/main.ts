import type { StorybookConfig } from '@storybook/vue3-vite';
import tailwind from '@tailwindcss/vite';
import { fileURLToPath } from 'url';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  async viteFinal(config) {
    // Add Tailwind plugin if not already present
    const hasTailwind = config.plugins?.some(
      (plugin) => plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === '@tailwindcss/vite'
    );
    
    if (!hasTailwind) {
      config.plugins = [...(config.plugins || []), tailwind()];
    }
    
    // Ensure @ alias is configured
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': fileURLToPath(new URL('../src', import.meta.url)),
      };
    } else {
      config.resolve = {
        alias: {
          '@': fileURLToPath(new URL('../src', import.meta.url)),
        },
      };
    }
    
    return config;
  },
};
export default config;