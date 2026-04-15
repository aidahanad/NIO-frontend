// src/utils/fakeAI.js
// This file is kept as a fallback during development.
// It will be fully replaced once ChatView and ProjectView are updated.

const CHAT = [
  `## Tendance du Marché Pétrolier

Le marché pétrolier traverse une **période de transition significative** ce trimestre.

### Facteurs Haussiers
- **Réduction OPEP+** : coupes volontaires maintenues jusqu'en fin d'année
- Reprise de la demande en **Asie du Sud-Est** (Inde +6%, Chine +3.2%)
- Tensions géopolitiques affectant les routes d'approvisionnement clés

### Facteurs Baissiers
- Stocks américains en hausse de 4.2 Mb sur les 4 dernières semaines
- Progression des **énergies renouvelables** réduisant la demande structurelle

---

**Conclusion** : Une fourchette de **75–85 USD/baril** est probable à court terme.`,

  `### Évaluation des Risques — Prochain Exercice

Voici les **principaux facteurs de risque** identifiés :

1. **Risque réglementaire** : Nouvelles normes CBAM impactant les coûts de +8%
2. **Risque de change** : Exposition USD/DZD, volatilité estimée à ±8%
3. **Risque opérationnel** : Vieillissement de certaines infrastructures
4. **Risque de marché** : Pression concurrentielle post-libéralisation

---

**Niveau de risque global** : **Modéré-Élevé**`,

  `## Comparatif des Indicateurs — 3 Derniers Mois

- **T1** — Volume : 1.2 MT | Disponibilité : 94% | Incidents : 12
- **T2** — Volume : 1.4 MT | Disponibilité : 96% | Incidents : 8
- **T3** — Volume : 1.35 MT | Disponibilité : 93% | Incidents : 15

---

**Recommandation** : Audit ciblé sur les incidents T3.`,
]

const ANALYSE = `## Résultat de l'Analyse

Suite à l'examen des documents fournis, voici le **verdict de conformité**.

---

## Points de Conformité ✓

- **Article 12** — Procédures de stockage conformes
- **Article 18** — Documentation de traçabilité conforme
- **Article 23** — Équipements correctement étalonnés

---

## Points d'Attention ⚠️

1. **Article 7** — Permis d'exploitation expire dans **47 jours**
2. **Article 15** — Rapport environnemental incomplet
3. **Article 31** — Deux agents sans formation obligatoire

---

## Recommandations

**Priorité Haute** — Renouveler le permis immédiatement

**Priorité Moyenne** — Compléter le rapport environnemental

---

**Verdict Global : Conformité Partielle**`

export const getFakeResponse = (isAnalyse = false) =>
  isAnalyse ? ANALYSE : CHAT[Math.floor(Math.random() * CHAT.length)]

export function simulateStreaming(text, onChunk, onDone, speed = 12) {
  let i = 0, acc = '', cancelled = false, tid = null

  function tick() {
    if (cancelled) return
    if (i >= text.length) { onDone?.(); return }
    const n = Math.floor(Math.random() * 3) + 1
    acc += text.slice(i, i + n)
    i += n
    onChunk(acc)
    tid = setTimeout(tick, speed + Math.random() * 8)
  }

  tid = setTimeout(tick, 60)
  return () => { cancelled = true; clearTimeout(tid) }
}
