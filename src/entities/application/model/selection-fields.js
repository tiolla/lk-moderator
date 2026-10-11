export const SELECTION_FIELDS = [
  { k: 'applicantFullName', label: 'ФИО заявителя' },
  { k: 'participantFullName', label: 'ФИО потенциального участника' },
  { k: 'studyGroup', label: 'Группа исследования' },
  { k: 'birth', label: 'Дата рождения' },
  { k: 'email', label: 'Email' },
  { k: 'phone', label: 'Телефон' },
  { k: 'city', label: 'Город забора биоматериала' },
  { k: 'comment', label: 'Комментарий', optional: true },
  { k: 'consentData', label: 'Согласие на передачу персональных данных', fact: true },
  { k: 'consentTerms', label: 'Согласие с условиями участия', fact: true },
]
