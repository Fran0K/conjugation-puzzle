
import { GrammarRule } from "./types";

export const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: "Présent",
    title: "Présent de l'Indicatif",
    formula: "Radical + Terminaisons",
    description: "Temps de base pour décrire une action actuelle, une habitude ou une vérité générale.",
    example: "Je parle, Je finis, Je prends",
    color: "bg-gray-100 border-gray-500 text-gray-900",
    details: [
      {
        label: "1er Groupe (-er)",
        text: "Radical de l'infinitif + e, es, e, ons, ez, ent.",
        examples: "Parler → je parle, nous parlons"
      },
      {
        label: "2ème Groupe (-ir régulier)",
        text: "Verbes en -ir avec participe présent en -issant. Radical + is, is, it, issons, issez, issent.",
        examples: "Finir → je finis, nous finissons"
      },
      {
        label: "3ème Groupe",
        text: "Verbes irréguliers avec variations de radical et de terminaisons.",
        examples: "Prendre → je prends, nous prenons, ils prennent"
      }
    ]
  },

    {
    id: "Passé Composé",
    title: "Le Passé Composé",
    formula: "Auxiliaire (présent) + participe passé",
    description: "Exprime une action passée terminée.",
    example: "J'ai mangé, je suis allé",
    color: "bg-red-100 border-red-500 text-red-900",
    details: [
      {
        label: "Auxiliaires",
        text: "Avoir pour la majorité, être pour les verbes de mouvement et pronominaux.",
        examples: "Je suis arrivé(e)"
      },
      {
        label: "Accord du participe passé",
        text: "Avec être → accord. Avec avoir → accord si le COD est avant.",
        examples: "Les lettres que j'ai écrites"
      }
    ]
  },

  {
    id: "Imparfait",
    title: "L'Imparfait",
    formula: "Présent (nous) − ons + terminaisons",
    description: "Exprime une description, une habitude ou une action en cours dans le passé.",
    example: "Je finissais",
    color: "bg-orange-100 border-orange-500 text-orange-900",
    details: [
      {
        label: "Règle Générale",
        text: "Forme 'nous' du présent sans -ons + ais, ais, ait, ions, iez, aient.",
        examples: "Nous mangeons → je mangeais"
      },
      {
        label: "Exception",
        text: "Être → radical ét-.",
        examples: "J'étais, nous étions"
      }
    ]
  },

  {
    id: "Futur Simple",
    title: "Le Futur Simple",
    formula: "Infinitif + terminaisons",
    description: "Exprime une action future.",
    example: "Je mangerai",
    color: "bg-blue-100 border-blue-500 text-blue-900",
    details: [
      {
        label: "Formation",
        text: "Infinitif + ai, as, a, ons, ez, ont (terminaisons identiques au présent de « avoir »).",
        examples: "Finir → je finirai"
      },
      {
        label: "Radicaux irréguliers",
        text: "Être (ser-), Avoir (aur-), Aller (ir-), Faire (fer-), Pouvoir (pourr-), Venir (viendr-).",
        examples: "Je serai, j'irai"
      }
    ]
  },

  {
    id: "Conditionnel Présent",
    title: "Le Conditionnel Présent",
    formula: "Radical du futur + terminaisons de l'imparfait",
    description: "Exprime la politesse, le souhait ou une hypothèse.",
    example: "Je mangerais",
    color: "bg-purple-100 border-purple-500 text-purple-900"
  },
  {
    id: "Subjonctif Présent",
    title: "Le Subjonctif Présent",
    formula: "Radical (ils) + terminaisons",
    description: "Exprime le doute, l'obligation, le sentiment après « que ».",
    example: "Que je vienne",
    color: "bg-emerald-100 border-emerald-500 text-emerald-900",
    details: [
      {
        label: "Formation",
        text: "Radical de la 3e personne du pluriel + e, es, e, ions, iez, ent.",
        examples: "Ils boivent → que je boive"
      },
      {
        label: "Verbes irréguliers",
        text: "Être (sois), Avoir (aie), Aller (aille), Faire (fasse), Pouvoir (puisse), Savoir (sache)."
      }
    ]
  },
  
  {
    id: "Plus-que-parfait",
    title: "Le Plus-que-parfait",
    formula: "Auxiliaire (imparfait) + participe passé",
    description: "Exprime une action antérieure à une autre dans le passé.",
    example: "J'avais fini",
    color: "bg-yellow-100 border-yellow-500 text-yellow-900"
  },

  {
    id: "Subjonctif Imparfait",
    title: "Le Subjonctif Imparfait",
    formula: "Passé simple (3e pers. sing.) + terminaisons",
    description: "Temps littéraire soutenu.",
    example: "Qu'il parlât, qu'il fût",
    color: "bg-teal-100 border-teal-500 text-teal-900",
    details: [
      {
        label: "Terminaisons",
        text: "-sse, -sses, -ât / -ît / -ût, -ssions, -ssiez, -ssent.",
        examples: "Il fut → qu'il fût"
      }
    ]
  },

  // =========================
  // Compound Tenses
  // =========================



  

  {
    id: "Futur Antérieur",
    title: "Le Futur Antérieur",
    formula: "Auxiliaire (futur) + participe passé",
    description: "Action future accomplie avant une autre.",
    example: "J'aurai terminé",
    color: "bg-cyan-100 border-cyan-500 text-cyan-900"
  },

  {
    id: "Conditionnel Passé",
    title: "Le Conditionnel Passé",
    formula: "Auxiliaire (conditionnel) + participe passé",
    description: "Exprime le regret, l'hypothèse irréalisée ou une information non confirmée.",
    example: "J'aurais dû venir",
    color: "bg-indigo-100 border-indigo-500 text-indigo-900"
  },

  {
    id: "Subjonctif Passé",
    title: "Le Subjonctif Passé",
    formula: "Auxiliaire (subjonctif présent) + participe passé",
    description: "Exprime l'antériorité dans le cadre du doute ou du sentiment.",
    example: "Que j'aie fini",
    color: "bg-green-100 border-green-500 text-green-900"
  },

  {
    id: "Subjonctif Plus-que-parfait",
    title: "Le Subjonctif Plus-que-parfait",
    formula: "Auxiliaire (subjonctif imparfait) + participe passé",
    description: "Temps très littéraire.",
    example: "Que j'eusse fini",
    color: "bg-lime-100 border-lime-500 text-lime-900"
  }
];


export const ALL_TENSES = GRAMMAR_RULES.map(rule => rule.id);

export const SHIMMER_CLASS = "animate-pulse bg-slate-200 rounded";
