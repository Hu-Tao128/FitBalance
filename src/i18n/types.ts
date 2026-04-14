export interface TranslationKeys {
  common: {
    welcome: string;
    login: string;
    register: string;
    settings: string;
    profile: string;
    dashboard: string;
    save: string;
    confirm: string;
    cancel: string;
    language: string;
    english: string;
    spanish: string;
    greeting: string;
  };
  auth: {
    email: string;
    password: string;
    forgotPassword: string;
    noAccount: string;
    completeCredentials: string;
    welcomeUser: string;
    incorrectCredentials: string;
    networkError: string;
    username: string;
    bestVersion: string;
  };
  dashboard: {
    calories: string;
    of: string;
    remaining: string;
    excess: string;
    macronutrients: string;
    protein: string;
    carbs: string;
    fat: string;
    mealLog: string;
    mealLogHistory: string;
    mealLogDesc: string;
    openMealLog: string;
    registerFood: string;
  };
  food: {
    searchOptionsTitle: string;
    searchOptionsSub: string;
    scanCode: string;
    scanCodeSub: string;
    searchByName: string;
    searchByNameSub: string;
    createMeal: string;
    createMealSub: string;
    viewSavedMeals: string;
    noPlannedMeals: string;
    loadPlanError: string;
    addMealSuccess: string;
    addMealSuccessMsg: string;
    notice: string;
    alreadyLogged: string;
    error: string;
    addMealError: string;
    contactNutritionist: string;
    logMealQuestion: string;
    useRecommended: string;
    deleteTitle: string;
    deleteMessage: string;
    deleteConfirm: string;
    deletePending: string;
    selectedDate: string;
    noRecords: string;
    retry: string;
    searchPlaceholder: string;
    findNutrition: string;
    quickCategories: string;
    recentSearches: string;
    clearAll: string;
    confirmAdd: string;
    servingInfo: string;
    categories: {
      breakfast: string;
      lunch: string;
      snacks: string;
      keto: string;
    };
    meals: {
      breakfast: string;
      lunch: string;
      dinner: string;
      snack: string;
    };
    foodCount: string;
    caloriesCount: string;
  };
  statistics: {
    title: string;
    selectedWeek: string;
    weekLabel: string;
    calendar: string;
    noData: string;
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
    close: string;
  };
  profile: {
    defaultUser: string;
    logoutTitle: string;
    logoutMessage: string;
    logoutExit: string;
    weight: string;
    height: string;
    editProfile: string;
    security: string;
    preferences: string;
  };
  nutritionist: {
    noNutritionist: string;
    loading: string;
    loadError: string;
    defaultSpecialization: string;
    contactInfo: string;
    email: string;
    noEmail: string;
    officeAddress: string;
    license: string;
    quickActions: string;
    sendMessage: string;
    bookAppointment: string;
    premiumBadge: string;
  };
  appointments: {
    title: string;
    subtitle: string;
    description: string;
    upcoming: string;
    pending: string;
    noAppointments: string;
    noAppointmentsSub: string;
    virtual: string;
    inPerson: string;
    default: string;
    videoCall: string;
    mainOffice: string;
    reschedule: string;
    join: string;
    confirm: string;
    history: string;
    finished: string;
    yourSpecialist: string;
    nutritionist: string;
    loading: string;
  };
  password: {
    title: string;
    subtitle: string;
    currentLabel: string;
    newLabel: string;
    confirmLabel: string;
    requirementsTitle: string;
    minChars: string;
    atLeastNumber: string;
    atLeastUpper: string;
    specialChar: string;
    saveChanges: string;
    accountProtection: string;
    protectionDesc: string;
    strength: {
      veryWeak: string;
      weak: string;
      medium: string;
      strong: string;
    };
    errors: {
      requiredFields: string;
      noMatch: string;
      tooShort: string;
      notIdentified: string;
      updateError: string;
    };
    success: string;
  };
  notifications: {
    deviceError: string;
    permissionError: string;
  };
  settings: {
    account: string;
    changePassword: string;
    preferences: string;
    notifications: string;
    darkMode: string;
    others: string;
    appointments: string;
    nutritionist: string;
    logOff: string;
    logoutQuestion: string;
    logoutConfirm: string;
  };
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationKeys;
    };
  }
}