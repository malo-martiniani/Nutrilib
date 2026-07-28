// Utilitaire de Traduction automatique pour Nutrilib
// Permet de traduire les noms d'aliments et entrées de journal en temps réel selon la langue de l'application (FR / EN).

async function translateText(text, from = 'auto', to = 'fr') {
  if (!text || typeof text !== 'string' || text.trim() === '') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return text;
  } catch (error) {
    console.error('Erreur de traduction:', error.message);
    return text;
  }
}

async function translateTextBatch(texts, from = 'auto', to = 'fr') {
  if (!texts || texts.length === 0) return [];
  const validTexts = texts.map(t => (t && typeof t === 'string') ? t : '');
  const combinedText = validTexts.join('\n');
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(combinedText)}`;
    const response = await fetch(url);
    if (!response.ok) return texts;
    const data = await response.json();
    if (data && data[0]) {
      const translatedLines = data[0].map(item => item[0]).join('');
      const splitTexts = translatedLines.split('\n').map(t => t.trim());
      if (splitTexts.length === texts.length) {
        return splitTexts;
      } else {
        const result = [];
        for (let i = 0; i < texts.length; i++) {
          result.push(splitTexts[i] || texts[i]);
        }
        return result;
      }
    }
    return texts;
  } catch (error) {
    console.error('Erreur traduction batch:', error.message);
    return texts;
  }
}

module.exports = {
  translateText,
  translateTextBatch
};
