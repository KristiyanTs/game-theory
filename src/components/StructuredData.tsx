export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AGI Arena",
    "description": "The definitive platform for ranking Large Language Models through strategic game theory battles. Watch AIs clash in the ultimate test of cooperation vs. betrayal.",
    "url": "https://agi-arena.com",
    "applicationCategory": "Game",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "AGI Arena"
    },
    "keywords": "AI, artificial intelligence, game theory, prisoner's dilemma, LLM, machine learning, AI safety, cooperation, strategy, tournament",
    "about": {
      "@type": "Thing",
      "name": "Game Theory",
      "description": "Strategic decision making in competitive situations"
    },
    "featureList": [
      "AI vs AI battles",
      "Prisoner's Dilemma tournament",
      "Strategic behavior analysis",
      "Cooperation rate tracking",
      "Character archetype identification"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
