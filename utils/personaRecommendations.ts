// Persona types and recommendation sets for the AI chat widget

export type Persona = 
  | 'recruiter'
  | 'product-leader'
  | 'designer'
  | 'friend'
  | null;

export interface PersonaConfig {
  label: string;
  recommendations: string[];
  greeting?: string;
}

export const personaConfigs: Record<Exclude<Persona, null>, PersonaConfig> = {
  recruiter: {
    label: 'Recruiter / HR',
    greeting: "I can help you understand Upen's background and fit for roles.",
    recommendations: [
      "What roles is Upen looking for?",
      "Can you summarize his experience in 2 minutes?",
      "What kind of teams does he work best with?",
      "Is he more IC or leadership-oriented?"
    ]
  },
  'product-leader': {
    label: 'Product / Engineering Leader',
    greeting: "I can help you understand how Upen contributes to product and engineering teams.",
    recommendations: [
      "How does Upen reduce ambiguity early?",
      "How does he use prototyping or code?",
      "How does he think about scale and systems?",
      "How does he collaborate cross-functionally?"
    ]
  },
  designer: {
    label: 'Designer (peer / junior / senior)',
    greeting: "I can help you learn from Upen's approach to design and product thinking.",
    recommendations: [
      "How does Upen think about product design?",
      "How does Upen approach ambiguous problems?",
      "What kind of designer is he beyond titles?",
      "How does he work with PMs & engineers?",
      "Examples of 0→1 or platform work",
      "How to approach design systems properly"
    ]
  },
  friend: {
    label: 'Friend / General Visitor',
    greeting: "I can help you learn about Upen's work and interests.",
    recommendations: [
      "What kind of work does Upen do?",
      "What is he working on these days?",
      "What excites him about design?"
    ]
  }
};

export const personaSelectionOptions = [
  { id: 'designer' as const, label: "I'm a designer", persona: 'designer' as Persona },
  { id: 'product-leader' as const, label: "I'm a product leader", persona: 'product-leader' as Persona },
  { id: 'recruiter' as const, label: "I'm a recruiter", persona: 'recruiter' as Persona },
  { id: 'friend' as const, label: "I'm a friend", persona: 'friend' as Persona }
];

// Map selection IDs to personas for better routing
export const getPersonaFromSelection = (selectionId: string): Persona => {
  const option = personaSelectionOptions.find(opt => opt.id === selectionId);
  return option ? option.persona : null;
};
