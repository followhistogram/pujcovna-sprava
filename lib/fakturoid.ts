"use server"

// Jednoduchá in-memory cache pro OAuth token
let tokenCache = {
  accessToken: null as string | null,
  expiresAt: 0,
}

/**
 * Získá platný OAuth 2.0 přístupový token.
 * Pokud je v cache platný token, vrátí ho. Jinak požádá o nový.
 */
async function getAccessToken(): Promise<string> {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken
  }

  const { FAKTUROID_CLIENT_ID, FAKTUROID_CLIENT_SECRET } = process.env

  if (!FAKTUROID_CLIENT_ID || !FAKTUROID_CLIENT_SECRET) {
    throw new Error("Fakturoid Client ID a Client Secret musí být nastaveny v env.")
  }

  const response = await fetch("https://login.fakturoid.cz/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: FAKTUROID_CLIENT_ID,
      client_secret: FAKTUROID_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  })

  const responseText = await response.text()
  let tokenData

  try {
    tokenData = JSON.parse(responseText)
  } catch (e) {
    console.error("Fakturoid OAuth response is not valid JSON:", responseText)
    throw new Error("Nepodařilo se zpracovat odpověď od Fakturoidu.")
  }

  if (!response.ok) {
    console.error("Fakturoid OAuth Error:", tokenData)
    throw new Error("Nepodařilo se získat přístupový token od Fakturoidu.")
  }

  // Uložíme token do cache. `expires_in` je v sekundách.
  // Pro jistotu odečteme 60 sekund od doby platnosti.
  tokenCache = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in - 60) * 1000,
  }

  return tokenCache.accessToken!
}

/**
 * Obecná funkce pro volání Fakturoid API s použitím OAuth tokenu.
 */
export async function fakturoidApiRequest(path: string, options: RequestInit = {}) {
  const { FAKTUROID_SLUG } = process.env
  if (!FAKTUROID_SLUG) {
    throw new Error("Fakturoid slug musí být nastaven v env.")
  }

  const accessToken = await getAccessToken()

  const response = await fetch(`https://api.fakturoid.cz/v3/accounts/${FAKTUROID_SLUG}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": `PujcovnaPolaroidu (OAuth)`,
      ...options.headers,
    },
  })

  // Handle empty response body (e.g., for 204 No Content)
  if (response.status === 204) {
    return null
  }

  const responseText = await response.text()
  let responseData

  try {
    responseData = JSON.parse(responseText)
  } catch (e) {
    console.error("Fakturoid API response is not valid JSON:", responseText)
    // Create a consistent error structure
    throw {
      status: response.status,
      data: { errors: { base: ["Odpověď od Fakturoid API není platný JSON."] } },
    }
  }

  if (!response.ok) {
    console.error("Fakturoid API Request Error:", responseData)
    throw { status: response.status, data: responseData }
  }

  return responseData
}
