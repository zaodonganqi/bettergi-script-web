export default {
    menu: {
        map: 'Suivi de carte',
        script: 'Scripts Javascript',
        combat: 'Stratégie de combat',
        tcg: 'Stratégie TCG'
    },
    button: {
        ok: 'OK',
        cancel: 'Annuler',
        refresh: 'Rafraîchir la page',
        help: 'Voir l\'aide',
        all: 'Tout',
        subscribed: 'Abonné',
        visitOnline: 'Voir le dépôt en ligne'
    },
    sider: {
        repoTitle: 'Dépôt de scripts',
        mainRepo: 'Voir le dépôt principal BetterGI',
        scriptRepo: 'Voir le dépôt de scripts BetterGI',
        onlineRepo: 'Voir le dépôt en ligne',
        lastUpdate: 'Dernière mise à jour : '
    },
    script: {
        all: 'Tout',
        subscribed: 'Abonné',
        onlyLocal: 'Disponible uniquement en mode local',
        searchMap: 'Rechercher nom, auteur, tag',
        searchScript: 'Rechercher nom du script, auteur, description, tag',
        searchCombat: 'Rechercher nom de stratégie de combat, auteur, tag',
        searchTCG: 'Rechercher nom de stratégie TCG, auteur, tag',
        searchDefault: 'Entrez un mot-clé pour rechercher',
        author: 'Auteur :',
        noAuthor: 'Aucune information sur l\'auteur',
        unknown: 'Script inconnu'
    },
    error: {
        repoTitle: 'Échec de la récupération des informations du dépôt',
        repoDesc: 'Veuillez vérifier votre connexion ou rafraîchir la page plus tard'
    },
    comment: {
        title: 'Commentaire',
        localModeTitle: 'Le commentaire n\'est pas disponible en mode local',
        localModeDesc: 'Veuillez aller sur le dépôt en ligne pour commenter'
    },
    egg: {
        title: 'Easter Egg',
        loading: 'Easter egg en cours de chargement…',
        error: 'Échec du chargement, veuillez réessayer'
    },
    help: {
        title: 'FAQ',
        modalTitle: 'Remarque : Veuillez réfléchir avant de poser des questions. Les réponses ci-dessous peuvent sembler dures, ce qui est normal et n\'a rien à voir avec l\'auteur de BGI. Si vous n\'êtes pas satisfait, veuillez contacter l\'auteur de cette page.',
        author: 'Email de l\'auteur : anqi4051@gmail.com',
        qa: [
            { q: 'Pourquoi le dépôt échoue-t-il toujours à charger ?', a: 'Le dépôt utilise des adresses GitHub, qui peuvent être instables en Chine. Si cela échoue, réessayez plus tard ou utilisez la page du dépôt local BGI. (Si vous êtes un magicien, vous savez quoi faire)' },
            { q: 'Pourquoi la fonction de commentaire est-elle indisponible ?', a: 'Les commentaires ne sont pas pris en charge en mode local. Veuillez visiter le dépôt en ligne et vous connecter avec votre compte GitHub pour commenter. Aucun guide sur l\'utilisation de GitHub ici.' },
            { q: 'Pourquoi n\'y a-t-il pas de script XX ?', a: 'Si vous avez vérifié les quatre listes et que vous ne le trouvez toujours pas, cela signifie que personne ne l\'a écrit.' },
            { q: 'Comment utiliser la fonction d\'abonnement ?', a: 'Allez dans “BetterGI → Paramètres → Paramètres du serveur Http BetterGI” (si introuvable, assurez-vous que BGI est à jour), activez-le et définissez le port sur 30648. Fermez ensuite cette page et redémarrez BGI. Si le problème persiste, contactez l\'auteur.' },
            { q: 'Qu\'est-ce que README, pourquoi échoue-t-il à charger ou à s\'afficher ?', a: 'Si vous ne savez pas ce qu\'est README, veuillez le lire. En cas d\'échec de chargement, voir la première question. S\'il ne s\'affiche pas, l\'auteur du script n\'a pas écrit de README ou a mal nommé le fichier.' },
            { q: 'Pourquoi certains liens ne fonctionnent-ils pas ou sont-ils lents ?', a: 'Voir la première question.' },
            { q: 'Pourquoi rien ne se passe après avoir cliqué sur s\'abonner ?', a: 'Ouvrez BGI, une fenêtre d\'importation apparaîtra. Si vous utilisez le dépôt en ligne et que votre abonnement n\'apparaît pas après actualisation, mettez à jour le dépôt local et réessayez. Pour d\'autres problèmes, demandez dans le groupe concerné.' },
            { q: 'Que faire si le script ne fonctionne pas ?', a: 'Demandez dans le groupe concerné, fournissez des captures d\'écran et des descriptions suffisantes.' },
            { q: 'Pourquoi mes anciens commentaires ont-ils disparu ?', a: 'Les commentaires sont rarement supprimés. S\'ils ont disparu, c\'est probablement parce que le chemin du nœud a changé (par exemple, un répertoire a été renommé).' },
            { q: 'Pourquoi ne pas utiliser Nahida dans ce script ?', a: 'Les auteurs considèrent si tout le monde a le personnage. Si vous en avez besoin, essayez d\'en créer un vous-même.' },
            { q: 'Que faire si je veux la fonctionnalité XX ?', a: 'Si aucun auteur ne l\'écrit, faites-le vous-même !' },
            { q: 'Autre', a: 'Contactez-moi pour plus de questions. Si elles sont utiles, cette page sera mise à jour.' }
        ]
    },
    common: {
        comma: ',',
        noDesc: 'Aucun'
    },
    detail: {
        author: 'Auteur :',
        scriptAuthor: 'Auteur',
        noAuthor: 'Aucune information sur l\'auteur',
        subscribe: 'S\'abonner',
        subscribed: 'Abonné',
        subscribeAgain: 'S\'abonner à nouveau',
        subscribeFailed: 'Échec de l\'abonnement',
        subscribeFailedWithMsg: 'Échec de l\'abonnement : {msg}',
        subscribeSuccess: 'Lien d\'abonnement de {name} copié dans le presse-papiers',
        copyFailed: 'Échec de la copie du lien d\'abonnement pour {name}',
        loadingReadme: 'Chargement du fichier readme',
        readmeFailed: 'Échec du chargement du fichier readme, veuillez réessayer',
        loadingStrategy: 'Chargement du contenu du fichier stratégie',
        strategyFailed: 'Échec du chargement du fichier stratégie, veuillez réessayer',
        empty: 'Veuillez sélectionner un script à gauche pour voir les détails',
        desc: 'Description :',
        tabReadme: 'Description',
        tabFiles: 'Liste des fichiers',
        noFiles: 'Aucune donnée de fichier',
        modalTitle: 'Détails du fichier',
        name: 'Nom',
        tags: 'Tags',
        lastUpdated: 'Dernière mise à jour',
        operations: 'Opérations',
        hash: 'hash',
        description: 'Description',
        version: 'Version',
        path: 'Chemin',
        details: 'Détails',
        showDetails: 'Détails'
    },
    scriptList: {
        subscribed: 'Abonné',
        noAuthor: 'Aucun auteur'
    },
    combatStrategyList: {
        subscribed: 'Abonné',
        noAuthor: 'Aucun auteur'
    },
    cardStrategyList: {
        subscribed: 'Abonné',
        noAuthor: 'Aucun auteur'
    },
    mapTreeList: {
        subscribed: 'Abonné',
        subscribe: 'S\'abonner',
        subscribeAgain: 'S\'abonner à nouveau',
        selectValidNode: 'Veuillez sélectionner un nœud valide pour vous abonner',
        subscribeFailed: 'Échec de l\'abonnement',
        subscribeFailedWithMsg: 'Échec de l\'abonnement : {msg}',
        subscribeSuccess: 'Lien d\'abonnement de {name} copié dans le presse-papiers',
        copyFailed: 'Échec de la copie du lien d\'abonnement pour {name}',
        noDesc: 'Aucun'
    },
    readmeViewer: {
        descTitle: 'Description :',
        noDesc: 'Aucune description',
        loadTimeout: 'Délai de chargement dépassé',
        loadFailed: 'Échec du chargement',
        clickToViewFile: 'Cliquez pour voir le fichier sur GitHub',
        clickToViewDir: 'Cliquez pour voir le dossier sur GitHub',
        invalidLinkHint: '(L\'auteur a fait une erreur dans le lien, veuillez lui demander de le corriger)'
    },
    action: {
        help: 'Aide',
        jumpToGitHub: 'Aller sur GitHub',
        comment: 'Commentaire'
    },
    settings: {
        title: 'Paramètres',
        language: 'Langue',
        zhCN: 'Chinois simplifié',
        zhTW: 'Chinois traditionnel',
        enUS: 'Anglais',
        jaJP: 'Japonais',
        frFR: 'Français'
    },
    loading: {
        repoData: 'Chargement des données du dépôt, veuillez patienter...'
    }
}