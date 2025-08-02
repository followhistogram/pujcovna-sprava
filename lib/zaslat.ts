"use server"

export async function zaslatApiRequest(path: string, options: RequestInit = {}) {
  const { ZASLAT_API_KEY } = process.env
  if (!ZASLAT_API_KEY) {
    throw new Error("Zaslat.cz API klíč musí být nastaven v env.")
  }

  const response = await fetch(`https://zaslat.cz/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": ZASLAT_API_KEY,
      ...options.headers,
    },
  })

  const responseText = await response.text()

  if (response.status === 204 || !responseText) {
    if (response.ok) return null
    throw { status: response.status, data: { errors: { base: ["Prázdná odpověď od Zaslat.cz API."] } } }
  }

  let responseData
  try {
    responseData = JSON.parse(responseText)
  } catch (e) {
    console.error("Zaslat.cz API response is not valid JSON:", responseText)
    throw { status: response.status, data: { errors: { base: ["Odpověď od Zaslat.cz API není platný JSON."] } } }
  }

  if (!response.ok) {
    console.error("Zaslat.cz API Request Error:", responseData)
    throw { status: response.status, data: responseData }
  }

  return responseData
}
