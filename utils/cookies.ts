// utils/cookies.ts
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined; // Ou outra lógica para lidar com o ambiente do servidor
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length >= 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue;
  }
  return undefined;
}
