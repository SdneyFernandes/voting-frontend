// utils/cookies.ts
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  console.log(`🔍 [getCookie] Buscando: ${name}`);
  console.log(`📦 [getCookie] Todos cookies: ${document.cookie}`);
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length >= 2) {
    const result = parts.pop()?.split(';').shift();
    console.log(`✅ [getCookie] ${name} encontrado: ${result}`);
    return result;
  }
  
  console.log(`❌ [getCookie] ${name} não encontrado`);
  return undefined;
}

// ✅ REMOVER setCookie e deleteCookie - deixe o backend gerenciar os cookies