import React, { createContext, useState, useContext, useEffect } from "react";

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

const translations = {
  en: {
    dashboard: "Dashboard",
    agents: "Agents",
    payments: "Payments",
    debts: "Debts",
    reports: "Reports",
    logout: "Logout",
    welcome: "Welcome to AgentPay",
    total_agents: "Total Agents",
    monthly_payments: "Monthly Payments",
    pending_payments: "Pending Payments",
    completed_payments: "Completed Payments",
    add_agent: "Add Agent",
    update_agent: "Update Agent",
    agent_name: "Agent Name",
    role: "Role",
    salary: "Salary ($)",
    date_of_birth: "Date of Birth",
    email_address: "Email Address",
    phone_number: "Phone Number",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    agent_debts: "Agent Debts",
    add_debt: "Add Debt",
    debt_amount: "Debt Amount",
    reason: "Reason",
    date: "Date",
    add_payment: "Add Payment",
    payment_month: "Payment Month",
    status: "Status",
    validate: "Validate",
    cancelled: "Cancelled",
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
    generate_report: "Generate Report",
    payslip: "PaySlip",
    month: "Month",
    year: "Year",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    manage_agents_with_ease: "The ultimate platform for managing agent payments with ease, security, and transparency.",
    get_started: "Get Started",
    enter_full_name: "Enter full name",
    salary_amount: "Salary amount",
    sign_in: "Sign in to your account",
    email: "Email",
    password: "Password",
    login: "Login",
    logging_in: "Logging in...",
    filters: "Filters",
    all_time: "All Time",
    monthly: "Monthly",
    payment_distribution: "Payment Distribution",
    payment_statuses: "Payment Statuses",
    select_agent: "Select Agent",
    select_month: "Select Month",
    select_type: "Select Type",
    yearly: "Yearly",
    all: "All",
    calculation_for: "Calculation for",
    base_salary: "Base Salary",
    total_debts_month: "Total Debts (Month)",
    rest_to_receive: "Rest to Receive",
    limit_exceeded: "Limit Exceeded",
    loading_dashboard: "Loading dashboard",
    payment_list: "Payment List",
    no_payments_found: "No payments found",
    management_reports: "Management Reports",
    general_reports: "General Reports",
    general_reports_desc: "Generate global lists for system data.",
    download_all_agents: "Download All Agents",
    download_all_debts: "Download All Debts",
    agent_payslips: "Agent Payslips",
    choose_agent: "Choose Agent",
    month_for_monthly: "Month for Monthly",
    year_for_yearly: "Year for Yearly",
    monthly_pdf: "Monthly PDF",
    yearly_pdf: "Yearly PDF",
    download_all_time: "Download All-Time History",
    payslip_note: "Note: All payslips only include \"Completed\" payments. Pending or Cancelled payments are excluded from the earnings calculation.",
    loading_agents: "Loading agents",
    all_fields_required: "All fields are required",
    invalid_email: "Invalid email address",
    password_too_short: "Password must be at least 6 characters",
    login_failed: "Login failed",
    invalid_phone_format: "Phone number must start with 099, 24399, or +24399",
    future_dob_error: "Date of birth cannot be in the future",
    birth_year_error: "Birth year cannot exceed 2006",
    save_success: "Agent saved successfully",
    delete_success: "Agent deleted successfully",
    delete_error: "Failed to delete agent",
    load_error: "Failed to load data",
    payment_success: "Payment added successfully",
    debt_success: "Debt added successfully",
    payment_validated: "Payment validated successfully",
    payment_cancelled: "Payment cancelled successfully",
    duplicate_email: "An agent with this email address already exists",
    duplicate_phone: "An agent with this phone number already exists",
    select_agent: "Please select an agent"
  },
  fr: {
    dashboard: "Tableau de Bord",
    agents: "Agents",
    payments: "Paiements",
    debts: "Dettes",
    reports: "Rapports",
    logout: "Déconnexion",
    welcome: "Bienvenue sur AgentPay",
    total_agents: "Total des Agents",
    monthly_payments: "Paiements Mensuels",
    pending_payments: "Paiements en Attente",
    completed_payments: "Paiements Effectués",
    add_agent: "Ajouter un Agent",
    update_agent: "Modifier l'Agent",
    agent_name: "Nom de l'Agent",
    role: "Rôle",
    salary: "Salaire ($)",
    date_of_birth: "Date de Naissance",
    email_address: "Adresse Email",
    phone_number: "Numéro de Téléphone",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Enregistrer",
    agent_debts: "Dettes des Agents",
    add_debt: "Ajouter une Dette",
    debt_amount: "Montant de la Dette",
    reason: "Raison",
    date: "Date",
    add_payment: "Ajouter un Paiement",
    payment_month: "Mois de Paiement",
    status: "Statut",
    validate: "Valider",
    cancelled: "Annulé",
    completed: "Terminé",
    pending: "En attente",
    failed: "Échoué",
    generate_report: "Générer le Rapport",
    payslip: "Fiche de Paie",
    month: "Mois",
    year: "Année",
    language: "Langue",
    theme: "Thème",
    dark: "Sombre",
    light: "Clair",
    manage_agents_with_ease: "La plateforme ultime pour gérer les règlements des agents avec facilité, sécurité et transparence.",
    get_started: "Commencer",
    enter_full_name: "Entrez le nom complet",
    salary_amount: "Montant du salaire",
    sign_in: "Connectez-vous à votre compte",
    email: "Email",
    password: "Mot de passe",
    login: "Connexion",
    logging_in: "Connexion en cours...",
    filters: "Filtres",
    all_time: "Tout le temps",
    monthly: "Mensuel",
    payment_distribution: "Distribution des Paiements",
    payment_statuses: "Statuts des Paiements",
    select_agent: "Sélectionner un Agent",
    select_month: "Sélectionner un Mois",
    select_type: "Sélectionner un Type",
    yearly: "Annuel",
    all: "Tous",
    calculation_for: "Calcul pour",
    base_salary: "Salaire de Base",
    total_debts_month: "Total Dettes (Mois)",
    rest_to_receive: "Reste à Percevoir",
    limit_exceeded: "Limite Dépassée",
    loading_dashboard: "Chargement du tableau de bord",
    payment_list: "Liste des Paiements",
    no_payments_found: "Aucun paiement trouvé",
    management_reports: "Rapports de Gestion",
    general_reports: "Rapports Généraux",
    general_reports_desc: "Générer des listes globales pour les données du système.",
    download_all_agents: "Télécharger tous les Agents",
    download_all_debts: "Télécharger toutes les Dettes",
    agent_payslips: "Fiches de Paie des Agents",
    choose_agent: "Choisir un Agent",
    month_for_monthly: "Mois pour le Mensuel",
    year_for_yearly: "Année pour l'Annuel",
    monthly_pdf: "PDF Mensuel",
    yearly_pdf: "PDF Annuel",
    download_all_time: "Télécharger l'Historique Complet",
    payslip_note: "Note : Toutes les fiches de paie n'incluent que les paiements \"Terminés\". Les paiements en attente ou annulés sont exclus du calcul des gains.",
    loading_agents: "Chargement des agents",
    all_fields_required: "Tous les champs sont obligatoires",
    invalid_email: "Adresse email invalide",
    password_too_short: "Le mot de passe doit comporter au moins 6 caractères",
    login_failed: "Échec de la connexion",
    invalid_phone_format: "Le numéro doit commencer par 099, 24399 ou +24399",
    future_dob_error: "La date de naissance ne peut pas être dans le futur",
    birth_year_error: "L'année de naissance ne peut pas dépasser 2006",
    save_success: "Agent enregistré avec succès",
    delete_success: "Agent supprimé avec succès",
    delete_error: "Échec de la suppression de l'agent",
    load_error: "Échec du chargement des données",
    payment_success: "Paiement ajouté avec succès",
    debt_success: "Dette ajoutée avec succès",
    payment_validated: "Paiement validé avec succès",
    payment_cancelled: "Paiement annulé avec succès",
    duplicate_email: "Un agent avec cette adresse email existe déjà",
    duplicate_phone: "Un agent avec ce numéro de téléphone existe déjà",
    select_agent: "Veuillez sélectionner un agent"
  }
};

export const UIProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));
  
  const changeLanguage = (lang) => setLanguage(lang);

  const t = (key) => {
    if (!translations[language]) return key;
    return translations[language][key] || key;
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  return (
    <UIContext.Provider value={{ theme, toggleTheme, language, changeLanguage, t, toast, showToast }}>
      {children}
    </UIContext.Provider>
  );
};
