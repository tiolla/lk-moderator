export function doc(name, kind, size, when, note) {
  return { name, kind, size, when, note: note || '', mark: '' }
}

export function handwrittenApps() {
  return [
    {
      id: 'ЗАЯВ-2026-0417', study: 'dm1', status: 'new', waited: '2 ч',
      form: {
        applicantFullName: 'Иванов Пётр Сергеевич', participantFullName: 'Иванова Мария Петровна', studyGroup: 'main',
        birth: '20.05.2010', email: 'ivanov.p@example.com', phone: '+7 (012) 345-67-89', city: 'Москва',
        comment: 'Диагноз поставлен в марте 2026 года, наблюдаемся в Морозовской больнице.', consentData: true, consentTerms: true,
      },
      docs: [
        doc('vypiska_sd1_ivanova.pdf', 'PDF', '1,8 МБ', '12 сентября', 'Выписка из истории болезни'),
        doc('analiz_gada.jpg', 'JPG', '640 КБ', '12 сентября', 'Результат анализа на антитела'),
      ],
      comments: {}, criteria: {}, history: [{ text: 'Заявка отправлена участником', when: '17 сентября, 09:40' }],
    },
    {
      id: 'ЗАЯВ-2026-0418', study: 'ait', status: 'new', waited: '4 ч',
      form: {
        applicantFullName: 'Соколова Ольга Викторовна', participantFullName: 'Соколов Артём Игоревич', studyGroup: 'main',
        birth: '02.04.1998', email: 'sokolova.o@example.com', phone: '+7 (003) 118-22-40', city: 'Пермь',
        comment: '', consentData: true, consentTerms: true,
      },
      docs: [doc('skan_vypiski.jpg', 'JPG', '220 КБ', '17 сентября', 'Снимок выписки, часть текста засвечена')],
      comments: {}, criteria: {}, history: [{ text: 'Заявка отправлена участником', when: '17 сентября, 07:10' }],
    },
    {
      id: 'ЗАЯВ-2026-0402', study: 'dm1', status: 'anketa', waited: '1 д',
      form: {
        applicantFullName: 'Петрова Анна Михайловна', participantFullName: 'Петрова Дарья Андреевна', studyGroup: 'control',
        birth: '14.11.2012', email: 'petrova.a@example.com', phone: '+7 (016) 200-14-77', city: 'Москва',
        comment: 'Контрольная группа, направление от участкового педиатра.', consentData: true, consentTerms: true,
      },
      docs: [doc('napravlenie.pdf', 'PDF', '320 КБ', '10 сентября', 'Направление педиатра')],
      comments: {}, criteria: {},
      history: [
        { text: 'Заявка отправлена участником', when: '10 сентября, 12:05' },
        { text: 'Заявка одобрена, участнику открыта анкета', when: '11 сентября, 10:20' },
        { text: 'Анкета отправлена на проверку', when: '16 сентября, 18:40' },
      ],
    },
    {
      id: 'ЗАЯВ-2026-0399', study: 'cel', status: 'returned', waited: '3 д',
      form: {
        applicantFullName: 'Кузнецов Игорь Олегович', participantFullName: 'Кузнецов Игорь Олегович', studyGroup: 'relatives',
        birth: '30.01.1989', email: 'kuznetsov@example', phone: '', city: 'Казань',
        comment: 'Брат участника с подтверждённым диагнозом.', consentData: true, consentTerms: true,
      },
      docs: [],
      comments: { email: 'Адрес почты без домена — проверьте и укажите заново.', phone: 'Телефон нужен для связи перед визитом.' },
      criteria: {},
      history: [
        { text: 'Заявка отправлена участником', when: '14 сентября, 16:20' },
        { text: 'Возвращена участнику: 2 замечания', when: '15 сентября, 09:05' },
      ],
    },
    {
      id: 'ЗАЯВ-2026-0388', study: 'dm1', status: 'approved', waited: '—',
      form: {
        applicantFullName: 'Морозова Елена Дмитриевна', participantFullName: 'Морозов Кирилл Сергеевич', studyGroup: 'main',
        birth: '08.08.2014', email: 'morozova.e@example.com', phone: '+7 (025) 771-09-31', city: 'Санкт-Петербург',
        comment: '', consentData: true, consentTerms: true,
      },
      docs: [doc('vypiska_morozov.pdf', 'PDF', '2,1 МБ', '9 сентября', 'Выписка из стационара')],
      comments: {}, criteria: {},
      history: [
        { text: 'Заявка отправлена участником', when: '9 сентября, 11:00' },
        { text: 'Заявка одобрена, участнику открыта анкета', when: '9 сентября, 15:30' },
      ],
    },
    {
      id: 'ЗАЯВ-2026-0361', study: 'ait', status: 'done', waited: '—',
      form: {
        applicantFullName: 'Волкова Ирина Павловна', participantFullName: 'Волкова Ирина Павловна', studyGroup: 'main',
        birth: '17.06.1994', email: 'volkova.i@example.com', phone: '+7 (001) 455-88-12', city: 'Новосибирск',
        comment: '', consentData: true, consentTerms: true,
      },
      docs: [doc('genetika_volkova.pdf', 'PDF', '1,2 МБ', '2 сентября', 'Результат генетического анализа')],
      comments: {}, criteria: {},
      history: [
        { text: 'Заявка отправлена участником', when: '1 сентября, 10:15' },
        { text: 'Заявка одобрена, участнику открыта анкета', when: '1 сентября, 14:02' },
        { text: 'Анкета подтверждена', when: '4 сентября, 11:48' },
      ],
    },
  ]
}

export function complete(a) {
  if (a.kind) return a
  a.kind = ['new', 'returned', 'docRequest', 'rejected'].includes(a.status) ? 'app' : 'anketa'
  a.visitNo = 0
  a.num = null
  a.family = null
  a.familyRole = ''
  a.repeat = false
  a.changed = []
  a.postponed = null
  a.moderator = 'Соколова К. В.'
  a.submitted = (a.history[a.history.length - 1].when || '').split(',')[0]
  a.waitH = a.waited === '—' ? 0 : a.waited.indexOf('д') > 0 ? parseInt(a.waited, 10) * 24 : parseInt(a.waited, 10)
  return a
}
