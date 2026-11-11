"""Every message the hub shows or sends, in English and French. Errors carry a code; the text is made here."""

LANGS = ("en", "fr")

MESSAGES = {
    # Zernio
    "key_refused": {
        "en": "Zernio refused the API key (401). Copy it again from Zernio, or remove this channel and add it back.",
        "fr": "Zernio a refusé la clé API (401). Recopie-la depuis Zernio, ou supprime cette chaîne et ajoute-la à nouveau.",
    },
    "zernio_http": {
        "en": "Zernio answered HTTP {status} on {path}: {detail}",
        "fr": "Zernio a répondu HTTP {status} sur {path} : {detail}",
    },
    "zernio_network": {
        "en": "Zernio can't be reached ({kind} on {path}). Check the internet connection.",
        "fr": "Zernio est injoignable ({kind} sur {path}). Vérifie la connexion internet.",
    },
    "unexpected": {
        "en": "unexpected problem ({kind}: {text})",
        "fr": "problème inattendu ({kind} : {text})",
    },
    # channels
    "name_empty": {
        "en": "Give the channel a name with letters or numbers.",
        "fr": "Donne à la chaîne un nom avec des lettres ou des chiffres.",
    },
    "key_format": {
        "en": "This doesn't look like a Zernio API key. Copy it again from Zernio.",
        "fr": "Ça ne ressemble pas à une clé API Zernio. Recopie-la depuis Zernio.",
    },
    "name_exists": {
        "en": "A channel called {name} already exists. Remove it first, or pick another name.",
        "fr": "Une chaîne nommée {name} existe déjà. Supprime-la d'abord, ou choisis un autre nom.",
    },
    "key_used": {
        "en": "This Zernio key is already used by another channel. Each channel has its own Zernio account.",
        "fr": "Cette clé Zernio est déjà utilisée par une autre chaîne. Chaque chaîne a son propre compte Zernio.",
    },
    "folder_missing": {
        "en": "Folder not found: {folder}",
        "fr": "Dossier introuvable : {folder}",
    },
    "demo_channels": {
        "en": "Channels can't be added in demo mode. Start the hub with Start dashboard.bat.",
        "fr": "Impossible d'ajouter une chaîne en mode démo. Lance le hub avec Start dashboard.bat.",
    },
    "demo_sync": {"en": "No sync in demo mode.", "fr": "Pas de synchronisation en mode démo."},
    # Telegram
    "token_format": {
        "en": "This doesn't look like a bot token. It looks like 123456789:ABC... in @BotFather.",
        "fr": "Ça ne ressemble pas à un token de bot. Il ressemble à 123456789:ABC... dans @BotFather.",
    },
    "token_refused": {
        "en": "Telegram refused this bot token. Copy it again from @BotFather.",
        "fr": "Telegram a refusé ce token. Recopie-le depuis @BotFather.",
    },
    "tg_unreachable": {
        "en": "Telegram can't be reached ({kind}). Check the internet connection.",
        "fr": "Telegram est injoignable ({kind}). Vérifie la connexion internet.",
    },
    "tg_error": {"en": "Telegram error: {detail}", "fr": "Erreur Telegram : {detail}"},
    "no_token": {"en": "Paste the bot token first.", "fr": "Colle d'abord le token du bot."},
    "not_connected": {"en": "Alerts aren't connected yet.", "fr": "Les alertes ne sont pas encore connectées."},
    "demo_alerts": {
        "en": "Alerts can't be set up in demo mode. Start the hub with Start dashboard.bat.",
        "fr": "Impossible de régler les alertes en mode démo. Lance le hub avec Start dashboard.bat.",
    },
    "account_missing": {"en": "Account not found", "fr": "Compte introuvable"},
    # Telegram messages sent to you
    "alert_on": {
        "en": "✅ Stats Hub alerts are on. You'll get a message here if the dashboard can't sync a channel.",
        "fr": "✅ Les alertes Stats Hub sont activées. Tu recevras un message ici si le tableau de bord n'arrive pas à synchroniser une chaîne.",
    },
    "alert_fail": {
        "en": "⚠️ Stats Hub can't sync {channel}.\n{error}",
        "fr": "⚠️ Stats Hub n'arrive pas à synchroniser {channel}.\n{error}",
    },
    "alert_ok": {"en": "✅ Stats Hub: {channel} syncs again.", "fr": "✅ Stats Hub : {channel} se synchronise de nouveau."},
    "alert_test": {"en": "👋 Test from Stats Hub: alerts work.", "fr": "👋 Test de Stats Hub : les alertes fonctionnent."},
    # weekly summary
    "digest.head": {"en": "📊 Stats Hub — your week ({range})", "fr": "📊 Stats Hub — ta semaine ({range})"},
    "digest.followers": {"en": "👥 Followers: {followers} ({growth} this week)", "fr": "👥 Abonnés : {followers} ({growth} cette semaine)"},
    "digest.views": {"en": "▶️ Views: {views}", "fr": "▶️ Vues : {views}"},
    "digest.vs": {"en": "vs last week", "fr": "vs semaine précédente"},
    "digest.engagement": {"en": "💬 Engagement: {engagement}", "fr": "💬 Engagement : {engagement}"},
    "digest.posts": {"en": "🎬 Posts published: {posts}", "fr": "🎬 Posts publiés : {posts}"},
    "digest.top": {"en": "🏆 Top post: “{title}” (@{handle}, {platform}) — {views} views",
                   "fr": "🏆 Top post : « {title} » (@{handle}, {platform}) — {views} vues"},
    "digest.best": {"en": "🚀 Best growth: @{handle} ({platform}) {growth} followers",
                    "fr": "🚀 Meilleure progression : @{handle} ({platform}) {growth} abonnés"},
    # phone access
    "demo_phone": {
        "en": "Phone access can't be set up in demo mode. Start the hub with Start dashboard.bat.",
        "fr": "L'accès depuis le téléphone ne se règle pas en mode démo. Lance le hub avec Start dashboard.bat.",
    },
    "tailscale_missing": {
        "en": "Tailscale isn't installed on this computer, or it didn't answer.",
        "fr": "Tailscale n'est pas installé sur cet ordinateur, ou il n'a pas répondu.",
    },
    "tailscale_failed": {
        "en": "Tailscale needs one more step from you. If its message below has a link, open it, allow Serve, then click the button again. Tailscale says: {detail}",
        "fr": "Tailscale a besoin d'une dernière étape de ta part. Si son message ci-dessous contient un lien, ouvre-le, autorise Serve, puis reclique sur le bouton. Tailscale dit : {detail}",
    },
}


def lang_of(value):
    value = (value or "").lower()[:2]
    return value if value in LANGS else "en"


def msg(code, lang="en", **params):
    texts = MESSAGES.get(code)
    if not texts:
        return code
    return texts[lang_of(lang)].format(**params)


class HubError(Exception):
    """An error with a code, readable in every language."""

    def __init__(self, code, **params):
        self.code, self.params = code, params
        super().__init__(msg(code, "en", **params))

    def text(self, lang):
        return msg(self.code, lang, **self.params)

    def as_dict(self):
        return {"code": self.code, "params": self.params, "error": str(self)}
