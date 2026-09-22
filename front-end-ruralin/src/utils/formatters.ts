export const formatDateForInput = (dateString: string | undefined | null): string => {
  if (!dateString) return ''
  // Se já estiver no formato YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString
  
  // Tenta criar um objeto Date
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  // Retorna no formato YYYY-MM-DD
  // Nota: toISOString() retorna em UTC. Se a data original não tiver timezone,
  // e for interpretada como local, pode haver deslocamento.
  // Se a string vier como '2023-01-01T00:00:00', new Date assume local.
  // toISOString converte para UTC.
  // Para input date, geralmente queremos a data literal sem conversão de fuso se não houver info de fuso.
  
  // Abordagem mais segura para strings ISO que podem ter T:
  if (dateString?.includes('T')) {
    return dateString?.split('T')[0] || '1900-01-01'
  }
  
  return date?.toISOString().split('T')[0] || '1900-01-01'
}
