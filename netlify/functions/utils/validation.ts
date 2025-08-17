import Joi from 'joi';

// Schémas de validation pour les différentes entités
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invalide',
    'any.required': 'L\'email est requis'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Le mot de passe est requis'
  })
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invalide',
    'any.required': 'L\'email est requis'
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
      'any.required': 'Le mot de passe est requis'
    }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 50 caractères',
    'any.required': 'Le nom est requis'
  })
});

export const documentCreateSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Le nom du document ne peut pas être vide',
    'string.max': 'Le nom du document ne peut pas dépasser 255 caractères',
    'any.required': 'Le nom du document est requis'
  }),
  type: Joi.string().valid('pdf', 'doc', 'docx', 'txt', 'image', 'other').required(),
  category: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(1000).optional().allow(''),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
});

export const documentUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  category: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
});

// Fonction utilitaire pour valider les données
export function validateData<T>(schema: Joi.ObjectSchema<T>, data: unknown): { 
  error?: string; 
  value?: T 
} {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return { error: errorMessage };
  }
  
  return { value };
}

// Fonction de sanitisation des chaînes de caractères
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprimer les balises HTML potentielles
    .trim()
    .substring(0, 1000); // Limiter la longueur
}

// Validation des IDs UUID
export const uuidSchema = Joi.string().uuid().required().messages({
  'string.uuid': 'Format d\'identifiant invalide'
});
