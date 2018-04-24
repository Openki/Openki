// ======== DB-Model: ========
// "lg"              -> String     ISO 639-1 code
// "name"            -> String     Full name
// "short"           -> String     Abbreviation
// "english"         -> String     English full name
// ===========================

export default Languages = {
	'ar':
		{ lg:      'ar'
		, name:    'العربية'
		, short:   'العربية'
		, english: 'Arabic'
		, visible: true
		}
	,
	'da':
		{ lg:      'da'
		, name:    'Dansk'
		, short:   'da'
		, english: 'Danish'
		, visible: true
		}
	,
	'de':
		{ lg:      'de'
		, name:    'Deutsch'
		, short:   'de'
		, english: 'German'
		, visible: true
		}
	,
	'el':
		{ lg:      'el'
		, name:    'Ελληνικά'
		, short:   'Ελ'
		, english: 'Greek'
		, visible: true
		}
	,
	'en':
		{ lg:      'en'
		, name:    'English'
		, short:   'en'
		, english: 'English'
		, visible: true
		}
	,
	'es':
		{ lg:      'es'
		, name:    'Castellano'
		, short:   'es'
		, english: 'Spanish'
		, visible: true
		}
	,
	'fr':
		{ lg:      'fr'
		, name:    'Français'
		, short:   'fr'
		, english: 'French'
		, visible: true
		}
	,
	'pt':
		{ lg:      'pt'
		, name:    'Português'
		, short:   'pt'
		, english: 'Portuguese'
		, visible: true
		}
	,
	'sv':
		{ lg:      'sv'
		, name:    'Svenska'
		, short:   'sv'
		, english: 'Swedish'
		, visible: true
	},
	'tr':
		{ lg:      'tr'
		, name:    'Türkçe'
		, short:   'tr'
		, english: 'Turkish'
		, visible: false
		}
	,
	'zh_CN':
		{ lg:      'zh_CN'
		, name:    '中文'
		, short:   '中文'
		, english: 'Simplified Chinese'
		, visible: false
		}
	,
	'zh_TW':
		{ lg:      'zh_TW'
		, name:    '國語'
		, short:   '國語'
		, english: 'Guóyǔ, Taiwanese'
		, visible: false
		}
	,
	'de_ZH':
		{ lg:      'de_ZH'
		, name:    'Züritüütsch'
		, short:   'zri-tü'
		, english: 'Zurich German'
		, visible: true
		}
};
