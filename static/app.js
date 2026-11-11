// Stats Hub dashboard: reads /api/* and draws the pages. Installable as an app on a phone. No build step.

// ---------- language ----------
const I18N = {
  en: {
    "nav.overview": "Overview", "nav.posts": "Top posts", "nav.insights": "Insights", "nav.settings": "Settings",
    "nav.short.overview": "Home", "nav.short.posts": "Posts", "nav.short.insights": "Insights", "nav.short.settings": "Settings",
    "sync.now": "Sync now", "sync.running": "Syncing…", "sync.never": "Not synced yet", "sync.last": "Last sync: {time}",
    "sync.short": "Sync {time}",
    "demo.banner": "<strong>Demo data.</strong> These numbers are invented, to show what the dashboard looks like.",
    "offline.banner": "<strong>Offline.</strong> These are the numbers saved on {time}. The PC or the dashboard can't be reached right now.",
    "offline.action": "Not possible while offline.",
    "offline.page": "This page hasn't been saved on this device yet. It will show up as soon as the dashboard can be reached.",
    "filter.all": "All", "filter.days": "{n} days", "filter.groups": "All channels",
    "kpi.followers": "Followers", "kpi.views": "Views", "kpi.median": "Median views per post",
    "kpi.engagement": "Engagement rate", "kpi.ppw": "Posts per week",
    "kpi.growth": "<b>{growth}</b> in {n} days", "kpi.posts": "{posts} posts in {n} days",
    "kpi.median.sub": "typical post, ignores viral outliers", "kpi.eng.sub": "(likes + comments + shares) ÷ views",
    "kpi.ppw.sub": "posting consistency", "kpi.vsPrev": "Compared with the {n} days before",
    "delta.new": "new",
    "pf.accounts": "{n} accounts", "pf.account": "1 account", "pf.followers": "Followers", "pf.views": "Views",
    "pf.median": "Median views", "pf.eng": "Engagement", "pf.chart": "Views per day",
    "chart.followers": "Followers by platform", "chart.followers.sub": "Total at the end of each day",
    "chart.views": "Views per day", "chart.views.sub": "Views of the posts published each day, by platform",
    "goals.title": "Creator Rewards (TikTok)",
    "goals.sub": "What TikTok asks before it pays: {followers} followers and {views} views over 30 days, on a personal account, with videos longer than 1 minute.",
    "goals.followers": "Followers", "goals.views30": "Views, last 30 days", "goals.reached": "Numbers reached",
    "goals.estimate": "Views = views of the posts published in the last 30 days. It's an estimate: TikTok also counts new views on older videos.",
    "channels.title": "Channels", "channels.sub": "Each channel and its accounts. Click an account to open it.",
    "channels.total": "{followers} followers · {views} views in {n} days",
    "table.title": "All accounts", "table.sub": "Click a column to sort, click an account to open it. Trend = followers over {n} days.",
    "rank.sub": "Sorted by:", "rank.growth7": "Growth, 7 days", "rank.growth30": "Growth, 30 days",
    "col.account": "Account", "col.followers": "Followers", "col.7": "7 days", "col.30": "30 days", "col.trend": "Trend",
    "col.ppw": "Posts / week", "col.views": "Views", "col.median": "Median views", "col.eng": "Engagement",
    "col.post": "Post", "col.category": "Category", "col.published": "Published", "col.likes": "Likes",
    "col.comments": "Comments", "col.shares": "Shares", "col.saves": "Saves", "col.watch": "Avg watch",
    "col.watch.title": "Average watch time (Instagram Reels)", "col.posts": "Posts",
    "pc.views": "views",
    "posts.title": "Top posts", "posts.byViews": "By views", "posts.byShares": "By shares",
    "posts.sub": "Best {n} posts of the last {d} days. Shares and saves are the strongest signals for the algorithm. Click a post for its details and its growth curve.",
    "posts.none": "No posts in this period.", "posts.open": "Open the post",
    "posts.export": "Export CSV", "posts.allCats": "All categories",
    "post.open": "Open on {platform}", "post.growth": "Views since publication",
    "post.growth.soon": "The curve appears after a few syncs: one point per sync during the first 30 days.",
    "post.reach": "Reach", "post.missing": "Post not found.", "post.loading": "Loading…",
    "sheet.close": "Close",
    "ins.times": "Best days and times to post",
    "ins.times.sub": "Median views of the posts published in each slot, last {d} days ({n} posts).",
    "ins.times.more": " Use 90 days for a more reliable picture.",
    "ins.best": "Best slot: <b>{day} around {hour}</b>, median {views} views ({n} posts).",
    "ins.tip": "{day} {hour} · median {views} views · {n} posts", "ins.tip.none": "{day} {hour} · no posts",
    "ins.scale.less": "Fewer views", "ins.scale.more": "More views · Paris time · grey = no post",
    "ins.cats": "Performance by category",
    "ins.cats.sub": "Median views per post for each topic category. Hover or tap a bar for posts, engagement and shares.",
    "ins.nocat": "No category",
    "acc.back": "← All accounts", "acc.posts": "Posts", "acc.posts.sub": "Every post of the last {d} days, newest first.",
    "acc.type.personal": "personal account", "acc.type.creator": "creator account", "acc.type.business": "business account",
    "acc.missing": "Account not found.", "acc.toOverview": "Back to the overview",
    "set.look": "Appearance", "set.look.sub": "Saved on this device.",
    "set.light": "Light mode", "set.light.sub": "White background with dark text. Off = dark mode.",
    "set.lang": "Language", "set.lang.sub": "For the whole dashboard and your Telegram alerts.",
    "set.alerts": "Telegram alerts",
    "set.alerts.sub": "A message on Telegram when the dashboard can't sync a channel, and when it works again. Uses its own bot, separate from your posting alerts.",
    "set.alerts.demo": "You're looking at the demo. Start the dashboard with <b>Start dashboard.bat</b> to set up alerts.",
    "set.alerts.on": "On: messages go to <b>{chat}</b> through <b>{bot}</b>.",
    "set.alerts.saved": "Bot <b>{bot}</b> saved. Last step: open it in Telegram, press <b>Start</b>, then click the button below.",
    "set.alerts.step1": "In Telegram, open <b>@BotFather</b>, send <b>/newbot</b> and give it a name, for example <i>Stats Hub alerts</i>.",
    "set.alerts.step2": "BotFather answers with a <b>token</b> (it looks like 123456789:ABC…). Copy it and paste it below.",
    "set.alerts.step3": "Then open your new bot, press <b>Start</b>, and come back here.",
    "set.alerts.token": "Bot token", "set.alerts.save": "Save", "set.alerts.started": "I pressed Start",
    "set.alerts.cancel": "Cancel", "set.alerts.test": "Send a test", "set.alerts.off": "Turn off",
    "set.alerts.yourbot": "your bot", "set.alerts.you": "you",
    "set.alerts.checking": "Checking the token with Telegram…", "set.alerts.looking": "Looking for your chat…",
    "set.alerts.connected": "Connected. A confirmation message was sent to you on Telegram.",
    "set.alerts.nostart": "No message found yet. Open the bot in Telegram, press Start (or send it any message), then try again.",
    "set.alerts.sending": "Sending…", "set.alerts.sent": "Sent. Check Telegram.", "set.alerts.turningOff": "Turning off…",
    "set.alerts.confirmOff": "Turn off Telegram alerts? The bot token is deleted from this computer.",
    "digest.label": "Weekly summary", "digest.sub": "Every Monday morning on Telegram: followers, views, top post, best account.",
    "digest.send": "Send the summary now",
    "phone.title": "On your phone",
    "phone.sub": "The dashboard as an app on your phone, through Tailscale: a private link between your own devices. Nothing is put on the internet.",
    "phone.demo": "You're looking at the demo. Start the dashboard with <b>Start dashboard.bat</b> to set up phone access.",
    "phone.notInstalled": "Tailscale isn't installed on this PC yet. It's free, from tailscale.com/download. Install it, log in, then click Check again.",
    "phone.notRunning": "Tailscale is installed but not connected. Open Tailscale on this PC (the icon near the clock), log in, then click Check again.",
    "phone.check": "Check again", "phone.enable": "Turn on phone access",
    "phone.enable.sub": "One click, once. Only your own Tailscale devices will be able to open the dashboard, over HTTPS.",
    "phone.enabling": "Turning it on…", "phone.ready": "Phone access is on.",
    "phone.address": "Address for your phone:", "phone.copy": "Copy", "phone.copied": "Copied",
    "phone.step1": "On your phone, install the <b>Tailscale</b> app (App Store or Google Play) and log in with the <b>same account</b> as on this PC.",
    "phone.step2": "Scan this code with the phone's camera, or type the address.",
    "phone.step3.ios": "iPhone: in Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>.",
    "phone.step3.android": "Android: in Chrome, tap the <b>⋮</b> menu, then <b>Install app</b> (or <b>Add to Home screen</b>).",
    "phone.note": "The PC must be on, with the dashboard running. Without it, the app shows the last saved numbers.",
    "phone.install": "Install the app", "phone.installed": "Installed on this device.",
    "phone.here.ios": "To keep it as an app: tap <b>Share</b>, then <b>Add to Home Screen</b>.",
    "phone.here.android": "To keep it as an app: tap the <b>⋮</b> menu, then <b>Install app</b> (or <b>Add to Home screen</b>).",
    "set.channels": "Your channels", "set.channels.sub": "One Zernio account per channel. Each channel is a group in the filters.",
    "set.channels.none": "No channel yet.", "set.channels.waiting": "No account found yet (waiting for a sync)",
    "set.channels.nokey": "No key", "set.remove": "Remove",
    "set.remove.confirm": "Remove {name}? Its key is deleted from this computer. The stats already saved are kept, hidden.",
    "set.add": "Add a channel",
    "set.add.demo": "You're looking at the demo. Start the dashboard with <b>Start dashboard.bat</b> to add your real channels.",
    "set.add.help": "In the Zernio account of this channel, copy its <b>API key</b> (in Zernio's settings) and paste it below. The key is checked with Zernio, then saved only on this computer, in the <code>.env</code> file. It is never shown again.",
    "set.add.name": "Channel name", "set.add.name.sub": "For example: Space facts",
    "set.add.key": "Zernio API key", "set.add.repo": "Project folder (optional)",
    "set.add.repo.sub": "The channel's posting project, to sort posts by category. Example: C:\\Users\\you\\my-channel",
    "set.add.go": "Check and add", "set.add.checking": "Checking the key with Zernio…",
    "set.add.fill": "Please fill in the name and the key.",
    "set.add.found0": "no TikTok or Instagram account yet. Connect them in Zernio, then click Sync now",
    "set.add.added": "<b>{name}</b> added. Found: {found}. Syncing…",
    "set.add.done": "<b>{name}</b> added and synced. Found: {found}.",
    "empty.title": "No accounts yet", "empty.text": "Connect your first channel with its Zernio key.",
    "empty.add": "+ Add a channel", "empty.demo": "To see an example, start the hub with <code>python hub.py --demo</code>.",
    "err.load": "Couldn't load the data ({error}). Is the hub still running?",
    "err.generic": "Something went wrong",
    "cloud.unlock.text": "Type your password to open your stats on this device.",
    "cloud.unlock.password": "Password", "cloud.unlock.remember": "Remember on this device",
    "cloud.unlock.go": "Open", "cloud.unlock.busy": "Opening…", "cloud.unlock.wrong": "Wrong password.",
    "cloud.unlock.nodata": "No numbers yet: the first update on GitHub hasn't finished. Try again in a few minutes.",
    "cloud.title": "Online version",
    "cloud.sub": "Updated by GitHub every 15 minutes, even when your PC is off. Your numbers are encrypted: only your password opens them.",
    "cloud.updated": "Last update: {time}", "cloud.refresh": "Update now",
    "cloud.refresh.none": "To update on demand, add the HUB_REFRESH_TOKEN secret on GitHub (see the guide).",
    "cloud.refreshing": "Update requested. The new numbers arrive in 1 to 3 minutes.",
    "cloud.refresh.failed": "GitHub refused the update (error {status}). The update key may have expired: create a new one.",
    "cloud.lock": "Lock this device", "cloud.lock.confirm": "Forget the password on this device? You'll type it again next time.",
    "cloud.readonly": "Not possible in the online version: do it in the dashboard on your PC.",
    "cloud.phone.sub": "Open this address on your phone, then add it to the home screen. Nothing else to install.",
    "cloud.phone.step1": "On your phone, open the address (or scan the code), then type your password once.",
    "cloud.phone.note": "The numbers update every 15 minutes, even when your PC is off.",
    "cloud.alerts.sub": "Sent by GitHub with the online version, even when your PC is off.",
    "cloud.alerts.on": "On: messages go to <b>{chat}</b> through <b>{bot}</b>. Weekly summary: {digest}.",
    "cloud.alerts.off": "Telegram alerts aren't set up. Set them up in the dashboard on your PC.",
    "cloud.digest.on": "on", "cloud.digest.off": "off",
    "cloud.channels.sub": "To add a channel online: add its ZERNIO_API_KEY_… line to the HUB_ENV secret on GitHub, and the channel to HUB_CONFIG.",
  },
  fr: {
    "nav.overview": "Vue d'ensemble", "nav.posts": "Meilleurs posts", "nav.insights": "Analyses", "nav.settings": "Réglages",
    "nav.short.overview": "Accueil", "nav.short.posts": "Posts", "nav.short.insights": "Analyses", "nav.short.settings": "Réglages",
    "sync.now": "Synchroniser", "sync.running": "Synchronisation…", "sync.never": "Pas encore synchronisé",
    "sync.last": "Dernière synchro : {time}",
    "sync.short": "Synchro {time}",
    "demo.banner": "<strong>Données de démo.</strong> Ces chiffres sont inventés, pour montrer à quoi ressemble le tableau de bord.",
    "offline.banner": "<strong>Hors ligne.</strong> Voici les chiffres enregistrés le {time}. Le PC ou le tableau de bord est injoignable pour l'instant.",
    "offline.action": "Impossible hors ligne.",
    "offline.page": "Cette page n'a pas encore été enregistrée sur cet appareil. Elle s'affichera dès que le tableau de bord sera joignable.",
    "filter.all": "Tout", "filter.days": "{n} jours", "filter.groups": "Toutes les chaînes",
    "kpi.followers": "Abonnés", "kpi.views": "Vues", "kpi.median": "Vues médianes par post",
    "kpi.engagement": "Taux d'engagement", "kpi.ppw": "Posts par semaine",
    "kpi.growth": "<b>{growth}</b> en {n} jours", "kpi.posts": "{posts} posts en {n} jours",
    "kpi.median.sub": "post typique, sans les vidéos virales", "kpi.eng.sub": "(likes + commentaires + partages) ÷ vues",
    "kpi.ppw.sub": "régularité de publication", "kpi.vsPrev": "Par rapport aux {n} jours précédents",
    "delta.new": "nouveau",
    "pf.accounts": "{n} comptes", "pf.account": "1 compte", "pf.followers": "Abonnés", "pf.views": "Vues",
    "pf.median": "Vues médianes", "pf.eng": "Engagement", "pf.chart": "Vues par jour",
    "chart.followers": "Abonnés par plateforme", "chart.followers.sub": "Total à la fin de chaque jour",
    "chart.views": "Vues par jour", "chart.views.sub": "Vues des posts publiés chaque jour, par plateforme",
    "goals.title": "Creator Rewards (TikTok)",
    "goals.sub": "Ce que TikTok demande avant de payer : {followers} abonnés et {views} vues sur 30 jours, avec un compte personnel et des vidéos de plus d'1 minute.",
    "goals.followers": "Abonnés", "goals.views30": "Vues, 30 derniers jours", "goals.reached": "Objectifs atteints",
    "goals.estimate": "Vues = vues des posts publiés ces 30 derniers jours. C'est une estimation : TikTok compte aussi les nouvelles vues des anciennes vidéos.",
    "channels.title": "Chaînes", "channels.sub": "Chaque chaîne et ses comptes. Clique sur un compte pour l'ouvrir.",
    "channels.total": "{followers} abonnés · {views} vues en {n} jours",
    "table.title": "Tous les comptes", "table.sub": "Clique sur une colonne pour trier, sur un compte pour l'ouvrir. Tendance = abonnés sur {n} jours.",
    "rank.sub": "Trié par :", "rank.growth7": "Croissance, 7 jours", "rank.growth30": "Croissance, 30 jours",
    "col.account": "Compte", "col.followers": "Abonnés", "col.7": "7 jours", "col.30": "30 jours", "col.trend": "Tendance",
    "col.ppw": "Posts / sem.", "col.views": "Vues", "col.median": "Vues médianes", "col.eng": "Engagement",
    "col.post": "Post", "col.category": "Catégorie", "col.published": "Publié", "col.likes": "Likes",
    "col.comments": "Commentaires", "col.shares": "Partages", "col.saves": "Enregistrements", "col.watch": "Visionnage moy.",
    "col.watch.title": "Durée moyenne de visionnage (Reels Instagram)", "col.posts": "Posts",
    "pc.views": "vues",
    "posts.title": "Meilleurs posts", "posts.byViews": "Par vues", "posts.byShares": "Par partages",
    "posts.sub": "Les {n} meilleurs posts des {d} derniers jours. Les partages et les enregistrements sont les signaux les plus forts pour l'algorithme. Clique sur un post pour voir son détail et sa courbe.",
    "posts.none": "Aucun post sur cette période.", "posts.open": "Ouvrir le post",
    "posts.export": "Exporter en CSV", "posts.allCats": "Toutes les catégories",
    "post.open": "Ouvrir sur {platform}", "post.growth": "Vues depuis la publication",
    "post.growth.soon": "La courbe apparaît après quelques synchronisations : un point par synchro pendant les 30 premiers jours.",
    "post.reach": "Portée", "post.missing": "Post introuvable.", "post.loading": "Chargement…",
    "sheet.close": "Fermer",
    "ins.times": "Meilleurs jours et heures pour publier",
    "ins.times.sub": "Vues médianes des posts publiés sur chaque créneau, {d} derniers jours ({n} posts).",
    "ins.times.more": " Choisis 90 jours pour un résultat plus fiable.",
    "ins.best": "Meilleur créneau : <b>{day} vers {hour}</b>, {views} vues médianes ({n} posts).",
    "ins.tip": "{day} {hour} · {views} vues médianes · {n} posts", "ins.tip.none": "{day} {hour} · aucun post",
    "ins.scale.less": "Moins de vues", "ins.scale.more": "Plus de vues · heure de Paris · gris = aucun post",
    "ins.cats": "Performance par catégorie",
    "ins.cats.sub": "Vues médianes par post pour chaque catégorie. Survole ou touche une barre pour les posts, l'engagement et les partages.",
    "ins.nocat": "Sans catégorie",
    "acc.back": "← Tous les comptes", "acc.posts": "Posts", "acc.posts.sub": "Tous les posts des {d} derniers jours, du plus récent au plus ancien.",
    "acc.type.personal": "compte personnel", "acc.type.creator": "compte créateur", "acc.type.business": "compte professionnel",
    "acc.missing": "Compte introuvable.", "acc.toOverview": "Retour à la vue d'ensemble",
    "set.look": "Apparence", "set.look.sub": "Enregistré sur cet appareil.",
    "set.light": "Mode clair", "set.light.sub": "Fond blanc et texte foncé. Désactivé = mode sombre.",
    "set.lang": "Langue", "set.lang.sub": "Pour tout le tableau de bord et tes alertes Telegram.",
    "set.alerts": "Alertes Telegram",
    "set.alerts.sub": "Un message sur Telegram quand le tableau de bord n'arrive pas à synchroniser une chaîne, puis quand ça remarche. Avec son propre bot, séparé de tes alertes de publication.",
    "set.alerts.demo": "Tu regardes la démo. Lance le tableau de bord avec <b>Start dashboard.bat</b> pour régler les alertes.",
    "set.alerts.on": "Activées : les messages vont à <b>{chat}</b> via <b>{bot}</b>.",
    "set.alerts.saved": "Bot <b>{bot}</b> enregistré. Dernière étape : ouvre-le dans Telegram, appuie sur <b>Démarrer</b>, puis clique sur le bouton ci-dessous.",
    "set.alerts.step1": "Dans Telegram, ouvre <b>@BotFather</b>, envoie <b>/newbot</b> et donne-lui un nom, par exemple <i>Stats Hub alerts</i>.",
    "set.alerts.step2": "BotFather répond avec un <b>token</b> (il ressemble à 123456789:ABC…). Copie-le et colle-le ci-dessous.",
    "set.alerts.step3": "Ensuite ouvre ton nouveau bot, appuie sur <b>Démarrer</b>, et reviens ici.",
    "set.alerts.token": "Token du bot", "set.alerts.save": "Enregistrer", "set.alerts.started": "J'ai appuyé sur Démarrer",
    "set.alerts.cancel": "Annuler", "set.alerts.test": "Envoyer un test", "set.alerts.off": "Désactiver",
    "set.alerts.yourbot": "ton bot", "set.alerts.you": "toi",
    "set.alerts.checking": "Vérification du token avec Telegram…", "set.alerts.looking": "Recherche de ta conversation…",
    "set.alerts.connected": "Connecté. Un message de confirmation t'a été envoyé sur Telegram.",
    "set.alerts.nostart": "Aucun message trouvé. Ouvre le bot dans Telegram, appuie sur Démarrer (ou envoie-lui un message), puis réessaie.",
    "set.alerts.sending": "Envoi…", "set.alerts.sent": "Envoyé. Regarde Telegram.", "set.alerts.turningOff": "Désactivation…",
    "set.alerts.confirmOff": "Désactiver les alertes Telegram ? Le token du bot est supprimé de cet ordinateur.",
    "digest.label": "Bilan de la semaine", "digest.sub": "Chaque lundi matin sur Telegram : abonnés, vues, top post, meilleur compte.",
    "digest.send": "Envoyer le bilan maintenant",
    "phone.title": "Sur ton téléphone",
    "phone.sub": "Le tableau de bord comme une app sur ton téléphone, via Tailscale : un lien privé entre tes appareils. Rien n'est mis sur internet.",
    "phone.demo": "Tu regardes la démo. Lance le tableau de bord avec <b>Start dashboard.bat</b> pour régler l'accès téléphone.",
    "phone.notInstalled": "Tailscale n'est pas encore installé sur ce PC. C'est gratuit, sur tailscale.com/download. Installe-le, connecte-toi, puis clique sur Vérifier.",
    "phone.notRunning": "Tailscale est installé mais pas connecté. Ouvre Tailscale sur ce PC (l'icône près de l'horloge), connecte-toi, puis clique sur Vérifier.",
    "phone.check": "Vérifier", "phone.enable": "Activer l'accès téléphone",
    "phone.enable.sub": "Un clic, une seule fois. Seuls tes appareils Tailscale pourront ouvrir le tableau de bord, en HTTPS.",
    "phone.enabling": "Activation…", "phone.ready": "L'accès téléphone est activé.",
    "phone.address": "Adresse pour ton téléphone :", "phone.copy": "Copier", "phone.copied": "Copié",
    "phone.step1": "Sur ton téléphone, installe l'app <b>Tailscale</b> (App Store ou Google Play) et connecte-toi avec le <b>même compte</b> que sur ce PC.",
    "phone.step2": "Scanne ce code avec l'appareil photo du téléphone, ou tape l'adresse.",
    "phone.step3.ios": "iPhone : dans Safari, touche <b>Partager</b>, puis <b>Sur l'écran d'accueil</b>.",
    "phone.step3.android": "Android : dans Chrome, touche le menu <b>⋮</b>, puis <b>Installer l'application</b> (ou <b>Ajouter à l'écran d'accueil</b>).",
    "phone.note": "Le PC doit être allumé, avec le tableau de bord lancé. Sinon l'app affiche les derniers chiffres enregistrés.",
    "phone.install": "Installer l'app", "phone.installed": "Installée sur cet appareil.",
    "phone.here.ios": "Pour la garder comme une app : touche <b>Partager</b>, puis <b>Sur l'écran d'accueil</b>.",
    "phone.here.android": "Pour la garder comme une app : touche le menu <b>⋮</b>, puis <b>Installer l'application</b> (ou <b>Ajouter à l'écran d'accueil</b>).",
    "set.channels": "Tes chaînes", "set.channels.sub": "Un compte Zernio par chaîne. Chaque chaîne est un groupe dans les filtres.",
    "set.channels.none": "Aucune chaîne pour l'instant.", "set.channels.waiting": "Aucun compte trouvé (en attente d'une synchro)",
    "set.channels.nokey": "Pas de clé", "set.remove": "Supprimer",
    "set.remove.confirm": "Supprimer {name} ? Sa clé est effacée de cet ordinateur. Les statistiques déjà enregistrées sont gardées, masquées.",
    "set.add": "Ajouter une chaîne",
    "set.add.demo": "Tu regardes la démo. Lance le tableau de bord avec <b>Start dashboard.bat</b> pour ajouter tes vraies chaînes.",
    "set.add.help": "Dans le compte Zernio de cette chaîne, copie sa <b>clé API</b> (dans les réglages de Zernio) et colle-la ci-dessous. La clé est vérifiée avec Zernio, puis enregistrée uniquement sur cet ordinateur, dans le fichier <code>.env</code>. Elle n'est plus jamais affichée.",
    "set.add.name": "Nom de la chaîne", "set.add.name.sub": "Par exemple : Space facts",
    "set.add.key": "Clé API Zernio", "set.add.repo": "Dossier du projet (facultatif)",
    "set.add.repo.sub": "Le projet de publication de la chaîne, pour trier les posts par catégorie. Exemple : C:\\Users\\toi\\ma-chaine",
    "set.add.go": "Vérifier et ajouter", "set.add.checking": "Vérification de la clé avec Zernio…",
    "set.add.fill": "Remplis le nom et la clé.",
    "set.add.found0": "aucun compte TikTok ou Instagram pour l'instant. Connecte-les dans Zernio, puis clique sur Synchroniser",
    "set.add.added": "<b>{name}</b> ajoutée. Trouvé : {found}. Synchronisation…",
    "set.add.done": "<b>{name}</b> ajoutée et synchronisée. Trouvé : {found}.",
    "empty.title": "Aucun compte pour l'instant", "empty.text": "Connecte ta première chaîne avec sa clé Zernio.",
    "empty.add": "+ Ajouter une chaîne", "empty.demo": "Pour voir un exemple, lance le hub avec <code>python hub.py --demo</code>.",
    "err.load": "Impossible de charger les données ({error}). Le hub tourne-t-il toujours ?",
    "err.generic": "Une erreur s'est produite",
    "cloud.unlock.text": "Tape ton mot de passe pour ouvrir tes stats sur cet appareil.",
    "cloud.unlock.password": "Mot de passe", "cloud.unlock.remember": "Se souvenir sur cet appareil",
    "cloud.unlock.go": "Ouvrir", "cloud.unlock.busy": "Ouverture…", "cloud.unlock.wrong": "Mot de passe incorrect.",
    "cloud.unlock.nodata": "Pas encore de chiffres : la première mise à jour sur GitHub n'est pas terminée. Réessaie dans quelques minutes.",
    "cloud.title": "Version en ligne",
    "cloud.sub": "Mise à jour par GitHub toutes les 15 minutes, même quand ton PC est éteint. Tes chiffres sont chiffrés : seul ton mot de passe les ouvre.",
    "cloud.updated": "Dernière mise à jour : {time}", "cloud.refresh": "Mettre à jour maintenant",
    "cloud.refresh.none": "Pour mettre à jour à la demande, ajoute le secret HUB_REFRESH_TOKEN sur GitHub (voir le guide).",
    "cloud.refreshing": "Mise à jour demandée. Les nouveaux chiffres arrivent dans 1 à 3 minutes.",
    "cloud.refresh.failed": "GitHub a refusé la mise à jour (erreur {status}). La clé de mise à jour a peut-être expiré : crées-en une nouvelle.",
    "cloud.lock": "Verrouiller cet appareil", "cloud.lock.confirm": "Oublier le mot de passe sur cet appareil ? Tu le retaperas la prochaine fois.",
    "cloud.readonly": "Impossible dans la version en ligne : fais-le dans le tableau de bord sur ton PC.",
    "cloud.phone.sub": "Ouvre cette adresse sur ton téléphone, puis ajoute-la à l'écran d'accueil. Rien d'autre à installer.",
    "cloud.phone.step1": "Sur ton téléphone, ouvre l'adresse (ou scanne le code), puis tape ton mot de passe une fois.",
    "cloud.phone.note": "Les chiffres se mettent à jour toutes les 15 minutes, même quand ton PC est éteint.",
    "cloud.alerts.sub": "Envoyées par GitHub avec la version en ligne, même quand ton PC est éteint.",
    "cloud.alerts.on": "Activées : les messages vont à <b>{chat}</b> via <b>{bot}</b>. Bilan de la semaine : {digest}.",
    "cloud.alerts.off": "Les alertes Telegram ne sont pas réglées. Règle-les dans le tableau de bord sur ton PC.",
    "cloud.digest.on": "activé", "cloud.digest.off": "désactivé",
    "cloud.channels.sub": "Pour ajouter une chaîne en ligne : ajoute sa ligne ZERNIO_API_KEY_… dans le secret HUB_ENV sur GitHub, et la chaîne dans HUB_CONFIG.",
  },
};

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const state = { days: 30, platform: "all", group: "all", sort: { key: "followers", dir: -1 }, postSort: "views",
  postCategory: "", rankKey: "followers", lang: null };
try { Object.assign(state, JSON.parse(localStorage.getItem("hub-filters") || "{}")); } catch {}

// t(): the dictionary is trusted HTML; every value put into it is escaped (or already safe HTML when raw)
function t(key, params = {}, raw = []) {
  const text = (I18N[state.lang] || I18N.en)[key] ?? I18N.en[key] ?? esc(key);
  return text.replace(/\{(\w+)\}/g, (_, k) => raw.includes(k) ? String(params[k]) : esc(params[k]));
}
// plain text (popups, canvas, attributes set from code): no HTML at all
const tText = (key, params = {}) => ((I18N[state.lang] || I18N.en)[key] ?? I18N.en[key] ?? key)
  .replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? "")).replace(/<[^>]+>/g, "");
const locale = () => (state.lang === "fr" ? "fr-FR" : "en-GB");        // dates: 31 Oct
const numLocale = () => (state.lang === "fr" ? "fr-FR" : "en-US");     // numbers: 4.3M, 50K (en-GB would write 4m)

// ---------- device ----------
const UA = navigator.userAgent;
const IS_IOS = /iPhone|iPad|iPod/.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const IS_ANDROID = /Android/.test(UA);
const IS_PHONE = IS_IOS || IS_ANDROID;
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const phoneLayout = () => matchMedia("(max-width: 720px)").matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const view = document.getElementById("view");
const tip = document.getElementById("tip");
let charts = [];
let sheetCharts = [];
let lastRender = null;
let offline = false;

// ---------- formatting ----------
// 1 234 -> 1.2K, 50 400 -> 50K, 4 300 000 -> 4.3M: one decimal where it matters, none between 10K and 1M
const fmt = n => n == null ? "–" : new Intl.NumberFormat(numLocale(), { notation: "compact",
  maximumFractionDigits: Math.abs(n) < 1e4 || Math.abs(n) >= 1e6 ? 1 : 0 }).format(n);
const num = n => n == null ? "–" : new Intl.NumberFormat(numLocale()).format(n);
const signed = n => n == null ? "–" : (n > 0 ? "+" : n < 0 ? "−" : "") + fmt(Math.abs(n));
const pct = r => r == null ? "–" : new Intl.NumberFormat(numLocale(), { style: "percent", maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(r);
const trend = n => n == null || n === 0 ? "" : n > 0 ? "up" : "down";
const PLATFORM = { tiktok: "TikTok", instagram: "Instagram" };
const shortDate = iso => new Date(iso + "T12:00:00").toLocaleDateString(locale(), { day: "numeric", month: "short" });
const longTime = d => d.toLocaleString(locale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const shortTime = d => d.toDateString() === new Date().toDateString()
  ? d.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" })
  : d.toLocaleDateString(locale(), { day: "numeric", month: "short" });
const postDate = s => longTime(new Date(s.replace(" ", "T")));
const weekday = i => new Intl.DateTimeFormat(locale(), { weekday: "short" }).format(new Date(2024, 0, 1 + i));  // 1 Jan 2024 = Monday
const hourText = h => String(h).padStart(2, "0") + ":00";
const watchText = s => new Intl.NumberFormat(numLocale(), { maximumFractionDigits: 1 }).format(s) + " s";

// how a number moved against the period just before: {text, dir}, or null when there is nothing to say
function change(now, before, kind) {
  if (now == null || before == null) return null;
  if (kind === "points") {  // a rate: the difference in points
    const d = (now - before) * 100;
    if (Math.abs(d) < 0.05) return null;
    const points = new Intl.NumberFormat(numLocale(), { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(Math.abs(d));
    return { text: `${d > 0 ? "▲" : "▼"} ${points} pt`, dir: d > 0 ? "up" : "down" };
  }
  if (before <= 0) return kind !== "stock" && now > 0 ? { text: tText("delta.new"), dir: "up" } : null;
  const r = (now - before) / before;
  if (Math.abs(r) < 0.005) return null;
  const share = new Intl.NumberFormat(numLocale(), { style: "percent", maximumFractionDigits: 0 }).format(Math.abs(r));
  return { text: `${r > 0 ? "▲" : "▼"} ${share}`, dir: r > 0 ? "up" : "down" };
}
const pill = (c, n) => c ? `<span class="pill ${c.dir}" title="${t("kpi.vsPrev", { n })}">${esc(c.text)}</span>` : "";

const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const colors = () => ({
  tiktok: css("--tiktok"), instagram: css("--instagram"), accent: css("--accent"), grid: css("--grid"),
  muted: css("--text-muted"), text: css("--text-primary"), surface: css("--surface-1"), border: css("--border"),
  seq: [1, 2, 3, 4, 5, 6].map(i => css("--seq-" + i)),
});

// ---------- data ----------
class Stale extends Error {}  // a newer page was asked for while this one was loading

// the service worker marks answers that come from its saved copy: the page then says so
function setOffline(savedAt) {
  offline = !!savedAt;
  const el = document.getElementById("offline");
  el.hidden = !offline;
  if (offline) el.innerHTML = t("offline.banner", { time: isNaN(new Date(savedAt)) ? "—" : longTime(new Date(savedAt)) });
}

// ---------- online version: no server, an encrypted file from GitHub + the numbers computed here ----------
const CLOUD = window.HUB_CLOUD || null;  // set by cloud-config.js in the online version; null on the PC
const cloud = { key: null, bundle: null, model: null, syncing: false, error: null };
const KEY_STORE = "hub-key";
const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));

async function cloudFetch() {  // the encrypted file (the phone's saved copy when GitHub can't be reached)
  const res = await fetch(CLOUD.data, { cache: "no-store" });
  if (!res.ok) return null;
  setOffline(res.headers.get("X-Offline") ? (res.headers.get("date") || "?") : null);
  return new Uint8Array(await res.arrayBuffer());
}

// "SHB1" | iterations | salt | iv | encrypted gzip of the numbers (written by tools/crypto.mjs)
function cloudHeader(file) {
  if (String.fromCharCode(...file.slice(0, 4)) !== "SHB1") throw new Error("format");
  return { iterations: new DataView(file.buffer, file.byteOffset + 4, 4).getUint32(0),
    salt: file.slice(8, 24), iv: file.slice(24, 36), body: file.slice(36) };
}

async function cloudOpen(file, key) {  // throws when the key is wrong
  const h = cloudHeader(file);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: h.iv }, key, h.body);
  return JSON.parse(await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
}

function cloudUse(bundle) {
  cloud.bundle = bundle;
  cloud.model = HubStats.create(bundle);
}

function cloudSavedKey() {
  for (const store of [localStorage, sessionStorage]) {
    try { const v = JSON.parse(store.getItem(KEY_STORE) || "null"); if (v) return v; } catch {}
  }
  return null;
}

async function cloudStart() {  // opens with the key remembered on this device, if any
  const saved = cloudSavedKey();
  if (!saved) return false;
  try {
    const file = await cloudFetch();
    if (!file || saved.salt !== b64(cloudHeader(file).salt)) return false;
    cloud.key = await crypto.subtle.importKey("raw", unb64(saved.key), "AES-GCM", true, ["decrypt"]);
    cloudUse(await cloudOpen(file, cloud.key));
    return true;
  } catch {
    return false;
  }
}

async function cloudUnlock(password, remember) {
  const file = await cloudFetch().catch(() => null);
  if (!file) throw new Error("nodata");
  const h = cloudHeader(file);
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password.trim()), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: h.salt, iterations: h.iterations },
    base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
  let bundle;
  try { bundle = await cloudOpen(file, key); } catch { throw new Error("wrong"); }
  cloud.key = key;
  cloudUse(bundle);
  // only the key made from the password is kept, never the password itself
  const saved = JSON.stringify({ salt: b64(h.salt), key: b64(await crypto.subtle.exportKey("raw", key)) });
  try { (remember ? localStorage : sessionStorage).setItem(KEY_STORE, saved); } catch {}
}

async function cloudReload() {  // a newer file from GitHub, if any
  try {
    const file = await cloudFetch();
    if (file) cloudUse(await cloudOpen(file, cloud.key));
  } catch {}
}

function cloudLock() {
  for (const store of [localStorage, sessionStorage]) { try { store.removeItem(KEY_STORE); } catch {} }
  location.reload();
}

// the Refresh button: asks GitHub to run the update now, then waits for the new file
async function cloudSync() {
  const r = cloud.bundle.refresh;
  if (!r || !r.token) return false;
  if (cloud.syncing) return true;
  let res;
  try {
    res = await fetch(`https://api.github.com/repos/${r.repo}/actions/workflows/${r.workflow}/dispatches`, {
      method: "POST", body: JSON.stringify({ ref: r.ref || "main" }),
      headers: { Authorization: `Bearer ${r.token}`, Accept: "application/vnd.github+json" } });
  } catch {
    cloud.error = "network";
    return false;
  }
  if (res.status !== 204) { cloud.error = res.status; return false; }
  cloud.syncing = true;
  const before = cloud.bundle.generated;
  (async () => {
    for (let i = 0; i < 40 && cloud.bundle.generated === before; i++) { await sleep(15000); await cloudReload(); }
    cloud.syncing = false;
  })();
  return true;
}

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

// answers the page's questions the way the PC's server does (app/server.py), from the decrypted numbers
async function cloudApi(path, opts) {
  const u = new URL(path, location.href), route = u.pathname, q = u.searchParams;
  const days = Number(q.get("days") || 30), pf = q.get("platform") || "all", group = q.get("group") || "all";
  const m = cloud.model, b = cloud.bundle;
  if (!opts.method || opts.method === "GET") {
    if (route === "/api/meta") {
      return json({ demo: false, cloud: true, accounts: m.accounts.length, groups: m.groups(), last_sync: b.last_sync,
        sync_errors: b.sync_errors.map(e => ({ channel: e.channel, error: e[state.lang] || e.en })), syncing: cloud.syncing,
        can_sync: !!(b.refresh && b.refresh.token), lang: b.lang, version: CLOUD.version });
    }
    if (route === "/api/overview") return json(m.overview(days, pf, group));
    if (route === "/api/posts") return json(m.topPosts(days, pf, group, q.get("sort") || "views", 25, q.get("category") || ""));
    if (route === "/api/insights") return json(m.insights(days, pf, group));
    if (route.startsWith("/api/account/")) {
      const d = m.account(decodeURIComponent(route.slice("/api/account/".length)), days);
      return d ? json(d) : json({ detail: tText("acc.missing") }, 404);
    }
    if (route.startsWith("/api/post/")) {
      const d = m.postDetail(decodeURIComponent(route.slice("/api/post/".length)));
      return d ? json(d) : json({ detail: tText("post.missing") }, 404);
    }
    if (route === "/api/channels") {
      return json({ demo: false, cloud: true, channels: m.groups().map(g => ({ label: g, name: g, has_key: true,
        accounts: m.accounts.filter(a => a.group_name === g).map(a => ({ platform: a.platform, handle: a.handle })) })) });
    }
    if (route === "/api/alerts") return json({ ...b.alerts, configured: b.alerts.connected, demo: false, cloud: true });
    if (route === "/api/phone") return json({ cloud: true, url: location.href.split("#")[0] });
  }
  if (route === "/api/language") return json({ lang: state.lang });  // kept on this device only
  if (route === "/api/sync") {
    return (await cloudSync()) ? json({ started: true })
      : json({ detail: b.refresh && b.refresh.token ? tText("cloud.refresh.failed", { status: cloud.error }) : tText("cloud.refresh.none") }, 400);
  }
  return json({ detail: tText("cloud.readonly") }, 400);
}

// the posts of the period as a spreadsheet file, made here (the PC's server does it at /api/export.csv)
function downloadCsv() {
  const { columns, rows } = cloud.model.exportRows(state.days, state.platform, state.group);
  const sep = state.lang === "fr" ? ";" : ",";
  const cell = v => {
    if (v == null) return "";
    let s = String(v);
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = "'" + s;  // a title must never run as a formula
    return /["\r\n,;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const text = "﻿" + [columns, ...rows].map(r => r.map(cell).join(sep)).join("\r\n") + "\r\n";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  a.download = `stats-hub-posts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function showUnlock(message = "") {
  document.body.classList.add("locked");
  view.innerHTML = `<section class="card unlock">
    <span class="logo big" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" rx="1.5"/><rect x="10" y="7" width="4" height="14" rx="1.5"/><rect x="17" y="3" width="4" height="18" rx="1.5"/></svg></span>
    <h2>Stats Hub</h2><p class="sub">${t("cloud.unlock.text")}</p>
    <form class="form" id="unlock-form">
      <input type="text" name="username" autocomplete="username" value="Stats Hub" hidden>
      <label>${t("cloud.unlock.password")}<input name="password" type="password" autocomplete="current-password" required autofocus></label>
      <label class="check"><input type="checkbox" name="remember" checked>${t("cloud.unlock.remember")}</label>
      <button class="btn" type="submit">${t("cloud.unlock.go")}</button>
      <div id="unlock-msg">${message}</div>
    </form></section>`;
  const form = document.getElementById("unlock-form");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const msg = document.getElementById("unlock-msg"), btn = form.querySelector("button");
    btn.disabled = true;
    msg.innerHTML = `<p class="msg">${t("cloud.unlock.busy")}</p>`;
    try {
      await cloudUnlock(form.password.value, form.remember.checked);
      document.body.classList.remove("locked");
      await startApp();
    } catch (err) {
      btn.disabled = false;
      msg.innerHTML = `<p class="msg err">${t(err.message === "nodata" ? "cloud.unlock.nodata" : "cloud.unlock.wrong")}</p>`;
    }
  });
}

async function api(path, opts = {}) {
  if (CLOUD) return cloudApi(path, opts);
  const read = !opts.method || opts.method === "GET";
  let res;
  try {
    res = await fetch(path, { ...opts, headers: { "x-lang": state.lang || "en", ...(opts.headers || {}) } });
  } catch (err) {
    if (read) throw err;  // an action (sync, save...) can't be done without the hub: say it instead of failing silently
    return new Response(JSON.stringify({ detail: tText("offline.action") }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
  if (read && path.startsWith("/api/")) setOffline(res.headers.get("X-Offline") ? (res.headers.get("date") || "?") : null);
  return res;
}

async function get(path, params = {}) {
  const token = lastRender;
  const q = new URLSearchParams({ days: state.days, platform: state.platform, group: state.group, ...params });
  const res = await api(`/api/${path}?${q}`);
  if (token !== lastRender) throw new Stale();
  if (!res.ok) throw new Error(`${res.status} on ${path}`);
  return res.json();
}

function save() {
  const { days, platform, group, sort, postSort, postCategory, rankKey, lang } = state;
  try { localStorage.setItem("hub-filters", JSON.stringify({ days, platform, group, sort, postSort, postCategory, rankKey, lang })); } catch {}
}

// ---------- charts ----------
const crosshair = {
  id: "crosshair",
  afterDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements?.() || [];
    if (!active.length || chart.config.type !== "line") return;
    const { ctx, chartArea } = chart, x = active[0].element.x;
    ctx.save();
    ctx.strokeStyle = colors().muted;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke();
    ctx.restore();
  },
};

const endLabels = {  // names the lines at their end, so identity never depends on color alone
  id: "endLabels",
  afterDatasetsDraw(chart) {
    if (chart.config.type !== "line" || chart.data.datasets.length < 2) return;
    const { ctx } = chart, c = colors();
    ctx.save();
    ctx.font = "600 11px system-ui, sans-serif";
    ctx.textAlign = "right";
    chart.data.datasets.forEach((ds, i) => {
      const pts = chart.getDatasetMeta(i).data;
      const last = pts[pts.length - 1];
      if (!last) return;
      ctx.fillStyle = c.text;
      ctx.fillText(ds.label, last.x - 4, last.y - 8);
    });
    ctx.restore();
  },
};

function baseOptions(c, valueLabel) {
  return {
    responsive: true, maintainAspectRatio: false, animation: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.surface, titleColor: c.text, bodyColor: c.text, borderColor: c.border, borderWidth: 1,
        padding: 10, displayColors: false, boxPadding: 4,
        callbacks: {
          title: items => shortDate(items[0].label),
          label: item => `${item.dataset.label || valueLabel}: ${item.parsed.y.toLocaleString(numLocale())}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false }, border: { color: c.grid },
        ticks: { color: c.muted, maxTicksLimit: 6, maxRotation: 0, callback(v) { return shortDate(this.getLabelForValue(v)); } },
      },
      y: {
        grid: { color: c.grid }, border: { display: false },
        ticks: { color: c.muted, maxTicksLimit: 5, precision: 0, callback: v => fmt(v) },  // counts: whole numbers only
      },
    },
  };
}

// series: [{label, color, values}]
function lineChart(canvas, labels, series, valueLabel, { fill = false } = {}) {
  const c = colors();
  const opts = baseOptions(c, valueLabel);
  opts.scales.y.grace = "5%";
  const all = series.flatMap(s => s.values), lo = Math.min(...all), hi = Math.max(...all);
  // counts are never negative: an area starts at zero, a flat line has no negative axis, and small numbers
  // (lowest value closer to zero than the curve is tall) start at zero instead of dipping below it
  if (fill || lo === hi || (lo >= 0 && lo < hi - lo)) opts.scales.y.min = 0;
  if (series.length > 1) opts.plugins.tooltip.displayColors = true;
  charts.push(new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: series.map(s => ({
        label: s.label, data: s.values, borderColor: s.color, borderWidth: 2, pointRadius: 0,
        cubicInterpolationMode: "monotone",  // smooth, but never overshoots below the real values
        pointHoverRadius: 5, pointHoverBackgroundColor: s.color, pointHoverBorderColor: c.surface, pointHoverBorderWidth: 2,
        fill: fill ? "origin" : false, backgroundColor: fill ? s.color + "26" : s.color,
      })),
    },
    options: opts, plugins: [crosshair, endLabels],
  }));
}

function barChart(canvas, labels, series, valueLabel) {
  const c = colors();
  const opts = baseOptions(c, valueLabel);
  opts.scales.y.beginAtZero = true;
  opts.scales.x.stacked = opts.scales.y.stacked = true;
  if (series.length > 1) opts.plugins.tooltip.displayColors = true;
  charts.push(new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: series.map(s => ({
        label: s.label, data: s.values, backgroundColor: s.color, borderColor: c.surface,
        borderWidth: series.length > 1 ? { top: 2 } : 0, borderRadius: 4, borderSkipped: "start",
        categoryPercentage: 0.9, barPercentage: 0.85,
      })),
    },
    options: opts,
  }));
}

function categoryChart(canvas, rows) {
  const c = colors();
  const opts = baseOptions(c, tText("pf.median"));
  opts.indexAxis = "y";
  opts.interaction = { mode: "nearest", axis: "y", intersect: false };
  opts.scales = {
    x: { beginAtZero: true, grid: { color: c.grid }, border: { display: false }, ticks: { color: c.muted, maxTicksLimit: 5, precision: 0, callback: v => fmt(v) } },
    y: { grid: { display: false }, border: { color: c.grid }, ticks: { color: c.text } },
  };
  opts.plugins.tooltip.callbacks = {
    title: items => items[0].label,
    label: item => {
      const r = rows[item.dataIndex];
      return [`${tText("pf.median")}: ${fmt(r.median_views)}`, `${tText("col.posts")}: ${r.posts}`,
        `${tText("pf.eng")}: ${pct(r.engagement)}`, `${tText("col.shares")}: ${fmt(r.shares)}`];
    },
  };
  charts.push(new Chart(canvas, {
    type: "bar",
    data: { labels: rows.map(r => r.category === "No category" ? tText("ins.nocat") : r.category),
      datasets: [{ data: rows.map(r => r.median_views || 0), backgroundColor: c.accent, hoverBackgroundColor: c.seq[5],
        borderRadius: 4, borderSkipped: "start", categoryPercentage: 0.9, barPercentage: 0.8 }] },
    options: opts,
  }));
}

// one post over real time: points are {x: time in ms, y: value}
function timeChart(canvas, points, valueLabel, color) {
  const c = colors();
  const opts = baseOptions(c, valueLabel);
  opts.parsing = false;
  const first = points[0].x, last = points[points.length - 1].x;
  const young = last - first < 48 * 3600 * 1000;  // less than two days: hours say more than dates
  opts.scales.x = {
    type: "linear", min: first, max: last,  // from publication to the last sync, no empty margin
    grid: { display: false }, border: { color: c.grid },
    ticks: { color: c.muted, maxTicksLimit: 5, maxRotation: 0,
      callback: v => (young ? new Date(v).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" })
        : new Date(v).toLocaleDateString(locale(), { day: "numeric", month: "short" })) },
  };
  opts.scales.y.min = 0;
  opts.plugins.tooltip.callbacks = {
    title: items => longTime(new Date(items[0].parsed.x)),
    label: item => `${valueLabel}: ${item.parsed.y.toLocaleString(numLocale())}`,
  };
  return new Chart(canvas, {
    type: "line",
    data: { datasets: [{ label: valueLabel, data: points, borderColor: color, borderWidth: 2,
      pointRadius: points.length <= 12 ? 3 : 0, pointBackgroundColor: color,
      pointHoverRadius: 5, pointHoverBackgroundColor: color, pointHoverBorderColor: c.surface, pointHoverBorderWidth: 2,
      cubicInterpolationMode: "monotone", fill: "origin", backgroundColor: color + "26" }] },
    options: opts, plugins: [crosshair],
  });
}

function sparkline(values, color, w = 96, h = 26) {
  const pts = values.map((v, i) => [i, v]).filter(p => p[1] != null);
  if (pts.length < 2) return "";
  const min = Math.min(...pts.map(p => p[1])), max = Math.max(...pts.map(p => p[1]));
  const x = i => (i / (values.length - 1)) * (w - 4) + 2;
  const y = v => max === min ? h / 2 : h - 3 - ((v - min) / (max - min)) * (h - 6);
  const d = pts.map(p => `${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(" ");
  return `<svg class="spark" width="${w}" height="${h}" aria-hidden="true"><polyline points="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

// ---------- pieces ----------
const ICONS = {  // Material Design icons (Apache 2.0)
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  comment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
  share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
  save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>',
};
const icon = platform => `<span class="pi ${esc(platform)}" aria-hidden="true"></span>`;
const badge = (platform, small) => `<span class="badge ${esc(platform)}${small ? " sm" : ""}">${icon(platform)}</span>`;
const pfColor = platform => (platform === "instagram" ? "var(--instagram)" : "var(--tiktok)");
const metric = (label, value) => `<div class="mini"><div class="l">${label}</div><div class="v">${value}</div></div>`;

const accountCell = (r, sub) => {
  const safePlatform = esc(PLATFORM[r.platform] || r.platform);
  return `<span class="acc">${icon(r.platform)}<span>@${esc(r.handle)} <small>${safePlatform}${sub ? " · " + esc(sub) : ""}</small></span></span>`;
};

// a post's cover image (or the platform logo when there is none)
const thumb = (p, size = "") => p.thumbnail
  ? `<img class="thumb ${size}" src="${esc(p.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`
  : `<span class="thumb ${size}">${icon(p.platform)}</span>`;

function kpiTiles(k, series) {
  const n = state.days, prev = k.previous || {};
  // every pill says how the big number moved against the N days before; for followers: against N days ago
  const before = k.growth != null ? k.followers - k.growth : null;
  return `<section class="kpis">
    <div class="kpi"><div class="label">${t("kpi.followers")}</div>
      <div class="value">${fmt(k.followers)}${pill(change(k.followers, before, "stock"), n)}</div>
      <div class="delta">${t("kpi.growth", { growth: signed(k.growth), n })}</div>${series ? sparkline(series.followers, "#fff", 64, 24) : ""}</div>
    <div class="kpi"><div class="label">${t("kpi.views")}</div>
      <div class="value">${fmt(k.views)}${pill(change(k.views, prev.views), n)}</div>
      <div class="delta">${t("kpi.posts", { posts: k.posts, n })}</div>${series ? sparkline(series.views, "#fff", 64, 24) : ""}</div>
    <div class="kpi"><div class="label">${t("kpi.median")}</div>
      <div class="value">${fmt(k.median_views)}${pill(change(k.median_views, prev.median_views), n)}</div>
      <div class="delta">${t("kpi.median.sub")}</div></div>
    <div class="kpi"><div class="label">${t("kpi.engagement")}</div>
      <div class="value">${pct(k.engagement)}${pill(change(k.engagement, prev.engagement, "points"), n)}</div>
      <div class="delta">${t("kpi.eng.sub")}</div></div>
    <div class="kpi"><div class="label">${t("kpi.ppw")}</div>
      <div class="value">${num(k.posts_per_week)}${pill(change(k.posts_per_week, prev.posts_per_week), n)}</div>
      <div class="delta">${t("kpi.ppw.sub")}</div></div>
  </section>`;
}

function platformPanel(pf, p) {
  const k = p.kpis, prev = k.previous || {}, n = state.days;
  return `<section class="card platform ${esc(pf)}">
    <div class="head">${badge(pf)}<div><h2>${esc(PLATFORM[pf] || pf)}</h2>
      <div class="muted" style="font-size:12px">${p.accounts === 1 ? t("pf.account") : t("pf.accounts", { n: p.accounts })}</div></div></div>
    <div class="minis">
      <div class="mini"><div class="l">${t("pf.followers")}</div><div class="v">${fmt(k.followers)}</div>
        <div class="d ${trend(k.growth)}">${signed(k.growth)}</div></div>
      <div class="mini"><div class="l">${t("pf.views")}</div><div class="v">${fmt(k.views)}</div>
        <div class="d">${pill(change(k.views, prev.views), n)}</div></div>
      <div class="mini"><div class="l">${t("pf.median")}</div><div class="v">${fmt(k.median_views)}</div>
        <div class="d">${pill(change(k.median_views, prev.median_views), n)}</div></div>
      <div class="mini"><div class="l">${t("pf.eng")}</div><div class="v">${pct(k.engagement)}</div>
        <div class="d">${pill(change(k.engagement, prev.engagement, "points"), n)}</div></div>
    </div>
    <p class="sub">${t("pf.chart")}</p>
    <div class="chart small"><canvas id="c-pf-${esc(pf)}"></canvas></div>
  </section>`;
}

function legend(names) {
  return `<div class="legend">${names.map(n => `<span>${icon(n)}${esc(PLATFORM[n] || n)}</span>`).join("")}</div>`;
}

// Creator Rewards: how far each TikTok account is from the two numbers TikTok asks for
const goalBar = (label, value, target) => `<div class="goal-row"><span>${label}</span><span class="goal-num">${fmt(value)} / ${fmt(target)}</span>
  <div class="track"><i style="width:${Math.round(Math.min(1, value / target) * 100)}%"></i></div></div>`;

function goalsCard(g) {
  if (!g || !g.accounts.length) return "";
  const T = g.targets;
  return `<section class="card"><h2>${t("goals.title")}</h2>
    <p class="sub">${t("goals.sub", { followers: fmt(T.followers), views: fmt(T.views_30) })}</p>
    <div class="goal-grid">${g.accounts.map(a => `<a class="goal" href="#/account/${encodeURIComponent(a.id)}">
      <div class="goal-head">${badge("tiktok", true)}<b>@${esc(a.handle)}</b><small>${esc(a.group || "")}</small>
        ${a.followers >= T.followers && a.views_30 >= T.views_30 ? `<span class="chip ok">✓ ${t("goals.reached")}</span>` : ""}</div>
      ${goalBar(t("goals.followers"), a.followers, T.followers)}${goalBar(t("goals.views30"), a.views_30, T.views_30)}</a>`).join("")}</div>
    <p class="sub" style="margin:10px 0 0">${t("goals.estimate")}</p></section>`;
}

function postsTable(posts, showAccount) {
  const top = Math.max(...posts.map(p => p.views || 0), 1);
  return `<div class="table-wrap"><table>
    <thead><tr><th>#</th><th class="l">${t("col.post")}</th>${showAccount ? `<th class="l">${t("col.account")}</th>` : ""}
      <th class="l">${t("col.category")}</th><th class="l">${t("col.published")}</th>
      <th class="l">${t("col.views")}</th><th>${t("col.likes")}</th><th>${t("col.comments")}</th><th>${t("col.shares")}</th>
      <th>${t("col.saves")}</th><th title="${t("col.watch.title")}">${t("col.watch")}</th><th>${t("col.eng")}</th></tr></thead>
    <tbody>${posts.map((p, i) => `<tr class="link" data-post="${esc(p.id)}">
      <td class="muted">${i + 1}</td>
      <td class="l"><div class="post-cell">${thumb(p)}
        <span class="title">${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener" title="${t("posts.open")}">${esc(p.title)}</a>` : esc(p.title)}</span></div></td>
      ${showAccount ? `<td class="l">${accountCell(p)}</td>` : ""}
      <td class="l"><span class="chip">${esc(p.category || t("ins.nocat"))}</span></td>
      <td class="l muted">${esc(postDate(p.date))}</td>
      <td class="l"><div class="bar"><span class="track"><i class="${esc(p.platform)}" style="width:${Math.max(2, Math.round((p.views || 0) / top * 100))}%"></i></span>${fmt(p.views)}</div></td>
      <td>${fmt(p.likes)}</td><td>${fmt(p.comments)}</td><td>${fmt(p.shares)}</td><td>${fmt(p.saves)}</td>
      <td>${p.avg_watch_sec ? watchText(p.avg_watch_sec) : "–"}</td>
      <td>${pct(p.engagement)}</td></tr>`).join("")}</tbody></table></div>`;
}

// the same post as a card: what a phone shows instead of a wide table
const postCard = (p, showAccount) => `<article class="post-card" data-post="${esc(p.id)}">
    ${thumb(p, "lg")}
    <div class="pc-main"><div class="pc-title">${esc(p.title || "—")}</div>
      <div class="pc-meta">${showAccount ? accountCell(p) : `<span class="chip">${esc(p.category || t("ins.nocat"))}</span>`}<span>${esc(postDate(p.date))}</span></div>
      <div class="pc-stats"><span title="${t("col.likes")}">${ICONS.heart}${fmt(p.likes)}</span><span title="${t("col.comments")}">${ICONS.comment}${fmt(p.comments)}</span>
        <span title="${t("col.shares")}">${ICONS.share}${fmt(p.shares)}</span><span title="${t("col.saves")}">${ICONS.save}${fmt(p.saves)}</span></div></div>
    <div class="pc-views"><b>${fmt(p.views)}</b><small>${t("pc.views")}</small></div>
  </article>`;

function postsSection(posts, showAccount = true) {
  if (!posts.length) return `<p class="muted">${t("posts.none")}</p>`;
  return `<div class="only-desktop">${postsTable(posts, showAccount)}</div>
    <div class="only-phone post-cards">${posts.map(p => postCard(p, showAccount)).join("")}</div>`;
}

// ---------- pages ----------
const ACCOUNT_COLUMNS = [
  ["handle", "col.account", "l"], ["followers", "col.followers"], ["growth_7", "col.7"], ["growth_30", "col.30"],
  [null, "col.trend"], ["posts_per_week", "col.ppw"], ["views", "col.views"], ["median_views", "col.median"], ["engagement", "col.eng"],
];
const RANK_KEYS = [["followers", "col.followers"], ["growth_7", "rank.growth7"], ["growth_30", "rank.growth30"],
  ["views", "col.views"], ["median_views", "col.median"], ["engagement", "col.eng"]];

function accountsTable(rows) {
  const { key, dir } = state.sort;
  const sorted = [...rows].sort((a, b) => {
    const x = a[key], y = b[key];
    if (typeof x === "string") return dir * x.localeCompare(y);
    return dir * ((x ?? -Infinity) - (y ?? -Infinity));
  });
  const head = ACCOUNT_COLUMNS.map(([k, label, cls]) => k
    ? `<th class="sort ${cls || ""} ${k === key ? "on" + (dir > 0 ? " asc" : "") : ""}" data-k="${k}">${t(label)}</th>`
    : `<th>${t(label)}</th>`).join("");
  return `<div class="table-wrap"><table id="accounts"><thead><tr>${head}</tr></thead><tbody>
    ${sorted.map(r => `<tr class="link" data-id="${esc(r.id)}">
      <td class="l">${accountCell(r, r.group)}</td>
      <td>${fmt(r.followers)}</td>
      <td class="${trend(r.growth_7)}">${signed(r.growth_7)}</td>
      <td class="${trend(r.growth_30)}">${signed(r.growth_30)}</td>
      <td>${sparkline(r.spark, pfColor(r.platform))}</td>
      <td>${num(r.posts_per_week)}</td><td>${fmt(r.views)}</td>
      <td>${fmt(r.median_views)}</td><td>${pct(r.engagement)}</td></tr>`).join("")}
  </tbody></table></div>`;
}

// the accounts table as a ranked list, for a phone: one number at a time, chosen in a menu
function ranking(rows) {
  const key = RANK_KEYS.some(([k]) => k === state.rankKey) ? state.rankKey : "followers";
  const sorted = [...rows].sort((a, b) => (b[key] ?? -Infinity) - (a[key] ?? -Infinity));
  const growth = key.startsWith("growth");
  const show = v => (key === "engagement" ? pct(v) : growth ? signed(v) : fmt(v));
  return `<ol class="rank">${sorted.map((r, i) => `<li data-id="${esc(r.id)}"><span class="n">${i + 1}</span>${badge(r.platform, true)}
      <span class="who"><b>@${esc(r.handle)}</b><small>${esc(r.group || "")}</small></span>
      <span class="num"><b class="${growth ? trend(r[key]) : ""}">${show(r[key])}</b></span></li>`).join("")}</ol>`;
}

function channelCards(rows) {
  const byGroup = new Map();
  rows.forEach(r => { const g = r.group || "—"; byGroup.set(g, [...(byGroup.get(g) || []), r]); });
  return `<div class="channels">${[...byGroup].map(([group, accs]) => `<div class="card channel-card">
      <h3>${esc(group)}</h3>
      <div class="total">${t("channels.total", { followers: fmt(accs.reduce((s, a) => s + (a.followers || 0), 0)),
        views: fmt(accs.reduce((s, a) => s + (a.views || 0), 0)), n: state.days })}</div>
      ${accs.map(a => `<a class="acc-row" href="#/account/${encodeURIComponent(a.id)}">
        ${badge(a.platform, true)}
        <span class="who"><b>@${esc(a.handle)}</b><small>${esc(PLATFORM[a.platform] || a.platform)}</small></span>
        ${sparkline(a.spark, pfColor(a.platform), 70, 26)}
        <span class="num"><b>${fmt(a.followers)}</b><small class="${trend(a.growth_7)}">${signed(a.growth_7)} · 7 ${state.lang === "fr" ? "j" : "d"}</small></span>
      </a>`).join("")}
    </div>`).join("")}</div>`;
}

async function pageOverview() {
  const d = await get("overview");
  if (!d.accounts.length) return emptyState();
  const names = Object.keys(d.platforms), n = state.days;
  const rankOptions = RANK_KEYS.map(([k, key]) => `<option value="${k}">${t(key)}</option>`).join("");
  view.innerHTML = kpiTiles(d.kpis, d.series)
    + `<section class="row2">${names.map(pf => platformPanel(pf, d.platforms[pf])).join("")}</section>`
    + goalsCard(d.goals)
    + `<section class="row2">
        <div class="card"><h2>${t("chart.followers")}</h2><p class="sub">${t("chart.followers.sub")}</p>
          ${names.length > 1 ? legend(names) : ""}<div class="chart"><canvas id="c-followers"></canvas></div></div>
        <div class="card"><h2>${t("chart.views")}</h2><p class="sub">${t("chart.views.sub")}</p>
          ${names.length > 1 ? legend(names) : ""}<div class="chart"><canvas id="c-views"></canvas></div></div>
      </section>`
    + `<section><h2 style="font-size:15px;margin:4px 0 2px">${t("channels.title")}</h2>
        <p class="muted" style="font-size:12px;margin:0 0 12px">${t("channels.sub")}</p>${channelCards(d.accounts)}</section>`
    + `<section class="card"><h2>${t("table.title")}</h2>
        <div class="only-desktop"><p class="sub">${t("table.sub", { n })}</p><div id="acc-table">${accountsTable(d.accounts)}</div></div>
        <div class="only-phone"><div class="toolbar" style="margin:8px 0 2px"><span class="muted" style="font-size:12px">${t("rank.sub")}</span>
            <select id="rank-key">${rankOptions}</select></div>
          <div id="rank-list">${ranking(d.accounts)}</div></div>
      </section>`;
  const c = colors(), labels = d.series.labels;
  names.forEach(pf => lineChart(document.getElementById(`c-pf-${pf}`), labels,
    [{ label: PLATFORM[pf], color: c[pf], values: d.platforms[pf].series.views }], tText("pf.views"), { fill: true }));
  lineChart(document.getElementById("c-followers"), labels,
    names.map(pf => ({ label: PLATFORM[pf], color: c[pf], values: d.platforms[pf].series.followers })), tText("kpi.followers"));
  barChart(document.getElementById("c-views"), labels,
    names.map(pf => ({ label: PLATFORM[pf], color: c[pf], values: d.platforms[pf].series.views })), tText("kpi.views"));

  const holder = document.getElementById("acc-table");
  holder.addEventListener("click", e => {
    const th = e.target.closest("th.sort");
    if (th) {
      const k = th.dataset.k;
      state.sort = { key: k, dir: state.sort.key === k ? -state.sort.dir : (k === "handle" ? 1 : -1) };
      save();
      holder.innerHTML = accountsTable(d.accounts);
      return;
    }
    const tr = e.target.closest("tr[data-id]");
    if (tr) location.hash = "#/account/" + encodeURIComponent(tr.dataset.id);
  });
  const rankKey = document.getElementById("rank-key"), rankList = document.getElementById("rank-list");
  rankKey.value = RANK_KEYS.some(([k]) => k === state.rankKey) ? state.rankKey : "followers";
  rankKey.addEventListener("change", () => { state.rankKey = rankKey.value; save(); rankList.innerHTML = ranking(d.accounts); });
  rankList.addEventListener("click", e => {
    const li = e.target.closest("li[data-id]");
    if (li) location.hash = "#/account/" + encodeURIComponent(li.dataset.id);
  });
}

const exportUrl = () => "/api/export.csv?" + new URLSearchParams({ days: state.days, platform: state.platform, group: state.group, lang: state.lang });

async function pagePosts() {
  const d = await get("posts", { sort: state.postSort, category: state.postCategory });
  if (state.postCategory && !d.categories.includes(state.postCategory)) {  // that category has no post in this period
    state.postCategory = "";
    save();
    return pagePosts();
  }
  const options = d.categories.map(c => `<option value="${esc(c)}">${esc(c === "No category" ? tText("ins.nocat") : c)}</option>`).join("");
  view.innerHTML = `<section class="card">
    <div class="toolbar"><h2 class="grow">${t("posts.title")}</h2>
      <select id="post-cat" aria-label="${t("col.category")}"><option value="">${t("posts.allCats")}</option>${options}</select>
      <div class="seg" id="post-sort"><button data-v="views">${t("posts.byViews")}</button><button data-v="shares">${t("posts.byShares")}</button></div>
      <a class="btn ghost" href="${exportUrl()}" download>${t("posts.export")}</a></div>
    <p class="sub" style="margin-top:8px">${t("posts.sub", { n: d.posts.length, d: state.days })}</p>
    ${postsSection(d.posts)}</section>`;
  const cat = document.getElementById("post-cat");
  cat.value = state.postCategory;
  cat.addEventListener("change", () => { state.postCategory = cat.value; save(); render(); });
  document.querySelector("a[download]").addEventListener("click", e => {
    if (CLOUD) { e.preventDefault(); downloadCsv(); }  // online: the file is made here
  });
  const seg = document.getElementById("post-sort");
  markSeg(seg, state.postSort);
  seg.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) { state.postSort = b.dataset.v; save(); render(); }
  });
}

function heatmap(d) {
  const all = [...new Set(d.grid.flat().map(c => c.median_views).filter(v => v != null))].sort((a, b) => a - b);
  if (!all.length) return `<p class="muted">${t("posts.none")}</p>`;
  const c = colors();
  // rank buckets, so one viral slot doesn't flatten the rest; the best slot always gets the strongest color
  const step = v => all.length === 1 ? 5 : Math.round(all.indexOf(v) / (all.length - 1) * 5);
  let best = null;
  d.grid.forEach((row, di) => row.forEach((cell, hi) => {
    if (cell.posts >= 2 && (!best || cell.median_views > best.v)) best = { v: cell.median_views, day: di, hour: d.hours[hi], n: cell.posts };
  }));
  const cols = `grid-template-columns: 44px repeat(${d.hours.length}, minmax(34px, 1fr))`;
  const header = `<div></div>` + d.hours.map(h => `<div class="h">${String(h).padStart(2, "0")}h</div>`).join("");
  const rows = d.grid.map((row, di) => `<div class="d">${esc(weekday(di))}</div>` + row.map((cell, hi) => {
    const where = { day: weekday(di), hour: hourText(d.hours[hi]) };
    return cell.posts
      ? `<div class="cell" style="background:${c.seq[step(cell.median_views)]}" data-tip="${t("ins.tip", { ...where, views: fmt(cell.median_views), n: cell.posts })}"></div>`
      : `<div class="cell" data-tip="${t("ins.tip.none", where)}"></div>`;
  }).join("")).join("");
  return `${best ? `<p class="callout">${t("ins.best", { day: weekday(best.day), hour: hourText(best.hour), views: fmt(best.v), n: best.n })}</p>` : ""}
    <div class="heat" style="${cols}">${header}${rows}</div>
    <div class="scale">${t("ins.scale.less")} ${c.seq.map(s => `<i style="background:${s}"></i>`).join("")} ${t("ins.scale.more")}</div>`;
}

async function pageInsights() {
  const d = await get("insights");
  view.innerHTML = `
    <section class="card"><h2>${t("ins.times")}</h2>
      <p class="sub">${t("ins.times.sub", { d: state.days, n: d.posts })}${state.days < 90 ? t("ins.times.more") : ""}</p>
      ${heatmap(d)}</section>
    <section class="card"><h2>${t("ins.cats")}</h2>
      <p class="sub">${t("ins.cats.sub")}</p>
      <div class="chart" style="height:${Math.max(160, d.categories.length * 30 + 40)}px"><canvas id="c-cats"></canvas></div>
      <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th class="l">${t("col.category")}</th><th>${t("col.posts")}</th>
        <th>${t("col.median")}</th><th>${t("col.eng")}</th><th>${t("col.shares")}</th></tr></thead>
      <tbody>${d.categories.map(r => `<tr><td class="l">${esc(r.category === "No category" ? tText("ins.nocat") : r.category)}</td><td>${r.posts}</td>
        <td>${fmt(r.median_views)}</td><td>${pct(r.engagement)}</td><td>${fmt(r.shares)}</td></tr>`).join("")}</tbody></table></div>
    </section>`;
  if (d.categories.length) categoryChart(document.getElementById("c-cats"), d.categories);
}

async function pageAccount(id) {
  const token = lastRender;
  const res = await api(`/api/account/${encodeURIComponent(id)}?days=${state.days}`);
  if (token !== lastRender) throw new Stale();
  if (!res.ok) { view.innerHTML = `<div class="card empty">${t("acc.missing")} <a href="#/">${t("acc.toOverview")}</a></div>`; return; }
  const d = await res.json(), a = d.account, c = colors();
  const typeChip = ["personal", "creator", "business"].includes(a.type) ? `<span class="chip">${t("acc.type." + a.type)}</span>` : "";
  view.innerHTML = `
    <div class="head"><a class="back" href="#/">${t("acc.back")}</a></div>
    <div class="head">${badge(a.platform)}<h1>@${esc(a.handle)}</h1>
      <span class="chip">${esc(a.group || "—")}</span>${typeChip}</div>
    ${kpiTiles(d.kpis, d.series)}
    <section class="row2">
      <div class="card"><h2>${t("kpi.followers")}</h2><p class="sub">${t("chart.followers.sub")}</p><div class="chart"><canvas id="c-followers"></canvas></div></div>
      <div class="card"><h2>${t("chart.views")}</h2><p class="sub">${t("pf.chart")}</p><div class="chart"><canvas id="c-views"></canvas></div></div>
    </section>
    <section class="card"><h2>${t("acc.posts")}</h2><p class="sub">${t("acc.posts.sub", { d: state.days })}</p>${postsSection(d.posts, false)}</section>`;
  const color = c[a.platform] || c.accent, name = PLATFORM[a.platform];
  lineChart(document.getElementById("c-followers"), d.series.labels, [{ label: name, color, values: d.series.followers }], tText("kpi.followers"), { fill: true });
  barChart(document.getElementById("c-views"), d.series.labels, [{ label: name, color, values: d.series.views }], tText("kpi.views"));
}

function emptyState() {
  view.innerHTML = `<div class="card empty"><h2>${t("empty.title")}</h2>
    <p>${t("empty.text")}</p>
    <p><a class="btn" href="#/settings" style="text-decoration:none">${t("empty.add")}</a></p>
    <p class="muted">${t("empty.demo")}</p></div>`;
}

// ---------- one post: details and growth curve, in a sheet ----------
async function openPost(id) {
  const sheet = document.getElementById("sheet"), body = document.getElementById("sheet-body");
  body.innerHTML = `<p class="muted">${t("post.loading")}</p>`;
  if (sheet.hidden) {
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    history.pushState({ sheet: true }, "");  // the phone's Back button closes the sheet instead of leaving the page
  }
  let data;
  try {
    const res = await api(`/api/post/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    body.innerHTML = `<p class="muted">${t("post.missing")}</p>`;
    return;
  }
  if (sheet.hidden) return;  // closed while it was loading
  const p = data.post, c = colors();
  const points = data.snapshots.filter(s => s.views != null).map(s => ({ x: new Date(s.t).getTime(), y: s.views }));
  if (points.length && p.published_at) points.unshift({ x: new Date(p.published_at).getTime(), y: 0 });
  body.innerHTML = `
    <div class="sheet-head">${thumb(p, "xl")}
      <div><h3>${esc(p.title || "—")}</h3>
        <div class="meta">${accountCell(p)}<span>${esc(postDate(p.date))}</span></div>
        <div class="meta" style="margin-top:6px"><span class="chip">${esc(p.category || t("ins.nocat"))}</span>${p.group ? `<span class="chip">${esc(p.group)}</span>` : ""}</div></div></div>
    <div class="metrics">
      ${metric(t("col.views"), fmt(p.views))}${metric(t("col.likes"), fmt(p.likes))}${metric(t("col.comments"), fmt(p.comments))}
      ${metric(t("col.shares"), fmt(p.shares))}${metric(t("col.saves"), fmt(p.saves))}${metric(t("col.eng"), pct(p.engagement))}
      ${p.reach != null ? metric(t("post.reach"), fmt(p.reach)) : ""}${p.avg_watch_sec ? metric(t("col.watch"), watchText(p.avg_watch_sec)) : ""}
    </div>
    <h2 style="font-size:14px;margin:0 0 8px">${t("post.growth")}</h2>
    ${points.length >= 2 ? `<div class="chart"><canvas id="c-post"></canvas></div>` : `<p class="muted" style="font-size:13px;margin:0">${t("post.growth.soon")}</p>`}
    ${p.url ? `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">${t("post.open", { platform: PLATFORM[p.platform] || p.platform })}</a>` : ""}`;
  if (points.length >= 2) sheetCharts.push(timeChart(document.getElementById("c-post"), points, tText("col.views"), c[p.platform] || c.accent));
}

function closeSheet(fromHistory = false) {
  const sheet = document.getElementById("sheet");
  if (sheet.hidden) return;
  sheetCharts.forEach(chart => chart.destroy());
  sheetCharts = [];
  sheet.hidden = true;
  document.body.style.overflow = "";
  if (!fromHistory && history.state && history.state.sheet) history.back();
}

// ---------- settings ----------
const isLight = () => (document.documentElement.dataset.theme
  || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "light";

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("hub-theme", theme); } catch {}
  // the phone's status bar follows the chosen theme
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute("content", css("--surface-1")));
}

function channelList(list) {
  if (!list.length) return `<p class="muted">${t("set.channels.none")}</p>`;
  return list.map(c => `<div class="channel">
      <div class="name">${esc(c.name)}</div>
      <div class="accs">${c.accounts.length ? c.accounts.map(a => accountCell(a)).join("")
        : `<span class="muted">${c.has_key ? t("set.channels.waiting") : t("set.channels.nokey")}</span>`}</div>
      <button class="btn ghost danger" data-remove="${esc(c.label)}" data-name="${esc(c.name)}">${t("set.remove")}</button>
    </div>`).join("");
}

function drawAlerts(s, message = "") {
  const box = document.getElementById("alerts-box");
  if (!box) return;
  if (s.demo) {
    box.innerHTML = `<p class="help">${t("set.alerts.demo")}</p>`;
    return;
  }
  const bot = s.bot ? "@" + s.bot : tText("set.alerts.yourbot");
  if (s.connected) {
    box.innerHTML = `<p class="msg ok">${t("set.alerts.on", { chat: s.chat || tText("set.alerts.you"), bot })}</p>
      <div class="switch-row" style="margin-top:14px"><span>${t("digest.label")} <small>${t("digest.sub")}</small></span>
        <button class="switch" id="digest-switch" role="switch" aria-checked="${s.digest !== false}" aria-label="${t("digest.label")}"><span></span></button></div>
      <p style="display:flex;gap:8px;margin:14px 0 0;flex-wrap:wrap"><button class="btn ghost" id="alert-test">${t("set.alerts.test")}</button>
        <button class="btn ghost" id="digest-send">${t("digest.send")}</button>
        <button class="btn ghost danger" id="alert-off">${t("set.alerts.off")}</button></p><div id="alert-msg" style="margin-top:10px">${message}</div>`;
  } else if (s.configured) {
    box.innerHTML = `<p class="help">${t("set.alerts.saved", { bot })}</p>
      <p style="display:flex;gap:8px"><button class="btn" id="alert-connect">${t("set.alerts.started")}</button>
      <button class="btn ghost" id="alert-off">${t("set.alerts.cancel")}</button></p><div id="alert-msg" style="margin-top:10px">${message}</div>`;
  } else {
    box.innerHTML = `<ol class="help"><li>${t("set.alerts.step1")}</li><li>${t("set.alerts.step2")}</li><li>${t("set.alerts.step3")}</li></ol>
      <form class="form" id="alert-form" autocomplete="off">
        <label>${t("set.alerts.token")} <input name="token" type="password" required spellcheck="false"></label>
        <button class="btn" type="submit">${t("set.alerts.save")}</button><div id="alert-msg">${message}</div></form>`;
  }
  const act = async (url, opts, busy) => {  // one action on the server: shows the wait, then the error if any
    const msg = document.getElementById("alert-msg");
    msg.innerHTML = `<p class="msg">${busy}</p>`;
    const res = await api(url, opts), out = await res.json();
    if (!res.ok) { msg.innerHTML = `<p class="msg err">${esc(typeof out.detail === "string" ? out.detail : tText("err.generic"))}</p>`; return null; }
    msg.innerHTML = "";
    return out;
  };
  const json = body => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const say = html => { document.getElementById("alert-msg").innerHTML = html; };
  document.getElementById("alert-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const out = await act("/api/alerts", json(Object.fromEntries(new FormData(e.target))), t("set.alerts.checking"));
    if (out) drawAlerts({ ...out, demo: false });
  });
  document.getElementById("alert-connect")?.addEventListener("click", async () => {
    const out = await act("/api/alerts", json({}), t("set.alerts.looking"));
    if (out) drawAlerts({ ...out, demo: false }, out.connected ? `<p class="msg ok">${t("set.alerts.connected")}</p>`
      : `<p class="msg err">${t("set.alerts.nostart")}</p>`);
  });
  document.getElementById("alert-test")?.addEventListener("click", async () => {
    if (await act("/api/alerts/test", { method: "POST" }, t("set.alerts.sending"))) say(`<p class="msg ok">${t("set.alerts.sent")}</p>`);
  });
  document.getElementById("digest-send")?.addEventListener("click", async () => {
    if (await act("/api/digest/send", { method: "POST" }, t("set.alerts.sending"))) say(`<p class="msg ok">${t("set.alerts.sent")}</p>`);
  });
  document.getElementById("digest-switch")?.addEventListener("click", async e => {
    const button = e.currentTarget;
    const out = await act("/api/digest", json({ enabled: button.getAttribute("aria-checked") !== "true" }), "…");
    if (out) button.setAttribute("aria-checked", String(out.digest));
  });
  document.getElementById("alert-off")?.addEventListener("click", async () => {
    if (!confirm(tText("set.alerts.confirmOff"))) return;
    const out = await act("/api/alerts", { method: "DELETE" }, t("set.alerts.turningOff"));
    if (out) drawAlerts({ ...out, demo: false });
  });
}

// the QR code library is only loaded when the phone card needs it
const QR_LIB = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
let qrLoading = null;
function loadQr() {
  qrLoading = qrLoading || new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = QR_LIB;
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
  return qrLoading;
}

// the address to open on the phone: QR code, copy button and the steps (steps are translated, trusted HTML)
function showAddress(box, url, intro, steps, note) {
  box.innerHTML = `${intro}<div class="phone-grid" style="margin-top:14px"><div class="qr" id="phone-qr" hidden></div>
      <div><div class="phone-url"><span>${t("phone.address")}</span><code>${esc(url)}</code>
          <button class="btn ghost" id="phone-copy">${t("phone.copy")}</button></div>
        <ol class="help">${steps.map(s => `<li>${s}</li>`).join("")}</ol>${note}</div></div>`;
  loadQr().then(() => {
    const holder = document.getElementById("phone-qr");
    if (!holder || typeof qrcode !== "function") return;
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    holder.innerHTML = qr.createSvgTag(4, 0);  // drawn by the library from the app's own address
    holder.hidden = false;
  }).catch(() => {});
  document.getElementById("phone-copy").addEventListener("click", async e => {
    try {
      await navigator.clipboard.writeText(url);
      e.target.textContent = tText("phone.copied");
    } catch {}
  });
}

async function drawPhone(fresh = false, message = "") {
  let s;
  try {
    s = await (await api("/api/phone" + (fresh ? "?fresh=true" : ""))).json();
  } catch {
    return;
  }
  const box = document.getElementById("phone-box");
  if (!box) return;
  const note = `<p class="help" style="margin:12px 0 0">${t(s.cloud ? "cloud.phone.note" : "phone.note")}</p>`;
  if (IS_PHONE) {  // opened on the phone itself: how to keep it as an app
    box.innerHTML = (isStandalone() ? `<p class="msg ok">${t("phone.installed")}</p>`
      : window.__install ? `<button class="btn" id="phone-install">${t("phone.install")}</button>`
      : `<p class="help" style="margin:0">${t(IS_IOS ? "phone.here.ios" : "phone.here.android")}</p>`) + note;
    document.getElementById("phone-install")?.addEventListener("click", async () => {
      window.__install.prompt();
      await window.__install.userChoice;
      window.__install = null;
      drawPhone();
    });
    return;
  }
  if (s.demo) {
    box.innerHTML = `<p class="help" style="margin:0">${t("phone.demo")}</p>`;
    return;
  }
  if (s.cloud) {  // online version on a computer: the same address works on the phone
    showAddress(box, s.url, "", [t("cloud.phone.step1"), t("phone.step3.ios"), t("phone.step3.android")], note);
    return;
  }
  const check = `<button class="btn ghost" id="phone-check">${t("phone.check")}</button>`;
  if (!s.installed) {
    box.innerHTML = `<p class="help">${t("phone.notInstalled")}</p>${check}`;
  } else if (!s.running) {
    box.innerHTML = `<p class="help">${t("phone.notRunning")}</p>${check}`;
  } else if (!s.serving) {
    box.innerHTML = `<p class="help">${t("phone.enable.sub")}</p>
      <button class="btn" id="phone-enable">${t("phone.enable")}</button><div id="phone-msg" style="margin-top:10px">${message}</div>`;
  } else {
    showAddress(box, s.url, `<p class="msg ok">${t("phone.ready")}</p>`,
      [t("phone.step1"), t("phone.step2"), t("phone.step3.ios"), t("phone.step3.android")], note);
  }
  document.getElementById("phone-check")?.addEventListener("click", () => drawPhone(true));
  document.getElementById("phone-enable")?.addEventListener("click", async e => {
    e.target.disabled = true;
    document.getElementById("phone-msg").innerHTML = `<p class="msg">${t("phone.enabling")}</p>`;
    const res = await api("/api/phone/enable", { method: "POST" }), out = await res.json();
    // Tailscale's own message may hold the link to allow Serve on the account: make it clickable
    const problem = esc(typeof out.detail === "string" ? out.detail : tText("err.generic"))
      .replace(/https:\/\/[^\s<]+/g, link => `<a href="${link}" target="_blank" rel="noopener">${link}</a>`);
    drawPhone(true, res.ok ? "" : `<p class="msg err" style="word-break:break-word">${problem}</p>`);
  });
}

// appearance and language: the same two cards on the PC and online
const lookCards = () => `<section class="row2">
      <section class="card"><h2>${t("set.look")}</h2><p class="sub">${t("set.look.sub")}</p>
        <div class="switch-row">
          <span>${t("set.light")} <small>${t("set.light.sub")}</small></span>
          <button class="switch" id="theme-switch" role="switch" aria-checked="${isLight()}" aria-label="${t("set.light")}"><span></span></button>
        </div></section>
      <section class="card"><h2>${t("set.lang")}</h2><p class="sub">${t("set.lang.sub")}</p>
        <div class="seg" id="lang-seg"><button data-v="en">English</button><button data-v="fr">Français</button></div></section>
    </section>`;

function wireLookCards() {
  const toggle = document.getElementById("theme-switch");
  toggle.addEventListener("click", () => {
    setTheme(isLight() ? "dark" : "light");
    toggle.setAttribute("aria-checked", isLight());
  });
  const langSeg = document.getElementById("lang-seg");
  markSeg(langSeg, state.lang);
  langSeg.addEventListener("click", e => { const b = e.target.closest("button"); if (b) setLanguage(b.dataset.v); });
}

// online version: what can be changed here (look, language, update, lock); the rest is shown, set on the PC
async function pageSettingsCloud() {
  const b = cloud.bundle, al = b.alerts, canRefresh = !!(b.refresh && b.refresh.token);
  const channels = (await (await api("/api/channels")).json()).channels;
  const alertsText = al.connected
    ? `<p class="msg ok">${t("cloud.alerts.on", { chat: al.chat || tText("set.alerts.you"), bot: al.bot ? "@" + al.bot : tText("set.alerts.yourbot"),
        digest: tText(al.digest ? "cloud.digest.on" : "cloud.digest.off") })}</p>`
    : `<p class="help" style="margin:0">${t("cloud.alerts.off")}</p>`;
  view.innerHTML = lookCards() + `
    <section class="card"><h2>${t("cloud.title")}</h2><p class="sub">${t("cloud.sub")}</p>
      <p class="help" style="margin:0 0 12px">${t("cloud.updated", { time: b.generated ? longTime(new Date(b.generated)) : "—" })}</p>
      <p style="display:flex;gap:8px;flex-wrap:wrap;margin:0">
        ${canRefresh ? `<button class="btn" id="cloud-refresh">${t("cloud.refresh")}</button>` : ""}
        <button class="btn ghost danger" id="cloud-lock">${t("cloud.lock")}</button></p>
      ${canRefresh ? "" : `<p class="help" style="margin:12px 0 0">${t("cloud.refresh.none")}</p>`}
      <div id="cloud-msg" style="margin-top:10px"></div></section>
    <section class="card"><h2>${t("phone.title")}</h2><p class="sub">${t("cloud.phone.sub")}</p><div id="phone-box"></div></section>
    <section class="card"><h2>${t("set.alerts")}</h2><p class="sub">${t("cloud.alerts.sub")}</p>${alertsText}</section>
    <section class="card"><h2>${t("set.channels")}</h2><p class="sub">${t("cloud.channels.sub")}</p>
      ${channels.map(c => `<div class="channel"><div class="name">${esc(c.name)}</div>
        <div class="accs">${c.accounts.map(a => accountCell(a)).join("")}</div></div>`).join("")}</section>`;
  wireLookCards();
  drawPhone();
  document.getElementById("cloud-lock").addEventListener("click", () => { if (confirm(tText("cloud.lock.confirm"))) cloudLock(); });
  document.getElementById("cloud-refresh")?.addEventListener("click", async e => {
    e.target.disabled = true;
    const ok = await cloudSync(), msg = document.getElementById("cloud-msg");
    msg.innerHTML = ok ? `<p class="msg ok">${t("cloud.refreshing")}</p>`
      : `<p class="msg err">${t("cloud.refresh.failed", { status: cloud.error })}</p>`;
    if (ok) waitForSync();
    else e.target.disabled = false;
  });
}

async function pageSettings() {
  if (CLOUD) return pageSettingsCloud();
  const token = lastRender;
  const d = await (await api("/api/channels")).json();
  if (token !== lastRender) throw new Stale();
  view.innerHTML = lookCards() + `
    <section class="card"><h2>${t("phone.title")}</h2><p class="sub">${t("phone.sub")}</p><div id="phone-box"></div></section>
    <section class="card"><h2>${t("set.alerts")}</h2><p class="sub">${t("set.alerts.sub")}</p><div id="alerts-box"></div></section>
    <section class="card"><h2>${t("set.channels")}</h2><p class="sub">${t("set.channels.sub")}</p>
      <div id="channel-list">${channelList(d.channels)}</div></section>
    <section class="card"><h2>${t("set.add")}</h2>
      ${d.demo ? `<p class="help">${t("set.add.demo")}</p>` : `
      <p class="help">${t("set.add.help")}</p>
      <form class="form" id="add-channel" autocomplete="off">
        <label>${t("set.add.name")} <span>${t("set.add.name.sub")}</span><input name="name" required maxlength="40"></label>
        <label>${t("set.add.key")}<input name="key" type="password" required spellcheck="false"></label>
        <label>${t("set.add.repo")} <span>${t("set.add.repo.sub")}</span><input name="repo" spellcheck="false"></label>
        <button class="btn" type="submit">${t("set.add.go")}</button>
        <div id="add-msg"></div>
      </form>`}
    </section>`;

  wireLookCards();
  drawPhone();
  drawAlerts(await (await api("/api/alerts")).json());

  const holder = document.getElementById("channel-list");
  if (!holder) return;  // another page was opened meanwhile
  const refreshList = async () => { holder.innerHTML = channelList((await (await api("/api/channels")).json()).channels); };
  holder.addEventListener("click", async e => {
    const b = e.target.closest("[data-remove]");
    if (!b || !confirm(tText("set.remove.confirm", { name: b.dataset.name }))) return;
    await api(`/api/channels/${encodeURIComponent(b.dataset.remove)}`, { method: "DELETE" });
    fillGroups(await loadMeta());
    refreshList();
  });

  const form = document.getElementById("add-channel");
  if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const msg = document.getElementById("add-msg"), btn = form.querySelector("button");
    btn.disabled = true;
    msg.innerHTML = `<p class="msg">${t("set.add.checking")}</p>`;
    try {
      const res = await api("/api/channels", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const out = await res.json();
      if (!res.ok) throw new Error(typeof out.detail === "string" ? out.detail : tText("set.add.fill"));
      form.reset();
      const found = out.accounts.length
        ? out.accounts.map(a => `@${esc(a.handle)} (${esc(PLATFORM[a.platform] || a.platform)})`).join(", ")
        : t("set.add.found0");
      msg.innerHTML = `<p class="msg ok">${t("set.add.added", { name: out.name, found }, ["found"])}</p>`;
      await refreshList();
      await waitForSync(false);  // adding the channel already started its sync
      msg.innerHTML = `<p class="msg ok">${t("set.add.done", { name: out.name, found }, ["found"])}</p>`;
      await refreshList();
    } catch (err) {
      msg.innerHTML = `<p class="msg err">${esc(err.message)}</p>`;
    } finally {
      btn.disabled = false;
    }
  });
}

// ---------- routing, filters, language ----------
function markSeg(seg, value) {
  seg.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.v === String(value)));
}

function applyStaticText() {
  const dict = I18N[state.lang] || I18N.en;
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = dict[el.dataset.i18n] ?? ""; });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll("#f-days button").forEach(b => { b.textContent = dict["filter.days"].replace("{n}", b.dataset.v); });
  document.getElementById("lang").value = state.lang;
  document.getElementById("sync-now").setAttribute("aria-label", tText("sync.now"));
  document.getElementById("sheet-close").setAttribute("aria-label", tText("sheet.close"));
}

async function setLanguage(lang) {
  state.lang = lang === "fr" ? "fr" : "en";
  save();
  api("/api/language", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: state.lang }) });
  applyStaticText();
  try { fillGroups(await loadMeta()); } catch {}
  render();
}

async function render() {
  charts.forEach(c => c.destroy());
  charts = [];
  tip.hidden = true;
  const hash = location.hash || "#/";
  const onAccount = hash.startsWith("#/account/");  // one account: only the period applies
  const tab = hash.startsWith("#/posts") ? "posts" : hash.startsWith("#/insights") ? "insights"
    : hash.startsWith("#/settings") || hash.startsWith("#/channels") ? "settings" : "overview";
  // on the phone's bottom bar, Home stays lit while an account is open
  document.querySelectorAll("[data-tab]").forEach(a =>
    a.classList.toggle("on", a.dataset.tab === tab && (!onAccount || !!a.closest(".bottom-nav"))));
  document.querySelector(".filters").hidden = tab === "settings";
  document.getElementById("f-platform").hidden = onAccount;
  document.getElementById("f-group").hidden = onAccount;
  markSeg(document.getElementById("f-days"), state.days);
  markSeg(document.getElementById("f-platform"), state.platform);
  const token = lastRender = Symbol();
  view.classList.add("loading");
  try {
    if (onAccount) await pageAccount(decodeURIComponent(hash.slice(10)));
    else if (tab === "posts") await pagePosts();
    else if (tab === "insights") await pageInsights();
    else if (tab === "settings") await pageSettings();
    else await pageOverview();
  } catch (err) {
    if (!(err instanceof Stale) && token === lastRender) {
      const problem = offline ? t("offline.page") : t("err.load", { error: err.message });  // t() escapes the message
      view.innerHTML = `<div class="card empty">${problem}</div>`;
    }
  } finally {
    if (token === lastRender) view.classList.remove("loading");
  }
}

async function loadMeta() {
  const res = await api("/api/meta");
  if (!res.ok) throw new Error(`${res.status} on meta`);
  const meta = await res.json();
  document.getElementById("demo-banner").hidden = !meta.demo;
  const label = document.getElementById("sync"), phone = phoneLayout();
  label.innerHTML = meta.syncing ? t("sync.running") : meta.last_sync
    ? t(phone ? "sync.short" : "sync.last", { time: (phone ? shortTime : longTime)(new Date(meta.last_sync)) })
    : meta.can_sync ? t("sync.never") : "";
  const btn = document.getElementById("sync-now");
  btn.hidden = !meta.can_sync;
  btn.disabled = meta.syncing;
  const errors = document.getElementById("sync-errors");
  errors.hidden = !meta.sync_errors.length;
  errors.innerHTML = meta.sync_errors.map(e => `<p><strong>${esc(e.channel)}:</strong> ${esc(e.error)}</p>`).join("");
  return meta;
}

async function syncNow() {
  try {
    const res = await api("/api/sync", { method: "POST" });
    if (res.ok) return await waitForSync();
    const out = await res.json().catch(() => ({}));
    if (CLOUD && out.detail) alert(out.detail);  // online: say why GitHub didn't start the update
    await render();
  } catch {}
}

// waits until the running sync is done, then refreshes the page (rerender: false keeps a form's message)
async function waitForSync(rerender = true) {
  await sleep(1000);
  let meta = await loadMeta();
  for (let i = 0; meta.syncing && !offline && i < 200; i++) {
    await sleep(3000);
    meta = await loadMeta();
  }
  fillGroups(meta);
  if (rerender) await render();
}

function fillGroups(meta) {
  const sel = document.getElementById("f-group");
  sel.innerHTML = `<option value="all">${t("filter.groups")}</option>` + meta.groups.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
  if (state.group !== "all" && !meta.groups.includes(state.group)) state.group = "all";
  sel.value = state.group;
}

// ---------- pull to refresh (phone) ----------
const RESYNC_AFTER_MS = 120000;  // a pull re-reads the numbers; it asks Zernio again only if the last sync is older

async function refresh() {
  if (CLOUD) {  // online: a pull fetches GitHub's latest file (the Refresh button asks for a new update)
    await cloudReload();
    try { fillGroups(await loadMeta()); } catch {}
    return render();
  }
  let meta;
  try {
    meta = await loadMeta();
  } catch {
    return render();
  }
  const recent = meta.last_sync && Date.now() - new Date(meta.last_sync).getTime() < RESYNC_AFTER_MS;
  if (meta.can_sync && !meta.syncing && !offline && !recent) await syncNow();
  else await render();
}

function setupPullToRefresh() {
  if (!("ontouchstart" in window)) return;
  const ptr = document.getElementById("ptr"), sheet = document.getElementById("sheet");
  const TRIGGER = 60;  // how far (px, after damping) the spinner must come down
  let startY = null, pulled = 0, busy = false;
  addEventListener("touchstart", e => {
    startY = !busy && sheet.hidden && window.scrollY <= 0 && e.touches.length === 1 ? e.touches[0].clientY : null;
    pulled = 0;
  }, { passive: true });
  addEventListener("touchmove", e => {
    if (startY == null) return;
    pulled = window.scrollY <= 0 ? Math.max(0, (e.touches[0].clientY - startY) * 0.5) : 0;
    ptr.style.transform = pulled ? `translate(-50%, ${Math.min(pulled, TRIGGER + 10) - 60}px)` : "";
  }, { passive: true });
  addEventListener("touchend", async () => {
    if (startY == null) return;
    startY = null;
    if (pulled < TRIGGER) { ptr.style.transform = ""; return; }
    busy = true;
    ptr.classList.add("busy");
    ptr.style.transform = "translate(-50%, 10px)";
    try {
      await refresh();
    } finally {
      busy = false;
      ptr.classList.remove("busy");
      ptr.style.transform = "";
    }
  });
}

async function init() {
  // listeners first: they don't need any data
  document.getElementById("lang").addEventListener("change", e => setLanguage(e.target.value));
  document.getElementById("sync-now").addEventListener("click", () => syncNow());
  const sel = document.getElementById("f-group");
  sel.addEventListener("change", () => { state.group = sel.value; save(); render(); });
  for (const [id, key, numeric] of [["f-days", "days", true], ["f-platform", "platform", false]]) {
    document.getElementById(id).addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      state[key] = numeric ? Number(b.dataset.v) : b.dataset.v;
      save(); render();
    });
  }

  const showTip = e => {
    const el = e.target.closest("[data-tip]");
    if (!el) { tip.hidden = true; return; }
    tip.textContent = el.dataset.tip;
    tip.hidden = false;
    const x = Math.max(8, Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 8));
    tip.style.left = x + "px";
    tip.style.top = (e.clientY + 14) + "px";
  };
  view.addEventListener("mousemove", showTip);
  view.addEventListener("click", showTip);  // phones have no hover: a tap shows it
  view.addEventListener("mouseleave", () => { tip.hidden = true; });
  view.addEventListener("click", e => {  // any post (table row or card) opens its details
    if (e.target.closest("a")) return;
    const el = e.target.closest("[data-post]");
    if (el) openPost(el.dataset.post);
  });

  document.getElementById("sheet-close").addEventListener("click", () => closeSheet());
  document.getElementById("sheet").addEventListener("click", e => { if (e.target.id === "sheet") closeSheet(); });
  addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
  addEventListener("popstate", () => closeSheet(true));
  addEventListener("hashchange", () => { closeSheet(true); window.scrollTo(0, 0); render(); });  // a new page starts at the top
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
  setupPullToRefresh();

  if (CLOUD) {  // online version: the numbers open with the password (remembered on this device after the first time)
    if (!state.lang) state.lang = browserLang();
    applyStaticText();
    if (!(await cloudStart())) return showUnlock();
  }
  await startApp();
}

const browserLang = () => ((navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en");

async function startApp() {
  let meta;
  try {
    if (!state.lang) {  // first visit on this device: the language saved by the hub, else the browser's
      const saved = (await (await api("/api/meta")).json()).lang;
      state.lang = saved || browserLang();
      save();
    }
    applyStaticText();
    meta = await loadMeta();
  } catch (err) {
    if (!state.lang) state.lang = browserLang();
    applyStaticText();
    view.innerHTML = `<div class="card empty">${t("err.load", { error: err.message })}</div>`;
    return;
  }
  fillGroups(meta);
  if (meta.syncing && !offline) waitForSync();  // the hub syncs when it starts: show the fresh numbers once it's done
  render();
}

init();
