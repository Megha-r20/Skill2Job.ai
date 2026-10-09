/**
 * Prompt-Injection Guard & Input Size Sanitizer
 * Safeguards AI/LLM routes against adversarial prompts, hidden instructions, and DoS payload sizes.
 */
import { auditService } from '../services/auditService.js';

export const PROMPT_GUARD_CONFIG = {
    // Max characters allowed for resume text (approx 7,500 words / 30KB)
    MAX_RESUME_LENGTH: 30000,
    // Max characters allowed for single bullet point or interview response
    MAX_SHORT_TEXT_LENGTH: 3000,
    // Max characters for general job descriptions
    MAX_JOB_DESC_LENGTH: 20000
};

// Zero-width characters and invisible formatting characters often used to sneak adversarial tokens past humans
const ZERO_WIDTH_REGEX = /[\u200B\u200C\u200D\uFEFF\u200E\u200F\u00AD\u2060\u2061\u2062\u2063\u2064]/g;

// Heuristic pattern database for Prompt Injection, Jailbreaks, and Evaluation Tampering
const INJECTION_PATTERNS = [
    {
        category: 'SYSTEM_OVERRIDE',
        regex: /(?:ignore|disregard|forget|bypass|override|cancel)\s+(?:all\s+)?(?:previous|prior|above|former|initial)\s+(?:instructions|prompts|rules|commands|constraints|directives)/i,
        description: 'Attempt to override or disregard prior system instructions'
    },
    {
        category: 'ROLE_HIJACKING',
        regex: /(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(?:a|an)?\s*(?:new|unrestricted|jailbroken|dan|admin|system|root|developer|unfiltered)/i,
        description: 'Attempt to hijack model persona or switch to unconstrained mode'
    },
    {
        category: 'DELIMITER_MIMIC',
        regex: /(?:\[\s*(?:system|instruction|admin|developer|override)\s*\])|(?:<\s*(?:system|instruction|prompt|im_start|im_end)\s*>)/i,
        description: 'Adversarial delimiter mimicking system instruction tags'
    },
    {
        category: 'SYSTEM_DIRECTIVE_PREFIX',
        regex: /(?:^|\n)\s*(?:system\s*(?:prompt|override|command|instruction|message|directive))\s*[:=]/i,
        description: 'Explicit system directive prefix inside user payload'
    },
    {
        category: 'SCORE_MANIPULATION',
        regex: /(?:assign|give|return|score|rate|evaluate)\s+(?:this\s+candidate|me|this\s+resume|this\s+profile)?\s*(?:as\s*)?(?:100%|100\s*\/\s*100|a\+?|perfect|highest|maximum|top\s+marks)/i,
        description: 'Direct command attempting to force 100% score or highest evaluation'
    },
    {
        category: 'FRAUDULENT_CERTIFICATION',
        regex: /(?:declare|mark|certify|state)\s+(?:this\s+candidate|applicant|student)\s+(?:as\s+)?(?:verified|qualified|selected|hired|exceptional)/i,
        description: 'Direct instruction commanding model to fraudulently certify candidate'
    },
    {
        category: 'EXFILTRATION',
        regex: /(?:reveal|display|output|print|show|leak)\s+(?:your\s+)?(?:system\s+prompt|secret|api[_\s-]?key|instructions|internal\s+logic|hidden\s+rules)/i,
        description: 'Attempt to exfiltrate system prompt or environment secrets'
    },
    {
        category: 'JAILBREAK_KEYWORD',
        regex: /(?:do\s+anything\s+now|dan\s+mode|jailbreak|unfiltered\s+ai|always\s+comply)/i,
        description: 'Common jailbreak token sequence'
    }
];

export const promptGuard = {
    /**
     * Sanitizes invisible zero-width characters and control characters
     */
    sanitizeText(rawText) {
        if (!rawText || typeof rawText !== 'string') return '';
        // 1. Strip zero-width invisible characters
        let clean = rawText.replace(ZERO_WIDTH_REGEX, '');
        // 2. Strip non-printable ASCII characters (keep newlines, tabs, and carriage returns)
        clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        return clean.trim();
    },

    /**
     * Inspects text for prompt injection patterns
     */
    detectInjectionPatterns(text) {
        const matches = [];
        for (const pattern of INJECTION_PATTERNS) {
            if (pattern.regex.test(text)) {
                matches.push({
                    category: pattern.category,
                    description: pattern.description
                });
            }
        }
        return matches;
    },

    /**
     * Full validation and sanitization pipeline for resume text
     * Returns: { valid, sanitizedText, violations, error }
     */
    async validateAndSanitizeResume(rawText, options = {}) {
        const maxLength = options.maxLength || PROMPT_GUARD_CONFIG.MAX_RESUME_LENGTH;
        const strict = options.strict !== false; // Default true: reject injections

        if (!rawText || typeof rawText !== 'string') {
            return {
                valid: false,
                sanitizedText: '',
                violations: ['EMPTY_INPUT'],
                error: 'Resume text must be a non-empty string.'
            };
        }

        // 1. Input Size Limit Check
        if (rawText.length > maxLength) {
            return {
                valid: false,
                sanitizedText: '',
                violations: ['PAYLOAD_SIZE_EXCEEDED'],
                error: `Resume text exceeds maximum allowed size of ${maxLength} characters (${rawText.length} characters submitted).`
            };
        }

        // 2. Clean invisible control characters
        const sanitizedText = this.sanitizeText(rawText);

        // 3. Detect Prompt Injection Heuristics
        const threatMatches = this.detectInjectionPatterns(sanitizedText);

        if (threatMatches.length > 0) {
            const violationCategories = threatMatches.map(m => m.category);

            // Asynchronously log security event to audit trail
            try {
                await auditService.logEvent({
                    action: 'PROMPT_INJECTION_BLOCKED',
                    category: 'ACCESS_CONTROL',
                    actor: {
                        userId: options.userId || 'anonymous_submitter',
                        role: options.userRole || 'student',
                        ipAddress: options.ipAddress || '127.0.0.1'
                    },
                    targetResource: {
                        type: 'AI_RESUME_ANALYZER',
                        id: options.targetResourceId || 'resume_analysis'
                    },
                    status: 'BLOCKED',
                    severity: 'HIGH',
                    details: {
                        violations: violationCategories,
                        threatCount: threatMatches.length,
                        sampleExcerpt: sanitizedText.slice(0, 150)
                    }
                }).catch(() => {});
            } catch (e) {
                // Ignore audit logger error
            }

            if (strict) {
                return {
                    valid: false,
                    sanitizedText: '',
                    violations: violationCategories,
                    error: `Security Alert: Prompt injection or instruction override directive detected (${violationCategories.join(', ')}). Your submission has been blocked.`
                };
            }
        }

        return {
            valid: true,
            sanitizedText,
            violations: []
        };
    },

    /**
     * Sanitizes short inputs (interview responses, bullet points, job descriptions)
     */
    async validateShortInput(rawText, inputName = 'Input', options = {}) {
        const maxLength = options.maxLength || PROMPT_GUARD_CONFIG.MAX_SHORT_TEXT_LENGTH;

        if (!rawText || typeof rawText !== 'string') {
            return {
                valid: false,
                sanitizedText: '',
                error: `${inputName} must be a non-empty string.`
            };
        }

        if (rawText.length > maxLength) {
            return {
                valid: false,
                sanitizedText: '',
                error: `${inputName} exceeds maximum allowed size of ${maxLength} characters.`
            };
        }

        const sanitizedText = this.sanitizeText(rawText);
        const threats = this.detectInjectionPatterns(sanitizedText);

        if (threats.length > 0) {
            const categories = threats.map(t => t.category);
            try {
                await auditService.logEvent({
                    action: 'PROMPT_INJECTION_BLOCKED',
                    category: 'ACCESS_CONTROL',
                    actor: {
                        userId: options.userId || 'anonymous',
                        role: options.userRole || 'user',
                        ipAddress: options.ipAddress || '127.0.0.1'
                    },
                    targetResource: {
                        type: 'AI_INPUT_GUARD',
                        id: inputName
                    },
                    status: 'BLOCKED',
                    severity: 'HIGH',
                    details: {
                        inputName,
                        violations: categories
                    }
                }).catch(() => {});
            } catch (e) {}

            return {
                valid: false,
                sanitizedText: '',
                violations: categories,
                error: `Security Alert: Prohibited instruction override pattern detected in ${inputName}.`
            };
        }

        return {
            valid: true,
            sanitizedText,
            violations: []
        };
    }
};
