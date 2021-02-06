const Config = {
    statics: {
        paginationSize: 20,
        typeSpeed: 50
    },
    mapApiKey: '9282916c8343617c6a072362f3f28c70a0866b84',

    baseUrl: 'http://10.56.16.50:8888',

    // SSO URLS
    loginUrl: '/pod/authentication',
    loginUrlDev: '/pod/authentication/true',

    // Question URLS
    getQuestion: '/api/services/app/Questions/GetQuestion',
    getQuestions: '/api/services/app/Questions/GetQuestions',
    getRandomLabel: '/api/services/app/Questions/GetRandomLabel',

    // Answer URLS
    submitAnswer: '/api/services/app/Answers/SubmitAnswer',
    submitAnswers: '/api/services/app/Answers/SubmitBatchAnswer',
    getAllAnswers: '/api/services/app/Answers/GetAll',
    getAnswersStats: '/api/services/app/Answers/Stats',

    // Datasets URLS
    getDataset: '/api/services/app/DataSets/Get',
    updateDataset: '/api/services/app/DataSets/Update',
    getAllDatasets: '/api/services/app/DataSets/GetAll',
    getDatasetStats: '/api/services/app/DataSets/Stats',

    // Dataset Items URLS
    getDatasetItem: '/api/services/app/DataSetItems/Get',
    getAllDatasetItems: '/api/services/app/DataSetItems/GetAll',
    setGolden: '/api/services/app/DataSetItems/SetGolden',


    // Target URLS
    setTarget: '/api/services/app/Targets/Create',
    getTarget: '/api/services/app/Targets/Get',
    getAllTargets: '/api/services/app/Targets/GetAll',

    // Get Files
    getFile: '/file/dataset/item',

    // Wallet
    getWalletCredit: '/api/services/app/Wallet/GetCredit',

    // Targets
    setTarget: '/api/services/app/Targets/Create',
    getTarget: '/api/services/app/Targets/Get',
    getAllTargets: '/api/services/app/Targets/GetAll',
    updateTarget: '/api/services/app/Targets/Update',
    deleteTarget: '/api/services/app/Targets/Delete',

    // Target ِDefinitions
    setTargetDefinition: '/api/services/app/TargetDefinitions/Create',
    getTargetDefinition: '/api/services/app/TargetDefinitions/Get',
    getAllTargetsDefinition: '/api/services/app/TargetDefinitions/GetAll',
    updateTargetDefinition: '/api/services/app/TargetDefinitions/Update',
    deleteTargetDefinition: '/api/services/app/TargetDefinitions/Delete',

    // Transactions
    getBalance: '/api/services/app/Transactions/GetBalance',
    getTransaction: '/api/services/app/Transactions/Get',
    getAllTransactions: '/api/services/app/Transactions/GetAll',
    setTransaction: '/api/services/app/Transactions/Create',
    updateTransaction: '/api/services/app/Transactions/Update',
    deleteTransaction: '/api/services/app/Transactions/Delete',

    // User
    getUser: '/api/services/app/User/Get',
    getAllUsers: '/api/services/app/User/GetAll',
    getUserRoles: '/api/services/app/User/GetRoles',
    createUser: '/api/services/app/User/Create',
    updateUser: '/api/services/app/User/Update',
    deleteUser: '/api/services/app/User/Delete',

    // Credit
    collectCredit: '/api/services/app/Credit/CollectCredit',
    getCredit: '/api/services/app/Credit/GetCredit',

    // Reports
    reportsAnswerCounts: '/api/services/app/Reports/AnswersCountsTrend',
    reportsScoreboard: '/api/services/app/Reports/Scoreboard',
    reportsDatasets: '/api/services/app/Reports/DataSets',

    // Session
    getCurrentSession: '/api/services/app/Session/GetCurrentLoginInformations',
};

export default Config;
