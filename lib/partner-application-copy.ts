import type { Locale } from "./locale";

/**
 * Every new public string for the partner checklist lives in this file.
 * Spanish is the source. Other locales follow the site i18n set.
 * Do not render `partnerPrivacyProposal` — it is wording for the owner,
 * not a change to the Privacy page.
 *
 * After a colon, the next word starts with a capital letter.
 */

export type PartnerDossierCopy = {
  legalKicker: string;
  legalName: string;
  rut: string;
  rutPlaceholder: string;
  rutInvalid: string;
  entityType: string;
  entityEmpresa: string;
  entityPersona: string;
  region: string;
  regionPlaceholder: string;
  comuna: string;
  presenceUrl: string;
  presenceHint: string;
  presenceInvalid: string;
  description: string;
  descriptionHint: string;
  offerKicker: string;
  offerName: string;
  offerPrice: string;
  offerUnit: string;
  unitNoche: string;
  unitPersona: string;
  unitExperiencia: string;
  minStay: string;
  capacity: string;
  addOffer: string;
  removeOffer: string;
  offerNeed: string;
  stayNeed: string;
  photosKicker: string;
  photosLabel: string;
  photosChoose: string;
  photosHint: string;
  photosNeed: string;
  photosType: string;
  photosSize: string;
  permitKicker: string;
  sernaturQuestion: string;
  sernaturYes: string;
  sernaturNo: string;
  sernaturNumber: string;
  sernaturNeed: string;
  termsPrefix: string;
  termsAnd: string;
  termsLink: string;
  privacyLink: string;
  termsNeed: string;
  emailLocked: string;
  emailMismatch: string;
  incompleteV2: string;
  dossierStore: string;
  adminLegal: string;
  adminEntity: string;
  adminRegion: string;
  adminComuna: string;
  adminPresence: string;
  adminDescription: string;
  adminOffers: string;
  adminPhotos: string;
  adminPhotoAlt: string;
  adminPhotoMissing: string;
  adminSernatur: string;
  adminSernaturNone: string;
  adminTerms: string;
};

export const partnerPrivacyProposal =
  "Postulaciones de partners: Si postulas un negocio turístico, Mapucoin puede tratar tu razón social o tu nombre, tu RUT, si eres empresa o persona natural, tu región y comuna, una URL pública de tu sitio o Instagram, una descripción breve, las ofertas con precio en CLP, el número de registro SERNATUR cuando lo informas, y al menos tres y como máximo cuatro fotografías del lugar o del servicio. Las fotografías quedan en un almacenamiento privado y solo las ve quien revisa la postulación. El RUT sirve para identificar al postulante en esa revisión y no se publica en el mapa ni en la ficha. Puedes pedir acceso, rectificación o eliminación en info@salvazion.org.";

const es: PartnerDossierCopy = {
  legalKicker: "Identidad legal",
  legalName: "Razón social o nombre",
  rut: "RUT",
  rutPlaceholder: "12.345.678-5",
  rutInvalid: "El RUT no es válido. Revisa el dígito verificador.",
  entityType: "Tipo de postulante",
  entityEmpresa: "Empresa",
  entityPersona: "Persona natural",
  region: "Región",
  regionPlaceholder: "Elige tu región",
  comuna: "Comuna",
  presenceUrl: "Sitio web o Instagram",
  presenceHint: "URL pública https de tu sitio o de tu perfil de Instagram.",
  presenceInvalid: "Ingresa una URL https de tu sitio o de Instagram.",
  description: "Descripción breve",
  descriptionHint: "Qué ofreces y dónde, en pocas líneas.",
  offerKicker: "Oferta y precios en CLP",
  offerName: "Nombre de la oferta",
  offerPrice: "Precio en CLP",
  offerUnit: "Cobro",
  unitNoche: "Por noche",
  unitPersona: "Por persona",
  unitExperiencia: "Por experiencia",
  minStay: "Estadía mínima en noches",
  capacity: "Capacidad en personas",
  addOffer: "Agregar otra oferta",
  removeOffer: "Quitar oferta",
  offerNeed: "Agrega al menos una oferta con precio en CLP.",
  stayNeed: "Para una oferta por noche indica la estadía mínima y la capacidad.",
  photosKicker: "Fotos",
  photosLabel: "Fotos del lugar o del servicio",
  photosChoose: "Elegir fotos",
  photosHint: "Sube al menos 3 fotos y como máximo 4. JPG, PNG o WebP. Cada una debe pesar como máximo 800 KB.",
  photosNeed: "Sube al menos 3 fotos y como máximo 4.",
  photosType: "Solo se aceptan fotos JPG, PNG o WebP.",
  photosSize: "Cada foto debe pesar como máximo 800 KB.",
  permitKicker: "Permisos",
  sernaturQuestion: "¿Tienes registro SERNATUR?",
  sernaturYes: "Sí",
  sernaturNo: "No",
  sernaturNumber: "Número de registro SERNATUR",
  sernaturNeed: "Indica el número de registro SERNATUR.",
  termsPrefix: "Acepto los",
  termsAnd: "y la",
  termsLink: "Términos",
  privacyLink: "Política de Privacidad",
  termsNeed: "Debes aceptar los Términos y la Política de Privacidad.",
  emailLocked: "Este correo es el de tu cuenta verificada.",
  emailMismatch: "El correo debe coincidir con tu cuenta verificada.",
  incompleteV2: "Completa la identidad, el negocio, la oferta y los permisos.",
  dossierStore: "Aún no podemos guardar la postulación completa. Inténtalo más tarde.",
  adminLegal: "Identidad legal",
  adminEntity: "Tipo",
  adminRegion: "Región",
  adminComuna: "Comuna",
  adminPresence: "Sitio o Instagram",
  adminDescription: "Descripción",
  adminOffers: "Ofertas en CLP",
  adminPhotos: "Fotos",
  adminPhotoAlt: "Foto de la postulación",
  adminPhotoMissing: "Foto no disponible",
  adminSernatur: "SERNATUR",
  adminSernaturNone: "Sin registro",
  adminTerms: "Términos y privacidad aceptados",
};

const en: PartnerDossierCopy = {
  legalKicker: "Legal identity",
  legalName: "Legal name",
  rut: "RUT",
  rutPlaceholder: "12.345.678-5",
  rutInvalid: "The RUT is not valid. Check the verification digit.",
  entityType: "Applicant type",
  entityEmpresa: "Company",
  entityPersona: "Individual",
  region: "Region",
  regionPlaceholder: "Choose your region",
  comuna: "Commune",
  presenceUrl: "Website or Instagram",
  presenceHint: "A public https URL of your site or Instagram profile.",
  presenceInvalid: "Enter an https URL of your site or Instagram.",
  description: "Short description",
  descriptionHint: "What you offer and where, in a few lines.",
  offerKicker: "Offer and prices in CLP",
  offerName: "Offer name",
  offerPrice: "Price in CLP",
  offerUnit: "Charge",
  unitNoche: "Per night",
  unitPersona: "Per person",
  unitExperiencia: "Per experience",
  minStay: "Minimum stay in nights",
  capacity: "Capacity in guests",
  addOffer: "Add another offer",
  removeOffer: "Remove offer",
  offerNeed: "Add at least one offer with a price in CLP.",
  stayNeed: "For a per-night offer, add the minimum stay and the capacity.",
  photosKicker: "Photos",
  photosLabel: "Photos of the place or service",
  photosChoose: "Choose photos",
  photosHint: "Upload at least 3 photos and at most 4. JPG, PNG, or WebP. Each one must be at most 800 KB.",
  photosNeed: "Upload at least 3 photos and at most 4.",
  photosType: "Only JPG, PNG, or WebP photos are accepted.",
  photosSize: "Each photo must be at most 800 KB.",
  permitKicker: "Permits",
  sernaturQuestion: "Do you have a SERNATUR registration?",
  sernaturYes: "Yes",
  sernaturNo: "No",
  sernaturNumber: "SERNATUR registration number",
  sernaturNeed: "Enter the SERNATUR registration number.",
  termsPrefix: "I accept the",
  termsAnd: "and the",
  termsLink: "Terms",
  privacyLink: "Privacy Policy",
  termsNeed: "You must accept the Terms and the Privacy Policy.",
  emailLocked: "This email belongs to your verified account.",
  emailMismatch: "The email must match your verified account.",
  incompleteV2: "Complete the identity, the business, the offer, and the permits.",
  dossierStore: "We cannot store the full application yet. Try again later.",
  adminLegal: "Legal identity",
  adminEntity: "Type",
  adminRegion: "Region",
  adminComuna: "Commune",
  adminPresence: "Site or Instagram",
  adminDescription: "Description",
  adminOffers: "Offers in CLP",
  adminPhotos: "Photos",
  adminPhotoAlt: "Application photo",
  adminPhotoMissing: "Photo unavailable",
  adminSernatur: "SERNATUR",
  adminSernaturNone: "No registration",
  adminTerms: "Terms and privacy accepted",
};

const pt: PartnerDossierCopy = {
  legalKicker: "Identidade legal",
  legalName: "Razão social ou nome",
  rut: "RUT",
  rutPlaceholder: "12.345.678-5",
  rutInvalid: "O RUT não é válido. Confira o dígito verificador.",
  entityType: "Tipo de postulante",
  entityEmpresa: "Empresa",
  entityPersona: "Pessoa natural",
  region: "Região",
  regionPlaceholder: "Escolha a sua região",
  comuna: "Comuna",
  presenceUrl: "Site ou Instagram",
  presenceHint: "URL pública https do seu site ou do perfil no Instagram.",
  presenceInvalid: "Informe uma URL https do seu site ou do Instagram.",
  description: "Descrição breve",
  descriptionHint: "O que você oferece e onde, em poucas linhas.",
  offerKicker: "Oferta e preços em CLP",
  offerName: "Nome da oferta",
  offerPrice: "Preço em CLP",
  offerUnit: "Cobrança",
  unitNoche: "Por noite",
  unitPersona: "Por pessoa",
  unitExperiencia: "Por experiência",
  minStay: "Estadia mínima em noites",
  capacity: "Capacidade em pessoas",
  addOffer: "Adicionar outra oferta",
  removeOffer: "Remover oferta",
  offerNeed: "Adicione pelo menos uma oferta com preço em CLP.",
  stayNeed: "Para uma oferta por noite, indique a estadia mínima e a capacidade.",
  photosKicker: "Fotos",
  photosLabel: "Fotos do lugar ou do serviço",
  photosChoose: "Escolher fotos",
  photosHint: "Envie pelo menos 3 fotos e no máximo 4. JPG, PNG ou WebP. Cada uma deve ter no máximo 800 KB.",
  photosNeed: "Envie pelo menos 3 fotos e no máximo 4.",
  photosType: "Só aceitamos fotos JPG, PNG ou WebP.",
  photosSize: "Cada foto deve ter no máximo 800 KB.",
  permitKicker: "Permissões",
  sernaturQuestion: "Você tem registro SERNATUR?",
  sernaturYes: "Sim",
  sernaturNo: "Não",
  sernaturNumber: "Número de registro SERNATUR",
  sernaturNeed: "Informe o número de registro SERNATUR.",
  termsPrefix: "Aceito os",
  termsAnd: "e a",
  termsLink: "Termos",
  privacyLink: "Política de Privacidade",
  termsNeed: "Você deve aceitar os Termos e a Política de Privacidade.",
  emailLocked: "Este e-mail é o da sua conta verificada.",
  emailMismatch: "O e-mail deve coincidir com a sua conta verificada.",
  incompleteV2: "Complete a identidade, o negócio, a oferta e as permissões.",
  dossierStore: "Ainda não podemos guardar a candidatura completa. Tente mais tarde.",
  adminLegal: "Identidade legal",
  adminEntity: "Tipo",
  adminRegion: "Região",
  adminComuna: "Comuna",
  adminPresence: "Site ou Instagram",
  adminDescription: "Descrição",
  adminOffers: "Ofertas em CLP",
  adminPhotos: "Fotos",
  adminPhotoAlt: "Foto da candidatura",
  adminPhotoMissing: "Foto indisponível",
  adminSernatur: "SERNATUR",
  adminSernaturNone: "Sem registro",
  adminTerms: "Termos e privacidade aceitos",
};

const fr: PartnerDossierCopy = {
  legalKicker: "Identité légale",
  legalName: "Raison sociale ou nom",
  rut: "RUT",
  rutPlaceholder: "12.345.678-5",
  rutInvalid: "Le RUT n’est pas valide. Vérifiez le chiffre de contrôle.",
  entityType: "Type de candidat",
  entityEmpresa: "Entreprise",
  entityPersona: "Personne physique",
  region: "Région",
  regionPlaceholder: "Choisissez votre région",
  comuna: "Commune",
  presenceUrl: "Site web ou Instagram",
  presenceHint: "URL publique https de votre site ou de votre profil Instagram.",
  presenceInvalid: "Saisissez une URL https de votre site ou d’Instagram.",
  description: "Description courte",
  descriptionHint: "Ce que vous proposez et où, en quelques lignes.",
  offerKicker: "Offre et prix en CLP",
  offerName: "Nom de l’offre",
  offerPrice: "Prix en CLP",
  offerUnit: "Facturation",
  unitNoche: "Par nuit",
  unitPersona: "Par personne",
  unitExperiencia: "Par expérience",
  minStay: "Séjour minimum en nuits",
  capacity: "Capacité en personnes",
  addOffer: "Ajouter une autre offre",
  removeOffer: "Retirer l’offre",
  offerNeed: "Ajoutez au moins une offre avec un prix en CLP.",
  stayNeed: "Pour une offre à la nuit, indiquez le séjour minimum et la capacité.",
  photosKicker: "Photos",
  photosLabel: "Photos du lieu ou du service",
  photosChoose: "Choisir des photos",
  photosHint: "Envoyez au moins 3 photos et au plus 4. JPG, PNG ou WebP. Chacune doit peser au plus 800 Ko.",
  photosNeed: "Envoyez au moins 3 photos et au plus 4.",
  photosType: "Seules les photos JPG, PNG ou WebP sont acceptées.",
  photosSize: "Chaque photo doit peser au plus 800 Ko.",
  permitKicker: "Autorisations",
  sernaturQuestion: "Avez-vous un enregistrement SERNATUR ?",
  sernaturYes: "Oui",
  sernaturNo: "Non",
  sernaturNumber: "Numéro d’enregistrement SERNATUR",
  sernaturNeed: "Indiquez le numéro d’enregistrement SERNATUR.",
  termsPrefix: "J’accepte les",
  termsAnd: "et la",
  termsLink: "Conditions",
  privacyLink: "Politique de confidentialité",
  termsNeed: "Vous devez accepter les Conditions et la Politique de confidentialité.",
  emailLocked: "Cet e-mail est celui de votre compte vérifié.",
  emailMismatch: "L’e-mail doit correspondre à votre compte vérifié.",
  incompleteV2: "Complétez l’identité, l’activité, l’offre et les autorisations.",
  dossierStore: "Nous ne pouvons pas encore enregistrer la candidature complète. Réessayez plus tard.",
  adminLegal: "Identité légale",
  adminEntity: "Type",
  adminRegion: "Région",
  adminComuna: "Commune",
  adminPresence: "Site ou Instagram",
  adminDescription: "Description",
  adminOffers: "Offres en CLP",
  adminPhotos: "Photos",
  adminPhotoAlt: "Photo de la candidature",
  adminPhotoMissing: "Photo indisponible",
  adminSernatur: "SERNATUR",
  adminSernaturNone: "Sans enregistrement",
  adminTerms: "Conditions et confidentialité acceptées",
};

const it: PartnerDossierCopy = {
  legalKicker: "Identità legale",
  legalName: "Ragione sociale o nome",
  rut: "RUT",
  rutPlaceholder: "12.345.678-5",
  rutInvalid: "Il RUT non è valido. Controlla la cifra di controllo.",
  entityType: "Tipo di candidato",
  entityEmpresa: "Impresa",
  entityPersona: "Persona fisica",
  region: "Regione",
  regionPlaceholder: "Scegli la tua regione",
  comuna: "Comune",
  presenceUrl: "Sito o Instagram",
  presenceHint: "URL pubblico https del tuo sito o del profilo Instagram.",
  presenceInvalid: "Inserisci un URL https del tuo sito o di Instagram.",
  description: "Descrizione breve",
  descriptionHint: "Cosa offri e dove, in poche righe.",
  offerKicker: "Offerta e prezzi in CLP",
  offerName: "Nome dell’offerta",
  offerPrice: "Prezzo in CLP",
  offerUnit: "Addebito",
  unitNoche: "A notte",
  unitPersona: "A persona",
  unitExperiencia: "A esperienza",
  minStay: "Soggiorno minimo in notti",
  capacity: "Capacità in persone",
  addOffer: "Aggiungi un’altra offerta",
  removeOffer: "Rimuovi offerta",
  offerNeed: "Aggiungi almeno un’offerta con prezzo in CLP.",
  stayNeed: "Per un’offerta a notte indica il soggiorno minimo e la capacità.",
  photosKicker: "Foto",
  photosLabel: "Foto del luogo o del servizio",
  photosChoose: "Scegli le foto",
  photosHint: "Carica almeno 3 foto e al massimo 4. JPG, PNG o WebP. Ognuna deve pesare al massimo 800 KB.",
  photosNeed: "Carica almeno 3 foto e al massimo 4.",
  photosType: "Sono accettate solo foto JPG, PNG o WebP.",
  photosSize: "Ogni foto deve pesare al massimo 800 KB.",
  permitKicker: "Permessi",
  sernaturQuestion: "Hai una registrazione SERNATUR?",
  sernaturYes: "Sì",
  sernaturNo: "No",
  sernaturNumber: "Numero di registrazione SERNATUR",
  sernaturNeed: "Indica il numero di registrazione SERNATUR.",
  termsPrefix: "Accetto i",
  termsAnd: "e la",
  termsLink: "Termini",
  privacyLink: "Informativa sulla privacy",
  termsNeed: "Devi accettare i Termini e l’Informativa sulla privacy.",
  emailLocked: "Questa email è quella del tuo account verificato.",
  emailMismatch: "L’email deve coincidere con il tuo account verificato.",
  incompleteV2: "Completa l’identità, l’attività, l’offerta e i permessi.",
  dossierStore: "Non possiamo ancora salvare la candidatura completa. Riprova più tardi.",
  adminLegal: "Identità legale",
  adminEntity: "Tipo",
  adminRegion: "Regione",
  adminComuna: "Comune",
  adminPresence: "Sito o Instagram",
  adminDescription: "Descrizione",
  adminOffers: "Offerte in CLP",
  adminPhotos: "Foto",
  adminPhotoAlt: "Foto della candidatura",
  adminPhotoMissing: "Foto non disponibile",
  adminSernatur: "SERNATUR",
  adminSernaturNone: "Senza registrazione",
  adminTerms: "Termini e privacy accettati",
};

const de: PartnerDossierCopy = {
  legalKicker: "Rechtliche Identität",
  legalName: "Firmenname oder Name",
  rut: "RUT",
  rutPlaceholder: "12.345.678-5",
  rutInvalid: "Die RUT ist ungültig. Prüfe die Prüfziffer.",
  entityType: "Art der Bewerbung",
  entityEmpresa: "Unternehmen",
  entityPersona: "Natürliche Person",
  region: "Region",
  regionPlaceholder: "Wähle deine Region",
  comuna: "Gemeinde",
  presenceUrl: "Website oder Instagram",
  presenceHint: "Öffentliche https-URL deiner Website oder deines Instagram-Profils.",
  presenceInvalid: "Gib eine https-URL deiner Website oder von Instagram ein.",
  description: "Kurze Beschreibung",
  descriptionHint: "Was du anbietest und wo, in wenigen Zeilen.",
  offerKicker: "Angebot und Preise in CLP",
  offerName: "Name des Angebots",
  offerPrice: "Preis in CLP",
  offerUnit: "Abrechnung",
  unitNoche: "Pro Nacht",
  unitPersona: "Pro Person",
  unitExperiencia: "Pro Erlebnis",
  minStay: "Mindestaufenthalt in Nächten",
  capacity: "Kapazität in Personen",
  addOffer: "Weiteres Angebot hinzufügen",
  removeOffer: "Angebot entfernen",
  offerNeed: "Füge mindestens ein Angebot mit Preis in CLP hinzu.",
  stayNeed: "Für ein Angebot pro Nacht gib den Mindestaufenthalt und die Kapazität an.",
  photosKicker: "Fotos",
  photosLabel: "Fotos des Orts oder der Leistung",
  photosChoose: "Fotos auswählen",
  photosHint: "Lade mindestens 3 und höchstens 4 Fotos als JPG, PNG oder WebP hoch. Jedes darf höchstens 800 KB groß sein.",
  photosNeed: "Lade mindestens 3 und höchstens 4 Fotos hoch.",
  photosType: "Nur Fotos als JPG, PNG oder WebP sind zulässig.",
  photosSize: "Jedes Foto darf höchstens 800 KB groß sein.",
  permitKicker: "Genehmigungen",
  sernaturQuestion: "Hast du eine SERNATUR-Registrierung?",
  sernaturYes: "Ja",
  sernaturNo: "Nein",
  sernaturNumber: "SERNATUR-Registrierungsnummer",
  sernaturNeed: "Gib die SERNATUR-Registrierungsnummer an.",
  termsPrefix: "Ich akzeptiere die",
  termsAnd: "und die",
  termsLink: "AGB",
  privacyLink: "Datenschutzerklärung",
  termsNeed: "Du musst die AGB und die Datenschutzerklärung akzeptieren.",
  emailLocked: "Diese E-Mail gehört zu deinem bestätigten Konto.",
  emailMismatch: "Die E-Mail muss zu deinem bestätigten Konto passen.",
  incompleteV2: "Vervollständige Identität, Betrieb, Angebot und Genehmigungen.",
  dossierStore: "Die vollständige Bewerbung können wir noch nicht speichern. Versuche es später erneut.",
  adminLegal: "Rechtliche Identität",
  adminEntity: "Art",
  adminRegion: "Region",
  adminComuna: "Gemeinde",
  adminPresence: "Website oder Instagram",
  adminDescription: "Beschreibung",
  adminOffers: "Angebote in CLP",
  adminPhotos: "Fotos",
  adminPhotoAlt: "Foto der Bewerbung",
  adminPhotoMissing: "Foto nicht verfügbar",
  adminSernatur: "SERNATUR",
  adminSernaturNone: "Keine Registrierung",
  adminTerms: "AGB und Datenschutz akzeptiert",
};

export const partnerApplicationCopy: Record<Locale, PartnerDossierCopy> = {
  es,
  en,
  pt,
  fr,
  it,
  de,
};
