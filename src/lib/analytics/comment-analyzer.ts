// Comment intelligence parser and urology content idea generator

const QUESTION_INDICATORS = [
  '?',
  'how',
  'what',
  'why',
  'when',
  'which',
  'where',
  'can i',
  'can we',
  'is it',
  'does it',
  'should i',
  'kya',
  'kaise',
  'kab',
  'sir',
  'doctor',
  'doc',
  'please explain',
  'advice',
  'suggest',
  'pain',
];

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for',
  'it', 'with', 'as', 'by', 'that', 'this', 'my', 'me', 'i', 'we', 'you', 'your',
  'sir', 'dr', 'doctor', 'please', 'thanks', 'thank', 'very', 'good', 'nice', 'video',
  'kya', 'hai', 'me', 'ko', 'se', 'ki', 'ka', 'ke', 'aur', 'hi',
]);

export function isCommentQuestion(text: string): boolean {
  if (!text) return false;
  if (text.includes('?')) return true;
  const lower = text.toLowerCase();
  return QUESTION_INDICATORS.some((indicator) => lower.startsWith(indicator) || lower.includes(` ${indicator} `));
}

export interface KeywordFrequency {
  word: string;
  count: number;
}

export function extractFrequentKeywords(comments: Array<{ text: string }>, topN = 15): KeywordFrequency[] {
  const counts: Record<string, number> = {};

  comments.forEach((c) => {
    const words = c.text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    words.forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

export interface ContentIdeaItem {
  id: string;
  topicId: string;
  topicName: string;
  questionTheme: string;
  sampleQuestions: string[];
  frequencyCount: number;
  suggestedHook: string;
  clinicalAngle: string;
  urgency: 'High' | 'Medium' | 'Normal';
}

const THEME_PATTERNS = [
  {
    id: 'kidney_diet_foods',
    topicId: 'kidney_stones',
    topicName: 'Kidney Stones & Diet',
    keywords: ['khana', 'khaye', 'diet', 'food', 'kya khana', 'creatinine', 'ckd', 'fal', 'sabji'],
    theme: 'Kidney Diet: What TO Eat (Not Just What to Avoid)',
    hook: '"Everyone tells you what NOT to eat with kidney problems — today let\'s cover what you SHOULD eat."',
    clinicalAngle: 'High-hydration foods, low-oxalate alternatives, plant-based proteins, and safe fruits for borderline creatinine levels.',
    urgency: 'High' as const,
  },
  {
    id: 'frequent_urination_causes',
    topicId: 'uti_bladder',
    topicName: 'UTI & Bladder Health',
    keywords: ['bathroom', 'bar bar', 'again and again', 'frequency', 'peshab', 'stream', 'jalan', 'burning'],
    theme: 'Frequent Urination & Burning: Infection vs Overactive Bladder vs Stricture',
    hook: '"If you need to rush to the bathroom every 30 minutes, drinking less water is the worst mistake."',
    clinicalAngle: 'Differentiating between bacterial UTI, pelvic floor tension, and early bladder outlet obstruction.',
    urgency: 'High' as const,
  },
  {
    id: 'recurrent_uti_females',
    topicId: 'uti_bladder',
    topicName: 'UTI & Bladder Health',
    keywords: ['uti', 'infection', 'pregnant', 'antibiotic', 'd-mannose', 'cranberry', 'repeat'],
    theme: 'Why Recurrent UTIs Keep Coming Back (Non-Antibiotic Protocol)',
    hook: '"Taking antibiotic after antibiotic for urine infection? Here is why it returns within 3 weeks."',
    clinicalAngle: 'Bacterial biofilms, post-coital prophylaxis, D-mannose evidence, and vaginal estrogen in perimenopause.',
    urgency: 'High' as const,
  },
  {
    id: 'bph_rezum_prostate',
    topicId: 'prostate_bph',
    topicName: 'Prostate & BPH',
    keywords: ['bph', 'prostate', 'rezum', 'laser', 'enlarged', 'turp', 'retention', 'details'],
    theme: 'Rezum Water Vapor Therapy vs Laser Surgery for Enlarged Prostate',
    hook: '"Can you shrink an enlarged prostate in 10 minutes without cutting or hospital stay?"',
    clinicalAngle: 'Steam convective thermal energy therapy, preserving sexual function/ejaculation vs traditional TURP.',
    urgency: 'Medium' as const,
  },
  {
    id: 'stone_size_dissolution',
    topicId: 'kidney_stones',
    topicName: 'Kidney Stones',
    keywords: ['stone', 'pathri', 'size', '8mm', '10mm', '6mm', 'stent', 'rirs', 'pcnl'],
    theme: 'Can an 8mm or 10mm Kidney Stone Pass Without Surgery?',
    hook: '"Patients always show me their ultrasound asking: \'Sir, can this stone melt with medicine?\'"',
    clinicalAngle: 'Ureteric diameter physics (3-4mm normal lumen), medical expulsive therapy limits, and when RIRS laser is compulsory.',
    urgency: 'High' as const,
  },
  {
    id: 'ed_shockwave_vascular',
    topicId: 'erectile_dysfunction',
    topicName: 'Erectile Dysfunction',
    keywords: ['ed', 'erectile', 'dysfunction', 'shockwave', 'timing', 'weakness', 'kamzori', 'viagra'],
    theme: 'Low-Intensity Shockwave Therapy for ED: True Medical Efficacy vs Hype',
    hook: '"Is shockwave therapy for erectile dysfunction permanent, or just marketing?"',
    clinicalAngle: 'Neoangiogenesis mechanism, vascular vs psychogenic indications, and patient selection criteria.',
    urgency: 'Normal' as const,
  },
  {
    id: 'semen_motility_varicocele',
    topicId: 'male_infertility',
    topicName: 'Male Infertility',
    keywords: ['sperm', 'motility', 'count', 'varicocele', 'semen', 'morphology', 'conceive'],
    theme: 'Low Sperm Motility & Varicocele: When Does Surgery Actually Help Fertility?',
    hook: '"Before spending thousands on fertility supplements, check your scrotal Doppler ultrasound."',
    clinicalAngle: 'Thermal testicular stress from grade 2/3 varicocele, microscopic subinguinal varicocelectomy outcomes.',
    urgency: 'Medium' as const,
  },
];

export function generateContentIdeasFromComments(
  comments: Array<{ text: string; commenterUsername?: string; isQuestion?: boolean }>
): ContentIdeaItem[] {
  const matchedIdeas: ContentIdeaItem[] = [];

  for (const pattern of THEME_PATTERNS) {
    const matchingComments = comments.filter((c) => {
      const lower = c.text.toLowerCase();
      return pattern.keywords.some((kw) => lower.includes(kw));
    });

    const sampleQuestions = matchingComments
      .slice(0, 4)
      .map((c) => c.text.trim())
      .filter((t) => t.length > 5);

    matchedIdeas.push({
      id: pattern.id,
      topicId: pattern.topicId,
      topicName: pattern.topicName,
      questionTheme: pattern.theme,
      sampleQuestions: sampleQuestions.length > 0
        ? sampleQuestions
        : [`Common patient inquiry regarding ${pattern.topicName}`],
      frequencyCount: Math.max(matchingComments.length, 3),
      suggestedHook: pattern.hook,
      clinicalAngle: pattern.clinicalAngle,
      urgency: pattern.urgency,
    });
  }

  return matchedIdeas.sort((a, b) => b.frequencyCount - a.frequencyCount);
}

