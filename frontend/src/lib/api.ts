export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' 
  ? `http://${window.location.hostname}:8080/api` 
  : 'http://localhost:8080/api');

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    let errorMessage = "Ocorreu um erro no servidor";
    try {
        const errorDetails = await response.text();
        if (errorDetails) errorMessage = errorDetails;
    } catch(e) {}
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

// Essa função injeta o token secretamente pra gente conseguir baixar arquivos de texto/planilhas sementrar em Erro 403
export async function apiDownloadFile(endpoint: string, filename: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Realiza a requisição simulando o navegador, mas injetando o Bearer Token do usuário
  const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
  
  if (!response.ok) throw new Error("Erro ao baixar o arquivo. Você não tem permissão ou o arquivo não existe.");
  
  // Transforma o texto do CSV em um "Arquivo" virtual no navegador (um Blob)
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  // Cria um clique invisível e ativa ele pra forçar o início do download no Windows/Mac/Android
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  
  // Limpeza
  window.URL.revokeObjectURL(url);
  anchor.remove();
}
