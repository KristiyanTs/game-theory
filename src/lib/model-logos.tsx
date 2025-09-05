import React from 'react';
import Image from 'next/image';

/**
 * Utility functions for mapping AI models to their company logos
 */

export interface ModelLogo {
  src: string;
  alt: string;
  company: string;
}

/**
 * Maps a model name to its company logo information
 */
export function getModelLogo(modelName: string): ModelLogo | null {
  const lowerModelName = modelName.toLowerCase();

  if (lowerModelName.includes('anthropic') || lowerModelName.includes('claude')) {
    return {
      src: '/anthropic-logo.svg',
      alt: 'Anthropic',
      company: 'Anthropic'
    };
  }

  if (lowerModelName.includes('openai') || lowerModelName.includes('gpt')) {
    return {
      src: '/openai-logo.svg',
      alt: 'OpenAI',
      company: 'OpenAI'
    };
  }

  if (lowerModelName.includes('x-ai') || lowerModelName.includes('grok')) {
    return {
      src: '/xai-logo.svg',
      alt: 'xAI',
      company: 'xAI'
    };
  }

  if (lowerModelName.includes('google') || lowerModelName.includes('gemini')) {
    return {
      src: '/google-logo.svg',
      alt: 'Google',
      company: 'Google'
    };
  }

  return null;
}

/**
 * React component for displaying a model logo
 */
export function ModelLogoIcon({ modelName, size = 20 }: { modelName: string; size?: number }): React.JSX.Element | null {
  const logo = getModelLogo(modelName);

  if (!logo) {
    return null;
  }

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={size}
      height={size}
      className="inline-block rounded-sm"
    />
  );
}
