import fs from 'fs';
import path from 'path';
import { lessonsData } from '../src/data/lessons';

const outputDir = 'd:\\AUDITORIA\\Manual\\Manual_Fisico';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let md = '# MANUAL INTERACTIVO DE SEGURIDAD DE LA INFORMACIÓN\n\n';
md += '> **Autor:** Marco A. Pacheco A. (FRAME)\n';
md += '> **Institución:** Universidad Nacional de San Martín\n';
md += '> **Programa:** Aula Virtual | Sistema de Laboratorios\n\n';
md += '---\n\n';
md += '## ÍNDICE DE CONTENIDOS\n\n';

lessonsData.forEach(lesson => {
  md += `- [${lesson.title}](#${lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')})\n`;
});
md += '\n---\n\n';

lessonsData.forEach(lesson => {
  md += `## ${lesson.title}\n\n`;
  if (lesson.subtitle) md += `**${lesson.subtitle}**\n\n`;
  md += `**Categoría:** ${lesson.category} | **Duración:** ${lesson.duration} | **Dificultad:** ${lesson.difficulty}\n\n`;
  
  if (lesson.summary) md += `${lesson.summary}\n\n`;
  
  if (lesson.theory) {
    md += `### Teoría y Fundamentos\n\n`;
    
    if (lesson.theory.objectives && lesson.theory.objectives.length > 0) {
      md += `#### Objetivos\n`;
      lesson.theory.objectives.forEach(obj => {
        md += `- ${obj}\n`;
      });
      md += '\n';
    }
    
    if (lesson.theory.introduction) {
      md += `#### Introducción\n`;
      md += `${lesson.theory.introduction}\n\n`;
    }
    
    if (lesson.theory.keyConcepts && lesson.theory.keyConcepts.length > 0) {
      md += `#### Conceptos Clave\n`;
      lesson.theory.keyConcepts.forEach(concept => {
        md += `- **${concept.title}:** ${concept.description}\n`;
      });
      md += '\n';
    }
  }
  
  if (lesson.commands && lesson.commands.length > 0) {
    md += `### Prontuario de Comandos / Procedimientos\n\n`;
    lesson.commands.forEach(cmd => {
      md += `\`\`\`bash\n${cmd.command}\n\`\`\`\n`;
      md += `> ${cmd.description}\n\n`;
    });
  }
  
  if (lesson.faqs && lesson.faqs.length > 0) {
    md += `### Notas y Preguntas Frecuentes\n\n`;
    lesson.faqs.forEach(faq => {
      md += `**${faq.question}**\n\n`;
      md += `${faq.answer}\n\n`;
    });
  }
  
  md += '---\n\n';
});

const outputPath = path.join(outputDir, 'Manual_de_Seguridad_Fisico.md');
fs.writeFileSync(outputPath, md, 'utf8');
console.log('Manual generado con éxito en:', outputPath);
