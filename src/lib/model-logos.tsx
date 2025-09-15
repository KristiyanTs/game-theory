import React from 'react';

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
 * Get company color and emoji for a model
 */
export function getModelDisplay(modelName: string): { emoji: string; color: string; company: string } | null {
  const lowerModelName = modelName.toLowerCase();

  if (lowerModelName.includes('anthropic') || lowerModelName.includes('claude')) {
    return { emoji: '🤖', color: 'text-orange-400', company: 'Anthropic' };
  }

  if (lowerModelName.includes('openai') || lowerModelName.includes('gpt')) {
    return { emoji: '🧠', color: 'text-green-400', company: 'OpenAI' };
  }

  if (lowerModelName.includes('x-ai') || lowerModelName.includes('grok')) {
    return { emoji: '⚡', color: 'text-blue-400', company: 'xAI' };
  }

  if (lowerModelName.includes('google') || lowerModelName.includes('gemini')) {
    return { emoji: '💎', color: 'text-purple-400', company: 'Google' };
  }

  return { emoji: '🔮', color: 'text-gray-400', company: 'Unknown' };
}

/**
 * React component for displaying a model logo
 */
export function ModelLogoIcon({ modelName, size = 20 }: { modelName: string; size?: number }): React.JSX.Element | null {
  const display = getModelDisplay(modelName);

  if (!display) {
    return null;
  }

  return (
    <span 
      className={`inline-block ${display.color}`}
      style={{ fontSize: size * 0.8 }}
      title={display.company}
    >
      {display.emoji}
    </span>
  );
}
