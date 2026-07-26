export type ClassId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface CommandStep {
  command: string;
  description: string;
  group?: string;
}

export interface LessonContent {
  id: ClassId;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: "Básico" | "Intermedio" | "Avanzado" | "Teórico";
  category: "Introducción" | "Inalámbrico" | "Gestión de Riesgos" | "Diccionarios" | "Ingeniería Social" | "Explotación" | "Redes & Firewalls" | "Detección & SIEM" | "Desarrollo Seguro" | "Criptografía";
  summary: string;
  isIgnored: boolean; // Si es Clase 1, 5 o 10 que se ignoran/pasan por encima rápido
  theory: {
    objectives: string[];
    introduction: string;
    keyConcepts: { title: string; description: string }[];
  };
  commands?: CommandStep[];
  additionalInfo?: string;
  faqs?: { question: string; answer: string }[];
}
