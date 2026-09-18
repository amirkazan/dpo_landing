/*
 * Конфиг внешних ссылок курса (classic script, подключается до app.js).
 *
 * Регистрация уже настоящая (Яндекс Формы). Остальные URL не предоставлены,
 * поэтому их значения null. Когда ссылки появятся, впишите их сюда вместо
 * null — больше ничего менять не нужно. Выдуманные адреса не добавлять.
 */
(function () {
  'use strict';

  window.COURSE_LINKS = {
    registration: 'https://forms.yandex.ru/cloud/6a21a51a90290294e1e12c7a', // Регистрация на курс
    recordings: null, // Записи лекций курса
    assignments: null, // Задания по курсу
    guides: null, // Методические материалы
    syllabus: null, // Программа курса (модули и занятия)
    presentation: null, // Презентация с описанием курса
    assessment: null, // Правила итоговой аттестации
    integral: "https://int3-eight.vercel.app/" // Программа «Интеграл»
  };
})();
